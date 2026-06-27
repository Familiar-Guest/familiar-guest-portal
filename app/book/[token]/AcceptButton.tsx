"use client";

import { useState } from "react";

export function AcceptButton({ token }: { token: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function accept() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/book/${token}/accept`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not confirm. Please try again.");
        setLoading(false);
        return;
      }
      // Reload the page — it will now show the confirmed state.
      window.location.reload();
    } catch {
      setError("Could not confirm. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <button className="bk-btn" onClick={accept} disabled={loading}>
        {loading ? "Confirming…" : "Accept this offer"}
      </button>
      {error && <div className="bk-error">{error}</div>}
    </>
  );
}
