import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { postMessage } from "@/lib/messages";
import { sendEmail, siteUrl } from "@/lib/email";
import { formatDate } from "@/lib/format";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Owner declines a pending guest date-change request. Original dates are kept. */
export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getOwner();
  if (!owner) return bad("Not authorized.", 401);

  const { id } = await params;
  const admin = createAdminClient();

  const { data } = await admin
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("owner_id", owner.id)
    .maybeSingle();
  const booking = data as Booking | null;
  if (!booking) return bad("Booking not found.", 404);
  if (!booking.requested_check_in || !booking.requested_check_out)
    return bad("No pending date-change request on this booking.", 409);

  const requestedIn = booking.requested_check_in;
  const requestedOut = booking.requested_check_out;

  const { error } = await admin
    .from("bookings")
    .update({
      requested_check_in: null,
      requested_check_out: null,
      date_change_requested_at: null,
    })
    .eq("id", id)
    .eq("owner_id", owner.id);
  if (error) {
    console.error("decline-change failed", error);
    return bad("Could not decline the date change. Please try again.", 500);
  }

  const requestedSummary = `${formatDate(requestedIn)} → ${formatDate(requestedOut)}`;
  const currentSummary = `${formatDate(booking.check_in)} → ${formatDate(booking.check_out)}`;

  await postMessage(admin, {
    booking,
    sender: "owner",
    subject: "Date change declined",
    body: `Your host couldn't accommodate the requested dates (${requestedSummary}). Your original booking (${currentSummary}) remains confirmed.`,
  });

  await sendEmail({
    to: booking.guest_email,
    subject: `Date change declined: ${booking.property_name}`,
    html: `<p>Hi ${booking.guest_name},</p><p>Your host was unable to accommodate the requested date change (${requestedSummary}) for ${booking.property_name}.</p><p>Your original booking (${currentSummary}) remains confirmed. Message your host if you'd like to discuss alternatives.</p><p><a href="${siteUrl()}/book/${booking.token}">View your booking</a></p>`,
  });

  return NextResponse.json({ ok: true });
}
