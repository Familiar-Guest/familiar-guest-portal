"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate, formatMoney, daysUntil } from "@/lib/format";
import { isExpired, expiryDate } from "@/lib/offers";
import type { Booking, Property } from "@/lib/types";
import { PropertyForm } from "./PropertyForm";
import { OfferForm, type FormMode, type OfferInitial } from "./OfferForm";
import { CalendarTab } from "./CalendarTab";
import { SettingsTab } from "./SettingsTab";

type Tab = "properties" | "calendar" | "bookings" | "offers" | "settings";

type Overlay =
  | { kind: "none" }
  | { kind: "property"; initial?: Property | null }
  | { kind: "offer"; mode: FormMode; initial?: OfferInitial };

function centsToAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

function statusLabel(b: Booking): { text: string; cls: string } {
  if (b.status === "paid") return { text: "Paid", cls: "op-paid" };
  if (b.status === "requested") return { text: "Requested", cls: "op-open" };
  if (b.status === "declined") return { text: "Declined", cls: "op-muted" };
  if (b.status === "cancelled") return { text: "Removed", cls: "op-muted" };
  if (b.status === "expired" || isExpired(b)) return { text: "Expired", cls: "op-muted" };
  const left = b.expires_at ? daysUntil(expiryDate(b.expires_at)) : null;
  const suffix =
    left === null ? "" : left <= 0 ? " · expires today" : ` · ${left}d left`;
  return { text: `Offer sent${suffix}`, cls: "op-open" };
}

