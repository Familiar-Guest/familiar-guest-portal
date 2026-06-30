import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { formatDate, formatMoney, nights } from "@/lib/format";
import { isExpired, expiryDate } from "@/lib/offers";
import { depositPlanFor, effectivePolicyForBooking } from "@/lib/policies";
import type { Booking } from "@/lib/types";
import { PayButton } from "./PayButton";
import { AcceptButton } from "./AcceptButton";
import { BrandMark } from "@/app/BrandMark";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

async function getBooking(token: string): Promise<Booking | null> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("token", token)
    .single();
  return (data as Booking) ?? null;
}

export default async function BookingPage({
  params,
  searchParams,
}: {
  params: Promise<{ token: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { token } = await params;
  const { from } = await searchParams;
  const booking = await getBooking(token);
  if (!booking) notFound();

  const session = await getOwner();
  // The breadcrumb reflects the screen you came FROM, not your account roles:
  // owner-portal links pass ?from=owner; everything else returns to the guest
  // portal. (A user with both roles shouldn't see "Owner portal" while paying.)
  const fromOwner = from === "owner";
  const n = nights(booking.check_in, booking.check_out);
  const isPaid = booking.status === "paid";
  const isDepositPaid = booking.status === "deposit_paid";
  const isForfeited = booking.status === "forfeited";
  const isCancelled = booking.status === "cancelled";
  const expired = booking.status === "expired" || isExpired(booking);
  const isFree = booking.amount_cents === 0;
  const canPay = !isFree && !isPaid && !isCancelled && !expired && !isForfeited;
  const canAccept = isFree && !isPaid && !isCancelled && !expired && !isForfeited;

  // For an unpaid offer, work out whether a deposit applies so the screen can
  // explain the deposit-now / balance-auto-charge schedule.
  const policy = await effectivePolicyForBooking(createAdminClient(), booking);
  const plan = depositPlanFor(policy, booking.amount_cents, booking.check_in);
  const showDepositPlan = canPay && !isDepositPaid && plan.plan === "deposit";

  return (
    <div className="bk-wrap">
      <BrandMark />
      <nav className="bk-nav">
        {fromOwner ? (
          <a href="/owner" className="bk-nav-link">← Owner portal</a>
        ) : (
          <a href="/guest" className="bk-nav-link">← Guest portal</a>
        )}
      </nav>
      <div className="bk-card">
        {isPaid && <span className="bk-badge">✓ Booking confirmed</span>}
        {isDepositPaid && <span className="bk-badge">Deposit paid</span>}
        <h1>{booking.property_name}</h1>
        <p className="bk-lead">
          {isPaid
            ? `You're all set, ${booking.guest_name}. Your stay is confirmed — a copy is in your inbox.`
            : isDepositPaid
            ? `Hi ${booking.guest_name}, your deposit is paid and your dates are held. Pay your remaining balance of ${formatMoney(
                booking.balance_cents,
                booking.currency
              )}${booking.balance_due_date ? ` by ${formatDate(booking.balance_due_date)}` : ""} to complete your booking.`
            : isForfeited
            ? "This reservation was released because the balance wasn't paid in time. Please contact your host."
            : isCancelled
            ? "This booking is no longer available. Please contact your host."
            : expired
            ? `Sorry ${booking.guest_name}, this offer has expired. Please contact your host to request new dates.`
            : isFree
            ? `Hi ${booking.guest_name}, your host is offering you a complimentary stay — no payment required. Accept below to confirm your dates.`
            : `Hi ${booking.guest_name}, your host has set aside these dates for you. Review the details and complete your payment to lock it in.`}
        </p>

        <div className="bk-summary">
          <div className="bk-row">
            <span className="bk-label">Check-in</span>
            <span className="bk-val">{formatDate(booking.check_in)}</span>
          </div>
          <div className="bk-row">
            <span className="bk-label">Check-out</span>
            <span className="bk-val">{formatDate(booking.check_out)}</span>
          </div>
          <div className="bk-row">
            <span className="bk-label">Nights</span>
            <span className="bk-val">{n}</span>
          </div>
          {booking.nightly_rate_cents != null ? (
            <>
              <div className="bk-row">
                <span className="bk-label">
                  {formatMoney(booking.nightly_rate_cents, booking.currency)} ×{" "}
                  {n} {n === 1 ? "night" : "nights"}
                </span>
                <span className="bk-val">
                  {formatMoney(booking.nightly_rate_cents * n, booking.currency)}
                </span>
              </div>
              {booking.cleaning_fee_cents > 0 && (
                <div className="bk-row">
                  <span className="bk-label">Cleaning fee</span>
                  <span className="bk-val">
                    {formatMoney(booking.cleaning_fee_cents, booking.currency)}
                  </span>
                </div>
              )}
            </>
          ) : (
            booking.amount_cents > 0 && (
              <>
                {/* Mixed per-day rates: show a single accommodation subtotal. */}
                <div className="bk-row">
                  <span className="bk-label">
                    Accommodation · {n} {n === 1 ? "night" : "nights"}
                  </span>
                  <span className="bk-val">
                    {formatMoney(booking.amount_cents - booking.cleaning_fee_cents, booking.currency)}
                  </span>
                </div>
                {booking.cleaning_fee_cents > 0 && (
                  <div className="bk-row">
                    <span className="bk-label">Cleaning fee</span>
                    <span className="bk-val">
                      {formatMoney(booking.cleaning_fee_cents, booking.currency)}
                    </span>
                  </div>
                )}
              </>
            )
          )}
          <div className="bk-row bk-total">
            <span className="bk-label">Total</span>
            <span className="bk-val">
              {formatMoney(booking.amount_cents, booking.currency)}
            </span>
          </div>
          {showDepositPlan && (
            <>
              <div className="bk-row">
                <span className="bk-label">Deposit due today</span>
                <span className="bk-val">
                  {formatMoney(plan.depositCents, booking.currency)}
                </span>
              </div>
              <div className="bk-row">
                <span className="bk-label">
                  Balance auto-charged
                  {plan.balanceDueDate ? ` ${formatDate(plan.balanceDueDate)}` : ""}
                </span>
                <span className="bk-val">
                  {formatMoney(plan.balanceCents, booking.currency)}
                </span>
              </div>
            </>
          )}
          {isDepositPaid && (
            <>
              <div className="bk-row">
                <span className="bk-label">Deposit paid</span>
                <span className="bk-val">
                  {formatMoney(booking.deposit_cents, booking.currency)}
                </span>
              </div>
              <div className="bk-row bk-total">
                <span className="bk-label">
                  Balance due
                  {booking.balance_due_date
                    ? ` by ${formatDate(booking.balance_due_date)}`
                    : ""}
                </span>
                <span className="bk-val">
                  {formatMoney(booking.balance_cents, booking.currency)}
                </span>
              </div>
            </>
          )}
        </div>

        {canPay && session && (
          <>
            <PayButton token={booking.token} defaultPhone={session.phone} />
            <p className="bk-note">
              Secure payment. You won&rsquo;t be charged until you confirm on the
              next screen.
              {showDepositPlan ? (
                <>
                  {" "}You&rsquo;ll pay the{" "}
                  <strong>{formatMoney(plan.depositCents, booking.currency)}</strong>{" "}
                  deposit today; the remaining{" "}
                  <strong>{formatMoney(plan.balanceCents, booking.currency)}</strong>{" "}
                  is automatically charged to the same card
                  {plan.balanceDueDate ? (
                    <> on <strong>{formatDate(plan.balanceDueDate)}</strong></>
                  ) : null}
                  . We&rsquo;ll remind you beforehand.
                </>
              ) : (
                booking.expires_at && !isDepositPaid && (() => {
                  const rawExpiry = expiryDate(booking.expires_at!);
                  return rawExpiry < booking.check_in ? (
                    <> These dates are held for you until <strong>{formatDate(rawExpiry)}</strong>.</>
                  ) : null;
                })()
              )}
            </p>
          </>
        )}

        {canPay && !session && (
          <div className="bk-authgate">
            <p className="bk-lead" style={{ marginBottom: 14 }}>
              Create a free guest account (or sign in) to complete your booking.
              It keeps all your stays in one place.
            </p>
            <a
              className="bk-btn"
              style={{ display: "block", textAlign: "center", marginBottom: 10 }}
              href={`/guest/signup?next=/book/${booking.token}`}
            >
              Create account &amp; continue
            </a>
            <a
              className="op-link"
              style={{ display: "block", textAlign: "center" }}
              href={`/guest/login?next=/book/${booking.token}`}
            >
              I already have an account
            </a>
          </div>
        )}

        {canAccept && session && (
          <>
            <AcceptButton token={booking.token} />
            <p className="bk-note">
              This is a complimentary stay — no payment is collected.
            </p>
          </>
        )}

        {canAccept && !session && (
          <div className="bk-authgate">
            <p className="bk-lead" style={{ marginBottom: 14 }}>
              Create a free guest account (or sign in) to accept this offer.
              It keeps all your stays in one place.
            </p>
            <a
              className="bk-btn"
              style={{ display: "block", textAlign: "center", marginBottom: 10 }}
              href={`/guest/signup?next=/book/${booking.token}`}
            >
              Create account &amp; accept
            </a>
            <a
              className="op-link"
              style={{ display: "block", textAlign: "center" }}
              href={`/guest/login?next=/book/${booking.token}`}
            >
              I already have an account
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
