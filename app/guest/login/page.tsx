import type { Metadata } from "next";
import { OAuthButtons } from "../../owner/OAuthButtons";

export const metadata: Metadata = {
  title: "Your stays",
  robots: { index: false, follow: false },
};

export default function GuestLoginPage() {
  return (
    <div className="bk-wrap">
      <div className="bk-brand">Familiar&nbsp;Guest</div>
      <div className="bk-card" style={{ maxWidth: 400 }}>
        <h1>See your stays</h1>
        <p className="bk-lead">
          Sign in to view your bookings, check-in details, and message your
          host. You never need an account to pay — this is just to keep your
          stays in one place.
        </p>
        <OAuthButtons next="/guest" showDivider={false} />
        <p className="bk-note" style={{ marginTop: 14 }}>
          Use the same email your host sent your booking to.
        </p>
      </div>
    </div>
  );
}
