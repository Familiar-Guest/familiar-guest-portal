import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";

/** Owner portal: list every offer/booking, newest first. */
export async function GET() {
  const cookieStore = await cookies();
  if (!isAdmin(cookieStore.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("offers list failed", error);
    return NextResponse.json({ error: "Could not load offers." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, bookings: (data ?? []) as Booking[] });
}

// Keep Next from statically caching the owner's live list.
export const dynamic = "force-dynamic";
