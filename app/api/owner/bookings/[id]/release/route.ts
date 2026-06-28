import { NextRequest, NextResponse } from "next/server";
import { getOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { releaseBookingPayout } from "@/lib/payouts";
import { paymentsGateEnabled } from "@/lib/flags";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";

/** Owner-initiated early release of a booking's escrowed funds to their payout account. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  if (!paymentsGateEnabled())
    return NextResponse.json({ error: "Payouts are not enabled yet." }, { status: 400 });
  const { id } = await params;

  const admin = createAdminClient();
  const { data } = await admin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("owner_id", owner.id)
    .maybeSingle();
  const booking = data as Booking | null;
  if (!booking) return NextResponse.json({ error: "Booking not found." }, { status: 404 });

  const result = await releaseBookingPayout(admin, booking);
  if (!result.ok) return NextResponse.json({ error: result.error }, { status: 400 });
  return NextResponse.json({ ok: true, amount_cents: result.amountCents });
}
