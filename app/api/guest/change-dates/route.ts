import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { postMessage } from "@/lib/messages";
import { fetchBusyBlocks, hasConflict } from "@/lib/ical";
import { findInternalConflict } from "@/lib/offers";
import { getOwnerPolicies } from "@/lib/policies";
import { sendEmail, siteUrl } from "@/lib/email";
import { formatDate, nights, daysUntil } from "@/lib/format";
import type { Booking, Property } from "@/lib/types";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Authenticated-session version of guest date-change request (mirrors /api/guest/[token]/change-dates).
 *  Dates are NOT updated immediately — the request is stored for owner approval. */
export async function POST(request: NextRequest) {
  const session = await getOwner();
  if (!session) return bad("Not signed in.", 401);

  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return bad("Invalid request."); }

  const bookingId = String(body.booking_id ?? "").trim();
  const check_in = String(body.check_in ?? "").trim();
  const check_out = String(body.check_out ?? "").trim();
  if (!bookingId) return bad("Missing booking.");
  if (!DATE_RE.test(check_in) || !DATE_RE.test(check_out)) return bad("Choose valid dates.");
  if (check_out <= check_in) return bad("Check-out must be after check-in.");

  const admin = createAdminClient();
  const { data } = await admin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("guest_email", session.email)
    .maybeSingle();
  const booking = data as Booking | null;
  if (!booking) return bad("Booking not found.", 404);
  if (booking.status === "cancelled" || booking.status === "declined")
    return bad("This booking is cancelled.", 409);

  const today = new Date().toISOString().slice(0, 10);
  if (booking.check_in <= today)
    return bad("This stay has already started. Message your host instead.", 409);

  if (booking.check_in === check_in && booking.check_out === check_out)
    return bad("Those are the same as your current dates.");

  let property: Property | null = null;
  if (booking.property_id) {
    const { data: prop } = await admin
      .from("properties").select("*").eq("id", booking.property_id).maybeSingle();
    property = prop as Property | null;
  }
  if (property && nights(check_in, check_out) < (property.min_nights ?? 1))
    return bad(`This place has a ${property.min_nights}-night minimum.`);

  const policy = await getOwnerPolicies(admin, booking.owner_id);
  if (daysUntil(check_in) < policy.min_days_to_book)
    return bad(`New dates must be at least ${policy.min_days_to_book} day(s) before check-in.`);

  const clash = await findInternalConflict(admin, {
    check_in, check_out, excludeId: bookingId, propertyId: booking.property_id,
  });
  if (clash) return bad("Sorry, those dates aren't available.", 409);

  if (property?.airbnb_ical_url) {
    const blocks = await fetchBusyBlocks(property.airbnb_ical_url);
    if (hasConflict(blocks, check_in, check_out))
      return bad("Sorry, those dates aren't available.", 409);
  }

  const { error } = await admin
    .from("bookings")
    .update({
      requested_check_in: check_in,
      requested_check_out: check_out,
      date_change_requested_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("guest_email", session.email);
  if (error) {
    console.error("guest change-dates (auth) failed", error);
    return bad("Could not submit the date change. Please try again.", 500);
  }

  const summary = `${formatDate(booking.check_in)} → ${formatDate(booking.check_out)} → requested ${formatDate(check_in)} → ${formatDate(check_out)}`;

  await postMessage(admin, {
    booking,
    sender: "guest",
    subject: "Date change requested",
    body: `${booking.guest_name} requested new dates for ${booking.property_name}: ${summary}. Awaiting your approval.`,
  });

  if (booking.owner_id) {
    const { data: ownerRow } = await admin
      .from("owners").select("email").eq("id", booking.owner_id).maybeSingle();
    const ownerEmail = (ownerRow as { email: string } | null)?.email;
    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        subject: `Date change requested: ${booking.property_name}`,
        html: `<p>${booking.guest_name} is requesting new dates for ${booking.property_name}.</p><p>${summary}.</p><p>The current booking dates are held until you approve or decline. <a href="${siteUrl()}/owner">Open your portal to respond.</a></p>`,
      });
    }
  }

  return NextResponse.json({ ok: true, pending: true });
}
