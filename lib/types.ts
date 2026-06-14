export type BookingStatus =
  | "requested" // guest asked to book; awaiting owner approval
  | "offer_sent" // approved/owner-sent; pay link active
  | "paid"
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
  amount_cents: number;
  checkin_instructions: string | null;
  status: BookingStatus;
  kind: OfferKind;
  expires_at: string | null; // ISO; when an unpaid offer lapses and frees its dates
  stripe_session_id: string | null;
  stripe_payment_intent_id: string | null;
  paid_at: string | null;
  confirmation_sent_at: string | null;
  reminder7_sent_at: string | null;
  checkin_sent_at: string | null;
  created_at: string;
}

export type CleaningFeeType = "standard" | "daily" | "alt1" | "alt2";

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
  nightly_rate_cents: number | null;
  cleaning_fee_cents: number; // "Standard Cleaning Fee" amount
  cleaning_fee_type: CleaningFeeType;
  daily_cleaning_fee_cents: number;
  alt_cleaning_fee_1_cents: number;
  alt_cleaning_fee_2_cents: number;
  min_nights: number;
  is_listed: boolean;
  airbnb_ical_url: string | null;
  checkin_instructions: string | null;
  created_at: string;
}

export interface Guest {
  id: string;
  email: string;
  phone: string | null;
  full_name: string | null;
  created_at: string;
}
