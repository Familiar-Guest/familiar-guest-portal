-- Per-day pricing for properties.
--
-- The existing `nightly_rate_cents` column is the property's "Standard Daily
-- Rate" — applied to every day by default. `nonstandard_rates` holds up to 8
-- owner-defined date ranges that override the standard rate for those nights.
--
-- Shape (JSONB array, max 8 entries, non-overlapping ranges):
--   [{ "id": "ns_ab12cd", "name": "Holiday week",
--      "start": "2026-12-20", "end": "2026-12-27", "rate_cents": 45000 }]
-- start/end are inclusive nights (YYYY-MM-DD). Validation (count, overlap,
-- date sanity) is enforced in application code (lib/properties.ts).
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS nonstandard_rates jsonb NOT NULL DEFAULT '[]'::jsonb;
