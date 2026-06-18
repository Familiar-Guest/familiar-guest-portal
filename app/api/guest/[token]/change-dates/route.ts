import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEmailForToken } from "@/lib/guestPortal";
import { postMessage } from "@/lib/messages";
import { fetchBusyBlocks, hasConflict } from "@/lib/ical";
import { findInternalConflict } from "@/lib/offers";
import { sendEmail, siteUrl } from "@/lib/email";
import { formatDate, nights } from "@/lib/format";
import type { Booking, Property } from "@/lib/types";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/**
 * Guest-initiated date change on a stay that hasn't started yet. Re-validates
 * availability (internal bookings + the property's Airbnb calendar) and the
 * minimum-night rule, then recomputes the total from the stored nightly rate.
 * The owner is notified to reconcile any payment difference on paid bookings.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }
  const bookingId = String(body.booking_id ?? "").trim();
  const check_in = String(body.check_in ?? "").trim();
  const check_out = String(body.check_out ?? "").trim();
  if (!bookingId) return bad("Missing booking.");
  if (!DATE_RE.test(check_in) || !DATE_RE.test(check_out))
    return bad("Choose valid dates.");
  if (check_out <= check_in) return bad("Check-out must be after check-in.");

  const admin = createAdminClient();
  const email = await getEmailForToken(token, admin);
  if (!email) return bad("This link is no longer valid.", 404);

  const { data } = await admin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("guest_email", email)
    .maybeSingle();
  const booking = data as Booking | null;
  if (!booking) return bad("Booking not found.", 404);
  if (booking.status === "cancelled" || booking.status === "declined")
    return bad("This booking is cancelled.", 409);

  const today = new Date().toISOString().slice(0, 10);
  if (booking.check_in <= today)
    return bad("This stay has already started and can't be changed here. Message your host instead.", 409);

  const oldCheckIn = booking.check_in;
  const oldCheckOut = booking.check_out;
  if (oldCheckIn === check_in && oldCheckOut === check_out)
    return bad("Those are the same dates.");

  // Minimum-night rule + availability against the property's calendars.
  let property: Property | null = null;
  if (booking.property_id) {
    const { data: prop } = await admin
      .from("properties")
      .select("*")
      .eq("id", booking.property_id)
      .maybeSingle();
    property = prop as Property | null;
  }
  if (property && nights(check_in, check_out) < (property.min_nights ?? 1))
    return bad(`This place has a ${property.min_nights}-night minimum.`);

  const clash = await findInternalConflict(admin, {
    check_in,
    check_out,
    excludeId: bookingId,
    propertyId: booking.property_id,
  });
  if (clash) return bad("Sorry, those dates aren't available.", 409);

  if (property?.airbnb_ical_url) {
    const blocks = await fetchBusyBlocks(property.airbnb_ical_url);
    if (hasConflict(blocks, check_in, check_out))
      return bad("Sorry, those dates aren't available.", 409);
  }

  // Keep the total consistent with the stored nightly rate + cleaning fee.
  const amount_cents =
    booking.nightly_rate_cents != null
      ? booking.nightly_rate_cents * nights(check_in, check_out) +
        booking.cleaning_fee_cents
      : booking.amount_cents;

  const { error } = await admin
    .from("bookings")
    .update({ check_in, check_out, amount_cents })
    .eq("id", bookingId)
    .eq("guest_email", email);
  if (error) {
    console.error("guest change-dates failed", error);
    return bad("Could not change the dates. Please try again.", 500);
  }

  const summary = `${formatDate(oldCheckIn)} → ${formatDate(oldCheckOut)} changed to ${formatDate(
    check_in
  )} → ${formatDate(check_out)}`;

  await postMessage(admin, {
    booking: { ...booking, check_in, check_out, amount_cents },
    sender: "guest",
    subject: "Dates changed",
    body: `${booking.guest_name} changed their stay at ${booking.property_name}: ${summary}.`,
  });

  if (booking.owner_id) {
    const { data: ownerRow } = await admin
      .from("owners")
      .select("email")
      .eq("id", booking.owner_id)
      .maybeSingle();
    const ownerEmail = (ownerRow as { email: string } | null)?.email;
    if (ownerEmail) {
      await sendEmail({
        to: ownerEmail,
        subject: `Dates changed by guest: ${booking.property_name}`,
        html: `<p>${booking.guest_name} changed their stay at ${booking.property_name}.</p><p>${summary}.</p>${
          booking.status === "paid"
            ? "<p>This booking is already paid — review whether a balance or refund is due.</p>"
            : ""
        }<p><a href="${siteUrl()}/owner">Open your portal</a></p>`,
      });
    }
  }

  return NextResponse.json({ ok: true });
}
