-- Per-booking policy overrides. When set, these take precedence over the
-- owner's global policies for that specific booking (deposit threshold, payment
-- schedule, refund windows, check-in email timing).
-- All columns are nullable; null means "use the owner's global policy".
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS policy_checkin_email_days    int,
  ADD COLUMN IF NOT EXISTS policy_deposit_required_days int,
  ADD COLUMN IF NOT EXISTS policy_full_payment_due_days int,
  ADD COLUMN IF NOT EXISTS policy_refund_100_days       int,
  ADD COLUMN IF NOT EXISTS policy_refund_50_days        int,
  ADD COLUMN IF NOT EXISTS policy_deposit_pct           int;
