-- Admin fields on owners: commission rate, subscription amount, free trial expiration.
-- These are set/edited by the site admin (famguest.com owner).
ALTER TABLE owners
  ADD COLUMN IF NOT EXISTS commission_rate    numeric(5,2),      -- e.g. 5.00 for 5%
  ADD COLUMN IF NOT EXISTS subscription_amount numeric(10,2),    -- monthly $ amount, null if pay-as-you-go
  ADD COLUMN IF NOT EXISTS trial_expires_at  timestamptz,        -- null when no active trial
  ADD COLUMN IF NOT EXISTS welcome_message_html text;            -- owner-customizable welcome email body

-- Set trial_expires_at = now() + 30 days for every owner who registered
-- without a trial date (retroactive for existing test accounts).
UPDATE owners
  SET trial_expires_at = created_at + INTERVAL '30 days'
  WHERE trial_expires_at IS NULL;

-- Rich text for check-in instructions is stored in the existing
-- checkin_instructions column on properties (plain text → HTML seamlessly;
-- column type is already text, no change needed).

-- Welcome message per property (owners can set a different greeting per listing).
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS welcome_message_html text;
