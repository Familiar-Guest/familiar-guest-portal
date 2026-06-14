"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** "Continue with Google / Apple" — used on both owner and guest auth pages. */
export function OAuthButtons({
  next = "/owner",
  showDivider = true,
}: {
  next?: string;
  showDivider?: boolean;
}) {
  const [loading, setLoading] = useState<"google" | "apple" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function go(provider: "google" | "apple") {
    setLoading(provider);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });
    if (error) {
      setError(
        "That sign-in option isn't available yet. Use email and password for now."
      );
      setLoading(null);
    }
    // On success the browser is redirected to the provider.
  }

  return (
    <div className="oauth">
      <button
        type="button"
        className="oauth-btn"
        onClick={() => go("google")}
        disabled={loading !== null}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
          <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1C6.2 6.8 8.9 4.8 12 4.8z" />
        </svg>
        {loading === "google" ? "Redirecting…" : "Continue with Google"}
      </button>
      <button
        type="button"
        className="oauth-btn"
        onClick={() => go("apple")}
        disabled={loading !== null}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor" aria-hidden="true">
          <path d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.8-3.5.8-.7 0-1.8-.8-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.3.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7 2-1 2.8-2.1c.9-1.3 1.2-2.5 1.3-2.6-.1 0-2.5-1-2.5-3.9zM14.2 5.6c.6-.8 1-1.9.9-3-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.8-1 2.8 1 .1 2.1-.5 2.8-1.2z" />
        </svg>
        {loading === "apple" ? "Redirecting…" : "Continue with Apple"}
      </button>
      {error && <div className="bk-error">{error}</div>}
      {showDivider && <div className="oauth-divider"><span>or</span></div>}
    </div>
  );
}
