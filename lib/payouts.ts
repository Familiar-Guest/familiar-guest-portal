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

/**
 * The settled net (after Stripe fees) and settlement currency for a charge.
 * Using the balance transaction's `net`/`currency` is what makes cross-border
 * work: the guest may pay in MXN/EUR, but it settles to the platform's balance
 * currency (Stripe's FX, at cost), and that's what we can transfer onward. Stripe
 * then converts to the owner's bank currency at payout time.
 */
async function chargeSettlement(
  stripe: Stripe,
  paymentIntentId: string
): Promise<{ netCents: number; currency: string } | null> {
  const pi = await stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge.balance_transaction"],
  });
  const charge = pi.latest_charge as Stripe.Charge | null;
  const bt = charge?.balance_transaction as Stripe.BalanceTransaction | null;
  if (!bt) return null; // not settled yet — try again on the next run
  return { netCents: bt.net, currency: bt.currency };
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

  if (paidAmountCents(booking) <= 0)
    return { ok: false, error: "Nothing has been collected to release.", reason: "not_ready" };

  const stripe = getStripe();

  // Sum the settled net across the deposit + balance charges, in the platform's
  // settlement currency (handles cross-border FX — see chargeSettlement).
  let netCents = 0;
  let currency: string | null = null;
  try {
    for (const pi of [
      booking.stripe_payment_intent_id,
      booking.balance_payment_intent_id,
    ]) {
      if (!pi) continue;
      const s = await chargeSettlement(stripe, pi);
      if (!s) return { ok: false, error: "Payment hasn't settled yet.", reason: "not_ready" };
      if (currency && currency !== s.currency)
        return { ok: false, error: "Mixed settlement currencies on one booking." };
      currency = s.currency;
      netCents += s.netCents;
    }
  } catch (err) {
    console.error("payout settlement lookup failed", err);
    return { ok: false, error: "Could not read settled payment amounts." };
  }

  if (!currency || netCents <= 0)
    return { ok: false, error: "Net payout after fees is zero.", reason: "not_ready" };

  const commission = Math.round(netCents * PLATFORM_COMMISSION_RATE);
  const transferCents = netCents - commission;
  if (transferCents <= 0)
    return { ok: false, error: "Net payout after commission is zero." };

  try {
    const transfer = await stripe.transfers.create(
      {
        amount: transferCents,
        currency,
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

export type RefundResult =
  | { ok: true; refundedCents: number }
  | { ok: false; error: string };

/**
 * Issue Stripe refund(s) for `refundCents` (in the booking's charge currency)
 * against the original charge(s) — deposit first, then balance. Idempotent via
 * per-charge keys and a guard on refunded_at.
 *
 * If the booking's payout was already released to the owner, we do NOT auto-
 * refund (that would need a transfer claw-back); it's flagged for manual
 * handling instead. In the normal flow cancellations happen before check-in,
 * i.e. before release.
 */
export async function refundBooking(
  admin: SupabaseClient,
  booking: Booking,
  refundCents: number
): Promise<RefundResult> {
  if (booking.refunded_at) return { ok: false, error: "Already refunded." };
  if (refundCents <= 0) return { ok: false, error: "Nothing to refund." };
  if (booking.payout_released_at) {
    const note = "Already paid out to the owner — refund manually (transfer claw-back needed).";
    await admin.from("bookings").update({ refund_error: note }).eq("id", booking.id);
    return { ok: false, error: note };
  }

  const stripe = getStripe();
  let remaining = refundCents;
  try {
    for (const pi of [booking.stripe_payment_intent_id, booking.balance_payment_intent_id]) {
      if (!pi || remaining <= 0) continue;
      const intent = await stripe.paymentIntents.retrieve(pi, { expand: ["latest_charge"] });
      const charge = intent.latest_charge as Stripe.Charge | null;
      if (!charge) continue;
      const refundable = charge.amount - charge.amount_refunded;
      const amount = Math.min(remaining, refundable);
      if (amount <= 0) continue;
      await stripe.refunds.create(
        { payment_intent: pi, amount, metadata: { booking_id: booking.id } },
        { idempotencyKey: `refund_${booking.id}_${pi}` }
      );
      remaining -= amount;
    }
    const refunded = refundCents - remaining;
    await admin
      .from("bookings")
      .update({
        refunded_at: new Date().toISOString(),
        refund_amount_cents: refunded,
        refund_error: remaining > 0 ? "Some of the amount was not refundable." : null,
      })
      .eq("id", booking.id);
    return { ok: true, refundedCents: refunded };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Refund failed.";
    console.error("refund failed", err);
    await admin.from("bookings").update({ refund_error: msg }).eq("id", booking.id);
    return { ok: false, error: msg };
  }
}
