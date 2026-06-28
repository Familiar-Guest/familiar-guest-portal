import Stripe from "stripe";

/**
 * Server-only Stripe client, lazily initialized so a missing key at build/import
 * time never throws. For the first booking the platform account IS the owner's
 * account (owner = platform operator), so funds land directly — no Connect yet.
 */
let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    const key = process.env.STRIPE_SECRET_KEY;
    if (!key) throw new Error("STRIPE_SECRET_KEY is not set");
    _stripe = new Stripe(key);
  }
  return _stripe;
}

// ── Stripe Connect (Custom accounts) — Gate 1 owner KYC ─────────────────────

/** The verification state we cache on the owner row and surface in the portal. */
export interface ConnectStatus {
  connected: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  requirements_due: string[];
}

/**
 * Create a Stripe Connect **Custom** account for an owner. Custom keeps Stripe
 * in the background (the owner experiences "Familiar Guest pays me"). KYC is
 * collected later via a hosted account link, so no sensitive PII touches us.
 *
 * NOTE: `country` must match where the owner is (US/CA at launch). We default to
 * US; capture the owner's country before launch for Canadian owners.
 */
export async function createConnectAccount(
  email: string,
  ownerId: string,
  country = "US"
): Promise<string> {
  const account = await getStripe().accounts.create({
    type: "custom",
    country,
    email,
    business_type: "individual",
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    metadata: { owner_id: ownerId },
  });
  return account.id;
}

/** A fresh hosted onboarding/KYC link for the owner's Connect account. */
export async function createAccountOnboardingLink(
  accountId: string,
  refreshUrl: string,
  returnUrl: string
): Promise<string> {
  const link = await getStripe().accountLinks.create({
    account: accountId,
    type: "account_onboarding",
    refresh_url: refreshUrl,
    return_url: returnUrl,
  });
  return link.url;
}

/** Live verification state for a Connect account, normalized for our use. */
export async function getConnectStatus(accountId: string): Promise<ConnectStatus> {
  const a = await getStripe().accounts.retrieve(accountId);
  return {
    connected: true,
    charges_enabled: Boolean(a.charges_enabled),
    payouts_enabled: Boolean(a.payouts_enabled),
    details_submitted: Boolean(a.details_submitted),
    requirements_due: a.requirements?.currently_due ?? [],
  };
}
