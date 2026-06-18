import { randomBytes } from "crypto";
import { createAdminClient } from "./supabase/admin";
import { siteUrl } from "./email";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * The permanent, no-login guest portal keyed by email (the unique customer
 * key). Each guest email maps to a single unguessable token; the link itself is
 * the credential — anyone with it can view that guest's bookings. Mirrors the
 * tokenized booking pay-link pattern already used for `bookings.token`.
 */

/**
 * Return the guest's permanent portal token, creating the mapping on first use.
 * Idempotent. Pass an admin client to reuse an existing one.
 */
export async function ensureGuestPortal(
  email: string,
  admin?: SupabaseClient
): Promise<string> {
  const db = admin ?? createAdminClient();
  const normalized = email.trim().toLowerCase();

  const { data: existing } = await db
    .from("guest_portals")
    .select("token")
    .eq("email", normalized)
    .maybeSingle();
  const found = (existing as { token: string } | null)?.token;
  if (found) return found;

  const token = randomBytes(24).toString("hex");
  const { data, error } = await db
    .from("guest_portals")
    .upsert({ email: normalized, token }, { onConflict: "email", ignoreDuplicates: true })
    .select("token")
    .maybeSingle();

  // On a race, the conflicting row wins — re-read to get the canonical token.
  if (error || !data) {
    const { data: row } = await db
      .from("guest_portals")
      .select("token")
      .eq("email", normalized)
      .maybeSingle();
    return (row as { token: string } | null)?.token ?? token;
  }
  return (data as { token: string }).token;
}

/** Resolve a portal token back to its guest email, or null if unknown. */
export async function getEmailForToken(
  token: string,
  admin?: SupabaseClient
): Promise<string | null> {
  if (!token) return null;
  const db = admin ?? createAdminClient();
  const { data } = await db
    .from("guest_portals")
    .select("email")
    .eq("token", token)
    .maybeSingle();
  return (data as { email: string } | null)?.email ?? null;
}

/** Full URL to a guest's permanent portal. */
export function guestPortalUrl(token: string): string {
  return `${siteUrl()}/guest/${token}`;
}
