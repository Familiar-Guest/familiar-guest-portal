import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { fetchBusyBlocks, hasConflict } from "@/lib/ical";
import { buildOfferEmail, sendEmail } from "@/lib/email";
import { findInternalConflict, offerExpiresAt } from "@/lib/offers";
import type { Booking, Property } from "@/lib/types";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Approve or decline a guest's booking request. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getOwner();
  if (!owner) return bad("Not authorized.", 401);
  const { id } = await params;

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }
  const action = String(body.action ?? "");
  if (action !== "approve" && action !== "decline")
    return bad("Unknown action.");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("owner_id", owner.id)
    .eq("status", "requested")
    .single();
  const booking = data as Booking | null;
  if (!booking) return bad("Request not found.", 404);

  if (action === "decline") {
    await supabase.from("bookings").update({ status: "declined" }).eq("id", id);
    return NextResponse.json({ ok: true });
  }

  // Approve: re-check the dates are still open for this property.
  const clash = await findInternalConflict(supabase, {
    check_in: booking.check_in,
    check_out: booking.check_out,
    excludeId: id,
    propertyId: booking.property_id,
  });
  if (clash)
    return bad(
      `Those dates now overlap a ${clash.status === "paid" ? "booking" : "offer"} for ${clash.guest_name}. Decline this request.`,
      409
    );

  if (booking.property_id) {
    const { data: prop } = await supabase
      .from("properties")
      .select("airbnb_ical_url")
      .eq("id", booking.property_id)
      .single();
    const ical = (prop as Pick<Property, "airbnb_ical_url"> | null)?.airbnb_ical_url;
    if (ical) {
      const blocks = await fetchBusyBlocks(ical);
      if (hasConflict(blocks, booking.check_in, booking.check_out))
        return bad("Those dates are now busy on your Airbnb calendar. Decline this request.", 409);
    }
  }

  const { data: updated } = await supabase
    .from("bookings")
    .update({ status: "offer_sent", expires_at: offerExpiresAt() })
    .eq("id", id)
    .select()
    .single();

  const out = (updated ?? booking) as Booking;
  const { subject, html } = buildOfferEmail(out);
  await sendEmail({ to: out.guest_email, subject, html, fromName: out.property_name });

  return NextResponse.json({ ok: true });
}
