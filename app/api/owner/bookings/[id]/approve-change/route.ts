import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { postMessage } from "@/lib/messages";
import { sendEmail, siteUrl } from "@/lib/email";
import { formatDate, nights } from "@/lib/format";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Owner approves a pending guest date-change request. Confirmed dates are updated. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getOwner();
  if (!owner) return bad("Not authorized.", 401);

  const { id } = await params;
  const admin = createAdminClient();

  const { data } = await admin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("owner_id", owner.id)
    .maybeSingle();
  const booking = data as Booking | null;
  if (!booking) return bad("Booking not found.", 404);
  if (!booking.requested_check_in || !booking.requested_check_out)
    return bad("No pending date-change request on this booking.", 409);

  const newCheckIn = booking.requested_check_in;
  const newCheckOut = booking.requested_check_out;

  // Recompute amount if a nightly rate is stored.
  const amount_cents =
    booking.nightly_rate_cents != null
      ? booking.nightly_rate_cents * nights(newCheckIn, newCheckOut) +
        booking.cleaning_fee_cents
      : booking.amount_cents;

  const { error } = await admin
    .from("bookings")
    .update({
      check_in: newCheckIn,
      check_out: newCheckOut,
      amount_cents,
      requested_check_in: null,
      requested_check_out: null,
      date_change_requested_at: null,
    })
    .eq("id", id)
    .eq("owner_id", owner.id);
  if (error) {
    console.error("approve-change failed", error);
    return bad("Could not approve the date change. Please try again.", 500);
  }

  const summary = `${formatDate(booking.check_in)} → ${formatDate(booking.check_out)} changed to ${formatDate(newCheckIn)} → ${formatDate(newCheckOut)}`;

  await postMessage(admin, {
    booking: { ...booking, check_in: newCheckIn, check_out: newCheckOut, amount_cents },
    sender: "owner",
    subject: "Date change approved",
    body: `Your host approved the date change for ${booking.property_name}: ${summary}.`,
  });

  // Email the guest.
  await sendEmail({
    to: booking.guest_email,
    subject: `Date change approved: ${booking.property_name}`,
    html: `<p>Hi ${booking.guest_name},</p><p>Your host approved your date change for ${booking.property_name}.</p><p><strong>${summary}.</strong></p>${booking.status === "paid" ? "<p>If there is a price difference your host will be in touch.</p>" : ""}<p><a href="${siteUrl()}/book/${booking.token}">View your booking</a></p>`,
  });

  return NextResponse.json({ ok: true });
}
