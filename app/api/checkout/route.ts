import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { getStripe } from "@/lib/stripe";
import { siteUrl } from "@/lib/email";
import { formatDate } from "@/lib/format";
import { isExpired } from "@/lib/offers";
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
  if (booking.status === "expired" || isExpired(booking)) {
    return NextResponse.json(
      { error: "This offer has expired. Please contact your host." },
      { status: 409 }
    );
  }

  try {
    const checkoutSession = await getStripe().checkout.sessions.create({
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
      .update({
        stripe_session_id: checkoutSession.id,
        guest_user_id: guestUser.id,
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
