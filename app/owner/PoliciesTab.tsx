"use client";

import { useEffect, useState } from "react";
import type { OwnerPolicy } from "@/lib/policies";

// Day-count fields share the "days before rental date" framing, shown once as a
// section heading rather than repeated on every label.
const DAY_FIELDS: { key: keyof OwnerPolicy; label: string }[] = [
  { key: "min_days_to_book", label: "Minimum to book" },
  { key: "checkin_email_days", label: "Send check-in email" },
  { key: "deposit_required_days", label: "Deposit required (min)" },
  { key: "full_payment_due_days", label: "Full payment due" },
  { key: "refund_100_days", label: "100% refund" },
  { key: "refund_50_days", label: "50% refund" },
];

type FormState = Record<keyof OwnerPolicy, string>;

export function PoliciesTab() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/owner/policies", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.policy) {
        const p = data.policy as OwnerPolicy;
        setForm({
          min_days_to_book: String(p.min_days_to_book),
          checkin_email_days: String(p.checkin_email_days),
          deposit_required_days: String(p.deposit_required_days),
          full_payment_due_days: String(p.full_payment_due_days),
          deposit_pct: String(p.deposit_pct),
          refund_100_days: String(p.refund_100_days),
          refund_50_days: String(p.refund_50_days),
        });
      }
      setLoading(false);
    })();
  }, []);

  function set(key: keyof OwnerPolicy, value: string) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const payload: Record<string, number> = {};
    (Object.keys(form) as (keyof OwnerPolicy)[]).forEach((k) => {
      payload[k] = Number(form[k]);
    });
    const res = await fetch("/api/owner/policies", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setError(data.error ?? "Could not save your policies.");
      return;
    }
    setSaved(true);
  }

  if (loading || !form) return <p className="op-empty">Loading…</p>;

  return (
    <div>
      <div className="op-head">
        <div>
          <h2 className="op-h2">Global Policies</h2>
          <p className="op-sub">
            These rules apply to <strong>all</strong> your properties and govern how
            bookings are paid, reminded, and refunded.
          </p>
        </div>
      </div>

      <form onSubmit={save}>
        <h3 className="op-subhead" style={{ marginTop: 0 }}>Days before rental date</h3>
        <p className="bk-note" style={{ textAlign: "left", marginBottom: 14 }}>
          Each value below is a number of days before the stay&rsquo;s check-in date.
        </p>
        <div className="bk-grid2">
          {DAY_FIELDS.map(({ key, label }) => (
            <div className="bk-field" key={key}>
              <label htmlFor={key}>{label}</label>
              <input
                id={key}
                type="number"
                min="0"
                step="1"
                value={form[key]}
                onChange={(e) => set(key, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 18, paddingTop: 18, borderTop: "1px solid var(--line, #E0D6C5)" }}>
          <div className="bk-field" style={{ maxWidth: 220 }}>
            <label htmlFor="deposit_pct">Deposit %</label>
            <input
              id="deposit_pct"
              type="number"
              min="0"
              max="100"
              step="1"
              value={form.deposit_pct}
              onChange={(e) => set("deposit_pct", e.target.value)}
            />
            <p className="bk-note" style={{ textAlign: "left", marginTop: 6 }}>
              Percent of the total collected as a deposit when a guest books far enough
              out (see &ldquo;Deposit required&rdquo; above). The balance is due by
              &ldquo;Full payment due&rdquo; days before check-in.
            </p>
          </div>
        </div>

        <button className="bk-btn" type="submit" disabled={saving} style={{ marginTop: 20 }}>
          {saving ? "Saving…" : "Save policies"}
        </button>
        {saved && <p className="bk-note">Saved.</p>}
        {error && <div className="bk-error">{error}</div>}
      </form>
    </div>
  );
}
