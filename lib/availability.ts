import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchBusyBlocks } from "./ical";
import { isActiveOffer } from "./offers";
import { nights } from "./format";
import type { Booking, Property } from "./types";

export interface BusyRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD (exclusive)
  label: string;
  type: "booked" | "offer" | "airbnb";
}

/**
 * What's unavailable for a property: confirmed bookings + live offer holds +
 * the linked Airbnb calendar. Pending requests do NOT block (the owner picks).
 */
export async function computeBusyRanges(
  supabase: SupabaseClient,
  propertyId: string,
  airbnbIcalUrl: string | null
): Promise<BusyRange[]> {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("property_id", propertyId)
    .in("status", ["paid", "offer_sent"]);
  const bookings = (data ?? []) as Booking[];

  const ranges: BusyRange[] = [];
  for (const b of bookings) {
    if (b.status === "paid") {
      ranges.push({ start: b.check_in, end: b.check_out, label: `Booked · ${b.guest_name}`, type: "booked" });
    } else if (isActiveOffer(b)) {
      ranges.push({ start: b.check_in, end: b.check_out, label: `Offer hold · ${b.guest_name}`, type: "offer" });
    }
  }

  if (airbnbIcalUrl) {
    const blocks = await fetchBusyBlocks(airbnbIcalUrl);
    for (const blk of blocks) {
      ranges.push({ start: blk.start, end: blk.end, label: blk.summary || "Airbnb", type: "airbnb" });
    }
  }

  ranges.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));
  return ranges;
}

/** True if [checkIn, checkOut) overlaps any busy range (exclusive end dates). */
export function overlapsBusy(ranges: BusyRange[], checkIn: string, checkOut: string): boolean {
  return ranges.some((r) => r.start < checkOut && r.end > checkIn);
}

export interface Quote {
  nights: number;
  nightly_cents: number;
  cleaning_cents: number;
  amount_cents: number;
}

/** Price a stay from a property's nightly rate + cleaning fee. */
export function quote(property: Property, checkIn: string, checkOut: string): Quote | null {
  if (property.nightly_rate_cents == null || property.nightly_rate_cents <= 0) return null;
  const n = nights(checkIn, checkOut);
  if (n <= 0) return null;
  const nightly_cents = property.nightly_rate_cents * n;
  const cleaning_cents = property.cleaning_fee_cents ?? 0;
  return {
    nights: n,
    nightly_cents,
    cleaning_cents,
    amount_cents: nightly_cents + cleaning_cents,
  };
}
