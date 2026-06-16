const CURRENCIES = ["usd", "cad", "mxn"];
const CLEANING_FEE_TYPES = ["standard", "daily", "alt1", "alt2"];

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
  is_listed: boolean;
  airbnb_ical_url: string | null;
  checkin_instructions: string | null;
  welcome_message_html: string | null;
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
  const airbnb_ical_url = String(body.airbnb_ical_url ?? "").trim() || null;
  if (airbnb_ical_url && !/^https?:\/\//i.test(airbnb_ical_url))
    return { error: "The calendar link must start with http:// or https://" };
  const checkin_instructions =
    String(body.checkin_instructions ?? "").trim() || null;
  const welcome_message_html =
    String(body.welcome_message_html ?? "").trim() || null;

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
      is_listed,
      airbnb_ical_url,
      checkin_instructions,
      welcome_message_html,
      gps_lat,
      gps_lng,
    },
  };
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
