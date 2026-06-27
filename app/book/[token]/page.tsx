import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { getOwner } from "@/lib/auth";
import { formatDate, formatMoney, nights } from "@/lib/format";
import { isExpired, expiryDate } from "@/lib/offers";
import type { Booking } from "@/lib/types";
import { PayButton } from "./PayButton";
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
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const booking = await getBooking(token);
  if (!booking) notFound();

  const session = await getOwner();
  // Show "Owner portal" only when the logged-in user is the owner of THIS booking.
  // A user who is both owner and guest should see "My stays" when viewing their own stay.
  const isBookingOwner = session !== null && booking.owner_id === session.id;
  const n = nights(booking.check_in, booking.check_out);
  const isPaid = booking.status === "paid";
  const isDepositPaid = booking.status === "deposit_paid";
  const isForfeited = booking.status === "forfeited";
  const isCancelled = booking.status === "cancelled";
  const expired = booking.status === "expired" || isExpired(booking);
  const canPay = !isPaid && !isCancelled && !expired && !isForfeited;

  return (
    <div className="bk-wrap">
      <BrandMark />
      <nav className="bk-nav">
        {isBookingOwner ? (
          <a href="/owner" className="bk-nav-link">← Owner portal</a>
        ) : (
          <a href="/guest" className="bk-nav-link">← My stays</a>
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
          {booking.nightly_rate_cents != null && (
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
          )}
          <div className="bk-row bk-total">
            <span className="bk-label">Total</span>
            <span className="bk-val">
              {formatMoney(booking.amount_cents, booking.currency)}
            </span>
          </div>
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
              {booking.expires_at && !isDepositPaid && (
                <>
                  {" "}
                  {(() => {
                    const rawExpiry = expiryDate(booking.expires_at!);
                    const displayExpiry = rawExpiry > booking.check_in ? booking.check_in : rawExpiry;
                    return rawExpiry > booking.check_in
                      ? <>Payment is due by your check-in date, <strong>{formatDate(displayExpiry)}</strong>.</>
                      : <>These dates are held for you until <strong>{formatDate(displayExpiry)}</strong>.</>;
                  })()}
                </>
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
      </div>
    </div>
  );
}
