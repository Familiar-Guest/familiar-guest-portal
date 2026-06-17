"use client";

import { useEffect, useState } from "react";
import { RichTextEditor } from "./RichTextEditor";

export function SettingsTab({ onHandleChange }: { onHandleChange: (handle: string | null) => void }) {
  const [publicName, setPublicName] = useState("");
  const [defaultName, setDefaultName] = useState("");
  const [handle, setHandle] = useState<string | null>(null);
  const [welcomeHtml, setWelcomeHtml] = useState("");
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
        setWelcomeHtml(data.welcome_message_html ?? "");
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
        welcome_message_html: welcomeHtml,
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
            placeholder={defaultName || "e.g. Casa Vista Rentals"}
          />
          <p className="bk-note" style={{ textAlign: "left", marginTop: 6 }}>
            Used in your listings page URL instead of your name. Leave blank to default to{" "}
            {defaultName ? <strong>{defaultName}</strong> : "your first and last name"}.
          </p>
        </div>

        {handle && (
          <div className="op-share" style={{ marginBottom: 18 }}>
            <span>Your listings page:</span>
            <code>famguest.com/h/{handle}</code>
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
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="bk-grid2">
            <div className="bk-field">
              <label htmlFor="contact_phone">Phone <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <input
                id="contact_phone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                placeholder="+1 555 123 4567"
              />
            </div>
            <div className="bk-field">
              <label htmlFor="contact_whatsapp">WhatsApp <span style={{ fontWeight: 400 }}>(optional)</span></label>
              <input
                id="contact_whatsapp"
                type="tel"
                value={contactWhatsapp}
                onChange={(e) => setContactWhatsapp(e.target.value)}
                placeholder="+52 612 123 4567"
              />
            </div>
          </div>
        </div>

        <div className="bk-field" style={{ marginTop: 24 }}>
          <label htmlFor="welcome_msg">Default welcome message</label>
          <p className="bk-note" style={{ textAlign: "left", marginBottom: 8 }}>
            Included in the invitation email sent to guests. You can also edit it per-invite when sending a stay offer. Your contact info above is added automatically at the bottom.
          </p>
          <RichTextEditor
            id="welcome_msg"
            value={welcomeHtml}
            onChange={setWelcomeHtml}
            placeholder="A personal note to your guests — e.g. 'We're so happy to have you! Help yourself to the welcome basket in the kitchen.'"
            minHeight={100}
          />
        </div>

        <button className="bk-btn" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <p className="bk-note">Saved.</p>}
        {error && <div className="bk-error">{error}</div>}
      </form>
    </div>
  );
}
