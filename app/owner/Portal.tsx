"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { formatDate, formatMoney, daysUntil } from "@/lib/format";
import { isExpired, expiryDate } from "@/lib/offers";
import type { Booking, Property } from "@/lib/types";
import { PropertyForm } from "./PropertyForm";
import { OfferForm, type FormMode, type OfferInitial } from "./OfferForm";
import { CalendarTab } from "./CalendarTab";
import { SettingsTab } from "./SettingsTab";
import { MessagesTab, type StartBooking } from "./MessagesTab";
import { PoliciesTab } from "./PoliciesTab";
import { OnboardingChecklist } from "./OnboardingChecklist";
import { PayoutBanner, type ConnectStatus } from "./PayoutBanner";
import { BrandMark } from "../BrandMark";

type Tab = "properties" | "calendar" | "bookings" | "offers" | "messages" | "policies" | "settings";

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

type Overlay =
  | { kind: "none" }
  | { kind: "property"; initial?: Property | null }
  | { kind: "offer"; mode: FormMode; initial?: OfferInitial };

function centsToAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

function statusLabel(b: Booking): { text: string; cls: string } {
  if (b.status === "paid") return { text: "Paid", cls: "op-paid" };
  if (b.status === "deposit_paid") return { text: "Deposit paid · balance due", cls: "op-open" };
  if (b.status === "forfeited") return { text: "Forfeited", cls: "op-muted" };
  if (b.status === "requested") return { text: "Requested", cls: "op-open" };
  if (b.status === "declined") return { text: "Declined", cls: "op-muted" };
  if (b.status === "cancelled") return { text: "Removed", cls: "op-muted" };
  if (b.status === "expired" || isExpired(b)) return { text: "Expired", cls: "op-muted" };
  const left = b.expires_at ? daysUntil(expiryDate(b.expires_at)) : null;
  const suffix =
    left === null ? "" : left <= 0 ? " · expires today" : ` · ${left}d left`;
  return { text: `Offer sent${suffix}`, cls: "op-open" };
}

