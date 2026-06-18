import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getOwner } from "@/lib/auth";
import { ensureOwnerHandle } from "@/lib/owner";
import { createAdminClient } from "@/lib/supabase/admin";
import { Portal } from "./Portal";

export const metadata: Metadata = {
  title: "Owner portal",
  robots: { index: false, follow: false },
};

export default async function OwnerPage() {
  const owner = await getOwner();
  if (!owner) redirect("/owner/login");

  // Owner iff they have an owners profile row (created at owner sign-up only).
  // A signed-in guest who lands here is sent to their stays instead.
  const admin = createAdminClient();
  const { data } = await admin
    .from("owners")
    .select("full_name, public_name")
    .eq("id", owner.id)
    .single();
  if (!data) redirect("/guest");

  let ownerName = owner.email.split("@")[0];
  const { full_name: fullName, public_name: publicName } = data as {
    full_name: string | null;
    public_name: string | null;
  };
  if (fullName) ownerName = fullName.split(" ")[0];

  const handle = await ensureOwnerHandle(owner.id, publicName || fullName || owner.email);

  return (
    <div className="bk-wrap op-wrap-page">
      <Portal ownerName={ownerName} ownerPublicName={publicName} handle={handle} />
    </div>
  );
}
