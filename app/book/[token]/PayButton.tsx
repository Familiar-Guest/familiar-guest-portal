"use client";

import { useState } from "react";

export function PayButton({
  token,
  defaultPhone,
}: {
  token: string;
  defaultPhone: string | null;
}) {
  const [phone, setPhone] = useState(defaultPhone ?? "");
  const [method, setMethod] = useState<"sms" | "email">(
    defaultPhone ? "sms" : "email"
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function startCheckout() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          guest_phone: phone,
          confirmation_method: method,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.url) {
        setError(data.error ?? "Could not start checkout. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setError("Could not start checkout. Please try again.");
      setLoading(false);
    }
  }

  return (
    <>
      <div className="bk-field">
        <label htmlFor="guest_phone">
          Phone number{" "}
          <span style={{ fontWeight: 400 }}>(optional — for text confirmation)</span>
        </label>
        <input
          id="guest_phone"
          type="tel"
          value={phone}
          onChange={(e) => {
            const value = e.target.value;
            setPhone(value);
            if (!value.trim() && method === "sms") setMethod("email");
          }}
        />
      </div>

      <div className="bk-field">
        <label>How should we confirm your booking?</label>
        <div style={{ display: "flex", gap: 16 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
            <input
              type="radio"
              name="confirmation_method"
              value="email"
              checked={method === "email"}
              onChange={() => setMethod("email")}
            />
            Email
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 6, fontWeight: 400 }}>
            <input
              type="radio"
              name="confirmation_method"
              value="sms"
              checked={method === "sms"}
              disabled={!phone.trim()}
              onChange={() => setMethod("sms")}
            />
            Text message
          </label>
        </div>
      </div>

      <button className="bk-btn" onClick={startCheckout} disabled={loading}>
        {loading ? "Starting secure checkout…" : "Complete payment"}
      </button>
      {error && <div className="bk-error">{error}</div>}
    </>
  );
}