export function Portal({
  ownerName,
  ownerPublicName,
  handle: initialHandle,
}: {
  ownerName: string;
  ownerPublicName: string | null;
  handle: string | null;
}) {
  const [tab, setTab] = useState<Tab>("properties");
  const [handle, setHandle] = useState(initialHandle);
  const [publicName, setPublicName] = useState(ownerPublicName);
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [policiesConfigured, setPoliciesConfigured] = useState(false);
  const [kyc, setKyc] = useState<ConnectStatus | null>(null);
  const [kycEnabled, setKycEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [overlay, setOverlay] = useState<Overlay>({ kind: "none" });
  const overlayOpenRef = useRef(false);
  // Tracks whether the open overlay form (e.g. property profile) has unsaved
  // edits, so we can warn before closing/navigating away. Ref mirrors state for
  // use inside the popstate/beforeunload listeners.
  const overlayDirtyRef = useRef(false);
  const setOverlayDirty = useCallback((d: boolean) => { overlayDirtyRef.current = d; }, []);
  const UNSAVED_MSG = "You have unsaved changes. Leave without saving?";
  const [copied, setCopied] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);
  const [messageBooking, setMessageBooking] = useState<StartBooking | null>(null);

  function openMessages(b: Booking) {
    setMessageBooking({ id: b.id, guest_name: b.guest_name, property_name: b.property_name });
    setTab("messages");
  }

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [pRes, bRes, polRes, kycRes] = await Promise.all([
        fetch("/api/owner/properties", { cache: "no-store" }),
        fetch("/api/owner/bookings", { cache: "no-store" }),
        fetch("/api/owner/policies", { cache: "no-store" }),
        fetch("/api/owner/stripe/status", { cache: "no-store" }),
      ]);
      const pData = await pRes.json().catch(() => ({}));
      const bData = await bRes.json().catch(() => ({}));
      const polData = await polRes.json().catch(() => ({}));
      const kycData = await kycRes.json().catch(() => ({}));
      if (pRes.ok) setProperties(pData.properties ?? []);
      if (bRes.ok) setBookings(bData.bookings ?? []);
      // Policies are "configured" if the owner has saved at least one custom value.
      if (polRes.ok) setPoliciesConfigured(Boolean(polData.has_custom_row));
      if (kycRes.ok) { setKyc(kycData.status ?? null); setKycEnabled(Boolean(kycData.enabled)); }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  /** Open an overlay and push a browser-history entry so the browser back
   *  button closes the overlay rather than exiting the site. */
  function openOverlay(o: Overlay) {
    if (o.kind !== "none") {
      window.history.pushState({ overlayOpen: true }, "");
      overlayOpenRef.current = true;
      overlayDirtyRef.current = false; // fresh overlay starts clean
    }
    setOverlay(o);
  }

  function closeOverlay(reload: boolean) {
    // Saving (reload=true) clears the form, so only guard explicit cancel/back.
    if (!reload && overlayDirtyRef.current && !window.confirm(UNSAVED_MSG)) return;
    overlayDirtyRef.current = false;
    overlayOpenRef.current = false;
    setOverlay({ kind: "none" });
    if (reload) load();
  }

  // Browser back button — if an overlay is open, close it instead of leaving the
  // portal. If the form has unsaved edits, confirm first; if the owner cancels,
  // re-push the history entry so the overlay stays open.
  useEffect(() => {
    function onPopState() {
      if (!overlayOpenRef.current) return;
      if (overlayDirtyRef.current && !window.confirm(UNSAVED_MSG)) {
        window.history.pushState({ overlayOpen: true }, "");
        return;
      }
      overlayDirtyRef.current = false;
      overlayOpenRef.current = false;
      setOverlay({ kind: "none" });
    }
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, []);

  // Warn on hard navigation (tab close / refresh / typing a new URL) while an
  // overlay form has unsaved edits.
  useEffect(() => {
    function onBeforeUnload(e: BeforeUnloadEvent) {
      if (overlayDirtyRef.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    }
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, []);

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
    openOverlay({ kind: "offer", mode: "edit", initial: editInitial(b) });
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

  const shareDisplay = handle ? `famguest.com/owner/${handle}` : null;
  async function copyShare() {
    if (!handle) return;
    const url = `${window.location.origin}/owner/${handle}`;
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

  const requests = bookings.filter((b) => b.status === "requested");
  const pendingOffers = bookings.filter(
    (b) => b.status === "offer_sent" && !isExpired(b)
  );
  const expiredOffers = bookings.filter(
    (b) => b.status === "expired" || (b.status === "offer_sent" && isExpired(b))
  );
  const attentionCount = requests.length + pendingOffers.length;

  // ---- Overlays take over the whole surface ----
  if (overlay.kind === "property") {
    return (
      <Shell ownerName={ownerName} onLogout={logout} tab={tab} setTab={setTab} alertCount={attentionCount} hideNav onBack={() => closeOverlay(false)}>
        <PropertyForm
          initial={overlay.initial}
          onDone={() => closeOverlay(true)}
          onCancel={() => closeOverlay(false)}
          onDirtyChange={setOverlayDirty}
        />
      </Shell>
    );
  }
  if (overlay.kind === "offer") {
    return (
      <Shell ownerName={ownerName} onLogout={logout} tab={tab} setTab={setTab} alertCount={attentionCount} hideNav onBack={() => closeOverlay(false)}>
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

  return (
    <Shell ownerName={ownerName} onLogout={logout} tab={tab} setTab={setTab} alertCount={attentionCount}>
      <OnboardingChecklist
        publicName={publicName}
        propertyCount={properties.length}
        policiesConfigured={policiesConfigured}
        onNavigate={(t) => setTab(t)}
      />
      {!loading && kycEnabled && <PayoutBanner status={kyc} />}
      {/* PROPERTIES */}
      {tab === "properties" && (
        <div>
          {attentionCount > 0 && (
            <div className="op-attention">
              <div className="op-attention-head">
                <span className="op-attention-title">
                  {attentionCount} item{attentionCount !== 1 ? "s" : ""} need{attentionCount === 1 ? "s" : ""} your attention
                </span>
                <button className="op-link" onClick={() => setTab("offers")}>
                  Go to Offers →
                </button>
              </div>
              <ul className="op-attention-list">
                {requests.map((b) => (
                  <li key={b.id} className="op-attention-item">
                    <span>
                      <strong>{b.guest_name}</strong> requested {b.property_name} ({formatDate(b.check_in)} → {formatDate(b.check_out)}) — approve or decline
                    </span>
                  </li>
                ))}
                {pendingOffers.map((b) => {
                  const left = b.expires_at ? daysUntil(expiryDate(b.expires_at)) : null;
                  const expiry = left === null ? "" : left <= 0 ? " · expires today" : left === 1 ? " · expires tomorrow" : ` · ${left} days left`;
                  return (
                    <li key={b.id} className="op-attention-item">
                      <span>
                        <strong>{b.guest_name}</strong> offer at {b.property_name} awaiting payment{expiry}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
          <div className="op-head">
            <div>
              <h2 className="op-h2">Properties</h2>
              <p className="op-sub">Set up your places and link each one&rsquo;s Airbnb calendar.</p>
            </div>
            <button className="bk-btn op-new" onClick={() => openOverlay({ kind: "property" })}>
              + Add property
            </button>
          </div>
          {shareDisplay && (
            <div className="op-share">
              <span>Your listings page:</span>
              <a className="op-url" href={`/owner/${handle}`} target="_blank" rel="noreferrer">
                {shareDisplay}
              </a>
              <button className="op-link op-copy-btn" onClick={copyShare} title="Copy link" aria-label="Copy listings page link">
                <CopyIcon />
                {shareCopied ? "Copied!" : "Copy"}
              </button>
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
                      {p.import_feeds?.length ? "calendar linked" : "no calendar"}
                    </div>
                  </div>
                  <div className="op-actions">
                    <button
                      className="op-link"
                      onClick={() => openOverlay({ kind: "offer", mode: "create", initial: { property_id: p.id } })}
                    >
                      Invite guest
                    </button>
                    <button className="op-link" onClick={() => openOverlay({ kind: "property", initial: p })}>
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
          onRefresh={load}
          payoutsEnabled={kycEnabled}
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
                const hasPendingChange = Boolean(b.requested_check_in && b.date_change_requested_at);
                return (
                  <li key={b.id} className="op-item" style={{ flexDirection: "column", alignItems: "stretch", gap: 8 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
                      <div className="op-main">
                        <div className="op-title">
                          {b.property_name}
                          {b.kind === "rebook" && <span className="op-tag">Rebook</span>}
                          {hasPendingChange && (
                            <span className="op-tag" style={{ background: "var(--amber-tint)", color: "var(--amber-text)", border: "1px solid var(--amber-border)" }}>
                              Date change requested
                            </span>
                          )}
                        </div>
                        <div className="op-meta">
                          {b.guest_name} · {formatDate(b.check_in)} → {formatDate(b.check_out)} ·{" "}
                          {formatMoney(b.amount_cents, b.currency)}
                        </div>
                        {hasPendingChange && (
                          <div className="op-meta" style={{ color: "var(--amber-text)", marginTop: 2 }}>
                            Requested: {formatDate(b.requested_check_in!)} → {formatDate(b.requested_check_out!)}
                          </div>
                        )}
                      </div>
                      <div className="op-side">
                        <span className={`op-status ${s.cls}`}>{s.text}</span>
                        <div className="op-actions">
                          <a className="op-link" href={`/book/${b.token}`} target="_blank" rel="noreferrer">View</a>
                          {b.status === "paid" && (
                            <button className="op-link" onClick={() => openOverlay({ kind: "offer", mode: "rebook", initial: rebookInitial(b) })}>
                              Rebook
                            </button>
                          )}
                          {b.status !== "cancelled" && (
                            <button className="op-link op-copy-btn" onClick={() => copyLink(b.token)} title="Copy payment link" aria-label="Copy payment link">
                              <CopyIcon />{copied === b.token ? "Copied!" : "Copy link"}
                            </button>
                          )}
                          <button className="op-link" onClick={() => openMessages(b)}>Message</button>
                        </div>
                      </div>
                    </div>
                    {hasPendingChange && (
                      <DateChangeDecision bookingId={b.id} onDone={load} />
                    )}
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
              <p className="op-sub">Pre-define a stay and send a payment link. Offers hold the dates until check-in.</p>
            </div>
            <button
              className="bk-btn op-new"
              onClick={() => openOverlay({ kind: "offer", mode: "create" })}
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
          {!loading && pendingOffers.length === 0 && expiredOffers.length === 0 && requests.length === 0 && (
            <div className="op-empty">No open offers. Create one with <strong>+ New offer</strong>.</div>
          )}
          {pendingOffers.length > 0 && (
            <>
              <h3 className="op-subhead" style={{ marginTop: requests.length > 0 ? 18 : 0 }}>
                Awaiting guest ({pendingOffers.length})
              </h3>
              <ul className="op-list">
                {pendingOffers.map((b) => {
                  const s = statusLabel(b);
                  return (
                    <li key={b.id} className="op-item op-item-live">
                      <div className="op-main">
                        <div className="op-title">
                          {b.property_name}
                          {b.kind === "rebook" && <span className="op-tag">Rebook</span>}
                        </div>
                        <div className="op-meta">
                          {b.guest_name} · {formatDate(b.check_in)} → {formatDate(b.check_out)} ·{" "}
                          {b.amount_cents === 0 ? "Complimentary" : formatMoney(b.amount_cents, b.currency)}
                        </div>
                      </div>
                      <div className="op-side">
                        <span className={`op-status ${s.cls}`}>{s.text}</span>
                        <div className="op-actions">
                          <button className="op-link" onClick={() => copyLink(b.token)}>
                            {copied === b.token ? "Copied!" : "Copy link"}
                          </button>
                          <button
                            className="op-link"
                            onClick={() =>
                              openOverlay({ kind: "offer", mode: "edit", initial: editInitial(b) })
                            }
                          >
                            Edit
                          </button>
                          <button className="op-link op-danger" onClick={() => removeOffer(b)}>
                            Remove
                          </button>
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </>
          )}
          {expiredOffers.length > 0 && (
            <>
              <h3 className="op-subhead" style={{ marginTop: 20, color: "var(--ink-soft)", fontSize: 14 }}>
                Expired
              </h3>
              <ul className="op-list">
                {expiredOffers.map((b) => (
                  <li key={b.id} className="op-item" style={{ opacity: 0.6 }}>
                    <div className="op-main">
                      <div className="op-title">{b.property_name}</div>
                      <div className="op-meta">
                        {b.guest_name} · {formatDate(b.check_in)} → {formatDate(b.check_out)}
                      </div>
                    </div>
                    <div className="op-side">
                      <span className="op-status op-muted">Expired</span>
                      <div className="op-actions">
                        <button className="op-link" onClick={() => removeOffer(b)}>Remove</button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      {/* MESSAGES */}
      {tab === "messages" && (
        <MessagesTab
          startBooking={messageBooking}
          onConsumeStart={() => setMessageBooking(null)}
        />
      )}

      {/* GLOBAL POLICIES */}
      {tab === "policies" && <PoliciesTab />}

      {/* SETTINGS */}
      {tab === "settings" && (
        <SettingsTab
          onHandleChange={setHandle}
          onPublicNameChange={setPublicName}
        />
      )}

    </Shell>
  );
}

function strOrUndef(v: number | null | undefined): string | undefined {
  return v != null ? String(v) : undefined;
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
    currency: b.currency,
    paid: b.status === "paid",
    policy_checkin_email_days:    strOrUndef(b.policy_checkin_email_days),
    policy_deposit_required_days: strOrUndef(b.policy_deposit_required_days),
    policy_full_payment_due_days: strOrUndef(b.policy_full_payment_due_days),
    policy_refund_100_days:       strOrUndef(b.policy_refund_100_days),
    policy_refund_50_days:        strOrUndef(b.policy_refund_50_days),
    policy_deposit_pct:           strOrUndef(b.policy_deposit_pct),
  };
}

function rebookInitial(b: Booking): OfferInitial {
  return {
    property_id: b.property_id ?? undefined,
    guest_name: b.guest_name,
    guest_email: b.guest_email,
    nightly_rate: b.nightly_rate_cents != null ? centsToAmount(b.nightly_rate_cents) : "",
    cleaning_fee: b.cleaning_fee_cents ? centsToAmount(b.cleaning_fee_cents) : "",
    currency: b.currency,
  };
}

function Shell({
  ownerName,
  onLogout,
  tab,
  setTab,
  alertCount = 0,
  hideNav,
  onBack,
  children,
}: {
  ownerName: string;
  onLogout: () => void;
  tab: Tab;
  setTab: (t: Tab) => void;
  alertCount?: number;
  hideNav?: boolean;
  onBack?: () => void;
  children: React.ReactNode;
}) {
  const tabs: { id: Tab; label: string }[] = [
    { id: "properties", label: "Properties" },
    { id: "calendar", label: "Calendar" },
    { id: "bookings", label: "Booking activity" },
    { id: "offers", label: "Offers" },
    { id: "messages", label: "Messages" },
    { id: "policies", label: "Default Policies" },
    { id: "settings", label: "Settings" },
  ];
  return (
    <div className="op-shell">
      <div className="op-topbar">
        <BrandMark href="/owner" style={{ margin: 0 }} />
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
              {t.id === "offers" && alertCount > 0 && (
                <span className="op-tab-count">{alertCount}</span>
              )}
            </button>
          ))}
        </nav>
      )}
      {hideNav && onBack && (
        <div className="op-formback">
          <button type="button" className="op-link" onClick={onBack}>
            ← Back to portal
          </button>
        </div>
      )}
      {hideNav ? (
        <div className="op-formwrap">{children}</div>
      ) : (
        <div className="op-panel">{children}</div>
      )}
    </div>
  );
}

function DateChangeDecision({ bookingId, onDone }: { bookingId: string; onDone: () => void }) {
  const [busy, setBusy] = useState<"approve" | "decline" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function decide(action: "approve" | "decline") {
    setBusy(action);
    setError(null);
    const res = await fetch(`/api/owner/bookings/${bookingId}/${action}-change`, { method: "POST" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? `Could not ${action} the change.`);
    } else {
      onDone();
    }
    setBusy(null);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", padding: "8px 0 2px" }}>
      <span style={{ fontSize: 13, color: "var(--ink-soft)" }}>Respond to date change request:</span>
      <button
        className="bk-btn"
        style={{ padding: "6px 16px", fontSize: 13, background: "var(--teal)" }}
        onClick={() => decide("approve")}
        disabled={busy !== null}
      >
        {busy === "approve" ? "Approving…" : "Approve"}
      </button>
      <button
        className="op-link op-danger"
        onClick={() => decide("decline")}
        disabled={busy !== null}
      >
        {busy === "decline" ? "Declining…" : "Decline"}
      </button>
      {error && <span style={{ fontSize: 13, color: "var(--amber-text)" }}>{error}</span>}
    </div>
  );
}
