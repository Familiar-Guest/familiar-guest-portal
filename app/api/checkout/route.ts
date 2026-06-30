import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { siteUrl } from "@/lib/email";
import { formatDate } from "@/lib/format";
import { isExpired } from "@/lib/offers";
import { depositPlanFor, effectivePolicyForBooking } from "@/lib/policies";
import type { Booking } from "@/lib/types";

export async function POST(request: NextRequest) {
  // A guest account is required to pay (even for owner offers).
  const guestUser = await getOwner();
  if (!guestUser) {
    return NextResponse.json(
      { error: "Please create an account or sign in to continue." },
      { status: 401 }
    );
  }

  let token: unknown;
  let guestPhone: unknown;
  let confirmationMethod: unknown;
  try {
    const body = await request.json();
    token = body?.token;
    guestPhone = body?.guest_phone;
    confirmationMethod = body?.confirmation_method;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const phone =
    typeof guestPhone === "string" && guestPhone.trim() ? guestPhone.trim() : null;
  // Text confirmation requires a phone number — fall back to email otherwise.
  const method = confirmationMethod === "sms" && phone ? "sms" : "email";

  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("token", token)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Booking not found." }, { status: 404 });
  }

  const booking = data as Booking;

  if (booking.status === "paid") {
    return NextResponse.json(
      { error: "This booking is already paid." },
      { status: 409 }
    );
  }
  if (booking.status === "cancelled" || booking.status === "forfeited") {
    return NextResponse.json(
      { error: "This booking is no longer available." },
      { status: 409 }
    );
  }
  if (booking.status === "expired" || isExpired(booking)) {
    return NextResponse.json(
      { error: "This offer has expired. Please contact your host." },
      { status: 409 }
    );
  }

  // Decide what this payment covers: a balance on a deposit-paid booking, a
  // deposit on an eligible new booking, or the full amount.
  let amountCents: number;
  let paymentKind: "full" | "deposit" | "balance";
  let label: string;
  // Extra fields persisted before redirecting to Stripe (deposit plan details).
  const planFields: Record<string, unknown> = {};

  if (booking.status === "deposit_paid") {
    if (booking.balance_cents <= 0 || booking.balance_paid_at) {
      return NextResponse.json({ error: "There's no balance due on this booking." }, { status: 409 });
    }
    amountCents = booking.balance_cents;
    paymentKind = "balance";
    label = "balance";
  } else {
    const policy = await effectivePolicyForBooking(supabase, booking);
    const plan = depositPlanFor(policy, booking.amount_cents, booking.check_in);
    if (plan.plan === "deposit") {
      amountCents = plan.depositCents;
      paymentKind = "deposit";
      label = "deposit";
      planFields.payment_plan = "deposit";
      planFields.deposit_cents = plan.depositCents;
      planFields.balance_cents = plan.balanceCents;
      planFields.balance_due_date = plan.balanceDueDate;
      planFields.balance_charge_date = plan.balanceDueDate;
    } else {
      amountCents = booking.amount_cents;
      paymentKind = "full";
      label = "stay";
    }
  }

  try {
    // For a deposit we save the card and create a Customer so the balance can be
    // auto-charged off-session later. The mandate is disclosed to the guest on
    // the booking page before they pay.
    const saveCard = paymentKind === "deposit";
    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "payment",
      // Card only — excludes Stripe Link, which can prompt the guest for a
      // phone number and send it an SMS code unrelated to our confirmation flow.
      payment_method_types: ["card"],
      customer_email: booking.guest_email,
      ...(saveCard ? { customer_creation: "always" as const } : {}),
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: booking.currency,
            unit_amount: amountCents,
            product_data: {
              name: `${booking.property_name} — ${label}`,
              description: `${formatDate(booking.check_in)} → ${formatDate(
                booking.check_out
              )}`,
            },
          },
        },
      ],
      metadata: { booking_id: booking.id, token: booking.token, payment_kind: paymentKind },
      payment_intent_data: {
        metadata: { booking_id: booking.id, token: booking.token, payment_kind: paymentKind },
        // Save the payment method to the Customer for off-session balance charges.
        ...(saveCard ? { setup_future_usage: "off_session" as const } : {}),
      },
      success_url: `${siteUrl()}/book/${booking.token}/success`,
      cancel_url: `${siteUrl()}/book/${booking.token}`,
    });

    await supabase
      .from("bookings")
      .update({
        ...planFields,
        // The balance session id is tracked separately so it doesn't clobber the
        // original (deposit) session id.
        ...(paymentKind === "balance"
          ? { balance_stripe_session_id: checkoutSession.id }
          : { stripe_session_id: checkoutSession.id }),
        guest_user_id: guestUser.id,
        guest_phone: phone,
        confirmation_method: method,
      })
      .eq("id", booking.id);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (err) {
    console.error("Stripe checkout session failed", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
