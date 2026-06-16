"use client";

import { useRef, useState } from "react";
import type { Property } from "@/lib/types";
import { RichTextEditor } from "./RichTextEditor";

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
    description: initial?.description ?? "",
    currency: initial?.currency ?? "usd",
    nightly_rate: initial?.nightly_rate_cents != null ? (initial.nightly_rate_cents / 100).toString() : "",
    cleaning_fee_type: initial?.cleaning_fee_type ?? "standard",
    cleaning_fee: initial ? (initial.cleaning_fee_cents / 100).toString() : "75",
    daily_cleaning_fee: initial?.daily_cleaning_fee_cents ? (initial.daily_cleaning_fee_cents / 100).toString() : "0",
    alt_cleaning_fee_1: initial?.alt_cleaning_fee_1_cents ? (initial.alt_cleaning_fee_1_cents / 100).toString() : "0",
    alt_cleaning_fee_2: initial?.alt_cleaning_fee_2_cents ? (initial.alt_cleaning_fee_2_cents / 100).toString() : "0",
    min_nights: initial?.min_nights ? String(initial.min_nights) : "1",
    gps_lat: initial?.gps_lat != null ? String(initial.gps_lat) : "",
    gps_lng: initial?.gps_lng != null ? String(initial.gps_lng) : "",
    airbnb_ical_url: initial?.airbnb_ical_url ?? "",
    checkin_instructions: initial?.checkin_instructions ?? "",
    welcome_message_html: (initial as (Property & { welcome_message_html?: string }) | null | undefined)?.welcome_message_html ?? "",
    is_listed: initial?.is_listed ?? false,
  });
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function set<K extends keyof typeof form>(key: K, value: string | boolean) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const MAX_PHOTOS = 10;

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    const room = Math.max(0, MAX_PHOTOS - photos.length);
    const toUpload = Array.from(files).slice(0, room);
    if (files.length > toUpload.length) {
      setError(`Up to ${MAX_PHOTOS} photos per property — some files were skipped.`);
    }
    for (const file of toUpload) {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/owner/photo", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.url) {
        setPhotos((p) => [...p, data.url]);
      } else {
        setError(data.error ?? "A photo failed to upload.");
      }
    }
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  }

  function makeCover(src: string) {
    setPhotos((p) => {
      const i = p.indexOf(src);
      if (i <= 0) return p;
      const next = [...p];
      next.splice(i, 1);
      next.unshift(src);
      return next;
    });
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
      body: JSON.stringify({ ...form, photos }),
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
        Add your place, set a nightly rate, upload photos, and link your Airbnb
        calendar. Publish it to share a booking page with guests.
      </p>
      <form onSubmit={submit}>
        <div className="bk-field">
          <label htmlFor="name">Property name</label>
          <input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Casa del Mar" required />
        </div>

        {/* Photos */}
        <div className="bk-field">
          <label>Photos <span style={{ fontWeight: 400 }}>(first is the cover — up to {MAX_PHOTOS})</span></label>
          {photos.length > 0 && (
            <div className="ph-grid">
              {photos.map((src, i) => (
                <div key={src} className="ph-thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={src} alt={`Photo ${i + 1}`} />
                  {i === 0 ? (
                    <span className="ph-cover">Cover</span>
                  ) : (
                    <button type="button" className="ph-cover ph-cover-btn" onClick={() => makeCover(src)}>
                      Make cover
                    </button>
                  )}
                  <button type="button" className="ph-x" onClick={() => setPhotos((p) => p.filter((u) => u !== src))} aria-label="Remove">×</button>
                </div>
              ))}
            </div>
          )}
          {photos.length < MAX_PHOTOS && (
            <input ref={fileRef} type="file" accept="image/*" multiple onChange={(e) => onFiles(e.target.files)} disabled={uploading} />
          )}
          {uploading && <p className="bk-note" style={{ textAlign: "left", marginTop: 6 }}>Uploading…</p>}
        </div>

        <div className="bk-field">
          <label htmlFor="description">Short description <span style={{ fontWeight: 400 }}>(shown on the listing card)</span></label>
          <textarea id="description" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Beachfront casita, steps from the sand, sleeps 4." />
        </div>

        <div className="bk-grid2">
          <div className="bk-field">
            <label htmlFor="location">Location</label>
            <input id="location" value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Todos Santos, BCS" />
          </div>
          <div className="bk-field">
            <label htmlFor="currency">Payout currency</label>
            <select id="currency" value={form.currency} onChange={(e) => set("currency", e.target.value)}>
              <option value="usd">USD</option>
              <option value="cad">CAD</option>
              <option value="mxn">MXN</option>
            </select>
          </div>
        </div>

        <div className="bk-field">
          <label htmlFor="rate">Nightly rate</label>
          <input id="rate" type="number" min="0" step="0.01" value={form.nightly_rate} onChange={(e) => set("nightly_rate", e.target.value)} placeholder="240.00" />
        </div>

        <div className="bk-field">
          <label>Cleaning fee</label>
          <div className="cf-options">
            <label className="cf-option">
              <input
                type="radio"
                name="cleaning_fee_type"
                checked={form.cleaning_fee_type === "standard"}
                onChange={() => set("cleaning_fee_type", "standard")}
              />
              <span>Standard cleaning fee</span>
              <input type="number" min="0" step="0.01" value={form.cleaning_fee} onChange={(e) => set("cleaning_fee", e.target.value)} placeholder="75.00" />
            </label>
            <label className="cf-option">
              <input
                type="radio"
                name="cleaning_fee_type"
                checked={form.cleaning_fee_type === "daily"}
                onChange={() => set("cleaning_fee_type", "daily")}
              />
              <span>Daily cleaning fee rate</span>
              <input type="number" min="0" step="0.01" value={form.daily_cleaning_fee} onChange={(e) => set("daily_cleaning_fee", e.target.value)} placeholder="0.00" />
            </label>
            <label className="cf-option">
              <input
                type="radio"
                name="cleaning_fee_type"
                checked={form.cleaning_fee_type === "alt1"}
                onChange={() => set("cleaning_fee_type", "alt1")}
              />
              <span>Alternate cleaning fee 1</span>
              <input type="number" min="0" step="0.01" value={form.alt_cleaning_fee_1} onChange={(e) => set("alt_cleaning_fee_1", e.target.value)} placeholder="0.00" />
            </label>
            <label className="cf-option">
              <input
                type="radio"
                name="cleaning_fee_type"
                checked={form.cleaning_fee_type === "alt2"}
                onChange={() => set("cleaning_fee_type", "alt2")}
              />
              <span>Alternate cleaning fee 2</span>
              <input type="number" min="0" step="0.01" value={form.alt_cleaning_fee_2} onChange={(e) => set("alt_cleaning_fee_2", e.target.value)} placeholder="0.00" />
            </label>
          </div>
          <p className="bk-note" style={{ textAlign: "left", marginTop: 6 }}>
            Choose which fee applies to this property. The daily rate is multiplied by the length of stay; the others are a flat amount per booking.
          </p>
        </div>

        <div className="bk-grid2">
          <div className="bk-field">
            <label htmlFor="minn">Minimum nights</label>
            <input id="minn" type="number" min="1" step="1" value={form.min_nights} onChange={(e) => set("min_nights", e.target.value)} />
          </div>
          <div className="bk-field" />
        </div>

        <div className="bk-field">
          <label htmlFor="ical">Airbnb calendar link <span style={{ fontWeight: 400 }}>(iCal export URL)</span></label>
          <input id="ical" value={form.airbnb_ical_url} onChange={(e) => set("airbnb_ical_url", e.target.value)} placeholder="https://www.airbnb.com/calendar/ical/…" />
          <p className="bk-note" style={{ textAlign: "left", marginTop: 6 }}>Airbnb → your listing → Availability → Export calendar. Keeps your listing from double-booking.</p>
        </div>

        <div className="bk-grid2">
          <div className="bk-field">
            <label htmlFor="lat">Latitude <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <input id="lat" value={form.gps_lat} onChange={(e) => set("gps_lat", e.target.value)} placeholder="23.4487" />
          </div>
          <div className="bk-field">
            <label htmlFor="lng">Longitude <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <input id="lng" value={form.gps_lng} onChange={(e) => set("gps_lng", e.target.value)} placeholder="-110.2317" />
          </div>
        </div>

        <div className="bk-field">
          <label htmlFor="ci">Default check-in instructions <span style={{ fontWeight: 400 }}>(optional — sent 2 days before check-in)</span></label>
          <RichTextEditor
            id="ci"
            value={form.checkin_instructions}
            onChange={(html) => set("checkin_instructions", html)}
            placeholder="Door code, parking, WiFi, directions…"
            minHeight={100}
          />
        </div>

        <div className="bk-field">
          <label htmlFor="welcome">Welcome message <span style={{ fontWeight: 400 }}>(optional — included in the guest invitation email)</span></label>
          <RichTextEditor
            id="welcome"
            value={form.welcome_message_html}
            onChange={(html) => set("welcome_message_html", html)}
            placeholder="A personal note to your guests — e.g. 'We're so happy to have you at Casa del Mar. Help yourself to the welcome basket!'"
            minHeight={100}
          />
        </div>

        <label className="ph-publish">
          <input type="checkbox" checked={form.is_listed} onChange={(e) => set("is_listed", e.target.checked)} />
          <span>Publish to my public listings page (needs a nightly rate + at least one photo)</span>
        </label>

        <button className="bk-btn" type="submit" disabled={loading || uploading} style={{ marginTop: 16 }}>
          {loading ? "Saving…" : initial ? "Save changes" : "Add property"}
        </button>
        <button type="button" className="op-link" style={{ marginTop: 14 }} onClick={onCancel} disabled={loading}>
          ← Back to portal
        </button>
        {error && <div className="bk-error">{error}</div>}
      </form>
    </div>
  );
}
