-- Tracking columns for owner notifications when a guest invite offer is
-- approaching or has passed its check-in date without payment. Each column
-- is stamped once to prevent duplicate sends across cron runs.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS owner_unpaid_1day_sent_at    timestamptz,  -- owner notified 1 day before check-in (offer still unpaid)
  ADD COLUMN IF NOT EXISTS owner_unpaid_checkin_sent_at timestamptz,  -- owner notified on check-in day (offer still unpaid)
  ADD COLUMN IF NOT EXISTS owner_unpaid_after_sent_at   timestamptz;  -- owner notified 1 day after check-in (offer still unpaid)
