import Link from "next/link";
import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { formatDate } from "@/lib/format";
import type { Booking } from "@/lib/types";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default async function SuccessPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .eq("token", token)
    .single();
  const booking = (data as Booking) ?? null;

  return (
    <div className="bk-wrap">
      <a href="/" className="bk-brand">Familiar&nbsp;Guest</a>
      <nav className="bk-nav">
        <a href="/guest" className="bk-nav-link">← My stays</a>
      </nav>
      <div className="bk-card">
        <span className="bk-badge">✓ Payment received</span>
        <h1>You&rsquo;re booked!</h1>
        <p className="bk-lead">
          {booking
            ? `Thank you, ${booking.guest_name}. Your stay at ${booking.property_name} is confirmed${
                booking.check_in ? ` for ${formatDate(booking.check_in)}` : ""
              }. A confirmation is on its way to your inbox.`
            : "Thank you — your payment was received and a confirmation is on its way to your inbox."}
        </p>
        <p className="bk-note">
          We&rsquo;ll remind you a week before your stay and send check-in
          details two days before you arrive.
        </p>
        {booking && (
          <p className="bk-note" style={{ marginTop: 18 }}>
            <Link href={`/book/${token}`} style={{ color: "var(--clay)" }}>
              View your booking
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
