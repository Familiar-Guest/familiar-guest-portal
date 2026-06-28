import { NextResponse } from "next/server";
import { getOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { getConnectStatus, type ConnectStatus } from "@/lib/stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DISCONNECTED: ConnectStatus = {
  connected: false,
  charges_enabled: false,
  payouts_enabled: false,
  details_submitted: false,
  requirements_due: [],
};

/**
 * The owner's Stripe Connect / KYC status. Pulls the live state from Stripe (so
 * it's current even if a webhook was missed) and caches it on the owner row.
 */
export async function GET() {
  const owner = await getOwner();
  if (!owner) return NextResponse.json({ error: "Not authorized." }, { status: 401 });

  const admin = createAdminClient();
  const { data } = await admin
    .from("owners")
    .select(
      "stripe_account_id, stripe_charges_enabled, stripe_payouts_enabled, stripe_details_submitted"
    )
    .eq("id", owner.id)
    .single();
  const row = data as {
    stripe_account_id: string | null;
    stripe_charges_enabled: boolean;
    stripe_payouts_enabled: boolean;
    stripe_details_submitted: boolean;
  } | null;

  if (!row?.stripe_account_id) {
    return NextResponse.json({ ok: true, status: DISCONNECTED });
  }

  try {
    const status = await getConnectStatus(row.stripe_account_id);
    await admin
      .from("owners")
      .update({
        stripe_charges_enabled: status.charges_enabled,
        stripe_payouts_enabled: status.payouts_enabled,
        stripe_details_submitted: status.details_submitted,
      })
      .eq("id", owner.id);
    return NextResponse.json({ ok: true, status });
  } catch (err) {
    console.error("stripe status refresh failed", err);
    // Fall back to the cached values if Stripe is unreachable.
    return NextResponse.json({
      ok: true,
      status: {
        connected: true,
        charges_enabled: row.stripe_charges_enabled,
        payouts_enabled: row.stripe_payouts_enabled,
        details_submitted: row.stripe_details_submitted,
        requirements_due: [],
      } satisfies ConnectStatus,
    });
  }
}
