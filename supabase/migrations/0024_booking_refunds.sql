-- Automated refunds: when a booking is cancelled within the refund window, we
-- issue Stripe refund(s) against the original charge(s). These columns record
-- the outcome (idempotency is also enforced via per-charge Stripe keys).
alter table bookings
  add column if not exists refunded_at         timestamptz,
  add column if not exists refund_amount_cents int,
  add column if not exists refund_error        text;
