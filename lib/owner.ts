import { createAdminClient } from "./supabase/admin";
import { slugify } from "./properties";

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
  let handle = base;
  // Find a free handle.
  for (let i = 0; i < 8; i++) {
    const { data: clash } = await admin
      .from("owners")
      .select("id")
      .eq("handle", handle)
      .maybeSingle();
    if (!clash) break;
    handle = `${base}-${Math.floor(Math.random() * 9000 + 1000)}`;
  }

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
