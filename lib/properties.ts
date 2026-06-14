const CURRENCIES = ["usd", "cad", "mxn"];

export type PropertyInput = {
  name: string;
  location: string | null;
  currency: string;
  airbnb_ical_url: string | null;
  checkin_instructions: string | null;
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
  const airbnb_ical_url = String(body.airbnb_ical_url ?? "").trim() || null;
  if (airbnb_ical_url && !/^https?:\/\//i.test(airbnb_ical_url))
    return { error: "The calendar link must start with http:// or https://" };
  const checkin_instructions =
    String(body.checkin_instructions ?? "").trim() || null;

  const gps_lat = numOrNull(body.gps_lat);
  const gps_lng = numOrNull(body.gps_lng);
  if ((gps_lat === null) !== (gps_lng === null))
    return { error: "Enter both latitude and longitude, or neither." };

  return {
    value: {
      name,
      location,
      currency,
      airbnb_ical_url,
      checkin_instructions,
      gps_lat,
      gps_lng,
    },
  };
}

function numOrNull(v: unknown): number | null {
  if (v === null || v === undefined || v === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}
