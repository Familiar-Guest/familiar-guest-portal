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

  const bookings = (data ?? []) as Booking[];

  // Fetch the first (cover) photo for each unique property so the portal can
  // show a thumbnail next to the property name.
  const propertyIds = [...new Set(bookings.map((b) => b.property_id).filter(Boolean))] as string[];
  const { data: propData } = propertyIds.length
    ? await admin.from("properties").select("id, photos").in("id", propertyIds)
    : { data: [] };
  const coverPhotos: Record<string, string> = {};
  for (const p of (propData ?? []) as { id: string; photos: string[] }[]) {
    if (p.photos?.[0]) coverPhotos[p.id] = p.photos[0];
  }

  return (
    <div className="bk-wrap op-wrap-page">
      <GuestPortalClient
        token={token}
        email={email}
        bookings={bookings}
        coverPhotos={coverPhotos}
      />
    </div>
  );
}
