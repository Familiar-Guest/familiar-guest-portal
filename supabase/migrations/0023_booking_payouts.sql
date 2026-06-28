-- Escrow payout: funds are held on the platform account until check-in, then
-- transferred to the owner's connected account (Stripe Connect). These columns
-- track the release.
--
-- balance_payment_intent_id lets us total the actual Stripe fees across both the
-- deposit and balance charges so the owner's payout is net of fees (at cost).
alter table bookings
  add column if not exists balance_payment_intent_id text,
  add column if not exists payout_transfer_id        text,
  add column if not exists payout_released_at         timestamptz,
  add column if not exists payout_amount_cents        int,
  add column if not exists payout_error               text;
