-- Gate 1: Stripe Connect Custom + identity (KYC) verification for owners.
--
-- Each owner gets a Stripe Connect Custom account. Onboarding/KYC happens in
-- Stripe-hosted flows (no sensitive PII touches our servers). These columns
-- cache the account id and the verification state Stripe reports back, so we can
-- gate paying actions (an owner can't collect payment until charges_enabled).
alter table owners
  add column if not exists stripe_account_id        text,
  add column if not exists stripe_charges_enabled   boolean not null default false,
  add column if not exists stripe_payouts_enabled   boolean not null default false,
  add column if not exists stripe_details_submitted boolean not null default false;

create unique index if not exists owners_stripe_account_idx
  on owners (stripe_account_id);
