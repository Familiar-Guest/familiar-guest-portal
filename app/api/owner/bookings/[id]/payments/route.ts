import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import type { BookingPayment } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** The payment ledger (deposit/balance/refund) for one of the owner's bookings. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const { id } = await params;
  const admin = createAdminClient();

  // Scope to the owner — never expose another owner's transactions.
  const { data: b } = await admin
    .from("bookings")
    .select("id, owner_id")
    .eq("id", id)
    .maybeSingle();
  if (!b || (b as { owner_id: string | null }).owner_id !== owner.id)
    return NextResponse.json({ error: "Not found." }, { status: 404 });

  const { data } = await admin
    .from("booking_payments")
    .select("*")
    .eq("booking_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({ ok: true, payments: (data ?? []) as BookingPayment[] });
}
