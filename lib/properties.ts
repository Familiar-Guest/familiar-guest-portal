import { IMPORT_PLATFORMS, type ImportFeed, type NonStandardRate } from "./types";
import { DEFAULT_POLICY } from "./policies";

const IMPORT_PLATFORM_KEYS = new Set<string>(IMPORT_PLATFORMS.map((p) => p.key));

export const CURRENCIES = ["usd", "cad", "mxn", "eur"];
const CLEANING_FEE_TYPES = ["standard", "daily", "alt1", "alt2"];
export const MAX_NONSTANDARD_RATES = 8;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export type PropertyInput = {
  name: string;
  slug: string;
  location: string | null;
  description: string | null;
  photos: string[];
  currency: string;
  nightly_rate_cents: number | null;
  cleaning_fee_cents: number;
  cleaning_fee_type: string;
  daily_cleaning_fee_cents: number;
  alt_cleaning_fee_1_cents: number;
  alt_cleaning_fee_2_cents: number;
  min_nights: number;
  nonstandard_rates: NonStandardRate[];
  deposit_pct: number;
  balance_lead_days: number;
  deposit_required_days: number;
  full_payment_due_days: number;
  refund_100_days: number;
  refund_50_days: number;
  checkin_email_days: number;
  is_listed: boolean;
  import_feeds: ImportFeed[];
  checkin_instructions: string | null;
  // Structured check-in + address fields used by the guest emails.
  address: string | null;
  check_in_time: string;
  check_out_time: string;
  entry_instructions: string | null;
  wifi: string | null;
  parking: string | null;
  house_rules: string | null;
  gps_lat: number | null;
  gps_lng: number | null;
};

/** Validate + normalize a property create/edit payload. */
export function parsePropertyInput(
  body: Record<string, unknown>
): { value: PropertyInput } | { error: string } {
  const name = String(body.name ?? "").trim();
  if (!name) return { error: "Enter a property name." };

  const currency = String(body.currency ?? "usd").trim().toLowerCase();
  if (!CURRENCIES.includes(currency)) return { error: "Unsupported currency." };

  const location = String(body.location ?? "").trim() || null;
  const description = String(body.description ?? "").trim() || null;

  // Inbound calendar feeds to import (one optional URL per platform).
  const importResult = parseImportFeeds(body.import_feeds);
  if ("error" in importResult) return { error: importResult.error };
  const import_feeds = importResult.value;

  const checkin_instructions =
    String(body.checkin_instructions ?? "").trim() || null;

  // Structured check-in + address fields (drive the booking/check-in emails).
  const address = String(body.address ?? "").trim() || null;
  const check_in_time = String(body.check_in_time ?? "").trim() || "3:00 PM";
  const check_out_time = String(body.check_out_time ?? "").trim() || "11:00 AM";
  const entry_instructions = String(body.entry_instructions ?? "").trim() || null;
  const wifi = String(body.wifi ?? "").trim() || null;
  const parking = String(body.parking ?? "").trim() || null;
  const house_rules = String(body.house_rules ?? "").trim() || null;

  const photos = Array.isArray(body.photos)
    ? (body.photos as unknown[]).map((p) => String(p)).filter(Boolean).slice(0, 10)
    : [];

  const nightly_rate_cents = centsOrNull(body.nightly_rate);
  const cleaning_fee_cents = centsOrNull(body.cleaning_fee) ?? 0;
  const daily_cleaning_fee_cents = centsOrNull(body.daily_cleaning_fee) ?? 0;
  const alt_cleaning_fee_1_cents = centsOrNull(body.alt_cleaning_fee_1) ?? 0;
  const alt_cleaning_fee_2_cents = centsOrNull(body.alt_cleaning_fee_2) ?? 0;
  const cleaning_fee_type = CLEANING_FEE_TYPES.includes(String(body.cleaning_fee_type))
    ? String(body.cleaning_fee_type)
    : "standard";
  const min_nights = Math.max(1, Math.round(Number(body.min_nights) || 1));
  const is_listed = body.is_listed === true;

  const nsResult = parseNonStandardRates(body.nonstandard_rates);
  if ("error" in nsResult) return { error: nsResult.error };
  const nonstandard_rates = nsResult.value;

  // Payment / refund policy (per-property). deposit_pct 0 = no deposit required.
  const deposits_required = body.deposits_required === true;
  let deposit_pct = 0;
  if (deposits_required) {
    deposit_pct = Math.round(Number(body.deposit_pct));
    if (deposit_pct !== 25 && deposit_pct !== 50)
      return { error: "Deposit must be 25% or 50%." };
  }
  // Single timing knob: the balance auto-charges this many days before check-in,
  // and a deposit only applies to bookings made further out than this. The legacy
  // deposit_required_days / full_payment_due_days columns are mirrored to it.
  const balance_lead_days = intOr(body.balance_lead_days, DEFAULT_POLICY.balance_lead_days);
  if (deposits_required && balance_lead_days < 1)
    return { error: "The balance must be collected at least 1 day before check-in." };
  const deposit_required_days = balance_lead_days;
  const full_payment_due_days = balance_lead_days;
  const refund_100_days = intOr(body.refund_100_days, DEFAULT_POLICY.refund_100_days);
  const refund_50_days = intOr(body.refund_50_days, DEFAULT_POLICY.refund_50_days);
  if (refund_50_days > refund_100_days)
    return { error: "The 50% refund window can't be longer than the 100% window." };
  const checkin_email_days = intOr(body.checkin_email_days, DEFAULT_POLICY.checkin_email_days);

  if (is_listed && (nightly_rate_cents === null || nightly_rate_cents <= 0))
    return { error: "Set a nightly rate before publishing this listing." };
  if (is_listed && photos.length === 0)
    return { error: "Add at least one photo before publishing this listing." };

  const gps_lat = numOrNull(body.gps_lat);
  const gps_lng = numOrNull(body.gps_lng);
  if ((gps_lat === null) !== (gps_lng === null))
    return { error: "Enter both latitude and longitude, or neither." };

  return {
    value: {
      name,
      slug: slugify(name),
      location,
      description,
      photos,
      currency,
      nightly_rate_cents,
      cleaning_fee_cents,
      cleaning_fee_type,
      daily_cleaning_fee_cents,
      alt_cleaning_fee_1_cents,
      alt_cleaning_fee_2_cents,
      min_nights,
      nonstandard_rates,
      deposit_pct,
      balance_lead_days,
      deposit_required_days,
      full_payment_due_days,
      refund_100_days,
      refund_50_days,
      checkin_email_days,
      is_listed,
      import_feeds,
      checkin_instructions,
      address,
      check_in_time,
      check_out_time,
      entry_instructions,
      wifi,
      parking,
      house_rules,
      gps_lat,
      gps_lng,
    },
  };
}

