import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { fetchBusyBlocks } from "@/lib/ical";
import { isActiveOffer } from "@/lib/offers";
import type { Booking, Property } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export interface BusyRange {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD (exclusive)
  label: string;
  type: "booked" | "offer" | "airbnb";
}

/** Availability for one property: confirmed bookings + live offer holds + Airbnb iCal. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: prop } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("owner_id", owner.id)
    .single();
  const property = prop as Property | null;
  if (!property)
    return NextResponse.json({ error: "Property not found." }, { status: 404 });

  const { data: bk } = await supabase
    .from("bookings")
    .select("*")
    .eq("property_id", id)
    .in("status", ["paid", "offer_sent"]);
  const bookings = (bk ?? []) as Booking[];

  const ranges: BusyRange[] = [];
  for (const b of bookings) {
    if (b.status === "paid") {
      ranges.push({
        start: b.check_in,
        end: b.check_out,
        label: `Booked · ${b.guest_name}`,
        type: "booked",
      });
    } else if (isActiveOffer(b)) {
      ranges.push({
        start: b.check_in,
        end: b.check_out,
        label: `Offer hold · ${b.guest_name}`,
        type: "offer",
      });
    }
  }

  if (property.airbnb_ical_url) {
    const blocks = await fetchBusyBlocks(property.airbnb_ical_url);
    for (const blk of blocks) {
      ranges.push({
        start: blk.start,
        end: blk.end,
        label: blk.summary || "Airbnb",
        type: "airbnb",
      });
    }
  }

  ranges.sort((a, b) => (a.start < b.start ? -1 : a.start > b.start ? 1 : 0));

  return NextResponse.json({
    ok: true,
    property: { id: property.id, name: property.name },
    hasCalendar: Boolean(property.airbnb_ical_url),
    ranges,
  });
}
