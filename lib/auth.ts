import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

export interface OwnerSession {
  id: string;
  email: string;
  phone: string | null;
}

/** The currently authenticated owner, or null. Reads the Supabase session. */
export async function getOwner(): Promise<OwnerSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const phone = (typeof meta.phone === "string" && meta.phone) || null;
  return { id: user.id, email: user.email ?? "", phone };
}

/**
 * Make sure the signed-in user has an `owners` profile row. Needed for OAuth
 * sign-ups (Google/Apple), which never hit /api/owner/register. Idempotent —
 * only inserts when missing, never overwrites an edited profile.
 */
export async function ensureOwnerProfile(): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const full_name =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    null;

  const admin = createAdminClient();
  await admin
    .from("owners")
    .upsert(
      { id: user.id, email: user.email ?? "", full_name },
      { onConflict: "id", ignoreDuplicates: true }
    );
}

/**
 * Ensure the signed-in user has a `guests` profile row. Returns whether it was
 * just created (so the caller can send the welcome email once).
 */
export async function ensureGuestProfile(): Promise<{ created: boolean }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { created: false };

  const admin = createAdminClient();
  const { data: existing } = await admin
    .from("guests")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();
  if (existing) return { created: false };

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const full_name =
    (typeof meta.full_name === "string" && meta.full_name) ||
    (typeof meta.name === "string" && meta.name) ||
    null;
  const phone =
    (typeof meta.phone === "string" && meta.phone) || null;

  await admin.from("guests").insert({
    id: user.id,
    email: user.email ?? "",
    full_name,
    phone,
  });
  return { created: true };
}
