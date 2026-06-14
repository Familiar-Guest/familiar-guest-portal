"use client";

import { useState } from "react";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/owner/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.reload();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Incorrect password.");
      setLoading(false);
    }
  }

  return (
    <div className="bk-card" style={{ maxWidth: 400 }}>
      <h1>Owner portal</h1>
      <p className="bk-lead">Enter your owner password to manage your offers.</p>
      <form onSubmit={submit}>
        <div className="bk-field">
          <label htmlFor="pw">Password</label>
          <input
            id="pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            required
          />
        </div>
        <button className="bk-btn" type="submit" disabled={loading}>
          {loading ? "Checking…" : "Continue"}
        </button>
        {error && <div className="bk-error">{error}</div>}
      </form>
    </div>
  );
}
