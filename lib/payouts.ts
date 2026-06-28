import type { SupabaseClient } from "@supabase/supabase-js";
import type Stripe from "stripe";
import { getStripe } from "./stripe";
import { paidAmountCents } from "./policies";
import type { Booking } from "./types";

/**
 * Familiar Guest commission taken on release, as a fraction (0 = none).
 * Wire this to per-owner plan/PAYG billing once that exists.
 */
export const PLATFORM_COMMISSION_RATE = 0;

export type ReleaseResult =
  | { ok: true; transferId: string; amountCents: number }
  | { ok: false; error: string; reason?: "not_ready" };

/** Total Stripe processing fee (cents) for a PaymentIntent's charge. */
async function chargeFeeCents(
  stripe: Stripe,
  paymentIntentId: string
): Promise<number> {
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge.balance_transaction"],
  });
  const charge = pi.latest_charge as Stripe.Charge | null;
  const bt = charge?.balance_transaction as Stripe.BalanceTransaction | null;
  return bt?.fee ?? 0;
}

/**
 * Release a booking's escrowed funds to the owner's connected account.
 *
 * Model: separate charges + transfers. The guest's payment sits in the platform
 * balance (the "escrow"); here we transfer the owner's share — collected amount
 * minus actual Stripe fees (passed through at cost) minus FG commission — to
 * their Connect account. Idempotent: guarded by payout_released_at and a
 * per-booking idempotency key, so it can't double-pay.
 */
export async function releaseBookingPayout(
  admin: SupabaseClient,
  booking: Booking
): Promise<ReleaseResult> {
  if (booking.payout_released_at)
    return { ok: false, error: "Payout already released.", reason: "not_ready" };
  if (booking.status !== "paid" && booking.status !== "deposit_paid")
    return { ok: false, error: "Booking isn't paid.", reason: "not_ready" };
  if (!booking.owner_id)
    return { ok: false, error: "Booking has no owner.", reason: "not_ready" };

  const { data: ownerRow } = await admin
    .from("owners")
    .select("stripe_account_id, stripe_payouts_enabled, stripe_charges_enabled")
    .eq("id", booking.owner_id)
    .single();
  const owner = ownerRow as {
    stripe_account_id: string | null;
    stripe_payouts_enabled: boolean;
    stripe_charges_enabled: boolean;
  } | null;
  if (!owner?.stripe_account_id)
    return { ok: false, error: "Owner has no connected payout account.", reason: "not_ready" };

  const collected = paidAmountCents(booking);
  if (collected <= 0)
    return { ok: false, error: "Nothing has been collected to release.", reason: "not_ready" };

  const stripe = getStripe();

  // Sum the real Stripe fees across the deposit and balance charges.
  let feeCents = 0;
  try {
    if (booking.stripe_payment_intent_id)
      feeCents += await chargeFeeCents(stripe, booking.stripe_payment_intent_id);
    if (booking.balance_payment_intent_id)
      feeCents += await chargeFeeCents(stripe, booking.balance_payment_intent_id);
  } catch (err) {
    console.error("payout fee lookup failed", err);
    return { ok: false, error: "Could not read payment fees." };
  }

  const commission = Math.round(collected * PLATFORM_COMMISSION_RATE);
  const transferCents = collected - feeCents - commission;
  if (transferCents <= 0)
    return { ok: false, error: "Net payout after fees is zero." };

  try {
    const transfer = await stripe.transfers.create(
      {
        amount: transferCents,
        currency: booking.currency,
        destination: owner.stripe_account_id,
        transfer_group: booking.id,
        metadata: { booking_id: booking.id, kind: "escrow_release" },
      },
      { idempotencyKey: `release_${booking.id}` }
    );
    await admin
      .from("bookings")
      .update({
        payout_transfer_id: transfer.id,
        payout_released_at: new Date().toISOString(),
        payout_amount_cents: transferCents,
        payout_error: null,
      })
      .eq("id", booking.id);
    return { ok: true, transferId: transfer.id, amountCents: transferCents };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Transfer failed.";
    console.error("payout transfer failed", err);
    await admin.from("bookings").update({ payout_error: msg }).eq("id", booking.id);
    return { ok: false, error: msg };
  }
}
