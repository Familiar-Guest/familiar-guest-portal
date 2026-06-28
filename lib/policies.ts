import type { SupabaseClient } from "@supabase/supabase-js";
import { addDays, daysUntil, formatDate, formatMoney } from "./format";
import type { Booking } from "./types";

/** Owner-global rental policies. Mirrors the owner_policies table. */
export interface OwnerPolicy {
  min_days_to_book: number;
  checkin_email_days: number;
  deposit_required_days: number;
  full_payment_due_days: number;
  deposit_pct: number;
  refund_100_days: number;
  refund_50_days: number;
}

/** Defaults from the 2026-06-17 Policies spec. */
export const DEFAULT_POLICY: OwnerPolicy = {
  min_days_to_book: 2,
  checkin_email_days: 2,
  deposit_required_days: 30,
  full_payment_due_days: 15,
  deposit_pct: 25,
  refund_100_days: 30,
  refund_50_days: 15,
};

const FIELDS = Object.keys(DEFAULT_POLICY) as (keyof OwnerPolicy)[];

/** The owner's policies, with any unset row falling back to defaults. */
export async function getOwnerPolicies(
  admin: SupabaseClient,
  ownerId: string | null
): Promise<OwnerPolicy> {
  if (!ownerId) return { ...DEFAULT_POLICY };
  const { data } = await admin
    .from("owner_policies")
    .select("*")
    .eq("owner_id", ownerId)
    .maybeSingle();
  if (!data) return { ...DEFAULT_POLICY };
  const row = data as Record<string, unknown>;
  const merged = { ...DEFAULT_POLICY };
  for (const key of FIELDS) {
    const v = row[key];
    if (v != null) merged[key] = Number(v);
  }
  return merged;
}

/** Validate + normalize a PATCH payload for the owner's policies. */
export function parsePolicyInput(
  body: Record<string, unknown>
): { value: OwnerPolicy } | { error: string } {
  const value = { ...DEFAULT_POLICY };
  for (const key of FIELDS) {
    if (!(key in body)) continue;
    const n = Number(body[key]);
    if (!Number.isFinite(n) || n < 0) return { error: `Enter a valid value for ${key}.` };
    if (key === "deposit_pct" && n > 100) return { error: "Deposit % must be between 0 and 100." };
    value[key] = key === "deposit_pct" ? n : Math.round(n);
  }
  if (value.refund_50_days > value.refund_100_days)
    return { error: "The 50% refund window can't be longer than the 100% window." };
  return { value };
}

/** Policy fields that now live on the property (the per-property payment/refund policy). */
export interface PropertyPolicyFields {
  deposit_pct: number;
  deposit_required_days: number;
  full_payment_due_days: number;
  refund_100_days: number;
  refund_50_days: number;
  checkin_email_days: number;
}

const PROPERTY_POLICY_COLS =
  "deposit_pct, deposit_required_days, full_payment_due_days, refund_100_days, refund_50_days, checkin_email_days";

/** Build an OwnerPolicy from a property's per-property policy fields.
 *  `min_days_to_book` is a global concern (public-request lead time) and is not
 *  used by the payment/refund consumers that read a property policy. */
export function policyFromProperty(p: PropertyPolicyFields): OwnerPolicy {
  return {
    min_days_to_book: DEFAULT_POLICY.min_days_to_book,
    checkin_email_days: p.checkin_email_days,
    deposit_required_days: p.deposit_required_days,
    full_payment_due_days: p.full_payment_due_days,
    deposit_pct: p.deposit_pct,
    refund_100_days: p.refund_100_days,
    refund_50_days: p.refund_50_days,
  };
}

/**
 * The effective policy for a booking: the property's per-property policy with
 * any per-booking overrides applied on top. Falls back to the owner's global
 * default if the property is missing (e.g. deleted after the booking).
 */
