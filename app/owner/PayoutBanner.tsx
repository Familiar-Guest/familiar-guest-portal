"use client";

export interface ConnectStatus {
  connected: boolean;
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted: boolean;
  requirements_due?: string[];
}

/**
 * Gate-1 banner. Prompts the owner to complete Stripe identity verification
 * (KYC) so they can get paid. Hidden once charges are enabled. Links straight to
 * the hosted onboarding route.
 */
export function PayoutBanner({ status }: { status: ConnectStatus | null }) {
  if (!status || status.charges_enabled) return null;

  const started = status.connected && status.details_submitted;
  const heading = started
    ? "Verification in review"
    : "Set up getting paid";
  const body = started
    ? "Stripe is reviewing your details, or needs a little more information before you can accept payments."
    : "Verify your identity with our payments partner (Stripe) to accept guest payments and receive payouts. Most owners finish in a few minutes.";
  const cta = started ? "Continue verification" : "Start verification";

  return (
    <div className="payout-banner">
      <div className="payout-banner-main">
        <div className="payout-banner-title">{heading}</div>
        <p className="payout-banner-body">{body}</p>
      </div>
      <a className="bk-btn payout-banner-btn" href="/api/owner/stripe/connect">
        {cta}
      </a>
    </div>
  );
}
