"use client";

import { useState } from "react";
import type { Property } from "@/lib/types";

export function PropertyForm({
  initial,
  onDone,
  onCancel,
}: {
  initial?: Property | null;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    location: initial?.location ?? "",
    currency: initial?.currency ?? "usd",
    gps_lat: initial?.gps_lat != null ? String(initial.gps_lat) : "",
    gps_lng: initial?.gps_lng != null ? String(initial.gps_lng) : "",
    airbnb_ical_url: initial?.airbnb_ical_url ?? "",
    checkin_instructions: initial?.checkin_instructions ?? "",
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
    const isEdit = Boolean(initial?.id);
    const url = isEdit ? `/api/owner/properties/${initial!.id}` : "/api/owner/properties";
    const res = await fetch(url, {
      method: isEdit ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not save the property.");
      setLoading(false);
      return;
    }
    onDone();
  }

  return (
    <div className="bk-card">
      <h1>{initial ? "Edit property" : "Add a property"}</h1>
      <p className="bk-lead">
        Tell us about your place and link your Airbnb calendar so availability
        stays in sync.
      </p>
      <form onSubmit={submit}>
        <div className="bk-field">
          <label htmlFor="name">Property name</label>
          <input
            id="name"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Casa del Mar"
            required
          />
        </div>
        <div className="bk-grid2">
          <div className="bk-field">
            <label htmlFor="location">Location</label>
            <input
              id="location"
              value={form.location}
              onChange={(e) => set("location", e.target.value)}
              placeholder="Todos Santos, BCS"
            />
          </div>
          <div className="bk-field">
            <label htmlFor="currency">Payout currency</label>
            <select
              id="currency"
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
            >
              <option value="usd">USD</option>
              <option value="cad">CAD</option>
              <option value="mxn">MXN</option>
            </select>
          </div>
        </div>
        <div className="bk-field">
          <label htmlFor="ical">
            Airbnb calendar link{" "}
            <span style={{ fontWeight: 400 }}>(iCal export URL)</span>
          </label>
          <input
            id="ical"
            value={form.airbnb_ical_url}
            onChange={(e) => set("airbnb_ical_url", e.target.value)}
            placeholder="https://www.airbnb.com/calendar/ical/…"
          />
          <p className="bk-note" style={{ textAlign: "left", marginTop: 6 }}>
            Airbnb → your listing → Availability → Export calendar. We check it
            so offers don&rsquo;t double-book.
          </p>
        </div>
        <div className="bk-grid2">
          <div className="bk-field">
            <label htmlFor="lat">
              Latitude <span style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="lat"
              value={form.gps_lat}
              onChange={(e) => set("gps_lat", e.target.value)}
              placeholder="23.4487"
            />
          </div>
          <div className="bk-field">
            <label htmlFor="lng">
              Longitude <span style={{ fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              id="lng"
              value={form.gps_lng}
              onChange={(e) => set("gps_lng", e.target.value)}
              placeholder="-110.2317"
            />
          </div>
        </div>
        <div className="bk-field">
          <label htmlFor="ci">
            Default check-in instructions{" "}
            <span style={{ fontWeight: 400 }}>(optional)</span>
          </label>
          <textarea
            id="ci"
            rows={3}
            value={form.checkin_instructions}
            onChange={(e) => set("checkin_instructions", e.target.value)}
            placeholder="Door code, parking, WiFi, directions…"
          />
        </div>
        <button className="bk-btn" type="submit" disabled={loading}>
          {loading ? "Saving…" : initial ? "Save changes" : "Add property"}
        </button>
        <button
          type="button"
          className="op-link"
          style={{ marginTop: 14 }}
          onClick={onCancel}
          disabled={loading}
        >
          ← Back to portal
        </button>
        {error && <div className="bk-error">{error}</div>}
      </form>
    </div>
  );
}
