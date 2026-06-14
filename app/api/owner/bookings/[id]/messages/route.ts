import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { buildMessageEmail, sendEmail } from "@/lib/email";
import type { Booking, Message } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

async function ownedBooking(
  supabase: ReturnType<typeof createAdminClient>,
  id: string,
  ownerId: string
): Promise<Booking | null> {
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("owner_id", ownerId)
    .single();
  return (data as Booking) ?? null;
}

/** Message history for a booking. */
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getOwner();
  if (!owner) return bad("Not authorized.", 401);
  const { id } = await params;

  const supabase = createAdminClient();
  const booking = await ownedBooking(supabase, id, owner.id);
  if (!booking) return bad("Booking not found.", 404);

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("booking_id", id)
    .order("created_at", { ascending: true });
  if (error) {
    console.error("messages list failed", error);
    return bad("Could not load messages.", 500);
  }
  return NextResponse.json({ ok: true, messages: (data ?? []) as Message[] });
}

/** Send a message to the guest (emails them + records it). */
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
  const text = String(body.body ?? "").trim();
  if (!text) return bad("Enter a message.");
  if (text.length > 4000) return bad("Message is too long.");

  const supabase = createAdminClient();
  const booking = await ownedBooking(supabase, id, owner.id);
  if (!booking) return bad("Booking not found.", 404);

  const { subject, html } = buildMessageEmail(booking, text);
  const sent = await sendEmail({
    to: booking.guest_email,
    subject,
    html,
    fromName: booking.property_name,
  });
  if (!sent) return bad("Could not send the email. Please try again.", 502);

  const { data, error } = await supabase
    .from("messages")
    .insert({
      booking_id: id,
      owner_id: owner.id,
      direction: "outbound",
      body: text,
    })
    .select()
    .single();
  if (error) {
    console.error("message insert failed", error);
    // Email already sent; report soft success.
    return NextResponse.json({ ok: true, recorded: false });
  }

  return NextResponse.json({ ok: true, recorded: true, message: data as Message });
}