export function Portal({ ownerName, handle: initialHandle }: { ownerName: string; handle: string | null }) {
  const [tab, setTab] = useState<Tab>("properties");
  const [handle, setHandle] = useState(initialHandle);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [overlay, setOverlay] = useState<Overlay>({ kind: "none" });
  const [copied, setCopied] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, bRes] = await Promise.all([
        fetch("/api/owner/properties", { cache: "no-store" }),
        fetch("/api/owner/bookings", { cache: "no-store" }),
      ]);
      const pData = await pRes.json().catch(() => ({}));
      const bData = await bRes.json().catch(() => ({}));
      if (pRes.ok) setProperties(pData.properties ?? []);
      if (bRes.ok) setBookings(bData.bookings ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function closeOverlay(reload: boolean) {
    setOverlay({ kind: "none" });
    if (reload) load();
  }

  async function logout() {
    await fetch("/api/owner/logout", { method: "POST" });
    window.location.href = "/owner/login";
  }

  async function copyLink(token: string) {
    const url = `${window.location.origin}/book/${token}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(token);
      setTimeout(() => setCopied((c) => (c === token ? null : c)), 1800);
    } catch {
      window.prompt("Copy the payment link:", url);
    }
  }

  async function removeOffer(b: Booking) {
    if (!window.confirm(`Remove the offer for ${b.guest_name}? This frees the dates and disables its link.`))
      return;
    const res = await fetch(`/api/owner/offer/${b.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not remove the offer.");
      return;
    }
    load();
  }

  // Cancel/remove a booking from the calendar. Paid bookings notify the guest.
  async function cancelBooking(b: Booking) {
    const isPaid = b.status === "paid";
    const msg = isPaid
      ? `Cancel the booking for ${b.guest_name}? They'll get a cancellation email and the dates will free up.`
      : `Remove the offer for ${b.guest_name}? This frees the dates and disables its link.`;
    if (!window.confirm(msg)) return;
    const res = await fetch(`/api/owner/offer/${b.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not cancel the booking.");
      return;
    }
    load();
  }

  function editBooking(b: Booking) {
    setOverlay({ kind: "offer", mode: "edit", initial: editInitial(b) });
  }

  async function decideRequest(b: Booking, action: "approve" | "decline") {
    if (action === "decline" && !window.confirm(`Decline ${b.guest_name}'s request?`)) return;
    const res = await fetch(`/api/owner/requests/${b.id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not update the request.");
      return;
    }
    load();
  }

  const shareDisplay = handle ? `famguest.com/h/${handle}` : null;
  async function copyShare() {
    if (!handle) return;
    const url = `${window.location.origin}/h/${handle}`;
    try {
      await navigator.clipboard.writeText(url);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 1800);
    } catch {
      window.prompt("Your listings page:", url);
    }
  }

  async function removeProperty(p: Property) {
    if (!window.confirm(`Remove ${p.name}? Existing bookings are kept but lose their property link.`))
      return;
    const res = await fetch(`/api/owner/properties/${p.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not remove the property.");
      return;
    }
    load();
  }

  // ---- Overlays take over the whole surface ----
  if (overlay.kind === "property") {
    return (
      <Shell ownerName={ownerName} onLogout={logout} tab={tab} setTab={setTab} hideNav>
        <PropertyForm
          initial={overlay.initial}
          onDone={() => closeOverlay(true)}
          onCancel={() => closeOverlay(false)}
        />
      </Shell>
    );
  }
  if (overlay.kind === "offer") {
    return (
      <Shell ownerName={ownerName} onLogout={logout} tab={tab} setTab={setTab} hideNav>
        <OfferForm
          mode={overlay.mode}
          properties={properties}
          initial={overlay.initial}
          onDone={() => closeOverlay(true)}
          onCancel={() => closeOverlay(false)}
        />
      </Shell>
    );
  }

  const offers = bookings.filter(
    (b) => b.status === "offer_sent" || b.status === "expired"
  );
  const requests = bookings.filter((b) => b.status === "requested");

  return (
    <Shell ownerName={ownerName} onLogout={logout} tab={tab} setTab={setTab}>
      {/* PROPERTIES */}
      {tab === "properties" && (
        <div>
          <div className="op-head">
            <div>
              <h2 className="op-h2">Properties</h2>
              <p className="op-sub">Set up your places and link each one&rsquo;s Airbnb calendar.</p>
            </div>
            <button className="bk-btn op-new" onClick={() => setOverlay({ kind: "property" })}>
              + Add property
            </button>
          </div>
          {shareDisplay && (
            <div className="op-share">
              <span>Your listings page:</span>
              <code>{shareDisplay}</code>
              <button className="op-link" onClick={copyShare}>
                {shareCopied ? "Copied!" : "Copy link"}
              </button>
              <a className="op-link" href={`/h/${handle}`} target="_blank" rel="noreferrer">
                Preview
              </a>
            </div>
          )}
          {loading && <p className="op-empty">Loading…</p>}
          {!loading && properties.length === 0 && (
            <div className="op-empty">
              No properties yet. Start with <strong>+ Add property</strong> — name it
              and paste your Airbnb iCal link.
            </div>
          )}
          {properties.length > 0 && (
            <ul className="op-list">
              {properties.map((p) => (
                <li key={p.id} className="op-item">
                  <div className="op-main">
                    <div className="op-title">{p.name}</div>
                    <div className="op-meta">
                      {p.location ? `${p.location} · ` : ""}
                      {p.nightly_rate_cents
                        ? `${formatMoney(p.nightly_rate_cents, p.currency)}/night · `
                        : "no rate · "}
                      {p.is_listed ? "Published" : "Hidden"} ·{" "}
                      {p.airbnb_ical_url ? "calendar linked" : "no calendar"}
                    </div>
                  </div>
                  <div className="op-actions">
                    <button
                      className="op-link"
                      onClick={() => setOverlay({ kind: "offer", mode: "create", initial: { property_id: p.id } })}
                    >
                      Invite guest
                    </button>
                    <button className="op-link" onClick={() => setOverlay({ kind: "property", initial: p })}>
                      Edit
                    </button>
                    <button className="op-link op-danger" onClick={() => removeProperty(p)}>
                      Remove
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* CALENDAR */}
      {tab === "calendar" && (
        <CalendarTab
          properties={properties}
          bookings={bookings}
          onEdit={editBooking}
          onCancel={cancelBooking}
        />
      )}

      {/* BOOKINGS (activity) */}
      {tab === "bookings" && (
        <div>
          <div className="op-head">
            <div>
              <h2 className="op-h2">Booking activity</h2>
              <p className="op-sub">Every offer and booking across your properties.</p>
            </div>
          </div>
          {loading && <p className="op-empty">Loading…</p>}
          {!loading && bookings.length === 0 && (
            <div className="op-empty">Nothing yet. Send an offer from the Offers tab.</div>
          )}
          {bookings.length > 0 && (
            <ul className="op-list">
              {bookings.map((b) => {
                const s = statusLabel(b);
                return (
                  <li key={b.id} className="op-item">
                    <div className="op-main">
                      <div className="op-title">
                        {b.property_name}
                        {b.kind === "rebook" && <span className="op-tag">Rebook</span>}
                      </div>
                      <div className="op-meta">
                        {b.guest_name} · {formatDate(b.check_in)} → {formatDate(b.check_out)} ·{" "}
                        {formatMoney(b.amount_cents, b.currency)}
                      </div>
                    </div>
                    <div className="op-side">
                      <span className={`op-status ${s.cls}`}>{s.text}</span>
                      <div className="op-actions">
                        {b.status === "paid" && (
                          <button
                            className="op-link"
                            onClick={() =>
                              setOverlay({
                                kind: "offer",
                                mode: "rebook",
                                initial: rebookInitial(b),
                              })
                            }
                          >
                            Rebook
                          </button>
                        )}
                        {b.status !== "cancelled" && (
                          <button className="op-link" onClick={() => copyLink(b.token)}>
                            {copied === b.token ? "Copied!" : "Copy link"}
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* OFFERS */}
      {tab === "offers" && (
        <div>
          <div className="op-head">
            <div>
              <h2 className="op-h2">Offers</h2>
              <p className="op-sub">Pre-define a stay and send a payment link. Offers hold the dates for 7 days.</p>
            </div>
            <button
              className="bk-btn op-new"
              onClick={() => setOverlay({ kind: "offer", mode: "create" })}
            >
              + New offer
            </button>
          </div>
          {requests.length > 0 && (
            <>
              <h3 className="op-subhead">Requests to review</h3>
              <ul className="op-list" style={{ marginBottom: 18 }}>
                {requests.map((b) => (
                  <li key={b.id} className="op-item">
                    <div className="op-main">
                      <div className="op-title">{b.property_name}</div>
                      <div className="op-meta">
                        {b.guest_name} · {formatDate(b.check_in)} → {formatDate(b.check_out)} ·{" "}
                        {formatMoney(b.amount_cents, b.currency)}
                      </div>
                    </div>
                    <div className="op-side">
                      <span className="op-status op-open">Requested</span>
                      <div className="op-actions">
                        <button className="op-link" onClick={() => decideRequest(b, "approve")}>
                          Approve &amp; send pay link
                        </button>
                        <button className="op-link op-danger" onClick={() => decideRequest(b, "decline")}>
                          Decline
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
          {loading && <p className="op-empty">Loading…</p>}
          {!loading && offers.length === 0 && requests.length === 0 && (
            <div className="op-empty">No open offers. Create one with <strong>+ New offer</strong>.</div>
          )}
          {offers.length > 0 && (
            <ul className="op-list">
              {offers.map((b) => {
                const s = statusLabel(b);
                const canEdit = b.status !== "paid";
                return (
                  <li key={b.id} className="op-item">
                    <div className="op-main">
                      <div className="op-title">
                        {b.property_name}
                        {b.kind === "rebook" && <span className="op-tag">Rebook</span>}
                      </div>
                      <div className="op-meta">
                        {b.guest_name} · {formatDate(b.check_in)} → {formatDate(b.check_out)} ·{" "}
                        {formatMoney(b.amount_cents, b.currency)}
                      </div>
                    </div>
                    <div className="op-side">
                      <span className={`op-status ${s.cls}`}>{s.text}</span>
                      <div className="op-actions">
                        <button className="op-link" onClick={() => copyLink(b.token)}>
                          {copied === b.token ? "Copied!" : "Copy link"}
                        </button>
                        {canEdit && (
                          <button
                            className="op-link"
                            onClick={() =>
                              setOverlay({ kind: "offer", mode: "edit", initial: editInitial(b) })
                            }
                          >
                            Edit
                          </button>
                        )}
                        {canEdit && (
                          <button className="op-link op-danger" onClick={() => removeOffer(b)}>
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* SETTINGS */}
      {tab === "settings" && <SettingsTab onHandleChange={setHandle} />}

    </Shell>
  );
}

function editInitial(b: Booking): OfferInitial {
  return {
    id: b.id,
    property_id: b.property_id ?? undefined,
    property_name: b.property_name,
    guest_name: b.guest_name,
    guest_email: b.guest_email,
    check_in: b.check_in,
    check_out: b.check_out,
    nightly_rate: b.nightly_rate_cents != null ? centsToAmount(b.nightly_rate_cents) : "",
    cleaning_fee: b.cleaning_fee_cents ? centsToAmount(b.cleaning_fee_cents) : "",
    checkin_instructions: b.checkin_instructions ?? "",
    welcome_message_html: b.welcome_message_html ?? undefined,
    paid: b.status === "paid",
  };
}

function rebookInitial(b: Booking): OfferInitial {
  return {
    property_id: b.property_id ?? undefined,
    guest_name: b.guest_name,
    guest_email: b.guest_email,
    nightly_rate: b.nightly_rate_cents != null ? centsToAmount(b.nightly_rate_cents) : "",
    cleaning_fee: b.cleaning_fee_cents ? centsToAmount(b.cleaning_fee_cents) : "",
    checkin_instructions: b.checkin_instructions ?? "",
  };
}

function Shell({
  ownerName,
  onLogout,
  tab,
  setTab,
  hideNav,
  children,
}: {
  ownerName: string;
  onLogout: () => void;
  tab: Tab;
  setTab: (t: Tab) => void;
  hideNav?: boolean;
  children: React.ReactNode;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "properties", label: "Properties" },
    { id: "calendar", label: "Calendar" },
    { id: "bookings", label: "Booking activity" },
    { id: "offers", label: "Offers" },
    { id: "settings", label: "Settings" },
  ];
  return (
    <div className="op-shell">
      <div className="op-topbar">
        <span className="bk-brand" style={{ margin: 0 }}>
          Familiar&nbsp;Guest
        </span>
        <div className="op-topright">
          <span className="op-hi">Hi, {ownerName}</span>
          <button className="op-link" onClick={onLogout}>
            Log out
          </button>
        </div>
      </div>
      {!hideNav && (
        <nav className="op-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`op-tab ${tab === t.id ? "op-tab-on" : ""}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>
      )}
      {hideNav ? (
        <div className="op-formwrap">{children}</div>
      ) : (
        <div className="op-panel">{children}</div>
      )}
    </div>
  );
}
