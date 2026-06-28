"use client";

import { useEffect, useRef, useState } from "react";
import type { Property } from "@/lib/types";
import { MAX_NONSTANDARD_RATES } from "@/lib/properties";

// UI shape for a non-standard rate row — `rate` is an editable dollar string.
interface NsRateRow {
  id: string;
  name: string;
  start: string;
  end: string;
  rate: string;
}

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
    // Structured check-in + address fields that populate the guest emails.
    address: initial?.address ?? "",
    check_in_time: initial?.check_in_time ?? "3:00 PM",
    check_out_time: initial?.check_out_time ?? "11:00 AM",
    entry_instructions: initial?.entry_instructions ?? "",
    wifi: initial?.wifi ?? "",
    parking: initial?.parking ?? "",
    house_rules: initial?.house_rules ?? "",
    // Payment / refund policy (per-property). For a new property these are
    // pre-filled from the owner's global default below.
    deposits_required: initial ? (initial.deposit_pct ?? 0) > 0 : true,
    deposit_pct: initial && initial.deposit_pct ? String(initial.deposit_pct) : "25",
    deposit_required_days: initial ? String(initial.deposit_required_days) : "30",
    full_payment_due_days: initial ? String(initial.full_payment_due_days) : "30",
    refund_100_days: initial ? String(initial.refund_100_days) : "30",
    refund_50_days: initial ? String(initial.refund_50_days) : "15",
    checkin_email_days: initial ? String(initial.checkin_email_days) : "2",
    is_listed: initial?.is_listed ?? false,
  });
  const [photos, setPhotos] = useState<string[]>(initial?.photos ?? []);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Non-standard (per-date-range) rates. Dates are fixed once added; only the
  // name and price are editable. Ranges may not overlap; up to 8 allowed.
  const [nsRates, setNsRates] = useState<NsRateRow[]>(
    (initial?.nonstandard_rates ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      start: r.start,
      end: r.end,
      rate: (r.rate_cents / 100).toString(),
    }))
  );
  const [showAddNs, setShowAddNs] = useState(false);
  const [nsDraft, setNsDraft] = useState({ name: "", start: "", end: "", rate: "" });

  // New property: pre-fill the payment/refund policy from the owner's global
  // default so they only set it once (then can adjust per property).
  useEffect(() => {
    if (initial) return; // editing keeps the property's saved policy
    fetch("/api/owner/policies", { cache: "no-store" })
      .then((r) => r.json())
      .then((d) => {
        if (!d.policy) return;
        const p = d.policy;
        setForm((f) => ({
          ...f,
          deposits_required: (p.deposit_pct ?? 0) > 0,
          deposit_pct: p.deposit_pct ? String(p.deposit_pct) : "25",
          deposit_required_days: String(p.deposit_required_days),
          full_payment_due_days: String(p.full_payment_due_days),
          refund_100_days: String(p.refund_100_days),
          refund_50_days: String(p.refund_50_days),
          checkin_email_days: String(p.checkin_email_days),
        }));
      })
      .catch(() => {});
  }, [initial]);
  const [nsError, setNsError] = useState<string | null>(null);

  function nextDefaultName(): string {
    const used = new Set<number>();
    for (const r of nsRates) {
      const m = /^Non-Standard (\d+)$/.exec(r.name);
      if (m) used.add(Number(m[1]));
    }
    let n = 1;
    while (used.has(n)) n++;
    return `Non-Standard ${n}`;
  }

  function addNs() {
    setNsError(null);
    if (nsRates.length >= MAX_NONSTANDARD_RATES) {
      setNsError(`You can set at most ${MAX_NONSTANDARD_RATES} non-standard rates.`);
      return;
    }
    const { start, end, rate } = nsDraft;
    if (!start || !end) { setNsError("Pick a start and end date."); return; }
    if (end < start) { setNsError("End date can't be before the start date."); return; }
    const rateNum = Number(rate);
    if (!rate || !Number.isFinite(rateNum) || rateNum < 0) { setNsError("Enter a valid rate amount."); return; }
    // Inclusive-night overlap: ranges clash when start ≤ other.end and other.start ≤ end.
    if (nsRates.some((r) => start <= r.end && r.start <= end)) {
      setNsError("These dates overlap an existing non-standard rate.");
      return;
    }
    const name = nsDraft.name.trim() || nextDefaultName();
    setNsRates((rs) => [
      ...rs,
      { id: `ns_${Math.random().toString(36).slice(2, 10)}`, name, start, end, rate },
    ]);
    setNsDraft({ name: "", start: "", end: "", rate: "" });
    setShowAddNs(false);
  }

  function removeNs(id: string) {
    setNsRates((rs) => rs.filter((r) => r.id !== id));
  }

  function updateNs(id: string, field: "name" | "rate", value: string) {
    setNsRates((rs) => rs.map((r) => (r.id === id ? { ...r, [field]: value } : r)));
  }

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
      body: JSON.stringify({
        ...form,
        photos,
        nonstandard_rates: nsRates.map((r) => ({
          id: r.id,
          name: r.name,
          start: r.start,
          end: r.end,
          rate: r.rate,
        })),
      }),
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
          <input id="name" value={form.name} onChange={(e) => set("name", e.target.value)} required />
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
          <textarea id="description" rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} />
        </div>

        <div className="bk-grid2">
          <div className="bk-field">
            <label htmlFor="location">Location</label>
            <input id="location" value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div className="bk-field">
            <label htmlFor="currency">Pricing currency</label>
            <select id="currency" value={form.currency} onChange={(e) => set("currency", e.target.value)}>
              <option value="usd">USD — US Dollar</option>
              <option value="cad">CAD — Canadian Dollar</option>
              <option value="mxn">MXN — Mexican Peso</option>
              <option value="eur">EUR — Euro</option>
            </select>
            <p className="bk-note" style={{ textAlign: "left", marginTop: 5 }}>
              Guests pay in this currency. US-based owners receive USD in their bank account — Stripe converts at the live rate.
            </p>
          </div>
        </div>

        <div className="bk-field">
          <label htmlFor="address">Street address <span style={{ fontWeight: 400 }}>(shown to guests in their booking &amp; check-in emails)</span></label>
          <input id="address" value={form.address} onChange={(e) => set("address", e.target.value)} />
          <p className="bk-note" style={{ textAlign: "left", marginTop: 6 }}>Add latitude/longitude below for an exact &ldquo;Get directions&rdquo; map pin.</p>
        </div>

        <div className="bk-field">
          <label htmlFor="rate">Standard Daily Rate ({form.currency.toUpperCase()})</label>
          <input id="rate" type="number" min="0" step="0.01" value={form.nightly_rate} onChange={(e) => set("nightly_rate", e.target.value)} />
          <p className="bk-note" style={{ textAlign: "left", marginTop: 5 }}>
            The default nightly price, applied to every day except those covered by a Non-Standard Rate below.
          </p>
        </div>

        <div className="bk-field">
          <label>
            Non-Standard Rates{" "}
            <span style={{ fontWeight: 400 }}>
              (up to {MAX_NONSTANDARD_RATES} date ranges priced differently from the Standard Daily Rate)
            </span>
          </label>

          {nsRates.length > 0 && (
            <div className="cf-options" style={{ marginBottom: 10 }}>
              {nsRates.map((r) => (
                <div key={r.id} className="ns-row">
                  <div className="ns-main">
                    <input
                      className="ns-name"
                      value={r.name}
                      onChange={(e) => updateNs(r.id, "name", e.target.value)}
                      aria-label="Rate name"
                    />
                    <span className="ns-dates">{r.start} &rarr; {r.end}</span>
                  </div>
                  <input
                    className="ns-rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={r.rate}
                    onChange={(e) => updateNs(r.id, "rate", e.target.value)}
                    aria-label="Rate amount"
                  />
                  <button type="button" className="ph-x" onClick={() => removeNs(r.id)} aria-label="Remove">×</button>
                </div>
              ))}
            </div>
          )}

          {showAddNs ? (
            <div className="ns-add">
              <div className="bk-grid2">
                <div className="bk-field">
                  <label>Start date</label>
                  <input type="date" value={nsDraft.start} onChange={(e) => setNsDraft((d) => ({ ...d, start: e.target.value }))} />
                </div>
                <div className="bk-field">
                  <label>End date</label>
                  <input type="date" value={nsDraft.end} onChange={(e) => setNsDraft((d) => ({ ...d, end: e.target.value }))} />
                </div>
              </div>
              <div className="bk-grid2">
                <div className="bk-field">
                  <label>Name <span style={{ fontWeight: 400 }}>(optional)</span></label>
                  <input value={nsDraft.name} placeholder={nextDefaultName()} onChange={(e) => setNsDraft((d) => ({ ...d, name: e.target.value }))} />
                </div>
                <div className="bk-field">
                  <label>Rate ({form.currency.toUpperCase()})</label>
                  <input type="number" min="0" step="0.01" value={nsDraft.rate} onChange={(e) => setNsDraft((d) => ({ ...d, rate: e.target.value }))} />
                </div>
              </div>
              {nsError && <div className="bk-error">{nsError}</div>}
              <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 6 }}>
                <button type="button" className="bk-btn" onClick={addNs}>Add rate</button>
                <button type="button" className="op-link" onClick={() => { setShowAddNs(false); setNsError(null); }}>Cancel</button>
              </div>
            </div>
          ) : (
            nsRates.length < MAX_NONSTANDARD_RATES && (
              <button type="button" className="op-link" onClick={() => { setShowAddNs(true); setNsError(null); }}>
                + Add Non-Standard Rate &amp; Dates
              </button>
            )
          )}

          <p className="bk-note" style={{ textAlign: "left", marginTop: 6 }}>
            Each range uses its own nightly price for those dates. Ranges can&rsquo;t overlap, and dates can&rsquo;t be edited once added — remove and re-add to change them. You can rename a range or change its price anytime.
          </p>
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
              <input type="number" min="0" step="0.01" value={form.cleaning_fee} onChange={(e) => set("cleaning_fee", e.target.value)} />
            </label>
            <label className="cf-option">
              <input
                type="radio"
                name="cleaning_fee_type"
                checked={form.cleaning_fee_type === "daily"}
                onChange={() => set("cleaning_fee_type", "daily")}
              />
              <span>Daily cleaning fee rate</span>
              <input type="number" min="0" step="0.01" value={form.daily_cleaning_fee} onChange={(e) => set("daily_cleaning_fee", e.target.value)} />
            </label>
            <label className="cf-option">
              <input
                type="radio"
                name="cleaning_fee_type"
                checked={form.cleaning_fee_type === "alt1"}
                onChange={() => set("cleaning_fee_type", "alt1")}
              />
              <span>Alternate cleaning fee 1</span>
              <input type="number" min="0" step="0.01" value={form.alt_cleaning_fee_1} onChange={(e) => set("alt_cleaning_fee_1", e.target.value)} />
            </label>
            <label className="cf-option">
              <input
                type="radio"
                name="cleaning_fee_type"
                checked={form.cleaning_fee_type === "alt2"}
                onChange={() => set("cleaning_fee_type", "alt2")}
              />
              <span>Alternate cleaning fee 2</span>
              <input type="number" min="0" step="0.01" value={form.alt_cleaning_fee_2} onChange={(e) => set("alt_cleaning_fee_2", e.target.value)} />
            </label>
          </div>
          <p className="bk-note" style={{ textAlign: "left", marginTop: 6 }}>
            Choose which fee applies to this property. The daily rate is multiplied by the length of stay; the others are a flat amount per booking.
          </p>
        </div>

        {/* Payment & refund policy (per-property) */}
        <div className="bk-field">
          <label>Payment policy</label>
          <label className="cf-option" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.deposits_required}
              onChange={(e) => setForm((f) => ({ ...f, deposits_required: e.target.checked }))}
            />
            <span>Require a deposit to reserve</span>
          </label>

          {form.deposits_required && (
            <div className="bk-grid2" style={{ marginTop: 10 }}>
              <div className="bk-field">
                <label htmlFor="dep_pct">Deposit amount</label>
                <select id="dep_pct" value={form.deposit_pct} onChange={(e) => set("deposit_pct", e.target.value)}>
                  <option value="25">25% of the total</option>
                  <option value="50">50% of the total</option>
                </select>
              </div>
              <div className="bk-field">
                <label htmlFor="dep_days">Deposit due (days before check-in)</label>
                <input id="dep_days" type="number" min="0" step="1" value={form.deposit_required_days} onChange={(e) => set("deposit_required_days", e.target.value)} />
                <p className="bk-note" style={{ textAlign: "left", marginTop: 5 }}>
                  If a guest books closer in than this, they pay in full at booking.
                </p>
              </div>
              <div className="bk-field">
                <label htmlFor="full_days">Full payment due (days before check-in)</label>
                <input id="full_days" type="number" min="0" step="1" value={form.full_payment_due_days} onChange={(e) => set("full_payment_due_days", e.target.value)} />
                <p className="bk-note" style={{ textAlign: "left", marginTop: 5 }}>
                  Default 30. Must fall between the deposit due date and check-in.
                </p>
              </div>
            </div>
          )}

          <details className="pol-advanced">
            <summary>Advanced: cancellation &amp; reminders</summary>
            <div className="bk-grid2" style={{ marginTop: 10 }}>
              <div className="bk-field">
                <label htmlFor="ref100">Full refund if cancelled (days before check-in)</label>
                <input id="ref100" type="number" min="0" step="1" value={form.refund_100_days} onChange={(e) => set("refund_100_days", e.target.value)} />
              </div>
              <div className="bk-field">
                <label htmlFor="ref50">50% refund if cancelled (days before check-in)</label>
                <input id="ref50" type="number" min="0" step="1" value={form.refund_50_days} onChange={(e) => set("refund_50_days", e.target.value)} />
              </div>
              <div className="bk-field">
                <label htmlFor="cie">Send check-in email (days before check-in)</label>
                <input id="cie" type="number" min="0" step="1" value={form.checkin_email_days} onChange={(e) => set("checkin_email_days", e.target.value)} />
              </div>
            </div>
            <p className="bk-note" style={{ textAlign: "left", marginTop: 6 }}>
              Cancel earlier than the full-refund window for 100% back; between the two windows, 50%; after that, no refund.
            </p>
          </details>
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
          <input id="ical" value={form.airbnb_ical_url} onChange={(e) => set("airbnb_ical_url", e.target.value)} />
          <p className="bk-note" style={{ textAlign: "left", marginTop: 6 }}>Airbnb → your listing → Availability → Export calendar. Keeps your listing from double-booking.</p>
        </div>

        <div className="bk-grid2">
          <div className="bk-field">
            <label htmlFor="lat">Latitude <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <input id="lat" value={form.gps_lat} onChange={(e) => set("gps_lat", e.target.value)} />
          </div>
          <div className="bk-field">
            <label htmlFor="lng">Longitude <span style={{ fontWeight: 400 }}>(optional)</span></label>
            <input id="lng" value={form.gps_lng} onChange={(e) => set("gps_lng", e.target.value)} />
          </div>
        </div>

        <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--line, #E0D6C5)" }}>
          <h3 className="op-subhead" style={{ marginTop: 0 }}>Check-in details</h3>
          <p className="bk-note" style={{ textAlign: "left", marginBottom: 14 }}>
            These fields build the check-in email sent to your guest two days before arrival. Leave any blank to omit it.
          </p>

          <div className="bk-grid2">
            <div className="bk-field">
              <label htmlFor="cit">Check-in time</label>
              <input id="cit" value={form.check_in_time} onChange={(e) => set("check_in_time", e.target.value)} />
            </div>
            <div className="bk-field">
              <label htmlFor="cot">Check-out time</label>
              <input id="cot" value={form.check_out_time} onChange={(e) => set("check_out_time", e.target.value)} />
            </div>
          </div>

          <div className="bk-field">
            <label htmlFor="entry">Entry instructions</label>
            <textarea id="entry" rows={4} value={form.entry_instructions} onChange={(e) => set("entry_instructions", e.target.value)} />
          </div>

          <div className="bk-field">
            <label htmlFor="wifi">Wifi</label>
            <textarea id="wifi" rows={2} value={form.wifi} onChange={(e) => set("wifi", e.target.value)} />
          </div>

          <div className="bk-grid2">
            <div className="bk-field">
              <label htmlFor="parking">Parking</label>
              <textarea id="parking" rows={4} value={form.parking} onChange={(e) => set("parking", e.target.value)} />
            </div>
            <div className="bk-field">
              <label htmlFor="house_rules">House rules</label>
              <textarea id="house_rules" rows={4} value={form.house_rules} onChange={(e) => set("house_rules", e.target.value)} />
            </div>
          </div>

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
