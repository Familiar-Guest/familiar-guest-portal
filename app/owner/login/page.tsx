"use client";

import { useState } from "react";
import { OAuthButtons } from "../OAuthButtons";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/owner/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (res.ok) {
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      window.location.href = next && next.startsWith("/") && !next.startsWith("//") ? next : "/owner";
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Incorrect email or password.");
      setLoading(false);
    }
  }

  return (
    <div className="bk-wrap">
      <div className="bk-brand">Familiar&nbsp;Guest</div>
      <div className="bk-card" style={{ maxWidth: 400 }}>
        <h1>Owner sign in</h1>
        <p className="bk-lead">Welcome back. Sign in to manage your properties and bookings.</p>
        <OAuthButtons />
        <form onSubmit={submit}>
          <div className="bk-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>
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
            {loading ? "Signing in…" : "Sign in"}
          </button>
          {error && <div className="bk-error">{error}</div>}
        </form>
        <p className="bk-note" style={{ marginTop: 18 }}>
          New here? <a href="/owner/signup" style={{ color: "var(--forest)", fontWeight: 600 }}>Create an owner account</a>
        </p>
      </div>
    </div>
  );
}
