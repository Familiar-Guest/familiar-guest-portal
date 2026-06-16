"use client";

import { useEffect, useState } from "react";

interface OwnerRow {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  created_at: string;
  commission_rate: number | null;
  subscription_amount: number | null;
  trial_expires_at: string | null;
  property_count: number;
}

interface PropertyRow {
  id: string;
  name: string;
  location: string | null;
  is_listed: boolean;
  created_at: string;
}

interface OwnerDetail extends OwnerRow {
  properties: PropertyRow[];
}

function fmt(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function fmtDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function toDateInput(iso: string | null): string {
  if (!iso) return "";
  return iso.slice(0, 10);
}

function OwnerDetailPanel({
  owner: initial,
  onClose,
  onUpdated,
}: {
  owner: OwnerDetail;
  onClose: () => void;
  onUpdated: (o: OwnerRow) => void;
}) {
  const [commission, setCommission] = useState(initial.commission_rate != null ? String(initial.commission_rate) : "");
  const [subscription, setSubscription] = useState(initial.subscription_amount != null ? String(initial.subscription_amount) : "");
  const [trialExpires, setTrialExpires] = useState(toDateInput(initial.trial_expires_at));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const body: Record<string, unknown> = {
      commission_rate: commission === "" ? null : Number(commission),
      subscription_amount: subscription === "" ? null : Number(subscription),
      trial_expires_at: trialExpires === "" ? null : trialExpires,
    };
    const res = await fetch(`/api/admin/owners/${initial.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not save.");
      setSaving(false);
      return;
    }
    setSaved(true);
    setSaving(false);
    onUpdated(data.owner);
  }

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 100, display: "flex", alignItems: "flex-start", justifyContent: "flex-end" }}>
      <div style={{ background: "#fff", width: "min(520px, 100vw)", height: "100vh", overflowY: "auto", padding: "32px 28px", boxShadow: "-4px 0 20px rgba(0,0,0,0.15)" }}>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", color: "#4F605A", marginBottom: 8 }}
          aria-label="Close"
        >
          ×
        </button>

        <h2 style={{ fontFamily: "Georgia,serif", color: "#0F4D45", marginBottom: 4 }}>
          {initial.full_name || initial.email}
        </h2>
        <p style={{ color: "#4F605A", fontSize: 14, marginBottom: 20 }}>{initial.email}</p>

        {/* Read-only info */}
        <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24, fontSize: 14 }}>
          <tbody>
            {[
              ["Phone", initial.phone || "—"],
              ["Registered", fmt(initial.created_at)],
              ["Properties", String(initial.property_count)],
            ].map(([label, val]) => (
              <tr key={label} style={{ borderBottom: "1px solid #E0D6C5" }}>
                <td style={{ padding: "8px 0", color: "#4F605A", width: 160 }}>{label}</td>
                <td style={{ padding: "8px 0", fontWeight: 600, color: "#16302B" }}>{val}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Properties list */}
        {initial.properties.length > 0 && (
          <div style={{ marginBottom: 24 }}>
            <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#4F605A", marginBottom: 8 }}>Properties</p>
            {initial.properties.map((p) => (
              <div key={p.id} style={{ padding: "8px 12px", background: "#F6F1E8", borderRadius: 6, marginBottom: 6, fontSize: 13 }}>
                <strong style={{ color: "#16302B" }}>{p.name}</strong>
                {p.location && <span style={{ color: "#4F605A" }}> · {p.location}</span>}
                <span style={{ float: "right", color: p.is_listed ? "#14635A" : "#8a7e72" }}>{p.is_listed ? "Listed" : "Unlisted"}</span>
              </div>
            ))}
          </div>
        )}

        {/* Editable admin fields */}
        <form onSubmit={save}>
          <p style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em", color: "#4F605A", marginBottom: 12 }}>Admin settings</p>

          <div className="bk-field" style={{ marginBottom: 16 }}>
            <label htmlFor="commission_rate" style={{ display: "block", fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Commission rate (%)</label>
            <input
              id="commission_rate"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={commission}
              onChange={(e) => setCommission(e.target.value)}
              placeholder="5.00 (blank = not set)"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #E0D6C5", borderRadius: 6, fontSize: 14 }}
            />
          </div>

          <div className="bk-field" style={{ marginBottom: 16 }}>
            <label htmlFor="subscription_amount" style={{ display: "block", fontWeight: 600, marginBottom: 4, fontSize: 14 }}>Monthly subscription ($)</label>
            <input
              id="subscription_amount"
              type="number"
              min="0"
              step="0.01"
              value={subscription}
              onChange={(e) => setSubscription(e.target.value)}
              placeholder="15.00 (blank = not set)"
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #E0D6C5", borderRadius: 6, fontSize: 14 }}
            />
          </div>

          <div className="bk-field" style={{ marginBottom: 20 }}>
            <label htmlFor="trial_expires_at" style={{ display: "block", fontWeight: 600, marginBottom: 4, fontSize: 14 }}>
              Free trial expiration
            </label>
            <input
              id="trial_expires_at"
              type="date"
              value={trialExpires}
              onChange={(e) => setTrialExpires(e.target.value)}
              style={{ width: "100%", padding: "9px 12px", border: "1px solid #E0D6C5", borderRadius: 6, fontSize: 14 }}
            />
            <p style={{ fontSize: 12, color: "#4F605A", marginTop: 4 }}>
              Currently: <strong>{fmtDate(initial.trial_expires_at)}</strong>. Change to 90 days for extended test access.
            </p>
          </div>

          <button
            type="submit"
            disabled={saving}
            style={{ background: "#0F4D45", color: "#fff", border: "none", borderRadius: 6, padding: "10px 22px", fontWeight: 600, fontSize: 14, cursor: "pointer" }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
          {saved && <span style={{ marginLeft: 12, color: "#14635A", fontSize: 13 }}>Saved.</span>}
          {error && <p style={{ color: "#D9663F", fontSize: 13, marginTop: 8 }}>{error}</p>}
        </form>
      </div>
    </div>
  );
}

export default function AdminPortal() {
  const [owners, setOwners] = useState<OwnerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<OwnerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/admin/owners");
      if (res.status === 401) {
        setError("Not authorized. You must be logged in as the site admin.");
        setLoading(false);
        return;
      }
      const data = await res.json().catch(() => ({}));
      if (!res.ok) { setError(data.error ?? "Failed to load owners."); setLoading(false); return; }
      setOwners(data.owners ?? []);
      setLoading(false);
    })();
  }, []);

  async function openOwner(id: string) {
    setLoadingDetail(true);
    const res = await fetch(`/api/admin/owners/${id}`);
    const data = await res.json().catch(() => ({}));
    setLoadingDetail(false);
    if (!res.ok) return;
    setSelected({ ...data.owner, properties: data.properties ?? [] });
  }

  function handleUpdated(updated: OwnerRow) {
    setOwners((prev) => prev.map((o) => o.id === updated.id ? { ...o, ...updated } : o));
    setSelected((prev) => prev ? { ...prev, ...updated } : prev);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F6F1E8", fontFamily: "Inter,-apple-system,sans-serif" }}>
      {/* Header */}
      <div style={{ background: "#0F4D45", padding: "16px 28px", display: "flex", alignItems: "center", gap: 14 }}>
        <span style={{ fontFamily: "Georgia,serif", fontSize: 20, color: "#fff", fontWeight: 600 }}>Familiar Guest</span>
        <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 14 }}>/ Admin</span>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>
        <h1 style={{ fontFamily: "Georgia,serif", color: "#0F4D45", marginBottom: 6 }}>Owner accounts</h1>
        <p style={{ color: "#4F605A", marginBottom: 28, fontSize: 15 }}>
          {loading ? "Loading…" : `${owners.length} registered owner${owners.length === 1 ? "" : "s"}`}
        </p>

        {error && (
          <div style={{ background: "#fde8e0", border: "1px solid #f5c6b3", borderRadius: 8, padding: "14px 18px", color: "#7a2a0a", marginBottom: 20 }}>
            {error}
          </div>
        )}

        {!loading && !error && (
          <div style={{ background: "#fff", border: "1px solid #E0D6C5", borderRadius: 12, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
              <thead>
                <tr style={{ background: "#F6F1E8", borderBottom: "1px solid #E0D6C5" }}>
                  {["Name", "Email", "Properties", "Registered", "Commission", "Subscription", "Trial expires"].map((h) => (
                    <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 600, color: "#4F605A", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {owners.map((o) => (
                  <tr
                    key={o.id}
                    onClick={() => openOwner(o.id)}
                    style={{ borderBottom: "1px solid #E0D6C5", cursor: "pointer" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "#F6F1E8")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "")}
                  >
                    <td style={{ padding: "12px 14px", fontWeight: 600, color: "#16302B" }}>{o.full_name || "—"}</td>
                    <td style={{ padding: "12px 14px", color: "#4F605A" }}>{o.email}</td>
                    <td style={{ padding: "12px 14px", textAlign: "center" }}>{o.property_count}</td>
                    <td style={{ padding: "12px 14px", color: "#4F605A" }}>{fmt(o.created_at)}</td>
                    <td style={{ padding: "12px 14px" }}>{o.commission_rate != null ? `${o.commission_rate}%` : "—"}</td>
                    <td style={{ padding: "12px 14px" }}>{o.subscription_amount != null ? `$${o.subscription_amount}/mo` : "—"}</td>
                    <td style={{ padding: "12px 14px", color: o.trial_expires_at && new Date(o.trial_expires_at) < new Date() ? "#D9663F" : "#16302B" }}>
                      {fmtDate(o.trial_expires_at)}
                    </td>
                  </tr>
                ))}
                {owners.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#4F605A" }}>No owners registered yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {loadingDetail && <p style={{ color: "#4F605A", marginTop: 16 }}>Loading owner details…</p>}
      </div>

      {selected && (
        <OwnerDetailPanel
          owner={selected}
          onClose={() => setSelected(null)}
          onUpdated={handleUpdated}
        />
      )}
    </div>
  );
}
