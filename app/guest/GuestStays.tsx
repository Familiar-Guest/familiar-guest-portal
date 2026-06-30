"use client";

import { useEffect, useRef, useState } from "react";
import { formatDate, formatMoney } from "@/lib/format";
import { isExpired } from "@/lib/offers";
import type { Booking } from "@/lib/types";
import { MonthCalendar, type CalendarBar } from "@/app/owner/MonthCalendar";
import { BrandMark } from "@/app/BrandMark";
import type { JSX } from "react";

function statusLabel(b: Booking): { text: string; cls: string } {
  if (b.status === "paid") return { text: "Confirmed", cls: "op-paid" };
  if (b.status === "deposit_paid") return { text: "Deposit paid — balance due", cls: "op-open" };
  if (b.status === "forfeited") return { text: "Forfeited", cls: "op-muted" };
  if (b.status === "requested") return { text: "Requested — awaiting host", cls: "op-open" };
  if (b.status === "declined") return { text: "Declined", cls: "op-muted" };
  if (b.status === "cancelled") return { text: "Cancelled", cls: "op-muted" };
  if (b.status === "expired" || isExpired(b)) return { text: "Offer expired", cls: "op-muted" };
  return { text: "Awaiting payment", cls: "op-open" };
}

type View = "calendar" | "list";

