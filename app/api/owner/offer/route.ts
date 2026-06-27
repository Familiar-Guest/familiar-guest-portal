import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { fetchBusyBlocks, hasConflict } from "@/lib/ical";
import { buildOfferEmail, sendEmail, bookingUrl, siteUrl } from "@/lib/email";
import { getOwnerContact } from "@/lib/owner";
import { ensureGuestPortal, guestPortalUrl } from "@/lib/guestPortal";
import { findInternalConflict, offerExpiresAt } from "@/lib/offers";
import { nights } from "@/lib/format";
import type { Booking, OfferKind, Property } from "@/lib/types";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const KINDS: OfferKind[] = ["offer", "rebook"];

export async function POST(request: NextRequest) {
  const owner = await getOwner();
  if (!owner) return bad("Not authorized.", 401);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }

  const property_id = String(body.property_id ?? "").trim();
  if (!property_id) return bad("Choose a property for this offer.");

  const supabase = createAdminClient();
  const { data: prop } = await supabase
    .from("properties")
    .select("*")
    .eq("id", property_id)
    .eq("owner_id", owner.id)
    .single();
  const property = prop as Property | null;
  if (!property) return bad("Property not found.", 404);

  const guest_name = String(body.guest_name ?? "").trim();
  const guest_email = String(body.guest_email ?? "").trim().toLowerCase();
  const check_in = String(body.check_in ?? "").trim();
  const check_out = String(body.check_out ?? "").trim();
  const checkin_instructions =
    String(body.checkin_instructions ?? "").trim() ||
    property.checkin_instructions ||
    null;
  const kind: OfferKind = KINDS.includes(body.kind as OfferKind)
    ? (body.kind as OfferKind)
    : "offer";
  const force = body.force === true;

  if (!guest_name) return bad("Enter the guest's name.");
  if (!EMAIL_RE.test(guest_email)) return bad("Enter a valid guest email.");
  if (!DATE_RE.test(check_in) || !DATE_RE.test(check_out))
    return bad("Enter valid check-in and check-out dates.");
  if (check_out <= check_in) return bad("Check-out must be after check-in.");

  const nightly_rate = Number(body.nightly_rate);
  if (!Number.isFinite(nightly_rate) || nightly_rate < 0)
    return bad("Enter a valid nightly rate (0 for a complimentary stay).");
  const nightly_rate_cents = Math.round(nightly_rate * 100);

  const cleaning_raw = Number(body.cleaning_fee);
  const cleaning_fee_cents =
    Number.isFinite(cleaning_raw) && cleaning_raw >= 0
      ? Math.round(cleaning_raw * 100)
      : property.cleaning_fee_cents;

  const amount_cents =
    nightly_rate_cents * nights(check_in, check_out) + cleaning_fee_cents;

  // Hold dates: block overlap with a paid booking or live offer for THIS property.
  if (!force) {
    const clash = await findInternalConflict(supabase, {
      check_in,
      check_out,
      propertyId: property_id,
    });
    if (clash) return conflict409("booking", clash);

    if (property.airbnb_ical_url) {
      const blocks = await fetchBusyBlocks(property.airbnb_ical_url);
      const c = hasConflict(blocks, check_in, check_out);
      if (c)
        return NextResponse.json(
          { conflict: { type: "calendar", start: c.start, end: c.end, summary: c.summary } },
          { status: 409 }
        );
    }
  }

  const token = randomBytes(24).toString("hex");
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      token,
      owner_id: owner.id,
      property_id,
      guest_name,
      guest_email,
      property_name: property.name,
      check_in,
      check_out,
      currency: property.currency,
      amount_cents,
      nightly_rate_cents,
      cleaning_fee_cents,
      checkin_instructions,
      kind,
      expires_at: offerExpiresAt(),
    })
    .select()
    .single();

  if (error || !data) {
    console.error("booking insert failed", error);
    return bad("Could not create the offer. Please try again.", 500);
  }

  const booking = data as Booking;
  // Make sure the invited guest has a permanent portal token before any
  // booking/portal links go out.
  await ensureGuestPortal(booking.guest_email, supabase);

  // Build a link to the property listing page if the property is publicly listed.
  const { data: ownerRow } = await supabase
    .from("owners")
    .select("handle")
    .eq("id", owner.id)
    .maybeSingle();
  const handle = (ownerRow as { handle: string | null } | null)?.handle;
  const propertyUrl =
    handle && property.slug && property.is_listed
      ? `${siteUrl()}/owner/${handle}/${property.slug}`
      : null;

  const contact = await getOwnerContact(supabase, owner.id);
  const { subject, html } = buildOfferEmail(booking, contact, propertyUrl);
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

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

function conflict409(
  type: "booking",
  clash: { check_in: string; check_out: string; guest_name: string; status: string }
) {
  return NextResponse.json(
    {
      conflict: {
        type,
        start: clash.check_in,
        end: clash.check_out,
        guest_name: clash.guest_name,
        status: clash.status,
      },
    },
    { status: 409 }
  );
}
