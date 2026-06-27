import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { buildBookingConfirmation, sendEmail } from "@/lib/email";
import { ensureGuestPortal, guestPortalUrl } from "@/lib/guestPortal";
import { isExpired } from "@/lib/offers";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";

/**
 * Confirm a complimentary ($0) booking without going through Stripe.
 * Requires the guest to be signed in (same auth gate as the pay flow).
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const guestUser = await getOwner();
  if (!guestUser) {
    return NextResponse.json(
      { error: "Please sign in to accept this offer." },
      { status: 401 }
    );
  }

  const { token } = await params;
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const booking = data as Booking;

  if (booking.amount_cents !== 0) {
    return NextResponse.json(
      { error: "This booking requires payment — use the payment button instead." },
      { status: 409 }
    );
  }
  if (booking.status === "paid") {
    return NextResponse.json({ error: "Already confirmed." }, { status: 409 });
  }
  if (
    booking.status === "cancelled" ||
    booking.status === "forfeited" ||
    booking.status === "declined"
  ) {
    return NextResponse.json(
      { error: "This offer is no longer available." },
      { status: 409 }
    );
  }
  if (booking.status === "expired" || isExpired(booking)) {
    return NextResponse.json(
      { error: "This offer has expired. Please contact your host." },
      { status: 409 }
    );
  }

  const nowIso = new Date().toISOString();

  await supabase
    .from("bookings")
    .update({
      status: "paid",
      paid_at: nowIso,
      guest_user_id: guestUser.id,
      confirmation_method: "email",
    })
    .eq("id", booking.id);

  const portalToken = await ensureGuestPortal(booking.guest_email, supabase);
  const updatedBooking = { ...booking, status: "paid" as const, paid_at: nowIso, guest_user_id: guestUser.id };
  const { subject, html } = await buildBookingConfirmation(updatedBooking, "full", guestPortalUrl(portalToken));
  const sent = await sendEmail({
    to: booking.guest_email,
    subject,
    html,
    fromName: booking.property_name,
  });

  if (sent) {
    await supabase
      .from("bookings")
      .update({ confirmation_sent_at: nowIso })
      .eq("id", booking.id);
  }

  return NextResponse.json({ ok: true });
}