export function GuestStays({
  email,
  bookings,
  coverPhotos = {},
  terms = {},
  modifiable = {},
}: {
  email: string;
  bookings: Booking[];
  coverPhotos?: Record<string, string>;
  terms?: Record<string, string[]>;
  modifiable?: Record<string, boolean>;
}) {
  const [view, setView] = useState<View>("calendar");
  // When a calendar bar is clicked we switch to the list and focus that stay,
  // where the guest can change dates or cancel (subject to the host's policy).
  const [focusId, setFocusId] = useState<string | null>(null);

  async function logout() {
    await fetch("/api/owner/logout", { method: "POST" });
    window.location.href = "/guest/login";
  }

  const todayIso = new Date().toISOString().slice(0, 10);

  // Calendar shows only live, upcoming stays — cancelled, declined, forfeited,
  // and expired/lapsed offers are dropped so they don't linger on the calendar.
  const upcoming = bookings.filter(
    (b) =>
      b.check_out >= todayIso &&
      b.status !== "declined" &&
      b.status !== "cancelled" &&
      b.status !== "forfeited" &&
      b.status !== "expired" &&
      !isExpired(b)
  );

  const calBars: CalendarBar[] = upcoming.map(b => ({
    start: b.check_in,
    end: b.check_out,
    shortLabel: b.property_name,
    fullLabel: `${b.property_name} · ${formatDate(b.check_in)} – ${formatDate(b.check_out)} — tap to manage`,
    type: b.status === "paid" ? "booked" : "offer",
    onClick: () => {
      setFocusId(b.id);
      setView("list");
    },
  }));

  return (
    <div className="op-shell">
      <div className="op-topbar">
        <BrandMark href="/guest" style={{ margin: 0 }} />
        <div className="op-topright">
          <span className="op-hi">{email}</span>
          <button className="op-link" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      <div className="op-panel">
        <div className="op-head">
          <div>
            <h2 className="op-h2">Your stays</h2>
            <p className="op-sub">Bookings linked to {email}.</p>
          </div>
          <div className="op-tabs" style={{ margin: 0, padding: 4 }}>
            <button className={`op-tab ${view === "calendar" ? "op-tab-on" : ""}`} onClick={() => setView("calendar")}>
              Calendar
            </button>
            <button className={`op-tab ${view === "list" ? "op-tab-on" : ""}`} onClick={() => setView("list")}>
              List
            </button>
          </div>
        </div>

        {bookings.length === 0 && (
          <div className="op-empty">
            No stays found for this email. If your host used a different email,
            sign in with that one.
          </div>
        )}

        {bookings.length > 0 && view === "calendar" && (
          <>
            {calBars.length > 0 ? (
              <>
                <MonthCalendar bars={calBars} />
                <p className="bk-note" style={{ textAlign: "left", marginTop: 10 }}>
                  <span className="cal-dot cal-booked" /> Confirmed &nbsp;
                  <span className="cal-dot cal-offer"  /> Pending
                </p>
              </>
            ) : (
              <div className="op-empty">No upcoming stays.</div>
            )}
          </>
        )}

        {bookings.length > 0 && view === "list" && (
          <ul className="op-list">
            {bookings.map((b) => (
              <StayRow key={b.id} booking={b} coverPhoto={b.property_id ? coverPhotos[b.property_id] : undefined} terms={terms[b.id]} focused={focusId === b.id} canChange={modifiable[b.id] ?? true} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StayRow({ booking: b, coverPhoto, terms, focused = false, canChange = true }: { booking: Booking; coverPhoto?: string; terms?: string[]; focused?: boolean; canChange?: boolean }): JSX.Element {
  const s = statusLabel(b);
  const today = new Date().toISOString().slice(0, 10);
  const isFuture = b.check_in > today;
  const canPay = b.status === "offer_sent" && !isExpired(b);
  // Terms are only meaningful for live reservations, not lapsed/cancelled ones.
  const showTerms =
    b.status === "deposit_paid" || b.status === "paid" || canPay;
  const isCancellable =
    isFuture &&
    b.status !== "cancelled" &&
    b.status !== "declined" &&
    b.status !== "expired" &&
    b.status !== "forfeited";
  const hasPendingChange = Boolean(b.requested_check_in && b.date_change_requested_at);

  // Scroll into view + briefly highlight when navigated here from a calendar bar.
  const rowRef = useRef<HTMLLIElement>(null);
  useEffect(() => {
    if (focused && rowRef.current) {
      rowRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [focused]);

  const [showChange, setShowChange] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelNote, setCancelNote] = useState<string | null>(null);

  async function cancel() {
    if (!window.confirm(`Cancel your stay at ${b.property_name}? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/guest/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: b.id }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(data.error ?? "Could not cancel."); return; }
    const refund = data.refund;
    if (refund?.cents > 0) {
      setCancelNote(`Booking cancelled. Refund due per your host's policy: ${formatMoney(refund.cents, b.currency)} (${refund.pct}%). Your host will process this.`);
    } else {
      setCancelNote("Booking cancelled. No refund is due per your host's cancellation policy.");
    }
  }

  if (cancelNote) {
    return (
      <li className="op-item" style={{ flexDirection: "column", gap: 8 }}>
        <div className="op-main">
          <div className="op-title">{b.property_name}</div>
          <div className="op-meta">{formatDate(b.check_in)} → {formatDate(b.check_out)}</div>
        </div>
        <div className="bk-ok" style={{ marginTop: 0 }}>{cancelNote}</div>
      </li>
    );
  }

  return (
    <li ref={rowRef} className={`op-item${focused ? " op-item-focus" : ""}`} style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div className="op-main">
          <div className="op-title">{b.property_name}</div>
          {coverPhoto && (
            <img
              src={coverPhoto}
              alt={b.property_name}
              style={{ width: 96, height: 64, objectFit: "cover", borderRadius: 6, display: "block", marginTop: 6 }}
            />
          )}
          <div className="op-meta" style={{ marginTop: coverPhoto ? 6 : 0 }}>
            {formatDate(b.check_in)} → {formatDate(b.check_out)} ·{" "}
            {formatMoney(b.amount_cents, b.currency)}
          </div>
          {hasPendingChange && (
            <div className="op-meta" style={{ color: "var(--amber-text)", marginTop: 3 }}>
              ⏳ Date change requested: {formatDate(b.requested_check_in!)} → {formatDate(b.requested_check_out!)} — awaiting host approval
            </div>
          )}
        </div>
        <span className={`op-status ${s.cls}`}>{s.text}</span>
      </div>

      {showTerms && terms && terms.length > 0 && (
        <div className="guest-info">
          <strong>Booking terms</strong>
          <ul style={{ margin: "4px 0 0", paddingLeft: 18 }}>
            {terms.map((t, i) => (
              <li key={i} style={{ marginBottom: 4 }}>{t}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="op-actions" style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
        {canPay && <a className="op-link" href={`/book/${b.token}`}>Complete payment →</a>}
        {b.status === "deposit_paid" && (
          <a className="op-link" href={`/book/${b.token}`}>
            Pay balance ({formatMoney(b.balance_cents, b.currency)}) →
          </a>
        )}
        {b.status === "paid" && <a className="op-link" href={`/book/${b.token}`}>View booking</a>}
        {isCancellable && !hasPendingChange && canChange && (
          <button className="op-link" onClick={() => setShowChange((v) => !v)}>
            {showChange ? "Cancel change" : "Change dates"}
          </button>
        )}
        {isCancellable && !hasPendingChange && !canChange && (
          <span className="op-meta">
            Date changes are closed this close to check-in — message your host.
          </span>
        )}
        {isCancellable && (
          <button className="op-link op-danger" onClick={cancel} disabled={busy}>
            {busy ? "Cancelling…" : "Cancel booking"}
          </button>
        )}
      </div>

      {error && <div className="bk-error">{error}</div>}

      {showChange && isCancellable && canChange && (
        <AuthChangeDates booking={b} onDone={() => window.location.reload()} />
      )}
    </li>
  );
}

function AuthChangeDates({ booking: b, onDone }: { booking: Booking; onDone: () => void }) {
  const [checkIn, setCheckIn] = useState(b.check_in);
  const [checkOut, setCheckOut] = useState(b.check_out);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch("/api/guest/change-dates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: b.id, check_in: checkIn, check_out: checkOut }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) { setError(data.error ?? "Could not request the date change."); return; }
    setSent(true);
    setTimeout(onDone, 1800);
  }

  if (sent) return (
    <div className="bk-ok" style={{ marginTop: 0 }}>
      Date change request sent — your host will review and respond.
    </div>
  );

  return (
    <form onSubmit={submit} className="guest-info" style={{ marginTop: 4 }}>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 10 }}>
        Request new dates — your host will approve or decline. Your current booking is kept until they respond.
      </p>
      <div className="bk-grid2">
        <div className="bk-field">
          <label htmlFor={`ci-auth-${b.id}`}>New check-in</label>
          <input id={`ci-auth-${b.id}`} type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
        </div>
        <div className="bk-field">
          <label htmlFor={`co-auth-${b.id}`}>New check-out</label>
          <input id={`co-auth-${b.id}`} type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
        </div>
      </div>
      <button className="bk-btn" type="submit" disabled={busy} style={{ marginTop: 4 }}>
        {busy ? "Sending…" : "Request new dates"}
      </button>
      {error && <div className="bk-error">{error}</div>}
    </form>
  );
}
