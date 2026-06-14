import { createClient } from "./supabase/server";
import { createAdminClient } from "./supabase/admin";

export interface OwnerSession {
  id: string;
  email: string;
}

/** The currently authenticated owner, or null. Reads the Supabase session. */
export async function getOwner(): Promise<OwnerSession | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? "" };
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
