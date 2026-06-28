import { NextResponse } from "next/server";
import { getOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createConnectAccount, createAccountOnboardingLink } from "@/lib/stripe";
import { siteUrl } from "@/lib/email";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Start (or resume) Stripe Connect onboarding / identity verification for the
 * signed-in owner. Ensures the owner has a Connect account, then redirects to a
 * fresh Stripe-hosted onboarding link. This same route is the account link's
 * refresh_url, so an expired link simply regenerates here.
 *
 * It's a GET so the portal can link to it directly (browser navigates to Stripe).
 */
export async function GET() {
  const owner = await getOwner();
  if (!owner) return NextResponse.redirect(`${siteUrl()}/owner/login`);

  const admin = createAdminClient();
  const { data } = await admin
    .from("owners")
    .select("stripe_account_id, email")
    .eq("id", owner.id)
    .single();
  const row = data as { stripe_account_id: string | null; email: string | null } | null;
  if (!row) return NextResponse.redirect(`${siteUrl()}/guest`);

  let accountId = row.stripe_account_id;
  try {
    if (!accountId) {
      accountId = await createConnectAccount(row.email ?? owner.email, owner.id);
      await admin.from("owners").update({ stripe_account_id: accountId }).eq("id", owner.id);
    }
    const url = await createAccountOnboardingLink(
      accountId,
      `${siteUrl()}/api/owner/stripe/connect`, // refresh: regenerate the link
      `${siteUrl()}/owner?kyc=return` // return: back to the portal
    );
    return NextResponse.redirect(url);
  } catch (err) {
    console.error("stripe connect onboarding failed", err);
    return NextResponse.redirect(`${siteUrl()}/owner?kyc=error`);
  }
}
