-- Waitlist signups from the marketing site
create table if not exists waitlist (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  locale text not null default 'en',
  source text,
  created_at timestamptz not null default now()
);

alter table waitlist enable row level security;

-- No client-side access; all reads/writes go through the service-role
-- /api/waitlist route handler.
