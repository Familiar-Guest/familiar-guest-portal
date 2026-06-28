-- Generalize inbound calendar sync: support importing iCal feeds from multiple
-- platforms (Airbnb, Booking.com, Expedia, Houfy, VRBO) instead of a single
-- Airbnb URL. Stored as a JSONB array of { platform, url }.
--
-- The legacy single `airbnb_ical_url` column is kept for back-compat but no
-- longer read; it is migrated into import_feeds here.
alter table properties
  add column if not exists import_feeds jsonb not null default '[]'::jsonb;

update properties
  set import_feeds = jsonb_build_array(
    jsonb_build_object('platform', 'airbnb', 'url', airbnb_ical_url)
  )
  where (import_feeds is null or import_feeds = '[]'::jsonb)
    and airbnb_ical_url is not null
    and airbnb_ical_url <> '';
