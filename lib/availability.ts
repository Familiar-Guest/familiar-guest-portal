import type { SupabaseClient } from "@supabase/supabase-js";
import { fetchFeedsBusyBlocks } from "./ical";
import { isActiveOffer } from "./offers";
import { nights } from "./format";
import type { Booking, ImportFeed, Property } from "./types";

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
  importFeeds: ImportFeed[] | null,
  excludeBookingId?: string
): Promise<BusyRange[]> {
  let q = supabase
    .from("bookings")
    .select("*")
    .eq("property_id", propertyId)
    .in("status", ["paid", "offer_sent"]);
  if (excludeBookingId) q = q.neq("id", excludeBookingId);
  const { data } = await q;
  const bookings = (data ?? []) as Booking[];

  const ranges: BusyRange[] = [];
  for (const b of bookings) {
    if (b.status === "paid") {
      ranges.push({ start: b.check_in, end: b.check_out, label: `Booked · ${b.guest_name}`, type: "booked" });
    } else if (isActiveOffer(b)) {
      ranges.push({ start: b.check_in, end: b.check_out, label: `Offer hold · ${b.guest_name}`, type: "offer" });
    }
  }

  const blocks = await fetchFeedsBusyBlocks(importFeeds);
  for (const blk of blocks) {
    ranges.push({ start: blk.start, end: blk.end, label: blk.summary || "Synced", type: "airbnb" });
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

/** The cleaning fee for a stay of `n` nights, based on the property's chosen fee type. */
export function cleaningFeeForStay(property: Property, n: number): number {
  switch (property.cleaning_fee_type) {
    case "daily":
      return (property.daily_cleaning_fee_cents ?? 0) * n;
    case "alt1":
      return property.alt_cleaning_fee_1_cents ?? 0;
    case "alt2":
      return property.alt_cleaning_fee_2_cents ?? 0;
    default:
      return property.cleaning_fee_cents ?? 0;
  }
}

/** Price a stay from a property's nightly rate + cleaning fee. */
export function quote(property: Property, checkIn: string, checkOut: string): Quote | null {
  if (property.nightly_rate_cents == null || property.nightly_rate_cents <= 0) return null;
  const n = nights(checkIn, checkOut);
  if (n <= 0) return null;
  const nightly_cents = property.nightly_rate_cents * n;
  const cleaning_cents = cleaningFeeForStay(property, n);
  return {
    nights: n,
    nightly_cents,
    cleaning_cents,
    amount_cents: nightly_cents + cleaning_cents,
  };
}
