-- Guest payment-confirmation preference: text (SMS) or email, plus an
-- optional phone number collected at checkout if none is on file.

alter table bookings
  add column if not exists guest_phone text,
  add column if not exists confirmation_method text not null default 'email';

alter table bookings
  add constraint bookings_confirmation_method_check
  check (confirmation_method in ('email', 'sms'));
