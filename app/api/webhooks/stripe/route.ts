import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildBookingConfirmation, sendEmail } from "@/lib/email";
import { ensureGuestPortal } from "@/lib/guestPortal";
import { buildConfirmationSms, sendSms } from "@/lib/sms";
import type { Booking } from "@/lib/types";

// Stripe needs the raw request body to verify the signature.
export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");
  const secret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!signature || !secret) {
    return NextResponse.json({ error: "Not configured." }, { status: 400 });
  }

  const raw = await request.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(raw, signature, secret);
  } catch (err) {
    console.error("Stripe signature verification failed", err);
    return NextResponse.json({ error: "Invalid signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;

    if (bookingId && session.payment_status === "paid") {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      const booking = data as Booking | null;

      // Idempotent: only act if we haven't already confirmed this booking.
      if (booking && booking.confirmation_sent_at === null) {
        let sent = false;
        if (booking.confirmation_method === "sms" && booking.guest_phone) {
          sent = await sendSms({
            to: booking.guest_phone,
            body: buildConfirmationSms(booking),
          });
        }
        if (!sent) {
          const { subject, html } = await buildBookingConfirmation(booking);
          sent = await sendEmail({
            to: booking.guest_email,
            subject,
            html,
            fromName: booking.property_name,
          });
        }

        // Ensure the guest has a permanent portal token (links in later emails).
        await ensureGuestPortal(booking.guest_email, supabase);

        await supabase
          .from("bookings")
          .update({
            status: "paid",
            paid_at: new Date().toISOString(),
            stripe_payment_intent_id:
              typeof session.payment_intent === "string"
                ? session.payment_intent
                : null,
            confirmation_sent_at: sent ? new Date().toISOString() : null,
          })
          .eq("id", booking.id);
      }
    }
  }

  return NextResponse.json({ received: true });
}
