import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { computeBusyRanges } from "@/lib/availability";

export const runtime = "nodejs";

/** Busy date ranges for a property — used by the offer form date picker.
 *  Pass ?exclude=<bookingId> to omit one booking from the ranges
 *  (e.g. when editing an existing offer so it doesn't show as self-blocked). */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { id } = await params;
  const excludeId = request.nextUrl.searchParams.get("exclude") ?? undefined;

  const supabase = createAdminClient();
  const { data: prop } = await supabase
    .from("properties")
    .select("airbnb_ical_url")
    .eq("id", id)
    .eq("owner_id", owner.id)
    .maybeSingle();

  if (!prop) return NextResponse.json({ error: "Property not found." }, { status: 404 });

  const ranges = await computeBusyRanges(
    supabase,
    id,
    (prop as { airbnb_ical_url: string | null }).airbnb_ical_url ?? null,
    excludeId
  );

  return NextResponse.json({ busy: ranges.map((r) => ({ start: r.start, end: r.end })) });
}
