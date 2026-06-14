"use client";

import { useState } from "react";

export type FormMode = "create" | "edit" | "rebook";

export interface OfferInitial {
  id?: string;
  property_name?: string;
  guest_name?: string;
  guest_email?: string;
  check_in?: string;
  check_out?: string;
  amount?: string;
  currency?: string;
  checkin_instructions?: string;
}

interface Conflict {
  type: "booking" | "calendar";
  start: string;
  end: string;
  summary?: string;
  guest_name?: string;
  status?: string;
}

interface Result {
  booking_url: string;
  email_sent: boolean;
}

const TITLES: Record<FormMode, string> = {
  create: "Send a stay offer",
  edit: "Edit offer",
  rebook: "Send a rebook offer",
};

export function OfferForm({
  mode,
  initial,
  onDone,
  onCancel,
}: {
  mode: FormMode;
  initial?: OfferInitial;
  onDone: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({
    property_name: initial?.property_name ?? "",
    guest_name: initial?.guest_name ?? "",
    guest_email: initial?.guest_email ?? "",
    check_in: initial?.check_in ?? "",
    check_out: initial?.check_out ?? "",
    amount: initial?.amount ?? "",
    currency: initial?.currency ?? "usd",
    checkin_instructions: initial?.checkin_instructions ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [conflict, setConflict] = useState<Conflict | null>(null);
  const [result, setResult] = useState<Result | null>(null);

  function set<K extends keyof typeof form>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function submit(force: boolean) {
    setLoading(true);
    setError(null);
    if (!force) setConflict(null);

    const isEdit = mode === "edit" && initial?.id;
    const url = isEdit ? `/api/owner/offer/${initial!.id}` : "/api/owner/offer";
    const method = isEdit ? "PATCH" : "POST";
    const payload = {
      ...form,
      amount: Number(form.amount),
      kind: mode === "rebook" ? "rebook" : "offer",
      force,
    };

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));

    if (res.status === 409 && data.conflict) {
      setConflict(data.conflict as Conflict);
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }
    setResult({ booking_url: data.booking_url, email_sent: data.email_sent });
    setLoading(false);
  }

  if (result) {
    return (
      <div className="bk-card">
        <span className="bk-badge">✓ {mode === "edit" ? "Offer updated" : "Offer sent"}</span>
        <h1>
          {mode === "edit" ? "Updated offer for " : "Offer sent to "}
          {form.guest_name}
        </h1>
        <p className="bk-lead">
          {result.email_sent
            ? `An email with the payment link was sent to ${form.guest_email}.`
            : `The offer was saved, but the email could not be sent. Share the payment link below directly.`}
        </p>
        <div className="bk-field">
          <label>Payment link</label>
          <div className="bk-ok">{result.booking_url}</div>
        </div>
        <button className="bk-btn" onClick={onDone}>
          Back to portal
        </button>
      </div>
    );
  }

  const conflictMsg = conflict
    ? conflict.type === "calendar"
      ? `Your Airbnb calendar shows these dates as busy (${conflict.start} → ${conflict.end}${
          conflict.summary ? `: ${conflict.summary}` : ""
        }).`
      : `These dates overlap an existing ${
          conflict.status === "paid" ? "booking" : "offer"
        }${conflict.guest_name ? ` for ${conflict.guest_name}` : ""} (${conflict.start} → ${conflict.end}).`
    : "";

  return (
    <div className="bk-card">
      <h1>{TITLES[mode]}</h1>
      <p className="bk-lead">
        {mode === "rebook"
          ? "Pick the new dates and price — guest details are pre-filled. They'll get an email with a link to pay."
          : mode === "edit"
          ? "Update the details. Saving re-sends the offer email and resets the 7-day hold."
          : "Set the dates and price for your guest. They'll get an email with a link to pay — no account needed."}
      </p>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(false);
        }}
      >
        <div className="bk-field">
          <label htmlFor="property_name">Property name</label>
          <input
            id="property_name"
            value={form.property_name}
            onChange={(e) => set("property_name", e.target.value)}
            placeholder="Casa del Mar"
            required
          />
        </div>
        <div className="bk-grid2">
          <div className="bk-field">
            <label htmlFor="guest_name">Guest name</label>
            <input
              id="guest_name"
              value={form.guest_name}
              onChange={(e) => set("guest_name", e.target.value)}
              required
            />
          </div>
          <div className="bk-field">
            <label htmlFor="guest_email">Guest email</label>
            <input
              id="guest_email"
              type="email"
              value={form.guest_email}
              onChange={(e) => set("guest_email", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="bk-grid2">
          <div className="bk-field">
            <label htmlFor="check_in">Check-in</label>
            <input
              id="check_in"
              type="date"
              value={form.check_in}
              onChange={(e) => set("check_in", e.target.value)}
              required
            />
          </div>
          <div className="bk-field">
            <label htmlFor="check_out">Check-out</label>
            <input
              id="check_out"
              type="date"
              value={form.check_out}
              onChange={(e) => set("check_out", e.target.value)}
              required
            />
          </div>
        </div>
        <div className="bk-grid2">
          <div className="bk-field">
            <label htmlFor="amount">Total price</label>
            <input
              id="amount"
              type="number"
              min="1"
              step="0.01"
              value={form.amount}
              onChange={(e) => set("amount", e.target.value)}
              placeholder="1200.00"
              required
            />
          </div>
          <div className="bk-field">
            <label htmlFor="currency">Currency</label>
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
          <label htmlFor="checkin_instructions">
            Check-in instructions{" "}
            <span style={{ fontWeight: 400 }}>(optional — sent 2 days before)</span>
          </label>
          <textarea
            id="checkin_instructions"
            rows={4}
            value={form.checkin_instructions}
            onChange={(e) => set("checkin_instructions", e.target.value)}
            placeholder="Door code, parking, WiFi, directions…"
          />
        </div>

        {conflict && (
          <div className="bk-error">
            Heads up — {conflictMsg} You can send the offer anyway.
            <button
              type="button"
              className="bk-btn"
              style={{ marginTop: 10 }}
              disabled={loading}
              onClick={() => submit(true)}
            >
              Send anyway
            </button>
          </div>
        )}

        {!conflict && (
          <button className="bk-btn" type="submit" disabled={loading}>
            {loading
              ? "Saving…"
              : mode === "edit"
              ? "Save & re-send email"
              : "Create offer & send email"}
          </button>
        )}
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
