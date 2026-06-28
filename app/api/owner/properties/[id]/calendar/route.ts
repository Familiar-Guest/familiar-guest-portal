import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { computeBusyRanges } from "@/lib/availability";
import type { Property } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const ranges = await computeBusyRanges(supabase, id, property.import_feeds);

  return NextResponse.json({
    ok: true,
    property: { id: property.id, name: property.name },
    hasCalendar: (property.import_feeds?.length ?? 0) > 0,
    ranges,
  });
}
