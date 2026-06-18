"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

/** "Continue with Google" — used on both owner and guest auth pages. */
export function OAuthButtons({
  next = "/owner",
  showDivider = true,
}: {
  next?: string;
  showDivider?: boolean;
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function goGoogle() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next
        )}`,
      },
    });
    if (error) {
      setError("Google sign-in is unavailable. Use email and password below.");
      setLoading(false);
    }
    // On success the browser is redirected to Google.
  }

  return (
    <div className="oauth">
      <button
        type="button"
        className="oauth-btn"
        onClick={goGoogle}
        disabled={loading}
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5a5.6 5.6 0 0 1-2.4 3.7v3h3.9c2.3-2.1 3.5-5.2 3.5-8.9z" />
          <path fill="#34A853" d="M12 24c3.2 0 6-1.1 8-2.9l-3.9-3c-1.1.7-2.5 1.2-4.1 1.2-3.1 0-5.8-2.1-6.7-5H1.3v3.1A12 12 0 0 0 12 24z" />
          <path fill="#FBBC05" d="M5.3 14.3a7.2 7.2 0 0 1 0-4.6V6.6H1.3a12 12 0 0 0 0 10.8l4-3.1z" />
          <path fill="#EA4335" d="M12 4.8c1.8 0 3.3.6 4.6 1.8l3.4-3.4A12 12 0 0 0 1.3 6.6l4 3.1C6.2 6.8 8.9 4.8 12 4.8z" />
        </svg>
        {loading ? "Redirecting…" : "Continue with Google"}
      </button>
      {error && <div className="bk-error">{error}</div>}
      {showDivider && <div className="oauth-divider"><span>or</span></div>}
    </div>
  );
}
