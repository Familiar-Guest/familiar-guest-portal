-- Move payment/refund policy onto each property (per-property), seeded from the
-- owner's global default (owner_policies). The global default still exists and
-- seeds NEW properties; existing rows are backfilled from it here.
--
-- deposit_pct = 0 means "no deposit required" (full payment at booking).
-- Otherwise it's 25 or 50. full_payment_due_days is the balance due date
-- (days before check-in) when a deposit is taken.
alter table properties
  add column if not exists deposit_pct            int not null default 25,
  add column if not exists deposit_required_days  int not null default 30,
  add column if not exists full_payment_due_days  int not null default 30,
  add column if not exists refund_100_days        int not null default 30,
  add column if not exists refund_50_days         int not null default 15,
  add column if not exists checkin_email_days     int not null default 2;

-- Backfill from the owner's existing global policy so current behavior carries over.
update properties p set
  deposit_pct           = coalesce(op.deposit_pct, p.deposit_pct),
  deposit_required_days = coalesce(op.deposit_required_days, p.deposit_required_days),
  full_payment_due_days = coalesce(op.full_payment_due_days, p.full_payment_due_days),
  refund_100_days       = coalesce(op.refund_100_days, p.refund_100_days),
  refund_50_days        = coalesce(op.refund_50_days, p.refund_50_days),
  checkin_email_days    = coalesce(op.checkin_email_days, p.checkin_email_days)
from owner_policies op
where op.owner_id = p.owner_id;
