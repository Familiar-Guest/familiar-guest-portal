import type { SupabaseClient } from "@supabase/supabase-js";
import type { Booking } from "./types";

/** How long a stay offer holds its dates before it lapses. */
export const OFFER_TTL_DAYS = 7;

/** ISO timestamp 7 days from `from` — the offer's expiry. */
export function offerExpiresAt(from: Date = new Date()): string {
  return new Date(from.getTime() + OFFER_TTL_DAYS * 86_400_000).toISOString();
}

/** An offer is expired if it's still awaiting payment past its expiry stamp. */
export function isExpired(
  b: Pick<Booking, "status" | "expires_at">,
  now: Date = new Date()
): boolean {
  return (
    b.status === "offer_sent" &&
    !!b.expires_at &&
    new Date(b.expires_at).getTime() <= now.getTime()
  );
}

/** True while an offer is live and still holding its dates. */
export function isActiveOffer(
  b: Pick<Booking, "status" | "expires_at">,
  now: Date = new Date()
): boolean {
  return b.status === "offer_sent" && !isExpired(b, now);
}

/** YYYY-MM-DD (UTC) date portion of an ISO timestamp. */
export function expiryDate(iso: string): string {
  return iso.slice(0, 10);
}

export interface InternalConflict {
  guest_name: string;
  check_in: string;
  check_out: string;
  status: string; // 'paid' | 'offer_sent'
}

/**
 * Finds an existing paid booking or active (non-expired) offer whose dates
 * overlap [check_in, check_out). This is what "holds" dates when an offer is
 * made: you can't offer the same nights twice. Expired offers and cancelled
 * bookings free their dates and are ignored. Pass a service-role client.
 */
export async function findInternalConflict(
  supabase: SupabaseClient,
  args: {
    check_in: string;
    check_out: string;
    excludeId?: string;
    propertyId?: string | null;
  }
): Promise<InternalConflict | null> {
  const { check_in, check_out, excludeId, propertyId } = args;
  // Overlap with exclusive end dates: existing.start < requested.end AND existing.end > requested.start
  let q = supabase
    .from("bookings")
    .select("id,guest_name,check_in,check_out,status,expires_at")
    .in("status", ["paid", "offer_sent"])
    .lt("check_in", check_out)
    .gt("check_out", check_in);
  if (propertyId) q = q.eq("property_id", propertyId);
  const { data } = await q;

  const rows = (data ?? []) as Array<
    Pick<
      Booking,
      "id" | "guest_name" | "check_in" | "check_out" | "status" | "expires_at"
    >
  >;
  const now = new Date();
  for (const r of rows) {
    if (excludeId && r.id === excludeId) continue;
    if (r.status === "offer_sent" && isExpired(r, now)) continue; // lapsed hold = free
    return {
      guest_name: r.guest_name,
      check_in: r.check_in,
      check_out: r.check_out,
      status: r.status,
    };
  }
  return null;
}
