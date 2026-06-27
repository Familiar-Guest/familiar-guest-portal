-- Allow complimentary (free) bookings where the owner sets a $0 rate.
-- The original constraint required amount_cents > 0; relax it to >= 0.
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_amount_cents_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_amount_cents_check CHECK (amount_cents >= 0);
