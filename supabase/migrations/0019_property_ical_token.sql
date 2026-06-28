-- Outbound calendar sync: each property gets a stable, unguessable token used
-- in its public .ics export URL (famguest.com/ical/<token>). Owners paste that
-- URL into Airbnb/VRBO's "Import calendar" field so Familiar Guest bookings
-- block those dates on the other platform — the outbound half of two-way sync.
alter table properties
  add column if not exists ical_token text;

-- Backfill existing rows with a random 32-char hex token.
update properties
  set ical_token = replace(gen_random_uuid()::text, '-', '')
  where ical_token is null;

alter table properties
  alter column ical_token set not null,
  alter column ical_token set default replace(gen_random_uuid()::text, '-', '');

create unique index if not exists properties_ical_token_idx
  on properties (ical_token);
