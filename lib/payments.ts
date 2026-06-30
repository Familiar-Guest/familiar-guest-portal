import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { getStripe } from "./stripe";

export interface CardDetails {
  paymentMethodId: string | null;
  brand: string | null;
  last4: string | null;
}

/** Saved payment-method id + card brand/last4 from a settled PaymentIntent.
 *  Stripe ids/metadata only — no card number ever touches us. */
export async function cardDetailsFromIntent(intentId: string): Promise<CardDetails> {
  try {
    const pi = await getStripe().paymentIntents.retrieve(intentId, {
      expand: ["latest_charge.payment_method_details", "payment_method"],
    });
    const pmId =
      typeof pi.payment_method === "string"
        ? pi.payment_method
        : pi.payment_method?.id ?? null;
    const charge = pi.latest_charge as Stripe.Charge | null;
    const card = charge?.payment_method_details?.card ?? null;
    return { paymentMethodId: pmId, brand: card?.brand ?? null, last4: card?.last4 ?? null };
  } catch (err) {
    console.error("cardDetailsFromIntent failed", err);
    return { paymentMethodId: null, brand: null, last4: null };
  }
}

/**
 * Append one transaction to a booking's payments ledger (proof of payment for
 * the owner). Idempotent per (booking, kind, payment_intent): a repeated webhook
 * or cron run won't double-insert.
 */
export async function recordBookingPayment(
  admin: SupabaseClient,
  p: {
    booking_id: string;
    kind: "deposit" | "balance" | "full" | "refund";
    amount_cents: number;
    currency: string;
    stripe_payment_intent_id?: string | null;
    card_brand?: string | null;
    card_last4?: string | null;
    status?: "succeeded" | "failed" | "refunded";
  }
): Promise<void> {
  if (p.stripe_payment_intent_id) {
    const { data: existing } = await admin
      .from("booking_payments")
      .select("id")
      .eq("booking_id", p.booking_id)
      .eq("kind", p.kind)
      .eq("stripe_payment_intent_id", p.stripe_payment_intent_id)
      .maybeSingle();
    if (existing) return;
  }
  await admin.from("booking_payments").insert({
    booking_id: p.booking_id,
    kind: p.kind,
    amount_cents: p.amount_cents,
    currency: p.currency,
    stripe_payment_intent_id: p.stripe_payment_intent_id ?? null,
    card_brand: p.card_brand ?? null,
    card_last4: p.card_last4 ?? null,
    status: p.status ?? "succeeded",
  });
}
