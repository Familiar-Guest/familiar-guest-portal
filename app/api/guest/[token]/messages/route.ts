import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEmailForToken } from "@/lib/guestPortal";
import { parseMessageInput, postMessage } from "@/lib/messages";
import type { Booking, Message } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Look up the booking for a token-authenticated guest, scoped to their email. */
async function guestBooking(
  admin: ReturnType<typeof createAdminClient>,
  token: string,
  bookingId: string
): Promise<{ email: string; booking: Booking } | { error: string; status: number }> {
  const email = await getEmailForToken(token, admin);
  if (!email) return { error: "This link is no longer valid.", status: 404 };
  if (!bookingId) return { error: "Missing booking.", status: 400 };
  const { data } = await admin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("guest_email", email)
    .maybeSingle();
  const booking = data as Booking | null;
  if (!booking) return { error: "Booking not found.", status: 404 };
  return { email, booking };
}

/** Full thread for one of the guest's bookings (marks host messages read). */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const bookingId = request.nextUrl.searchParams.get("booking_id") ?? "";
  const admin = createAdminClient();

  const ctx = await guestBooking(admin, token, bookingId);
  if ("error" in ctx) return bad(ctx.error, ctx.status);

  const { data } = await admin
    .from("messages")
    .select("*")
    .eq("booking_id", bookingId)
    .order("created_at", { ascending: true });
  const messages = (data ?? []) as Message[];

  await admin
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("booking_id", bookingId)
    .eq("sender", "owner")
    .is("read_at", null);

  return NextResponse.json({ ok: true, messages });
}

/** Guest sends a message to the host on one of their bookings. */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }
  const bookingId = String(body.booking_id ?? "").trim();
  const parsed = parseMessageInput(body.body, body.subject);
  if ("error" in parsed) return bad(parsed.error);

  const admin = createAdminClient();
  const ctx = await guestBooking(admin, token, bookingId);
  if ("error" in ctx) return bad(ctx.error, ctx.status);

  const result = await postMessage(admin, {
    booking: ctx.booking,
    sender: "guest",
    subject: parsed.subject,
    body: parsed.body,
  });
  if ("error" in result) return bad(result.error, 500);
  return NextResponse.json({ ok: true, message: result.message });
}
