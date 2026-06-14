"use client";

import { useState } from "react";
import { OAuthButtons } from "../../owner/OAuthButtons";

function nextParam(): string {
  if (typeof window === "undefined") return "/guest";
  const n = new URLSearchParams(window.location.search).get("next");
  return n && n.startsWith("/") && !n.startsWith("//") ? n : "/guest";
}

export default function GuestSignupPage() {
  const [form, setForm] = useState({ full_name: "", email: "", phone: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [next] = useState(nextParam);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/guest/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      window.location.href = data.signedIn ? next : `/guest/login?next=${encodeURIComponent(next)}`;
    } else {
      setError(data.error ?? "Could not create your account.");
      setLoading(false);
    }
  }

  return (
    <div className="bk-wrap">
      <div className="bk-brand">Familiar&nbsp;Guest</div>
      <div className="bk-card" style={{ maxWidth: 420 }}>
        <h1>Create your guest account</h1>
        <p className="bk-lead">
          One account for all your Familiar Guest stays. We&rsquo;ll email you a
          link to your stays page.
        </p>
        <OAuthButtons next={next} />
        <form onSubmit={submit}>
          <div className="bk-field">
            <label htmlFor="full_name">Your name</label>
            <input id="full_name" value={form.full_name} onChange={(e) => set("full_name", e.target.value)} autoComplete="name" required />
          </div>
          <div className="bk-field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} autoComplete="email" required />
          </div>
          <div className="bk-field">
            <label htmlFor="phone">
              Mobile <span style={{ fontWeight: 400 }}>(optional — for SMS updates)</span>
            </label>
            <input id="phone" type="tel" value={form.phone} onChange={(e) => set("phone", e.target.value)} autoComplete="tel" />
          </div>
          <div className="bk-field">
            <label htmlFor="pw">Password</label>
            <input id="pw" type="password" value={form.password} onChange={(e) => set("password", e.target.value)} autoComplete="new-password" minLength={8} required />
          </div>
          <button className="bk-btn" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
          {error && <div className="bk-error">{error}</div>}
        </form>
        <p className="bk-note" style={{ marginTop: 18 }}>
          Already have an account?{" "}
          <a href="/guest/login" style={{ color: "var(--forest)", fontWeight: 600 }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
