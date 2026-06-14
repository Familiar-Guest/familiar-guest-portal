export type BookingStatus = "offer_sent" | "paid" | "cancelled" | "expired";

export type OfferKind = "offer" | "rebook";

export interface Booking {
  id: string;
  token: string;
  owner_id: string | null;
  property_id: string | null;
  guest_name: string;
  guest_email: string;
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

export interface Property {
  id: string;
  owner_id: string;
  name: string;
  location: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
  currency: string;
  airbnb_ical_url: string | null;
  checkin_instructions: string | null;
  created_at: string;
}

export interface Message {
  id: string;
  booking_id: string;
  owner_id: string;
  direction: string; // 'outbound'
  body: string;
  created_at: string;
}
