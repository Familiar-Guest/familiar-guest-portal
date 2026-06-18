-- Email-template data capture, tokenized guest portal, and two-way messaging.
--
-- Backs the 2026-06-17 update: the new transactional email templates
-- (booking confirmation, check-in) need structured property data; guests get a
-- permanent no-login portal keyed by email; owner<->guest messaging becomes
-- two-way with email-style fields.

-- 1. Property check-in + address fields used by the new email templates.
--    check_in_time / check_out_time mirror the template defaults so existing
--    rows render sensibly without owner edits.
ALTER TABLE properties
  ADD COLUMN IF NOT EXISTS address            text,
  ADD COLUMN IF NOT EXISTS check_in_time      text NOT NULL DEFAULT '3:00 PM',
  ADD COLUMN IF NOT EXISTS check_out_time     text NOT NULL DEFAULT '11:00 AM',
  ADD COLUMN IF NOT EXISTS entry_instructions text,
  ADD COLUMN IF NOT EXISTS wifi               text,
  ADD COLUMN IF NOT EXISTS parking            text,
  ADD COLUMN IF NOT EXISTS house_rules        text;

-- 2. Permanent, no-login guest portal token keyed by email (the unique customer
--    key). One token per guest email; the link is the credential.
CREATE TABLE IF NOT EXISTS guest_portals (
  email      text PRIMARY KEY,
  token      text NOT NULL UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE guest_portals ENABLE ROW LEVEL SECURITY;
-- No client policies: service-role server routes only.

-- 3. Two-way, email-style messaging. The messages table already exists
--    (owner->guest, outbound only); extend it for guest replies and the common
--    email fields (subject, read state). `sender` is the source of truth;
--    `direction` (existing) is kept in sync for backward compatibility.
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS sender  text NOT NULL DEFAULT 'owner',  -- 'owner' | 'guest'
  ADD COLUMN IF NOT EXISTS subject text,
  ADD COLUMN IF NOT EXISTS read_at timestamptz;

-- Note: owners.welcome_message_html and properties.welcome_message_html are
-- intentionally left in place (non-destructive) but are no longer written or
-- read after this update.
