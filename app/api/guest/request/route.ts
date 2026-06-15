import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner, ensureGuestProfile } from "@/lib/auth";
import { fetchBusyBlocks, hasConflict } from "@/lib/ical";
import { findInternalConflict } from "@/lib/offers";
import { quote } from "@/lib/availability";
import { nights } from "@/lib/format";
import { buildOwnerRequestEmail, sendEmail } from "@/lib/email";
import type { Booking, Property } from "@/lib/types";

export const runtime = "nodejs";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

function bad(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** A signed-in guest requests open dates on a public listing. */
export async function POST(request: NextRequest) {
  const session = await getOwner(); // signed-in user
  if (!session) return bad("Please sign in to request a booking.", 401);
  await ensureGuestProfile();

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return bad("Invalid request.");
  }
  const property_id = String(body.property_id ?? "").trim();
  const check_in = String(body.check_in ?? "").trim();
  const check_out = String(body.check_out ?? "").trim();
  if (!property_id) return bad("Missing property.");
  if (!DATE_RE.test(check_in) || !DATE_RE.test(check_out))
    return bad("Choose valid dates.");
  if (check_out <= check_in) return bad("Check-out must be after check-in.");

  const supabase = createAdminClient();
  const { data: prop } = await supabase
    .from("properties")
    .select("*")
    .eq("id", property_id)
    .single();
  const property = prop as Property | null;
  if (!property || !property.is_listed) return bad("This listing isn't available.", 404);

  if (nights(check_in, check_out) < (property.min_nights ?? 1))
    return bad(`This place has a ${property.min_nights}-night minimum.`);

  const q = quote(property, check_in, check_out);
  if (!q) return bad("This listing isn't bookable right now.");

  // Make sure the dates are actually open.
  const clash = await findInternalConflict(supabase, { check_in, check_out, propertyId: property_id });
  if (clash) return bad("Sorry, those dates are no longer available.", 409);
  if (property.airbnb_ical_url) {
    const blocks = await fetchBusyBlocks(property.airbnb_ical_url);
    if (hasConflict(blocks, check_in, check_out))
      return bad("Sorry, those dates are no longer available.", 409);
  }

  // Guest display name.
  const { data: g } = await supabase
    .from("guests")
    .select("full_name")
    .eq("id", session.id)
    .maybeSingle();
  const guest_name =
    (g as { full_name: string | null } | null)?.full_name ||
    session.email.split("@")[0];

  const token = randomBytes(24).toString("hex");
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      token,
      owner_id: property.owner_id,
      property_id,
      guest_user_id: session.id,
      guest_name,
      guest_email: session.email,
      property_name: property.name,
      check_in,
      check_out,
      currency: property.currency,
      amount_cents: q.amount_cents,
      nightly_rate_cents: property.nightly_rate_cents,
      cleaning_fee_cents: q.cleaning_cents,
      checkin_instructions: property.checkin_instructions,
      kind: "request",
      status: "requested",
    })
    .select()
    .single();

  if (error || !data) {
    console.error("request insert failed", error);
    return bad("Could not submit your request. Please try again.", 500);
  }

  // Notify the owner (transactional) so they can approve.
  const { data: ownerRow } = await supabase
    .from("owners")
    .select("email")
    .eq("id", property.owner_id)
    .single();
  const ownerEmail = (ownerRow as { email: string } | null)?.email;
  if (ownerEmail) {
    const { subject, html } = buildOwnerRequestEmail(data as Booking);
    await sendEmail({ to: ownerEmail, subject, html });
  }

  return NextResponse.json({ ok: true });
}
