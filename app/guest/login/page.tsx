"use client";

import { useState } from "react";
import { OAuthButtons } from "../../owner/OAuthButtons";
import { PasswordField } from "../../PasswordField";

function nextParam(): string {
  if (typeof window === "undefined") return "/guest";
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/guest";
}

export default function GuestLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [next] = useState(nextParam);

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
      window.location.href = next;
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Incorrect email or password.");
      setLoading(false);
    }
  }

  return (
    <div className="bk-wrap">
      <a href="/" className="bk-brand">Familiar&nbsp;Guest</a>
      <div className="bk-card" style={{ maxWidth: 400 }}>
        <h1>See your stays</h1>
        <p className="bk-lead">
          Sign in to view your bookings and check-in details. Use the email your
          host has on file.
        </p>
        <OAuthButtons next={next} />
        <form onSubmit={submit}>
          <div className="bk-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
          </div>
          <PasswordField id="pw" value={password} onChange={setPassword} autoComplete="current-password" required />
          <button className="bk-btn" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
          {error && <div className="bk-error">{error}</div>}
        </form>
        <p className="bk-note" style={{ marginTop: 18 }}>
          New here?{" "}
          <a href="/guest/signup" style={{ color: "var(--forest)", fontWeight: 600 }}>
            Create a guest account
          </a>
        </p>
      </div>
    </div>
  );
}
