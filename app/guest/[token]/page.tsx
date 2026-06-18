import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { getEmailForToken } from "@/lib/guestPortal";
import { GuestPortalClient } from "./GuestPortalClient";
import type { Booking } from "@/lib/types";

export const metadata: Metadata = {
  title: "Your bookings",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

export default async function GuestTokenPortal({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const admin = createAdminClient();
  const email = await getEmailForToken(token, admin);

  if (!email) {
    return (
      <div className="bk-wrap op-wrap-page">
        <div className="op-shell">
          <div className="op-panel">
            <div className="op-empty">
              This link is no longer valid. If you have a Familiar Guest account,
              you can sign in to view your bookings.
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { data } = await admin
    .from("bookings")
    .select("*")
    .eq("guest_email", email)
    .order("check_in", { ascending: true });

  return (
    <div className="bk-wrap op-wrap-page">
      <GuestPortalClient
        token={token}
        email={email}
        bookings={(data ?? []) as Booking[]}
      />
    </div>
  );
}
