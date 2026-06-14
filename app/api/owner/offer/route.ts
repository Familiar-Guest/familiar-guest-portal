import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { fetchBusyBlocks, hasConflict } from "@/lib/ical";
import { buildOfferEmail, sendEmail, bookingUrl } from "@/lib/email";
import { findInternalConflict, offerExpiresAt } from "@/lib/offers";
import type { Booking, OfferKind } from "@/lib/types";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CURRENCIES = ["usd", "cad", "mxn"];
const KINDS: OfferKind[] = ["offer", "rebook"];

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  if (!isAdmin(cookieStore.get(ADMIN_COOKIE)?.value)) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const guest_name = String(body.guest_name ?? "").trim();
  const guest_email = String(body.guest_email ?? "").trim().toLowerCase();
  const property_name = String(body.property_name ?? "").trim();
  const check_in = String(body.check_in ?? "").trim();
  const check_out = String(body.check_out ?? "").trim();
  const currency = String(body.currency ?? "usd").trim().toLowerCase();
  const checkin_instructions =
    String(body.checkin_instructions ?? "").trim() || null;
  const kind: OfferKind = KINDS.includes(body.kind as OfferKind)
    ? (body.kind as OfferKind)
    : "offer";
  const force = body.force === true;

  // Validation
  if (!guest_name) return bad("Enter the guest's name.");
  if (!EMAIL_RE.test(guest_email)) return bad("Enter a valid guest email.");
  if (!property_name) return bad("Enter the property name.");
  if (!DATE_RE.test(check_in) || !DATE_RE.test(check_out))
    return bad("Enter valid check-in and check-out dates.");
  if (check_out <= check_in)
    return bad("Check-out must be after check-in.");
  if (!CURRENCIES.includes(currency)) return bad("Unsupported currency.");

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0)
    return bad("Enter a price greater than zero.");
  const amount_cents = Math.round(amount * 100);

  const supabase = createAdminClient();

  // Hold the dates: block if they overlap a paid booking or another live offer.
  if (!force) {
    const clash = await findInternalConflict(supabase, { check_in, check_out });
    if (clash) {
      return NextResponse.json(
        {
          conflict: {
            type: "booking",
            start: clash.check_in,
            end: clash.check_out,
            guest_name: clash.guest_name,
            status: clash.status,
          },
        },
        { status: 409 }
      );
    }
  }

  // Optional Airbnb calendar conflict check (non-blocking; owner can override)
  if (!force && process.env.OWNER_AIRBNB_ICAL_URL) {
    const blocks = await fetchBusyBlocks(process.env.OWNER_AIRBNB_ICAL_URL);
    const conflict = hasConflict(blocks, check_in, check_out);
    if (conflict) {
      return NextResponse.json(
        {
          conflict: {
            type: "calendar",
            start: conflict.start,
            end: conflict.end,
            summary: conflict.summary,
          },
        },
        { status: 409 }
      );
    }
  }

  const token = randomBytes(24).toString("hex");

  const { data, error } = await supabase
    .from("bookings")
    .insert({
      token,
      guest_name,
      guest_email,
      property_name,
      check_in,
      check_out,
      currency,
      amount_cents,
      checkin_instructions,
      kind,
      expires_at: offerExpiresAt(),
    })
    .select()
    .single();

  if (error || !data) {
    console.error("booking insert failed", error);
    return NextResponse.json(
      { error: "Could not create the booking. Please try again." },
      { status: 500 }
    );
  }

  const booking = data as Booking;
  const { subject, html } = buildOfferEmail(booking);
  const sent = await sendEmail({
    to: booking.guest_email,
    subject,
    html,
    fromName: booking.property_name,
  });

  return NextResponse.json({
    ok: true,
    booking_url: bookingUrl(booking.token),
    email_sent: sent,
  });
}

function bad(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}
