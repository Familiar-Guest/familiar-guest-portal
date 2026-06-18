"use client";

import { useState } from "react";
import { OAuthButtons } from "../OAuthButtons";
import { PasswordField } from "../../PasswordField";
import { PhoneField } from "../../PhoneField";

export default function SignupPage() {
  const [form, setForm] = useState({
    full_name: "",
    public_name: "",
    email: "",
    phone: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await fetch("/api/owner/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      window.location.href = data.signedIn ? "/owner" : "/owner/login";
    } else {
      setError(data.error ?? "Could not create your account.");
      setLoading(false);
    }
  }

  return (
    <div className="bk-wrap">
      <a href="/" className="bk-brand">Familiar&nbsp;Guest</a>
      <div className="bk-card" style={{ maxWidth: 440 }}>
        <h1>Create your owner account</h1>
        <p className="bk-lead">
          Set up in minutes — add your property, link your calendar, and start
          taking direct bookings.
        </p>
        <OAuthButtons />
        <form onSubmit={submit}>
          <div className="bk-field">
            <label htmlFor="full_name">Your name</label>
            <input
              id="full_name"
              value={form.full_name}
              onChange={(e) => {
                // Keep public_name in sync until the user diverges it manually
                if (form.public_name === form.full_name) set("public_name", e.target.value);
                set("full_name", e.target.value);
              }}
              autoComplete="name"
              required
            />
          </div>
          <div className="bk-field">
            <label htmlFor="public_name">
              Public name{" "}
              <span style={{ fontWeight: 400, fontSize: 13 }}>
                (shown on your listing page and part of your listing link; can be a company name)
              </span>
            </label>
            <input
              id="public_name"
              value={form.public_name}
              onChange={(e) => set("public_name", e.target.value)}
              required
            />
          </div>
          <div className="bk-field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={(e) => set("email", e.target.value)}
              autoComplete="email"
              required
            />
          </div>
          <PhoneField
            id="phone"
            label="Phone"
            value={form.phone}
            onChange={(v) => set("phone", v)}
            optional
            autoComplete="tel"
          />
          <PasswordField
            id="pw"
            value={form.password}
            onChange={(v) => set("password", v)}
            autoComplete="new-password"
            minLength={8}
            required
          />
          <button className="bk-btn" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
          {error && <div className="bk-error">{error}</div>}
        </form>
        <p className="bk-note" style={{ marginTop: 18 }}>
          Already have an account?{" "}
          <a href="/owner/login" style={{ color: "var(--forest)", fontWeight: 600 }}>
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
}
