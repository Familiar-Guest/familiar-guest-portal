import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, isAdmin } from "@/lib/admin-auth";
import { AdminLogin } from "./AdminLogin";
import { OwnerPortal } from "./OwnerPortal";

export const metadata: Metadata = {
  title: "Owner portal",
  robots: { index: false, follow: false },
};

export default async function OwnerPage() {
  const cookieStore = await cookies();
  const authed = isAdmin(cookieStore.get(ADMIN_COOKIE)?.value);

  return (
    <div className="bk-wrap">
      <div className="bk-brand">Familiar&nbsp;Guest</div>
      {authed ? <OwnerPortal /> : <AdminLogin />}
    </div>
  );
}
