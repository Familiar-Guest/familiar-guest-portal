"use client";

import { useEffect, useState } from "react";
import { PhoneField } from "../PhoneField";

export function SettingsTab({ onHandleChange, onPublicNameChange }: { onHandleChange: (handle: string | null) => void; onPublicNameChange?: (name: string | null) => void }) {
  const [publicName, setPublicName] = useState("");
  const [defaultName, setDefaultName] = useState("");
  const [handle, setHandle] = useState<string | null>(null);
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactWhatsapp, setContactWhatsapp] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const res = await fetch("/api/owner/settings", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setPublicName(data.public_name ?? "");
        setDefaultName(data.default_public_name ?? "");
        setHandle(data.handle ?? null);
        setContactEmail(data.contact_email ?? "");
        setContactPhone(data.contact_phone ?? "");
        setContactWhatsapp(data.contact_whatsapp ?? "");
      }
      setLoading(false);
    })();
  }, []);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);
    const res = await fetch("/api/owner/settings", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        public_name: publicName,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        contact_whatsapp: contactWhatsapp,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not save your settings.");
      setSaving(false);
      return;
    }
    setHandle(data.handle ?? null);
    onHandleChange(data.handle ?? null);
    onPublicNameChange?.(publicName || null);
    setSaved(true);
    setSaving(false);
  }

  if (loading) return <p className="op-empty">Loading…</p>;

  return (
    <div>
      <div className="op-head">
        <div>
          <h2 className="op-h2">Settings</h2>
          <p className="op-sub">Choose how your listings page URL appears to guests.</p>
        </div>
      </div>

      <form onSubmit={save}>
        <div className="bk-field">
          <label htmlFor="public_name">Public name</label>
          <input
            id="public_name"
            value={publicName}
            onChange={(e) => setPublicName(e.target.value)}
          />
          <p className="bk-note" style={{ textAlign: "left", marginTop: 6 }}>
            Used in your listings page URL instead of your name. Leave blank to default to{" "}
            {defaultName ? <strong>{defaultName}</strong> : "your first and last name"}.
          </p>
        </div>

        {handle && (
          <div className="op-share" style={{ marginBottom: 18 }}>
            <span>Your listings page:</span>
            <a
              className="op-url"
              href={`/owner/${handle}`}
              target="_blank"
              rel="noreferrer"
            >
              famguest.com/owner/{handle}
            </a>
            <button
              type="button"
              className="op-link op-copy-btn"
              title="Copy link"
              aria-label="Copy listings page link"
              onClick={async () => {
                const url = `${window.location.origin}/owner/${handle}`;
                try { await navigator.clipboard.writeText(url); } catch { window.prompt("Your listings page:", url); }
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              Copy
            </button>
          </div>
        )}

        <div style={{ marginTop: 28, paddingTop: 24, borderTop: "1px solid var(--line, #E0D6C5)" }}>
          <h3 className="op-subhead" style={{ marginTop: 0 }}>Guest contact info</h3>
          <p className="bk-note" style={{ textAlign: "left", marginBottom: 14 }}>
            How guests can reach you. This is added to the bottom of your welcome message. Email is required; phone and WhatsApp are optional.
          </p>
          <div className="bk-field">
            <label htmlFor="contact_email">Contact email</label>
            <input
              id="contact_email"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              required
            />
          </div>
          <div className="bk-grid2">
            <PhoneField
              id="contact_phone"
              label="Phone"
              value={contactPhone}
              onChange={setContactPhone}
              optional
            />
            <PhoneField
              id="contact_whatsapp"
              label="WhatsApp"
              value={contactWhatsapp}
              onChange={setContactWhatsapp}
              optional
            />
          </div>
        </div>

        <button className="bk-btn" type="submit" disabled={saving} style={{ marginTop: 24 }}>
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <p className="bk-note">Saved.</p>}
        {error && <div className="bk-error">{error}</div>}
      </form>
    </div>
  );
}
