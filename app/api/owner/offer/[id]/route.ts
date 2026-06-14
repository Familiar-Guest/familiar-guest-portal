import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { fetchBusyBlocks, hasConflict } from "@/lib/ical";
import { buildOfferEmail, sendEmail, bookingUrl } from "@/lib/email";
import { findInternalConflict, offerExpiresAt } from "@/lib/offers";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CURRENCIES = ["usd", "cad", "mxn"];

async function authed(): Promise<boolean> {
  const cookieStore = await cookies();
  return isAdmin(cookieStore.get(ADMIN_COOKIE)?.value);
}

function bad(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

/** Edit an existing offer. Re-issues the 7-day hold and re-sends the email. */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await authed())) return bad("Not authorized.", 401);
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
    .single();
  const current = existing as Booking | null;
  if (!current) return bad("Offer not found.", 404);
  if (current.status === "paid")
    return bad("This booking is already paid and can't be edited.", 409);

  const guest_name = String(body.guest_name ?? "").trim();
  const guest_email = String(body.guest_email ?? "").trim().toLowerCase();
  const property_name = String(body.property_name ?? "").trim();
  const check_in = String(body.check_in ?? "").trim();
  const check_out = String(body.check_out ?? "").trim();
  const currency = String(body.currency ?? "usd").trim().toLowerCase();
  const checkin_instructions =
    String(body.checkin_instructions ?? "").trim() || null;
  const force = body.force === true;

  if (!guest_name) return bad("Enter the guest's name.");
  if (!EMAIL_RE.test(guest_email)) return bad("Enter a valid guest email.");
  if (!property_name) return bad("Enter the property name.");
  if (!DATE_RE.test(check_in) || !DATE_RE.test(check_out))
    return bad("Enter valid check-in and check-out dates.");
  if (check_out <= check_in) return bad("Check-out must be after check-in.");
  if (!CURRENCIES.includes(currency)) return bad("Unsupported currency.");

  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0)
    return bad("Enter a price greater than zero.");
  const amount_cents = Math.round(amount * 100);

  // Re-check date holds, ignoring this same offer.
  if (!force) {
    const clash = await findInternalConflict(supabase, {
      check_in,
      check_out,
      excludeId: id,
    });
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
    if (process.env.OWNER_AIRBNB_ICAL_URL) {
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
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({
      guest_name,
      guest_email,
      property_name,
      check_in,
      check_out,
      currency,
      amount_cents,
      checkin_instructions,
      status: "offer_sent", // re-activate if it had expired
      expires_at: offerExpiresAt(), // re-issue the 7-day hold
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) {
    console.error("offer update failed", error);
    return bad("Could not update the offer. Please try again.", 500);
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

/** Remove an offer. Paid bookings can't be removed; everything else is deleted. */
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await authed())) return bad("Not authorized.", 401);
  const { id } = await params;

  const supabase = createAdminClient();
  const { data: existing } = await supabase
    .from("bookings")
    .select("status")
    .eq("id", id)
    .single();
  if (!existing) return bad("Offer not found.", 404);
  if ((existing as { status: string }).status === "paid")
    return bad("This booking is paid and can't be removed.", 409);

  const { error } = await supabase.from("bookings").delete().eq("id", id);
  if (error) {
    console.error("offer delete failed", error);
    return bad("Could not remove the offer. Please try again.", 500);
  }
  return NextResponse.json({ ok: true });
}