/**
 * Validate + normalize the non-standard (per-date-range) rates payload.
 * Rules: at most 8 ranges, each with valid start ≤ end dates and a non-negative
 * rate, no overlap between ranges, and a name (auto-filled "Non-Standard N" when
 * the owner left it blank). Wire shape per entry: { id?, name?, start, end, rate }
 * where `rate` is in the property's currency units (dollars), converted to cents.
 */
function parseNonStandardRates(
  raw: unknown
): { value: NonStandardRate[] } | { error: string } {
  if (raw === undefined || raw === null) return { value: [] };
  if (!Array.isArray(raw)) return { error: "Invalid non-standard rates." };
  if (raw.length > MAX_NONSTANDARD_RATES)
    return { error: `You can set at most ${MAX_NONSTANDARD_RATES} non-standard rates.` };

  const parsed: NonStandardRate[] = [];
  for (const item of raw) {
    const r = (item ?? {}) as Record<string, unknown>;
    const start = String(r.start ?? "").trim();
    const end = String(r.end ?? "").trim();
    if (!DATE_RE.test(start) || !DATE_RE.test(end))
      return { error: "Each non-standard rate needs valid start and end dates." };
    if (end < start)
      return { error: "A non-standard rate's end date can't be before its start date." };
    const rate_cents = centsOrNull(r.rate);
    if (rate_cents === null)
      return { error: "Enter a valid amount for each non-standard rate." };
    const id = String(r.id ?? "").trim() || `ns_${Math.random().toString(36).slice(2, 10)}`;
    const name = String(r.name ?? "").trim();
    parsed.push({ id, name, start, end, rate_cents });
  }

  // Reject overlaps: sort by start, then ensure each range begins after the
  // previous one ends (end is an inclusive night, so equal/earlier = overlap).
  const sorted = [...parsed].sort((a, b) => (a.start < b.start ? -1 : 1));
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].start <= sorted[i - 1].end)
      return { error: "Non-standard date ranges can't overlap." };
  }

  // Fill blank names with a unique "Non-Standard N", skipping numbers already
  // used by owner-named ranges that happen to match the pattern.
  const used = new Set<number>();
  for (const r of parsed) {
    const m = /^Non-Standard (\d+)$/.exec(r.name);
    if (m) used.add(Number(m[1]));
  }
  let next = 1;
  for (const r of parsed) {
    if (r.name) continue;
    while (used.has(next)) next++;
    r.name = `Non-Standard ${next}`;
    used.add(next);
  }

  return { value: parsed };
}

/** Validate + normalize the inbound import feeds: an array of { platform, url }
 *  with known platforms and http(s) URLs; blanks are dropped. */
function parseImportFeeds(
  raw: unknown
): { value: ImportFeed[] } | { error: string } {
  if (raw === undefined || raw === null) return { value: [] };
  if (!Array.isArray(raw)) return { error: "Invalid calendar feeds." };
  const seen = new Set<string>();
  const feeds: ImportFeed[] = [];
  for (const item of raw) {
    const r = (item ?? {}) as Record<string, unknown>;
    const platform = String(r.platform ?? "").trim().toLowerCase();
    const url = String(r.url ?? "").trim();
    if (!url) continue;
    if (!IMPORT_PLATFORM_KEYS.has(platform))
      return { error: "Unknown calendar platform." };
    if (seen.has(platform))
      return { error: "Only one calendar link per platform." };
    if (!/^https?:\/\//i.test(url))
      return { error: "Each calendar link must start with http:// or https://" };
    seen.add(platform);
    feeds.push({ platform, url });
  }
  return { value: feeds };
}

export function slugify(s: string): string {
  const base = s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
  return base || "listing";
}

function centsOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  if (!Number.isFinite(n) || n < 0) return null;
  return Math.round(n * 100);
}

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

/** Parse a non-negative integer, falling back to `dflt` for missing/invalid input. */
function intOr(v: unknown, dflt: number): number {
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? Math.round(n) : dflt;
}
