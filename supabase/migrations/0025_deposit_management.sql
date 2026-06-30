-- Deposit management: simplified two-knob policy, card-on-file for automatic
-- balance collection, and a per-transaction payments ledger.
--
-- balance_lead_days: how many days before check-in the balance is auto-charged.
-- A deposit only applies when a booking is made MORE than this many days out;
-- closer-in bookings pay in full. It supersedes the separate deposit_required_days
-- / full_payment_due_days knobs, which are kept (mirrored to balance_lead_days on
-- save) for back-compat with existing consumers.

alter table owner_policies
  add column if not exists balance_lead_days int not null default 45;

alter table properties
  add column if not exists balance_lead_days int not null default 45;

-- Carry over any customized timing from the prior knob.
update owner_policies set balance_lead_days = coalesce(full_payment_due_days, 45);
update properties      set balance_lead_days = coalesce(full_payment_due_days, 45);

alter table bookings
  -- Card-on-file for off-session balance charges. Stripe ids only — never card data.
  add column if not exists stripe_customer_id          text,
  add column if not exists stripe_payment_method_id    text,
  -- When the balance is scheduled to auto-charge (check_in - balance_lead_days).
  add column if not exists balance_charge_date          date,
  add column if not exists balance_charge_attempted_at  timestamptz,
  add column if not exists balance_charge_failed_at      timestamptz,
  add column if not exists balance_charge_error          text,
  -- Pre-charge guest reminders.
  add column if not exists balance_reminder7_sent_at     timestamptz,
  add column if not exists balance_reminder1_sent_at     timestamptz,
  -- Owner notifications for the balance lifecycle.
  add column if not exists owner_balance_paid_sent_at    timestamptz,
  add column if not exists owner_balance_failed_sent_at  timestamptz,
  -- Per-booking override (null = use property/owner policy).
  add column if not exists policy_balance_lead_days      int;

-- Per-transaction payment ledger (deposit, balance, full, refund) for the owner's
-- booking view — proof of payment with Stripe transaction IDs. Stripe ids only.
create table if not exists booking_payments (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings(id) on delete cascade,
  kind text not null,                          -- 'deposit' | 'balance' | 'full' | 'refund'
  amount_cents int not null,
  currency text not null,
  stripe_payment_intent_id text,
  card_brand text,
  card_last4 text,
  status text not null default 'succeeded',    -- 'succeeded' | 'failed' | 'refunded'
  created_at timestamptz not null default now()
);
create index if not exists booking_payments_booking_id_idx on booking_payments(booking_id);
