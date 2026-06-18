-- Owner-global rental policies + deposit/balance payment plan on bookings.
--
-- Backs the 2026-06-17 Policies update: owners define one set of policies that
-- applies to all their properties, and the platform enforces them across the
-- booking lifecycle (deposit-then-balance payments, scheduled balance reminders
-- with forfeiture, refund windows, minimum lead time, check-in email timing).

-- One policy row per owner. Defaults match the spec.
CREATE TABLE IF NOT EXISTS owner_policies (
  owner_id              uuid PRIMARY KEY REFERENCES owners (id) ON DELETE CASCADE,
  min_days_to_book      int  NOT NULL DEFAULT 2,   -- earliest a guest may book before the stay
  checkin_email_days    int  NOT NULL DEFAULT 2,   -- send check-in email this many days before
  deposit_required_days int  NOT NULL DEFAULT 30,  -- deposit only when booking >= this far out
  full_payment_due_days int  NOT NULL DEFAULT 15,  -- balance due = check_in - this
  deposit_pct           numeric(5,2) NOT NULL DEFAULT 25,
  refund_100_days       int  NOT NULL DEFAULT 30,  -- full refund if cancelled >= this far out
  refund_50_days        int  NOT NULL DEFAULT 15,  -- half refund if cancelled >= this far out
  updated_at            timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE owner_policies ENABLE ROW LEVEL SECURITY;
-- No client policies: service-role server routes only.

-- Deposit/balance payment plan on bookings. A 'deposit' plan collects the
-- deposit now and leaves the balance due by balance_due_date; 'full' is the
-- single up-front payment.
ALTER TABLE bookings
  ADD COLUMN IF NOT EXISTS payment_plan              text NOT NULL DEFAULT 'full', -- 'full' | 'deposit'
  ADD COLUMN IF NOT EXISTS deposit_cents             int  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS balance_cents             int  NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deposit_paid_at           timestamptz,
  ADD COLUMN IF NOT EXISTS balance_paid_at           timestamptz,
  ADD COLUMN IF NOT EXISTS balance_due_date          date,
  ADD COLUMN IF NOT EXISTS balance_reminder_sent_at  timestamptz,
  ADD COLUMN IF NOT EXISTS balance_forfeited_at      timestamptz,
  ADD COLUMN IF NOT EXISTS balance_stripe_session_id text;

-- New booking status values now in use (status is free text, no enum change):
--   'deposit_paid' — deposit collected, balance outstanding (HOLDS its dates)
--   'forfeited'    — balance unpaid past the grace window (frees its dates)
