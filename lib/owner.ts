import { createAdminClient } from "./supabase/admin";
import { slugify } from "./properties";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { OwnerContact } from "./welcome";

/** Fetch the owner's guest-facing contact info (falls back to account email). */
export async function getOwnerContact(
  admin: SupabaseClient,
  ownerId: string
): Promise<OwnerContact> {
  const { data } = await admin
    .from("owners")
    .select("email, contact_email, contact_phone, contact_whatsapp")
    .eq("id", ownerId)
    .single();
  const row = data as {
    email: string;
    contact_email: string | null;
    contact_phone: string | null;
    contact_whatsapp: string | null;
  } | null;
  return {
    email: row?.contact_email ?? row?.email ?? null,
    phone: row?.contact_phone ?? null,
    whatsapp: row?.contact_whatsapp ?? null,
  };
}

/** Find a handle based on `base`, appending a random suffix if taken by another owner. */
async function findUniqueHandle(
  admin: SupabaseClient,
  base: string,
  excludeOwnerId: string
): Promise<string> {
  let handle = base;
  for (let i = 0; i < 8; i++) {
    const { data: clash } = await admin
      .from("owners")
      .select("id")
      .eq("handle", handle)
      .neq("id", excludeOwnerId)
      .maybeSingle();
    if (!clash) break;
    handle = `${base}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }
  return handle;
}

/**
 * Ensure the owner has a unique storefront handle (for famguest.com/h/<handle>).
 * Returns the handle. Generates one from their name/email on first need.
 */
export async function ensureOwnerHandle(
  ownerId: string,
  seed: string
): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("owners")
    .select("handle")
    .eq("id", ownerId)
    .single();
  const existing = (data as { handle: string | null } | null)?.handle;
  if (existing) return existing;

  const base = slugify(seed.split("@")[0] || "host");
  const handle = await findUniqueHandle(admin, base, ownerId);

  const { error } = await admin
    .from("owners")
    .update({ handle })
    .eq("id", ownerId);
  if (error) {
    console.error("set owner handle failed", error);
    return null;
  }
  return handle;
}

/**
 * Set the owner's public display name and regenerate their storefront handle
 * from it. Pass `null`/empty to clear it and fall back to their full name.
 */
export async function setOwnerPublicName(
  ownerId: string,
  publicName: string | null
): Promise<{ handle: string | null } | { error: string }> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("owners")
    .select("full_name, email")
    .eq("id", ownerId)
    .single();
  const owner = data as { full_name: string | null; email: string } | null;
  if (!owner) return { error: "Owner not found." };

  const seed = publicName || owner.full_name || owner.email;
  const base = slugify(seed.split("@")[0] || "host");
  const handle = await findUniqueHandle(admin, base, ownerId);

  const { error } = await admin
    .from("owners")
    .update({ public_name: publicName, handle })
    .eq("id", ownerId);
  if (error) {
    console.error("set owner public name failed", error);
    return { error: "Could not save your public name." };
  }
  return { handle };
}
