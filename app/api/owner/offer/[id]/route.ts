import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { fetchFeedsBusyBlocks, hasConflict } from "@/lib/ical";
import {
  buildOfferEmail,
  buildChangeEmail,
  buildCancellationEmail,
  sendEmail,
  bookingUrl,
} from "@/lib/email";
import { getOwnerContact } from "@/lib/owner";
import { ensureGuestPortal, guestPortalUrl } from "@/lib/guestPortal";
import { findInternalConflict, isActiveOffer } from "@/lib/offers";
import { effectivePolicyForBooking, computeRefund } from "@/lib/policies";
import { CURRENCIES } from "@/lib/properties";
import { quoteStay } from "@/lib/pricing";
import { refundBooking } from "@/lib/payouts";
import { paymentsGateEnabled } from "@/lib/flags";
import { nights, formatMoney } from "@/lib/format";
import type { Booking, NonStandardRate, Property } from "@/lib/types";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Edit an existing offer the owner owns. Re-issues the hold and re-sends email. */
export async function PATCH(
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

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("owner_id", owner.id)
    .single();
  const current = existing as Booking | null;
  if (!current) return bad("Booking not found.", 404);
  if (current.status === "cancelled" || current.status === "declined")
    return bad("This booking is cancelled and can't be edited.", 409);

  const isPaid = current.status === "paid";
  const oldCheckIn = current.check_in;
  const oldCheckOut = current.check_out;

  const guest_name = String(body.guest_name ?? "").trim();
  const guest_email = String(body.guest_email ?? "").trim().toLowerCase();
  const check_in = String(body.check_in ?? "").trim();
  const check_out = String(body.check_out ?? "").trim();
  const checkin_instructions =
    String(body.checkin_instructions ?? "").trim() || null;
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
      : current.cleaning_fee_cents ?? 0;

  // Currency override (unpaid offers only — a paid booking keeps the currency it
  // was charged in). Falls back to the booking's existing currency.
  const currencyInput = String(body.currency ?? "").trim().toLowerCase();
  if (currencyInput && !CURRENCIES.includes(currencyInput))
    return bad("Unsupported currency.");
  const offerCurrency = currencyInput || current.currency;

  // Pricing mode (see POST route): calendar sums the property's per-day rates,
  // custom uses the flat nightly rate from the form.
  const pricing_mode = body.pricing_mode === "calendar" ? "calendar" : "custom";
  let nightly_rate_cents: number | null;
  let stay_subtotal_cents: number;
  if (pricing_mode === "calendar") {
    let standardCents = 0;
    let nonstandard: NonStandardRate[] = [];
    if (current.property_id) {
      const { data: prop } = await supabase
        .from("properties")
        .select("nightly_rate_cents, nonstandard_rates")
        .eq("id", current.property_id)
        .maybeSingle();
      const pr = prop as Pick<Property, "nightly_rate_cents" | "nonstandard_rates"> | null;
      standardCents = pr?.nightly_rate_cents ?? 0;
      nonstandard = pr?.nonstandard_rates ?? [];
    }
    const quote = quoteStay(standardCents, nonstandard, check_in, check_out);
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

  function parsePolicy(key: string): number | null {
    const v = Number(body[key]);
    return Number.isFinite(v) && v >= 0 ? Math.round(v) : null;
  }
  // Single timing override; legacy day-fields are mirrored to it for back-compat.
  const balanceLead = parsePolicy("policy_balance_lead_days");
  const policyFields = {
    policy_checkin_email_days:    parsePolicy("policy_checkin_email_days"),
    policy_balance_lead_days:     balanceLead,
    policy_deposit_required_days: balanceLead,
    policy_full_payment_due_days: balanceLead,
    policy_refund_100_days:       parsePolicy("policy_refund_100_days"),
    policy_refund_50_days:        parsePolicy("policy_refund_50_days"),
    policy_deposit_pct:           parsePolicy("policy_deposit_pct"),
  };

  if (!force) {
    const clash = await findInternalConflict(supabase, {
      check_in,
      check_out,
      excludeId: id,
      propertyId: current.property_id,
    });
    if (clash)
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

    if (current.property_id) {
      const { data: prop } = await supabase
        .from("properties")
        .select("import_feeds")
        .eq("id", current.property_id)
        .eq("owner_id", owner.id)
        .single();
      const feeds = (prop as Pick<Property, "import_feeds"> | null)?.import_feeds;
      const blocks = await fetchFeedsBusyBlocks(feeds);
      const c = hasConflict(blocks, check_in, check_out);
      if (c)
        return NextResponse.json(
          { conflict: { type: "calendar", start: c.start, end: c.end, summary: c.summary } },
          { status: 409 }
        );
    }
  }

  // Paid bookings keep their paid status and date hold; only unpaid offers get
  // their status reset and the 7-day hold re-issued.
  const updates: Record<string, unknown> = {
    guest_name,
    guest_email,
    check_in,
    check_out,
    amount_cents,
    nightly_rate_cents,
    cleaning_fee_cents,
    checkin_instructions,
    ...policyFields,
  };
  if (!isPaid) {
    updates.status = "offer_sent";
    updates.expires_at = `${check_in}T23:59:59.999Z`;
    updates.currency = offerCurrency;
  }

  const { data, error } = await supabase
    .from("bookings")
    .update(updates)
    .eq("id", id)
    .eq("owner_id", owner.id)
    .select()
    .single();

  if (error || !data) {
    console.error("offer update failed", error);
    return bad("Could not update the booking. Please try again.", 500);
  }

  const booking = data as Booking;
  const contact = await getOwnerContact(supabase, owner.id);

  // Look up the guest portal token so "View your booking" in the change email
  // lands on the guest's personal stays portal, not just the payment page.
  const portalToken = await ensureGuestPortal(booking.guest_email, supabase);
  const portalUrl = guestPortalUrl(portalToken);

  // A paid booking that's edited gets a change notice (it already paid — no pay
  // link). An unpaid offer re-sends the offer email with the live pay link.
  const policy = await effectivePolicyForBooking(supabase, booking);
  const { subject, html } = isPaid
    ? buildChangeEmail(booking, oldCheckIn, oldCheckOut, portalUrl)
    : buildOfferEmail(booking, contact, null, policy);
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
    paid: isPaid,
  });
}

