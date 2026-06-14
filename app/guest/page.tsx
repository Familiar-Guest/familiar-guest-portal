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
  const { data } = await admin
    .from("bookings")
    .select("*")
    .eq("guest_email", session.email)
    .order("check_in", { ascending: true });

  return (
    <div className="bk-wrap op-wrap-page">
      <GuestStays email={session.email} bookings={(data ?? []) as Booking[]} />
    </div>
  );
}
