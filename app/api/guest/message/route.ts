import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { buildGuestToOwnerEmail, sendEmail } from "@/lib/email";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Guest → host message. Verified by matching the booking's guest_email to the session. */
export async function POST(request: NextRequest) {
  const session = await getOwner(); // signed-in user (guest)
  if (!session) return bad("Not authorized.", 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }
  const booking_id = String(body.booking_id ?? "").trim();
  const text = String(body.body ?? "").trim();
  if (!booking_id) return bad("Missing booking.");
  if (!text) return bad("Enter a message.");
  if (text.length > 4000) return bad("Message is too long.");

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", booking_id)
    .eq("guest_email", session.email)
    .single();
  const booking = data as Booking | null;
  if (!booking) return bad("Booking not found.", 404);
  if (!booking.owner_id) return bad("This booking has no host on file.", 409);

  const { data: ownerRow } = await supabase
    .from("owners")
    .select("email")
    .eq("id", booking.owner_id)
    .single();
  const ownerEmail = (ownerRow as { email: string } | null)?.email;
  if (!ownerEmail) return bad("Could not reach the host.", 409);

  const { subject, html } = buildGuestToOwnerEmail(booking, text);
  const sent = await sendEmail({ to: ownerEmail, subject, html });
  if (!sent) return bad("Could not send your message. Please try again.", 502);

  await supabase.from("messages").insert({
    booking_id,
    owner_id: booking.owner_id,
    direction: "inbound",
    body: text,
  });

  return NextResponse.json({ ok: true });
}
