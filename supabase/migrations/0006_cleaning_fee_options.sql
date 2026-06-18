-- Cleaning fee options: owner picks one of four fee structures per property.
-- cleaning_fee_cents (existing column) now holds the "Standard Cleaning Fee" amount.

alter table properties
  add column if not exists cleaning_fee_type text not null default 'standard',
  add column if not exists daily_cleaning_fee_cents integer not null default 0,
  add column if not exists alt_cleaning_fee_1_cents integer not null default 0,
  add column if not exists alt_cleaning_fee_2_cents integer not null default 0;

alter table properties
  add constraint properties_cleaning_fee_type_check
  check (cleaning_fee_type in ('standard', 'daily', 'alt1', 'alt2'));
