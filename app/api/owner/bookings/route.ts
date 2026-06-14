import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** All of the owner's bookings/offers, newest first. Optional ?property_id. */
export async function GET(request: NextRequest) {
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const propertyId = request.nextUrl.searchParams.get("property_id");

  const supabase = createAdminClient();
  let query = supabase
    .from("bookings")
    .select("*")
    .eq("owner_id", owner.id)
    .order("created_at", { ascending: false });
  if (propertyId) query = query.eq("property_id", propertyId);

  const { data, error } = await query;
  if (error) {
    console.error("bookings list failed", error);
    return NextResponse.json({ error: "Could not load bookings." }, { status: 500 });
  }
  return NextResponse.json({ ok: true, bookings: (data ?? []) as Booking[] });
}
