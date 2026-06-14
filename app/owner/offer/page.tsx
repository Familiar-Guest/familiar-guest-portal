import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { AdminLogin } from "./AdminLogin";
import { OfferForm } from "./OfferForm";

export const metadata: Metadata = {
  title: "Send a booking offer",
  robots: { index: false, follow: false },
};

export default async function OwnerOfferPage() {
  const cookieStore = await cookies();
  const authed = isAdmin(cookieStore.get(ADMIN_COOKIE)?.value);

  return (
    <div className="bk-wrap">
      <div className="bk-brand">Familiar&nbsp;Guest</div>
      {authed ? <OfferForm /> : <AdminLogin />}
    </div>
  );
}
