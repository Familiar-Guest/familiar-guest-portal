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
