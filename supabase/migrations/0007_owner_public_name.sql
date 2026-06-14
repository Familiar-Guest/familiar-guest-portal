-- Owner-chosen public display name, used for the storefront handle
-- (famguest.com/h/<handle>) instead of their first+last name.

alter table owners
  add column if not exists public_name text;
