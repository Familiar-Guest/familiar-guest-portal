-- Owner-defined bookings ("offers"): the owner sets dates + price for a known
-- guest, the guest pays via a private link, and the platform sends the
-- confirmation, 7-day reminder, and 2-day check-in emails automatically.
create table if not exists bookings (
  id uuid primary key default gen_random_uuid(),
  token text not null unique,                 -- unguessable id for the /book/[token] link
  guest_name text not null,
  guest_email text not null,
  property_name text not null,
  check_in date not null,
  check_out date not null,
  currency text not null default 'usd',
  amount_cents integer not null check (amount_cents > 0),
  checkin_instructions text,                  -- shown in the check-in email
  status text not null default 'offer_sent',  -- offer_sent | paid | cancelled
  stripe_session_id text,
  stripe_payment_intent_id text,
  paid_at timestamptz,
  -- idempotency stamps so the cron + webhook never double-send
  confirmation_sent_at timestamptz,
  reminder7_sent_at timestamptz,
  checkin_sent_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists bookings_status_checkin_idx on bookings (status, check_in);

alter table bookings enable row level security;
-- No client policies: all access is through the service-role server routes
-- (owner offer form, guest payment, Stripe webhook, reminders cron).
