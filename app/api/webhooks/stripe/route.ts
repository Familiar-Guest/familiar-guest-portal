import { NextRequest, NextResponse } from "next/server";
import type Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildBookingConfirmation, sendEmail } from "@/lib/email";
import { ensureGuestPortal, guestPortalUrl } from "@/lib/guestPortal";
import { buildConfirmationSms, sendSms } from "@/lib/sms";
import { cardDetailsFromIntent, recordBookingPayment } from "@/lib/payments";
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

  // Connect account KYC state changes — cache verification flags on the owner.
  if (event.type === "account.updated") {
    const account = event.data.object as Stripe.Account;
    const supabase = createAdminClient();
    await supabase
      .from("owners")
      .update({
        stripe_charges_enabled: Boolean(account.charges_enabled),
        stripe_payouts_enabled: Boolean(account.payouts_enabled),
        stripe_details_submitted: Boolean(account.details_submitted),
      })
      .eq("stripe_account_id", account.id);
    return NextResponse.json({ received: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const bookingId = session.metadata?.booking_id;
    const paymentKind = (session.metadata?.payment_kind ?? "full") as
      | "full"
      | "deposit"
      | "balance";

    if (bookingId && session.payment_status === "paid") {
      const supabase = createAdminClient();
      const { data } = await supabase
        .from("bookings")
        .select("*")
        .eq("id", bookingId)
        .single();

      const booking = data as Booking | null;
      const intentId =
        typeof session.payment_intent === "string" ? session.payment_intent : null;
      const nowIso = new Date().toISOString();

      // Send the right confirmation email/SMS for this payment, returning
      // whether it went out. A deposit gets the deposit-received variant; full
      // and balance payments get the paid-in-full variant.
      const notify = async (
        b: Booking,
        kind: "full" | "deposit" | "balance"
      ): Promise<boolean> => {
        const portalToken = await ensureGuestPortal(b.guest_email, supabase);
        let sent = false;
        // SMS only applies to the final (paid-in-full) confirmations.
        if (kind !== "deposit" && b.confirmation_method === "sms" && b.guest_phone) {
          sent = await sendSms({ to: b.guest_phone, body: buildConfirmationSms(b) });
        }
        if (!sent) {
          const { subject, html } = await buildBookingConfirmation(b, kind, guestPortalUrl(portalToken));
          sent = await sendEmail({ to: b.guest_email, subject, html, fromName: b.property_name });
        }
        return sent;
      };

      // Card brand/last4 (+ saved payment-method id for deposits) from the intent.
      const card = intentId
        ? await cardDetailsFromIntent(intentId)
        : { paymentMethodId: null, brand: null, last4: null };
      const customerId =
        typeof session.customer === "string"
          ? session.customer
          : session.customer?.id ?? null;

      if (booking && paymentKind === "deposit") {
        // Idempotent on deposit_paid_at.
        if (booking.deposit_paid_at === null) {
          const sent = await notify(booking, "deposit");
          await supabase
            .from("bookings")
            .update({
              status: "deposit_paid",
              deposit_paid_at: nowIso,
              stripe_payment_intent_id: intentId,
              // Card-on-file for the off-session balance auto-charge later.
              stripe_customer_id: customerId,
              stripe_payment_method_id: card.paymentMethodId,
              confirmation_sent_at: sent ? nowIso : null,
            })
            .eq("id", booking.id);
          await recordBookingPayment(supabase, {
            booking_id: booking.id,
            kind: "deposit",
            amount_cents: booking.deposit_cents,
            currency: booking.currency,
            stripe_payment_intent_id: intentId,
            card_brand: card.brand,
            card_last4: card.last4,
          });
        }
      } else if (booking && paymentKind === "balance") {
        // Idempotent on balance_paid_at.
        if (booking.balance_paid_at === null) {
          const sent = await notify(booking, "balance");
          await supabase
            .from("bookings")
            .update({
              status: "paid",
              balance_paid_at: nowIso,
              paid_at: booking.paid_at ?? nowIso,
              balance_payment_intent_id: intentId,
              confirmation_sent_at: sent ? nowIso : booking.confirmation_sent_at,
            })
            .eq("id", booking.id);
          await recordBookingPayment(supabase, {
            booking_id: booking.id,
            kind: "balance",
            amount_cents: booking.balance_cents,
            currency: booking.currency,
            stripe_payment_intent_id: intentId,
            card_brand: card.brand,
            card_last4: card.last4,
          });
        }
      } else if (booking) {
        // Full payment. Idempotent on confirmation_sent_at.
        if (booking.confirmation_sent_at === null) {
          const sent = await notify(booking, "full");
          await supabase
            .from("bookings")
            .update({
              status: "paid",
              paid_at: nowIso,
              stripe_payment_intent_id: intentId,
              confirmation_sent_at: sent ? nowIso : null,
            })
            .eq("id", booking.id);
          await recordBookingPayment(supabase, {
            booking_id: booking.id,
            kind: "full",
            amount_cents: booking.amount_cents,
            currency: booking.currency,
            stripe_payment_intent_id: intentId,
            card_brand: card.brand,
            card_last4: card.last4,
          });
        }
      }
    }
  }

  return NextResponse.json({ received: true });
}
