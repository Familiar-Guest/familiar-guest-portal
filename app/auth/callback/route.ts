import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { ensureOwnerProfile } from "@/lib/auth";

export const runtime = "nodejs";

/**
 * OAuth (Google/Apple) redirect target. Exchanges the code for a session,
 * ensures the owner profile exists, then continues to `next` (default /owner).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = sanitizeNext(searchParams.get("next"));

  // Behind Vercel's proxy, trust the forwarded host for the redirect base.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocal = process.env.NODE_ENV === "development";
  const base = !isLocal && forwardedHost ? `https://${forwardedHost}` : origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Only the owner path creates an owner profile; guests stay account-light.
      if (next.startsWith("/owner")) await ensureOwnerProfile();
      return NextResponse.redirect(`${base}${next}`);
    }
  }
  return NextResponse.redirect(`${base}/owner/login?error=oauth`);
}

/** Only allow same-site relative paths as the post-login destination. */
function sanitizeNext(next: string | null): string {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/owner";
  return next;
}