/**
 * Remove a booking. An active booking (paid, or a live offer) emails the guest
 * a cancellation. Paid bookings are kept as "cancelled" to preserve the payment
 * record; unpaid offers are deleted outright so their dates free up.
 */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const owner = await getOwner();
  if (!owner) return bad("Not authorized.", 401);
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("bookings")
    .select("*")
    .eq("id", id)
    .eq("owner_id", owner.id)
    .single();
  const booking = existing as Booking | null;
  if (!booking) return bad("Booking not found.", 404);

  // A booking with money collected (paid or deposit_paid) is kept as a record;
  // an unpaid offer is deleted outright.
  const hasMoney = booking.status === "paid" || booking.status === "deposit_paid";
  const wasActive = hasMoney || isActiveOffer(booking);

  // Notify the guest before we remove their reservation, with the refund owed
  // per the owner's policy (computed, not auto-issued).
  if (wasActive) {
    let refundNote: string | undefined;
    if (hasMoney) {
      const policy = await effectivePolicyForBooking(supabase, booking);
      const refund = computeRefund(policy, booking);
      if (refund.cents > 0) {
        if (paymentsGateEnabled()) await refundBooking(supabase, booking, refund.cents);
        refundNote = `A refund of ${formatMoney(refund.cents, booking.currency)} (${refund.pct}% of what you paid) ${
          paymentsGateEnabled() ? "has been issued" : "will be processed"
        } per the cancellation policy.`;
      }
    }
    const { subject, html } = buildCancellationEmail(booking, refundNote);
    await sendEmail({
      to: booking.guest_email,
      subject,
      html,
      fromName: booking.property_name,
    });
  }

  if (hasMoney) {
    // Keep the row (payment history) but free the dates by marking cancelled.
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id)
      .eq("owner_id", owner.id);
    if (error) {
      console.error("booking cancel failed", error);
      return bad("Could not cancel the booking. Please try again.", 500);
    }
  } else {
    const { error } = await supabase
      .from("bookings")
      .delete()
      .eq("id", id)
      .eq("owner_id", owner.id);
    if (error) {
      console.error("offer delete failed", error);
      return bad("Could not remove the booking. Please try again.", 500);
    }
  }

  return NextResponse.json({ ok: true, cancelled: hasMoney, emailed: wasActive });
}
