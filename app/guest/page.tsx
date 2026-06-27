import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { GuestStays } from "./GuestStays";
import type { Booking } from "@/lib/types";

export const metadata: Metadata = {
  title: "Your stays",
  robots: { index: false, follow: false },
};

export default async function GuestPage() {
  // getOwner returns the signed-in user (owner or guest) from the session.
  const session = await getOwner();
  if (!session) redirect("/guest/login");

  const admin = createAdminClient();
  // Match stays booked under this email OR linked to this account id.
  const { data } = await admin
    .from("bookings")
    .select("*")
    .or(`guest_email.eq.${session.email},guest_user_id.eq.${session.id}`)
    .order("check_in", { ascending: true });

  const bookings = (data ?? []) as Booking[];

  // Fetch the first (cover) photo for each unique property.
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
      <GuestStays email={session.email} bookings={bookings} coverPhotos={coverPhotos} />
    </div>
  );
}
