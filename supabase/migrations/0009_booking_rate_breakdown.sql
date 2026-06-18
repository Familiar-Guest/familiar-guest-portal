-- Per-booking price breakdown: nightly (daily) rate + cleaning fee.
-- Guests now see a daily rate × nights + cleaning fee line.
-- amount_cents remains the authoritative total charged via Stripe.
-- nightly_rate_cents is nullable so legacy bookings (total-only) still render.

alter table bookings
  add column if not exists nightly_rate_cents integer,
  add column if not exists cleaning_fee_cents integer not null default 0;