export async function effectivePolicyForBooking(
  admin: SupabaseClient,
  booking: Booking
): Promise<OwnerPolicy> {
  let base: OwnerPolicy | null = null;
  if (booking.property_id) {
    const { data } = await admin
      .from("properties")
      .select(PROPERTY_POLICY_COLS)
      .eq("id", booking.property_id)
      .maybeSingle();
    if (data) base = policyFromProperty(data as PropertyPolicyFields);
  }
  if (!base) base = await getOwnerPolicies(admin, booking.owner_id);
  return effectivePolicy(booking, base);
}

/**
 * Merge per-booking policy overrides with a base policy (property or global).
 * Any field set on the booking takes precedence; null falls back to the base.
 * `min_days_to_book` is not per-booking (it governs public requests, not owner invites).
 */
export function effectivePolicy(booking: Booking, ownerPolicy: OwnerPolicy): OwnerPolicy {
  return {
    min_days_to_book: ownerPolicy.min_days_to_book,
    checkin_email_days:
      booking.policy_checkin_email_days ?? ownerPolicy.checkin_email_days,
    deposit_required_days:
      booking.policy_deposit_required_days ?? ownerPolicy.deposit_required_days,
    full_payment_due_days:
      booking.policy_full_payment_due_days ?? ownerPolicy.full_payment_due_days,
    deposit_pct:
      booking.policy_deposit_pct ?? ownerPolicy.deposit_pct,
    refund_100_days:
      booking.policy_refund_100_days ?? ownerPolicy.refund_100_days,
    refund_50_days:
      booking.policy_refund_50_days ?? ownerPolicy.refund_50_days,
  };
}

export interface DepositPlan {
  plan: "full" | "deposit";
  depositCents: number;
  balanceCents: number;
  balanceDueDate: string | null; // YYYY-MM-DD
}

/**
 * Decide whether a booking pays a deposit now or the full amount, based on how
 * far out the stay is. A deposit applies only when the stay is at least
 * `deposit_required_days` away and the deposit is a true fraction (< 100%).
 */
export function depositPlanFor(
  policy: OwnerPolicy,
  amountCents: number,
  checkIn: string,
  now: Date = new Date()
): DepositPlan {
  const eligible =
    amountCents > 0 &&
    policy.deposit_pct > 0 &&
    policy.deposit_pct < 100 &&
    daysUntil(checkIn, now) >= policy.deposit_required_days;

  if (!eligible) {
    return { plan: "full", depositCents: 0, balanceCents: 0, balanceDueDate: null };
  }

  const depositCents = Math.round((amountCents * policy.deposit_pct) / 100);
  const balanceCents = amountCents - depositCents;
  return {
    plan: "deposit",
    depositCents,
    balanceCents,
    balanceDueDate: addDays(checkIn, -policy.full_payment_due_days),
  };
}

/** Refund percentage (100 | 50 | 0) for a cancellation `checkIn` days out. */
export function refundPctForCancellation(
  policy: OwnerPolicy,
  checkIn: string,
  now: Date = new Date()
): 100 | 50 | 0 {
  const d = daysUntil(checkIn, now);
  if (d >= policy.refund_100_days) return 100;
  if (d >= policy.refund_50_days) return 50;
  return 0;
}

/** Last day a balance can be paid before the deposit is forfeited (due + 5). */
export function forfeitDeadline(balanceDueDate: string): string {
  return addDays(balanceDueDate, 5);
}

/** How much money has actually been collected on a booking, in cents. */
export function paidAmountCents(b: {
  status: string;
  amount_cents: number;
  deposit_cents: number;
}): number {
  if (b.status === "paid") return b.amount_cents;
  if (b.status === "deposit_paid") return b.deposit_cents;
  return 0;
}

/**
 * Guest-facing booking terms (payment schedule + cancellation policy) as plain
 * text lines, derived from the booking's effective policy. State-aware: a paid
 * or deposit-paid booking reflects what's already been collected; an unpaid
 * offer shows the schedule the guest will follow when they pay.
 */
