"use client";

import { useEffect, useState } from "react";
import type { OwnerPolicy } from "@/lib/policies";

type FormState = {
  deposits_required: boolean;
  deposit_pct: string;
  balance_lead_days: string;
  refund_100_days: string;
  refund_50_days: string;
  checkin_email_days: string;
  min_days_to_book: string;
};

/**
 * Global DEFAULT policy. These values seed every NEW property's payment/refund
 * policy; each property is then edited on its own profile. Changing them here
 * does not alter existing properties.
 */
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
          deposits_required: p.deposit_pct > 0,
          deposit_pct: p.deposit_pct ? String(p.deposit_pct) : "25",
          balance_lead_days: String(p.balance_lead_days ?? 45),
          refund_100_days: String(p.refund_100_days),
          refund_50_days: String(p.refund_50_days),
          checkin_email_days: String(p.checkin_email_days),
          min_days_to_book: String(p.min_days_to_book),
        });
      }
      setLoading(false);
    })();
  }, []);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => (f ? { ...f, [key]: value } : f));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (!form) return;
    setSaving(true);
    setError(null);
    setSaved(false);
    const payload = {
      min_days_to_book: Number(form.min_days_to_book),
      checkin_email_days: Number(form.checkin_email_days),
      balance_lead_days: Number(form.balance_lead_days),
      deposit_pct: form.deposits_required ? Number(form.deposit_pct) : 0,
      refund_100_days: Number(form.refund_100_days),
      refund_50_days: Number(form.refund_50_days),
    };
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
          <h2 className="op-h2">Default policies</h2>
          <p className="op-sub">
            These are the defaults applied to <strong>new</strong> properties. Edit an
            individual property to change its payment or refund terms.
          </p>
        </div>
      </div>

      <form onSubmit={save}>
        <div className="bk-field">
          <label>Payment policy</label>
          <label className="cf-option" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.deposits_required}
              onChange={(e) => set("deposits_required", e.target.checked)}
            />
            <span>Require a deposit to reserve</span>
          </label>

          {form.deposits_required && (
            <div className="bk-grid2" style={{ marginTop: 10 }}>
              <div className="bk-field">
                <label htmlFor="g_dep_pct">Deposit amount</label>
                <select id="g_dep_pct" value={form.deposit_pct} onChange={(e) => set("deposit_pct", e.target.value)}>
                  <option value="25">25% of the total</option>
                  <option value="50">50% of the total</option>
                </select>
              </div>
              <div className="bk-field">
                <label htmlFor="g_bal_days">Collect the balance (days before check-in)</label>
                <input id="g_bal_days" type="number" min="1" step="1" value={form.balance_lead_days} onChange={(e) => set("balance_lead_days", e.target.value)} />
                <p className="bk-note" style={{ textAlign: "left", marginTop: 5 }}>
                  The balance auto-charges the guest&rsquo;s card this many days before check-in. Bookings made closer in are charged in full at booking.
                </p>
              </div>
            </div>
          )}
        </div>

        <details className="pol-advanced">
          <summary>Advanced: cancellation, reminders &amp; public bookings</summary>
          <div className="bk-grid2" style={{ marginTop: 10 }}>
            <div className="bk-field">
              <label htmlFor="g_ref100">Full refund if cancelled (days before check-in)</label>
              <input id="g_ref100" type="number" min="0" step="1" value={form.refund_100_days} onChange={(e) => set("refund_100_days", e.target.value)} />
            </div>
            <div className="bk-field">
              <label htmlFor="g_ref50">50% refund if cancelled (days before check-in)</label>
              <input id="g_ref50" type="number" min="0" step="1" value={form.refund_50_days} onChange={(e) => set("refund_50_days", e.target.value)} />
            </div>
            <div className="bk-field">
              <label htmlFor="g_cie">Send check-in email (days before check-in)</label>
              <input id="g_cie" type="number" min="0" step="1" value={form.checkin_email_days} onChange={(e) => set("checkin_email_days", e.target.value)} />
            </div>
            <div className="bk-field">
              <label htmlFor="g_minbook">Minimum lead time for public requests (days)</label>
              <input id="g_minbook" type="number" min="0" step="1" value={form.min_days_to_book} onChange={(e) => set("min_days_to_book", e.target.value)} />
              <p className="bk-note" style={{ textAlign: "left", marginTop: 5 }}>
                Does not apply to invite offers.
              </p>
            </div>
          </div>
        </details>

        <button className="bk-btn" type="submit" disabled={saving} style={{ marginTop: 20 }}>
          {saving ? "Saving…" : "Save defaults"}
        </button>
        {saved && <p className="bk-note">Saved.</p>}
        {error && <div className="bk-error">{error}</div>}
      </form>
    </div>
  );
}
