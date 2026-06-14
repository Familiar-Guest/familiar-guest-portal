-- Stay offers, part 2: expiration + offer kind.
--
-- An offer now holds its dates only until it expires (7 days from creation).
-- Until then, those dates are blocked from being offered again; once an offer
-- is paid it becomes a real booking; once it expires the dates free up.
-- `kind` distinguishes a fresh offer from a one-click rebook (same pipeline).

alter table bookings
  add column if not exists expires_at timestamptz,
  add column if not exists kind text not null default 'offer';   -- 'offer' | 'rebook'

-- Backfill any existing open offers so they have a sensible expiry.
update bookings
  set expires_at = created_at + interval '7 days'
  where expires_at is null and status = 'offer_sent';

-- status values now in use: offer_sent | paid | cancelled | expired
-- (no DB enum/check — kept as text; see lib/offers.ts for the lifecycle).

-- Helps the date-hold conflict query (overlap scan over open/paid stays).
create index if not exists bookings_dates_idx on bookings (check_in, check_out);
