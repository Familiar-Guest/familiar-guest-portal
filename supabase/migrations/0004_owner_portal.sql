-- Owner portal: real multi-owner accounts + properties + per-booking messaging.
--
-- Auth itself lives in Supabase Auth (auth.users, email + password). These
-- tables hold the app data, all keyed to the authenticated owner's uid.
-- RLS is ON with no client policies: every read/write goes through the
-- service-role server routes, which scope by owner_id from the session.

-- Owner profile (extra fields beyond auth.users).
create table if not exists owners (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  full_name text,
  phone text,
  created_at timestamptz not null default now()
);

-- A property an owner rents out.
create table if not exists properties (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  location text,
  gps_lat double precision,
  gps_lng double precision,
  currency text not null default 'usd',
  airbnb_ical_url text,                       -- owner's Airbnb (or other) export URL
  checkin_instructions text,                  -- default instructions for this property
  created_at timestamptz not null default now()
);
create index if not exists properties_owner_idx on properties (owner_id);

-- Tie bookings/offers to an owner + property (nullable for pre-portal rows).
alter table bookings
  add column if not exists owner_id uuid references auth.users (id) on delete set null,
  add column if not exists property_id uuid references properties (id) on delete set null;
create index if not exists bookings_owner_idx on bookings (owner_id);
create index if not exists bookings_property_idx on bookings (property_id);

-- Owner -> guest messages, threaded per booking.
create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references bookings (id) on delete cascade,
  owner_id uuid not null references auth.users (id) on delete cascade,
  direction text not null default 'outbound', -- 'outbound' (owner->guest)
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_booking_idx on messages (booking_id, created_at);

alter table owners enable row level security;
alter table properties enable row level security;
alter table messages enable row level security;
-- No client policies: service-role server routes only (scoped by owner_id).
