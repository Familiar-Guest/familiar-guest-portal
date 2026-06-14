import { createClient } from "./supabase/server";

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
