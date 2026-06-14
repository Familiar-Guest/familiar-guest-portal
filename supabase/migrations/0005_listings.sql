-- Public listings + self-serve (request-to-book) + required guest accounts.

-- Owner storefront handle for the shareable short URL: famguest.com/h/<handle>
alter table owners
  add column if not exists handle text unique;

-- Listing fields on a property.
alter table properties
  add column if not exists slug text,
  add column if not exists description text,          -- short blurb for the card
  add column if not exists photos text[] not null default '{}',  -- cover = photos[0]
  add column if not exists nightly_rate_cents integer,
  add column if not exists cleaning_fee_cents integer not null default 0,
  add column if not exists min_nights integer not null default 1,
  add column if not exists is_listed boolean not null default false;
-- slug is unique per owner (used in famguest.com/h/<handle>/<slug>)
create unique index if not exists properties_owner_slug_idx
  on properties (owner_id, slug);
create index if not exists properties_listed_idx on properties (owner_id, is_listed);

-- Tie a booking to the guest's account (required going forward).
alter table bookings
  add column if not exists guest_user_id uuid references auth.users (id) on delete set null;
create index if not exists bookings_guest_user_idx on bookings (guest_user_id);

-- Guest account profile (separate from owners; a person could be both).
create table if not exists guests (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  phone text,
  full_name text,
  created_at timestamptz not null default now()
);

alter table guests enable row level security;
-- No client policies: service-role server routes only.

-- New status values now in use: 'requested' (guest asked), 'declined' (owner said no).
-- New kind value: 'request'. All free text, no enum changes needed.
