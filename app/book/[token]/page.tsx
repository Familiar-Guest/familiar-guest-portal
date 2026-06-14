import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate, formatMoney, nights } from "@/lib/format";
import { isExpired, expiryDate } from "@/lib/offers";
import type { Booking } from "@/lib/types";
import { PayButton } from "./PayButton";

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

  const n = nights(booking.check_in, booking.check_out);
  const isPaid = booking.status === "paid";
  const isCancelled = booking.status === "cancelled";
  const expired = booking.status === "expired" || isExpired(booking);
  const canPay = !isPaid && !isCancelled && !expired;

  return (
    <div className="bk-wrap">
      <div className="bk-brand">Familiar&nbsp;Guest</div>
      <div className="bk-card">
        {isPaid && <span className="bk-badge">✓ Booking confirmed</span>}
        <h1>{booking.property_name}</h1>
        <p className="bk-lead">
          {isPaid
            ? `You're all set, ${booking.guest_name}. Your stay is confirmed — a copy is in your inbox.`
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
          <div className="bk-row bk-total">
            <span className="bk-label">Total</span>
            <span className="bk-val">
              {formatMoney(booking.amount_cents, booking.currency)}
            </span>
          </div>
        </div>

        {canPay && (
          <>
            <PayButton token={booking.token} />
            <p className="bk-note">
              Secure payment — no account needed. You won&rsquo;t be charged
              until you confirm on the next screen.
              {booking.expires_at && (
                <>
                  {" "}
                  These dates are held for you until{" "}
                  <strong>{formatDate(expiryDate(booking.expires_at))}</strong>.
                </>
              )}
            </p>
          </>
        )}

        <p className="bk-note" style={{ marginTop: 18, borderTop: "1px solid var(--line)", paddingTop: 16 }}>
          Want all your bookings in one place?{" "}
          <a href="/guest/login" style={{ color: "var(--forest)", fontWeight: 600 }}>
            Sign in with Google or Apple
          </a>
        </p>
      </div>
    </div>
  );
}
