import { NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildIcalFeed, type IcalEvent } from "@/lib/ical";
import { isActiveOffer } from "@/lib/offers";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Public outbound calendar feed for one property, addressed by its unguessable
 * ical_token: famguest.com/ical/<token>.ics
 *
 * Emits an all-day busy block for every Familiar Guest reservation (paid or
 * deposit-paid) and every live offer hold, so Airbnb/VRBO/etc. block those
 * dates when the owner imports this URL. Guest names are NOT included — only
 * generic "Reserved"/"Hold" summaries — since the feed is public-by-token.
 */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token: raw } = await params;
  const token = raw.replace(/\.ics$/i, "");

  const supabase = createAdminClient();
  const { data: prop } = await supabase
    .from("properties")
    .select("id, name")
    .eq("ical_token", token)
    .maybeSingle();

  if (!prop) {
    return new Response("Calendar not found.", { status: 404 });
  }

  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("property_id", prop.id)
    .in("status", ["paid", "deposit_paid", "offer_sent"]);
  const bookings = (data ?? []) as Booking[];

  const events: IcalEvent[] = [];
  for (const b of bookings) {
    const blocks = b.status === "paid" || b.status === "deposit_paid";
    const holds = b.status === "offer_sent" && isActiveOffer(b);
    if (!blocks && !holds) continue; // lapsed/expired offers free their dates
    events.push({
      uid: `${b.id}@famguest.com`,
      start: b.check_in,
      end: b.check_out,
      summary: blocks ? "Reserved (Familiar Guest)" : "Hold (Familiar Guest)",
    });
  }

  const body = buildIcalFeed(`${prop.name} — Familiar Guest`, events);

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="famguest-${token}.ics"`,
      // Let the CDN cache briefly; importing platforms poll every few hours.
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
