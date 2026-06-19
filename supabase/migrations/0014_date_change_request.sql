-- Pending guest date-change request on bookings.
--
-- When a guest requests new dates, we store the requested dates here and leave
-- the confirmed dates (check_in / check_out) untouched until the owner approves
-- or declines. date_change_requested_at non-null means a request is pending.

ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS requested_check_in       date,
  ADD COLUMN IF NOT EXISTS requested_check_out      date,
  ADD COLUMN IF NOT EXISTS date_change_requested_at timestamptz;
