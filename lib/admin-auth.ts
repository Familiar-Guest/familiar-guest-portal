import { createHash } from "crypto";

export const ADMIN_COOKIE = "fg_admin";

/** Opaque cookie value derived from ADMIN_SECRET — the raw secret never leaves the server. */
export function adminToken(): string {
  return createHash("sha256")
    .update(process.env.ADMIN_SECRET ?? "")
    .digest("hex");
}

export function isAdmin(cookieValue: string | undefined): boolean {
  return Boolean(process.env.ADMIN_SECRET) && cookieValue === adminToken();
}

export function checkPassword(password: string): boolean {
  const secret = process.env.ADMIN_SECRET;
  return Boolean(secret) && password === secret;
}
