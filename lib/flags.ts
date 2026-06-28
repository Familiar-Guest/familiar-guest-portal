/**
 * Master switch for live money movement: the Stripe Connect KYC payment gate,
 * escrow release (payouts), and automated refunds. Off by default so the code
 * can ship dormant; flip PAYMENTS_GATE_ENABLED=true (Vercel env) once Connect is
 * set up, test-mode validated, and the safety review is done.
 */
export function paymentsGateEnabled(): boolean {
  return process.env.PAYMENTS_GATE_ENABLED === "true";
}
