import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { fetchFeedsBusyBlocks, hasConflict } from "@/lib/ical";
import { buildOfferEmail, sendEmail, bookingUrl, siteUrl } from "@/lib/email";
import { getOwnerContact } from "@/lib/owner";
import { ensureGuestPortal, guestPortalUrl } from "@/lib/guestPortal";
import { findInternalConflict } from "@/lib/offers";
import { effectivePolicy, policyFromProperty } from "@/lib/policies";
import { CURRENCIES } from "@/lib/properties";
import { quoteStay } from "@/lib/pricing";
import { paymentsGateEnabled } from "@/lib/flags";
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
    String(body.checkin_instructions ?? "").trim() || null;
  const kind: OfferKind = KINDS.includes(body.kind as OfferKind)
    ? (body.kind as OfferKind)
    : "offer";
  const force = body.force === true;

  if (!guest_name) return bad("Enter the guest's name.");
  if (!EMAIL_RE.test(guest_email)) return bad("Enter a valid guest email.");
  if (!DATE_RE.test(check_in) || !DATE_RE.test(check_out))
    return bad("Enter valid check-in and check-out dates.");
  if (check_out <= check_in) return bad("Check-out must be after check-in.");

  const cleaning_raw = Number(body.cleaning_fee);
  const cleaning_fee_cents =
    Number.isFinite(cleaning_raw) && cleaning_raw >= 0
      ? Math.round(cleaning_raw * 100)
      : property.cleaning_fee_cents;

  // Currency: defaults to the property's, but the owner can override per-offer.
  const currency = String(body.currency ?? "").trim().toLowerCase();
  if (currency && !CURRENCIES.includes(currency))
    return bad("Unsupported currency.");
  const offerCurrency = currency || property.currency;

  // Pricing: "calendar" sums the property's per-day rates for the stay;
  // "custom" uses the flat nightly rate the owner entered. A mixed-rate
  // calendar stay stores nightly_rate_cents = null (the total carries it).
  const pricing_mode = body.pricing_mode === "calendar" ? "calendar" : "custom";
  let nightly_rate_cents: number | null;
  let stay_subtotal_cents: number;
  if (pricing_mode === "calendar") {
    const quote = quoteStay(
      property.nightly_rate_cents ?? 0,
      property.nonstandard_rates ?? [],
      check_in,
      check_out
    );
    stay_subtotal_cents = quote.subtotalCents;
    nightly_rate_cents = quote.uniform ? quote.uniformRateCents : null;
  } else {
    const nightly_rate = Number(body.nightly_rate);
    if (!Number.isFinite(nightly_rate) || nightly_rate < 0)
      return bad("Enter a valid nightly rate (0 for a complimentary stay).");
    nightly_rate_cents = Math.round(nightly_rate * 100);
    stay_subtotal_cents = nightly_rate_cents * nights(check_in, check_out);
  }

  const amount_cents = stay_subtotal_cents + cleaning_fee_cents;

  // Gate 1: an owner can't collect payment until Stripe identity verification
  // (KYC) is complete. Complimentary ($0) offers are allowed through. Dormant
  // until payments are switched on.
  if (paymentsGateEnabled() && amount_cents > 0) {
    const { data: ownerRow } = await supabase
      .from("owners")
      .select("stripe_charges_enabled")
      .eq("id", owner.id)
      .single();
    if (!(ownerRow as { stripe_charges_enabled: boolean } | null)?.stripe_charges_enabled)
      return bad(
        "Finish identity verification (Get set up to get paid in your portal) before sending a paid offer.",
        403
      );
  }

  // Per-booking policy overrides (null keeps the owner's global policy active).
  function parsePolicy(key: string): number | null {
    const v = Number(body[key]);
    return Number.isFinite(v) && v >= 0 ? Math.round(v) : null;
  }
  const policyFields = {
    policy_checkin_email_days:    parsePolicy("policy_checkin_email_days"),
    policy_deposit_required_days: parsePolicy("policy_deposit_required_days"),
    policy_full_payment_due_days: parsePolicy("policy_full_payment_due_days"),
    policy_refund_100_days:       parsePolicy("policy_refund_100_days"),
    policy_refund_50_days:        parsePolicy("policy_refund_50_days"),
    policy_deposit_pct:           parsePolicy("policy_deposit_pct"),
  };

  // Hold dates: block overlap with a paid booking or live offer for THIS property.
  if (!force) {
    const clash = await findInternalConflict(supabase, {
      check_in,
      check_out,
      propertyId: property_id,
    });
    if (clash) return conflict409("booking", clash);

    const blocks = await fetchFeedsBusyBlocks(property.import_feeds);
    const c = hasConflict(blocks, check_in, check_out);
    if (c)
      return NextResponse.json(
        { conflict: { type: "calendar", start: c.start, end: c.end, summary: c.summary } },
        { status: 409 }
      );
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
      currency: offerCurrency,
      amount_cents,
      nightly_rate_cents,
      cleaning_fee_cents,
      checkin_instructions,
      kind,
      expires_at: `${check_in}T23:59:59.999Z`,
      ...policyFields,
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
  const policy = effectivePolicy(booking, policyFromProperty(property));
  const { subject, html } = buildOfferEmail(booking, contact, propertyUrl, policy);
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
