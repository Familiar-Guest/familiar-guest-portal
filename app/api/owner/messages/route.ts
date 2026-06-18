import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { parseMessageInput, postMessage } from "@/lib/messages";
import type { Booking, Message } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/**
 * Owner messaging.
 *  - GET                  → thread summaries (one row per booking with messages)
 *  - GET ?booking_id=...  → full thread (and marks guest messages read)
 */
export async function GET(request: NextRequest) {
  const owner = await getOwner();
  if (!owner) return bad("Not authorized.", 401);

  const admin = createAdminClient();
  const bookingId = request.nextUrl.searchParams.get("booking_id");

  if (bookingId) {
    const { data: bk } = await admin
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .eq("owner_id", owner.id)
      .maybeSingle();
    const booking = bk as Booking | null;
    if (!booking) return bad("Booking not found.", 404);

    const { data } = await admin
      .from("messages")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true });
    const messages = (data ?? []) as Message[];

    // Mark inbound (guest) messages as read.
    await admin
      .from("messages")
      .update({ read_at: new Date().toISOString() })
      .eq("booking_id", bookingId)
      .eq("sender", "guest")
      .is("read_at", null);

    return NextResponse.json({ ok: true, booking, messages });
  }

  // Thread list: bookings that have at least one message.
  const { data: bookingRows } = await admin
    .from("bookings")
    .select("id, guest_name, guest_email, property_name, check_in, check_out, status")
    .eq("owner_id", owner.id);
  const bookings = (bookingRows ?? []) as Pick<
    Booking,
    "id" | "guest_name" | "guest_email" | "property_name" | "check_in" | "check_out" | "status"
  >[];
  if (bookings.length === 0) return NextResponse.json({ ok: true, threads: [] });

  const ids = bookings.map((b) => b.id);
  const { data: msgRows } = await admin
    .from("messages")
    .select("*")
    .in("booking_id", ids)
    .order("created_at", { ascending: true });
  const messages = (msgRows ?? []) as Message[];

  const byBooking = new Map(bookings.map((b) => [b.id, b]));
  const threads = new Map<
    string,
    { booking: (typeof bookings)[number]; latest: Message; unread: number; count: number }
  >();
  for (const m of messages) {
    const booking = byBooking.get(m.booking_id);
    if (!booking) continue;
    const t = threads.get(m.booking_id);
    const unreadInc = m.sender === "guest" && m.read_at === null ? 1 : 0;
    if (!t) {
      threads.set(m.booking_id, { booking, latest: m, unread: unreadInc, count: 1 });
    } else {
      t.latest = m; // messages are ascending, so the last seen is the latest
      t.unread += unreadInc;
      t.count += 1;
    }
  }

  const list = Array.from(threads.values()).sort(
    (a, b) => b.latest.created_at.localeCompare(a.latest.created_at)
  );
  return NextResponse.json({ ok: true, threads: list });
}

/** Owner sends a message to the guest on a booking. */
export async function POST(request: NextRequest) {
  const owner = await getOwner();
  if (!owner) return bad("Not authorized.", 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }

  const bookingId = String(body.booking_id ?? "").trim();
  if (!bookingId) return bad("Missing booking.");
  const parsed = parseMessageInput(body.body, body.subject);
  if ("error" in parsed) return bad(parsed.error);

  const admin = createAdminClient();
  const { data: bk } = await admin
    .from("bookings")
    .select("*")
    .eq("id", bookingId)
    .eq("owner_id", owner.id)
    .maybeSingle();
  const booking = bk as Booking | null;
  if (!booking) return bad("Booking not found.", 404);

  const result = await postMessage(admin, {
    booking,
    sender: "owner",
    subject: parsed.subject,
    body: parsed.body,
  });
  if ("error" in result) return bad(result.error, 500);
  return NextResponse.json({ ok: true, message: result.message });
}
