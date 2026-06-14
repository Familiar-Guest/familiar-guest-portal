import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getStripe } from "@/lib/stripe";
import { siteUrl } from "@/lib/email";
import { formatDate } from "@/lib/format";
import type { Booking } from "@/lib/types";

export async function POST(request: NextRequest) {
  let token: unknown;
  try {
    const body = await request.json();
    token = body?.token;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  if (typeof token !== "string" || !token) {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

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
  if (booking.status === "cancelled") {
    return NextResponse.json(
      { error: "This booking is no longer available." },
      { status: 409 }
    );
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      customer_email: booking.guest_email,
      line_items: [
        {
          quantity: 1,
          price_data: {
            currency: booking.currency,
            unit_amount: booking.amount_cents,
            product_data: {
              name: `${booking.property_name} — stay`,
              description: `${formatDate(booking.check_in)} → ${formatDate(
                booking.check_out
              )}`,
            },
          },
        },
      ],
      metadata: { booking_id: booking.id, token: booking.token },
      payment_intent_data: {
        metadata: { booking_id: booking.id, token: booking.token },
      },
      success_url: `${siteUrl()}/book/${booking.token}/success`,
      cancel_url: `${siteUrl()}/book/${booking.token}`,
    });

    await supabase
      .from("bookings")
      .update({ stripe_session_id: session.id })
      .eq("id", booking.id);

    return NextResponse.json({ url: session.url });
  } catch (err) {
    console.error("Stripe checkout session failed", err);
    return NextResponse.json(
      { error: "Could not start checkout. Please try again." },
      { status: 500 }
    );
  }
}
