-- Owner contact info, shared with guests at the bottom of the welcome message.
ALTER TABLE owners
  ADD COLUMN IF NOT EXISTS contact_email    text,
  ADD COLUMN IF NOT EXISTS contact_phone    text,
  ADD COLUMN IF NOT EXISTS contact_whatsapp text;

-- Default the contact email to the account email where not yet set.
UPDATE owners
  SET contact_email = email
  WHERE contact_email IS NULL;
