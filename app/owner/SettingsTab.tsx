"use client";

import { useEffect, useState } from "react";

export function SettingsTab({ onHandleChange }: { onHandleChange: (handle: string | null) => void }) {
  const [publicName, setPublicName] = useState("");
  const [defaultName, setDefaultName] = useState("");
  const [handle, setHandle] = useState<string | null>(null);
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
      body: JSON.stringify({ public_name: publicName }),
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

        <button className="bk-btn" type="submit" disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </button>
        {saved && <p className="bk-note">Saved.</p>}
        {error && <div className="bk-error">{error}</div>}
      </form>
    </div>
  );
}
