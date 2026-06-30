import type { SupabaseClient } from "@supabase/supabase-js";
import { getStripe } from "./stripe";
import { cardDetailsFromIntent, recordBookingPayment } from "./payments";
import type { Booking } from "./types";

export type BalanceChargeResult =
  | { ok: true; paymentIntentId: string }
  | { ok: false; error: string; needsAction?: boolean };

/**
 * Auto-charge a deposit-paid booking's outstanding balance off-session using the
 * card saved at booking. Funds land in the platform balance (escrow) exactly
 * like the deposit; payout still happens at check-in.
 *
 * Idempotency: the key is per booking + day, so a double cron run on the same
 * day can't double-charge, while a later day can retry a failed charge (Stripe
 * idempotency records expire after 24h). The booking is also re-read fresh by
 * the caller and guarded on balance_paid_at.
 */
export async function autoChargeBalance(
  admin: SupabaseClient,
  booking: Booking
): Promise<BalanceChargeResult> {
  if (booking.status !== "deposit_paid")
    return { ok: false, error: "Booking is not awaiting a balance." };
  if (booking.balance_paid_at) return { ok: false, error: "Balance already paid." };
  if (booking.balance_cents <= 0) return { ok: false, error: "No balance due." };
  if (!booking.stripe_customer_id || !booking.stripe_payment_method_id)
    return { ok: false, error: "No saved card on file for this booking." };

  const stripe = getStripe();
  const nowIso = new Date().toISOString();
  const dayKey = nowIso.slice(0, 10);
  await admin
    .from("bookings")
    .update({ balance_charge_attempted_at: nowIso })
    .eq("id", booking.id);

  try {
    const pi = await stripe.paymentIntents.create(
      {
        amount: booking.balance_cents,
        currency: booking.currency,
        customer: booking.stripe_customer_id,
        payment_method: booking.stripe_payment_method_id,
        off_session: true,
        confirm: true,
        metadata: { booking_id: booking.id, token: booking.token, payment_kind: "balance" },
      },
      { idempotencyKey: `balance_${booking.id}_${dayKey}` }
    );

    if (pi.status === "succeeded") {
      const okNow = new Date().toISOString();
      await admin
        .from("bookings")
        .update({
          status: "paid",
          balance_paid_at: okNow,
          paid_at: booking.paid_at ?? okNow,
          balance_payment_intent_id: pi.id,
          balance_charge_failed_at: null,
          balance_charge_error: null,
        })
        .eq("id", booking.id);
      const card = await cardDetailsFromIntent(pi.id);
      await recordBookingPayment(admin, {
        booking_id: booking.id,
        kind: "balance",
        amount_cents: booking.balance_cents,
        currency: booking.currency,
        stripe_payment_intent_id: pi.id,
        card_brand: card.brand,
        card_last4: card.last4,
      });
      return { ok: true, paymentIntentId: pi.id };
    }

    // requires_action / requires_payment_method — the guest must finish via link.
    const msg = `Balance charge needs the guest to finish (status: ${pi.status}).`;
    await admin
      .from("bookings")
      .update({ balance_charge_failed_at: new Date().toISOString(), balance_charge_error: msg })
      .eq("id", booking.id);
    return { ok: false, error: msg, needsAction: true };
  } catch (err) {
    // Off-session charges throw on decline / authentication_required.
    const msg = err instanceof Error ? err.message : "Balance charge failed.";
    const code =
      typeof err === "object" && err !== null ? (err as { code?: string }).code : undefined;
    await admin
      .from("bookings")
      .update({ balance_charge_failed_at: new Date().toISOString(), balance_charge_error: msg })
      .eq("id", booking.id);
    console.error("autoChargeBalance failed", err);
    return { ok: false, error: msg, needsAction: code === "authentication_required" };
  }
}
