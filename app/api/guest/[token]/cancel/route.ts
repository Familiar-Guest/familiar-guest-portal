import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEmailForToken } from "@/lib/guestPortal";
import { postMessage } from "@/lib/messages";
import { sendEmail, siteUrl } from "@/lib/email";
import { formatDate, formatMoney } from "@/lib/format";
import { computeRefund, effectivePolicyForBooking } from "@/lib/policies";
import { refundBooking } from "@/lib/payouts";
import { paymentsGateEnabled } from "@/lib/flags";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/**
 * Guest-initiated cancellation of a stay that hasn't started yet. With no
 * per-owner cancellation-policy model in place, the rule is simply: a guest may
 * cancel any future-dated booking. Paid bookings are kept (marked cancelled) to
 * preserve the payment record; the owner is notified.
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
  if (!bookingId) return bad("Missing booking.");

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
    return bad("This booking is already cancelled.", 409);

  const today = new Date().toISOString().slice(0, 10);
  if (booking.check_in <= today)
    return bad("This stay has already started and can't be cancelled here. Message your host instead.", 409);

  const { error } = await admin
    .from("bookings")
    .update({ status: "cancelled" })
    .eq("id", bookingId)
    .eq("guest_email", email);
  if (error) {
    console.error("guest cancel failed", error);
    return bad("Could not cancel the booking. Please try again.", 500);
  }

  // Refund owed per the booking's effective policy (property policy + per-booking override).
  const policy = await effectivePolicyForBooking(admin, booking);
  const refund = computeRefund(policy, booking);
  if (paymentsGateEnabled() && refund.cents > 0) await refundBooking(admin, booking, refund.cents);
  const refundLine =
    refund.cents > 0
      ? `Refund due per your policy: ${formatMoney(refund.cents, booking.currency)} (${refund.pct}%).`
      : `No refund is due per your policy (cancelled inside the refund window).`;

  // Record + notify on the message thread, and email the owner.
  await postMessage(admin, {
    booking,
    sender: "guest",
    subject: "Booking cancelled",
    body: `${booking.guest_name} cancelled the stay at ${booking.property_name} (${formatDate(
      booking.check_in
    )} → ${formatDate(booking.check_out)}).`,
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
        subject: `Cancelled by guest: ${booking.property_name} (${formatDate(booking.check_in)})`,
        html: `<p>${booking.guest_name} cancelled their stay at ${booking.property_name} for ${formatDate(
          booking.check_in
        )} → ${formatDate(booking.check_out)}. The dates are now free.</p><p>${refundLine}</p><p><a href="${siteUrl()}/owner">Open your portal</a></p>`,
      });
    }
  }

  return NextResponse.json({ ok: true, refund });
}