export function guestBookingTerms(
  b: Booking,
  policy: OwnerPolicy,
  now: Date = new Date()
): string[] {
  const lines: string[] = [];
  const money = (c: number) => formatMoney(c, b.currency);

  if (b.amount_cents === 0) {
    lines.push("Complimentary stay — no payment is required.");
    return lines;
  }

  // ── Payment schedule ──────────────────────────────────────────────────────
  if (b.status === "paid") {
    lines.push(`Paid in full: ${money(b.amount_cents)}.`);
  } else if (b.status === "deposit_paid") {
    lines.push(`Deposit paid: ${money(b.deposit_cents)}.`);
    if (b.balance_cents > 0) {
      lines.push(
        b.balance_due_date
          ? `Remaining balance of ${money(b.balance_cents)} due by ${formatDate(b.balance_due_date)}.`
          : `Remaining balance of ${money(b.balance_cents)} due before check-in.`
      );
    }
  } else {
    // Unpaid offer — show the schedule that will apply when the guest pays.
    const plan = depositPlanFor(policy, b.amount_cents, b.check_in, now);
    if (plan.plan === "deposit") {
      lines.push(
        `A ${policy.deposit_pct}% deposit (${money(plan.depositCents)}) reserves your dates now.`
      );
      lines.push(
        plan.balanceDueDate
          ? `Remaining balance of ${money(plan.balanceCents)} is due by ${formatDate(plan.balanceDueDate)} (${policy.full_payment_due_days} days before check-in).`
          : `Remaining balance of ${money(plan.balanceCents)} is due before check-in.`
      );
    } else {
      lines.push(`Full payment of ${money(b.amount_cents)} confirms your booking.`);
    }
  }

  // ── Cancellation policy ───────────────────────────────────────────────────
  lines.push(
    `Cancellation: full refund if cancelled ${policy.refund_100_days}+ days before check-in; ` +
      `${policy.refund_50_days}–${policy.refund_100_days} days before, 50%; after that, no refund.`
  );

  return lines;
}

/**
 * Build a map of booking id → guest-facing terms for a set of bookings,
 * caching each owner's policy so the table is hit once per owner. Used by the
 * guest portal pages to render terms per reservation.
 */
export async function buildTermsMap(
  admin: SupabaseClient,
  bookings: Booking[],
  now: Date = new Date()
): Promise<Record<string, string[]>> {
  const propCache = new Map<string, OwnerPolicy>();
  const ownerCache = new Map<string, OwnerPolicy>();
  const map: Record<string, string[]> = {};
  for (const b of bookings) {
    let base: OwnerPolicy | null = null;
    if (b.property_id) {
      base = propCache.get(b.property_id) ?? null;
      if (!base) {
        const { data } = await admin
          .from("properties")
          .select(PROPERTY_POLICY_COLS)
          .eq("id", b.property_id)
          .maybeSingle();
        if (data) {
          base = policyFromProperty(data as PropertyPolicyFields);
          propCache.set(b.property_id, base);
        }
      }
    }
    if (!base) {
      const key = b.owner_id ?? "";
      base = ownerCache.get(key) ?? (await getOwnerPolicies(admin, b.owner_id));
      ownerCache.set(key, base);
    }
    map[b.id] = guestBookingTerms(b, effectivePolicy(b, base), now);
  }
  return map;
}

/** The refund owed on cancellation: percentage tier + amount in cents. */
export function computeRefund(
  policy: OwnerPolicy,
  b: { status: string; amount_cents: number; deposit_cents: number; check_in: string },
  now: Date = new Date()
): { pct: 100 | 50 | 0; cents: number } {
  const pct = refundPctForCancellation(policy, b.check_in, now);
  const paid = paidAmountCents(b);
  return { pct, cents: Math.round((paid * pct) / 100) };
}
