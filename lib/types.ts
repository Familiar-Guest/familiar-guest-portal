export type BookingStatus =
  | "requested" // guest asked to book; awaiting owner approval
  | "offer_sent" // approved/owner-sent; pay link active
  | "deposit_paid" // deposit collected, balance outstanding (holds dates)
  | "paid"
  | "forfeited" // balance unpaid past the grace window; deposit forfeited
  | "cancelled"
  | "declined"
  | "expired";

export type OfferKind = "offer" | "rebook" | "request";

export interface Booking {
  id: string;
  token: string;
  owner_id: string | null;
  property_id: string | null;
  guest_name: string;
  guest_email: string;
  guest_user_id: string | null;
  property_name: string;
  check_in: string; // YYYY-MM-DD
  check_out: string; // YYYY-MM-DD
  currency: string;
  amount_cents: number; // authoritative total = nightly_rate_cents × nights + cleaning_fee_cents
  nightly_rate_cents: number | null; // per-night rate shown to the guest
  cleaning_fee_cents: number; // total cleaning fee for the stay
  checkin_instructions: string | null;
  welcome_message_html: string | null;
  guest_phone: string | null;
  confirmation_method: "email" | "sms";
  status: BookingStatus;
  kind: OfferKind;
  expires_at: string | null; // ISO; when an unpaid offer lapses and frees its dates
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  confirmation_sent_at: string | null;
  reminder7_sent_at: string | null;
  checkin_sent_at: string | null;
  // Deposit/balance payment plan (see owner_policies).
  payment_plan: "full" | "deposit";
  deposit_cents: number;
  balance_cents: number;
  deposit_paid_at: string | null;
  balance_paid_at: string | null;
  balance_due_date: string | null; // YYYY-MM-DD
  balance_reminder_sent_at: string | null;
  balance_forfeited_at: string | null;
  balance_stripe_session_id: string | null;
  // Pending guest date-change request — null means no request is pending.
  requested_check_in: string | null;
  requested_check_out: string | null;
  date_change_requested_at: string | null;
  // Owner notifications when an invite offer approaches check-in without payment.
  owner_unpaid_1day_sent_at: string | null;
  owner_unpaid_checkin_sent_at: string | null;
  owner_unpaid_after_sent_at: string | null;
  // Per-booking policy overrides (null = use owner's global policy).
  policy_checkin_email_days: number | null;
  policy_deposit_required_days: number | null;
  policy_full_payment_due_days: number | null;
  policy_refund_100_days: number | null;
  policy_refund_50_days: number | null;
  policy_deposit_pct: number | null;
  created_at: string;
}

export type CleaningFeeType = "standard" | "daily" | "alt1" | "alt2";

/**
 * An owner-defined per-day price override for a date range. Nights within
 * [start, end] (inclusive) are priced at rate_cents instead of the property's
 * Standard Daily Rate. Ranges never overlap; max 8 per property.
 */
export interface NonStandardRate {
  id: string;
  name: string;
  start: string; // YYYY-MM-DD (inclusive)
  end: string; // YYYY-MM-DD (inclusive)
  rate_cents: number;
}

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  slug: string | null;
  location: string | null;
  description: string | null;
  photos: string[];
  gps_lat: number | null;
  gps_lng: number | null;
  currency: string;
  nightly_rate_cents: number | null; // "Standard Daily Rate" — default for every day
  nonstandard_rates: NonStandardRate[]; // up to 8 date-range price overrides
  cleaning_fee_cents: number; // "Standard Cleaning Fee" amount
  cleaning_fee_type: CleaningFeeType;
  daily_cleaning_fee_cents: number;
  alt_cleaning_fee_1_cents: number;
  alt_cleaning_fee_2_cents: number;
  min_nights: number;
  is_listed: boolean;
  airbnb_ical_url: string | null;
  checkin_instructions: string | null;
  welcome_message_html: string | null;
  // Structured check-in + address fields that populate the guest emails.
  address: string | null;
  check_in_time: string;
  check_out_time: string;
  entry_instructions: string | null;
  wifi: string | null;
  parking: string | null;
  house_rules: string | null;
  created_at: string;
}

export interface Guest {
  id: string;
  email: string;
  phone: string | null;
  full_name: string | null;
  created_at: string;
}

export type MessageSender = "owner" | "guest";

export interface Message {
  id: string;
  booking_id: string;
  owner_id: string;
  sender: MessageSender;
  direction: string; // 'outbound' (owner->guest) | 'inbound' (guest->owner)
  subject: string | null;
  body: string;
  read_at: string | null;
  created_at: string;
}
