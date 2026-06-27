"use client";

import { useCallback, useEffect, useState } from "react";
import { BrandMark } from "@/app/BrandMark";
import { formatDate, formatMoney } from "@/lib/format";
import { isExpired } from "@/lib/offers";
import type { Booking, Message } from "@/lib/types";

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

export function GuestPortalClient({
  token,
  email,
  bookings,
  coverPhotos = {},
}: {
  token: string;
  email: string;
  bookings: Booking[];
  coverPhotos?: Record<string, string>;
}) {
  return (
    <div className="op-shell">
      <div className="op-topbar">
        <BrandMark style={{ margin: 0 }} />
        <div className="op-topright">
          <span className="op-hi">{email}</span>
        </div>
      </div>

      <div className="op-panel">
        <div className="op-head">
          <div>
            <h2 className="op-h2">Your bookings</h2>
            <p className="op-sub">Every stay linked to {email} — current and past.</p>
          </div>
        </div>

        {bookings.length === 0 && (
          <div className="op-empty">No bookings found for this email yet.</div>
        )}

        {bookings.length > 0 && (
          <ul className="op-list">
            {bookings.map((b) => (
              <StayCard key={b.id} token={token} booking={b} coverPhoto={b.property_id ? coverPhotos[b.property_id] : undefined} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StayCard({ token, booking: b, coverPhoto }: { token: string; booking: Booking; coverPhoto?: string }) {
  const s = statusLabel(b);
  const today = new Date().toISOString().slice(0, 10);
  const isFuture = b.check_in > today;
  const isCancellable =
    isFuture &&
    b.status !== "cancelled" &&
    b.status !== "declined" &&
    b.status !== "expired" &&
    b.status !== "forfeited";
  const canPay = b.status === "offer_sent" && !isExpired(b);
  const balanceDue = b.status === "deposit_paid" && b.balance_cents > 0;
  const hasPendingChange = Boolean(b.requested_check_in && b.date_change_requested_at);

  const [showMessages, setShowMessages] = useState(false);
  const [showChange, setShowChange] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cancelNote, setCancelNote] = useState<string | null>(null);

  async function cancel() {
    if (!window.confirm(`Cancel your stay at ${b.property_name}? This cannot be undone.`)) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/guest/${token}/cancel`, {
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
    <li className="op-item" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
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

      <div className="op-actions" style={{ justifyContent: "flex-start", flexWrap: "wrap" }}>
        {canPay && (
          <a className="op-link" href={`/book/${b.token}`}>
            Complete payment →
          </a>
        )}
        {balanceDue && (
          <a className="op-link" href={`/book/${b.token}`}>
            Pay balance ({formatMoney(b.balance_cents, b.currency)})
            {b.balance_due_date ? ` · due ${formatDate(b.balance_due_date)}` : ""} →
          </a>
        )}
        {b.status === "paid" && (
          <a className="op-link" href={`/book/${b.token}`}>
            View booking
          </a>
        )}
        <button className="op-link" onClick={() => setShowMessages((v) => !v)}>
          {showMessages ? "Hide messages" : "Message host"}
        </button>
        {isCancellable && !hasPendingChange && (
          <button className="op-link" onClick={() => setShowChange((v) => !v)}>
            {showChange ? "Cancel change" : "Change dates"}
          </button>
        )}
        {isCancellable && (
          <button className="op-link op-danger" onClick={cancel} disabled={busy}>
            {busy ? "Cancelling…" : "Cancel booking"}
          </button>
        )}
      </div>

      {error && <div className="bk-error">{error}</div>}

      {showChange && isCancellable && (
        <ChangeDates token={token} booking={b} onDone={() => window.location.reload()} />
      )}

      {showMessages && <Thread token={token} bookingId={b.id} />}
    </li>
  );
}

function ChangeDates({
  token,
  booking: b,
  onDone,
}: {
  token: string;
  booking: Booking;
  onDone: () => void;
}) {
  const [checkIn, setCheckIn] = useState(b.check_in);
  const [checkOut, setCheckOut] = useState(b.check_out);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/guest/${token}/change-dates`, {
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
      Date change request sent — your host will review and respond. Your current dates are held until then.
    </div>
  );

  return (
    <form onSubmit={submit} className="guest-info" style={{ marginTop: 4 }}>
      <p style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 10 }}>
        Request new dates — your host will approve or decline. Your current booking is kept until they respond.
      </p>
      <div className="bk-grid2">
        <div className="bk-field">
          <label htmlFor={`ci-${b.id}`}>New check-in</label>
          <input id={`ci-${b.id}`} type="date" value={checkIn} onChange={(e) => setCheckIn(e.target.value)} required />
        </div>
        <div className="bk-field">
          <label htmlFor={`co-${b.id}`}>New check-out</label>
          <input id={`co-${b.id}`} type="date" value={checkOut} onChange={(e) => setCheckOut(e.target.value)} required />
        </div>
      </div>
      <button className="bk-btn" type="submit" disabled={busy} style={{ marginTop: 4 }}>
        {busy ? "Sending…" : "Request new dates"}
      </button>
      {error && <div className="bk-error">{error}</div>}
    </form>
  );
}

function Thread({ token, bookingId }: { token: string; bookingId: string }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/guest/${token}/messages?booking_id=${bookingId}`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setMessages(data.messages ?? []);
    setLoading(false);
  }, [token, bookingId]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/guest/${token}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: bookingId, subject, body }),
    });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) {
      setError(data.error ?? "Could not send your message.");
      return;
    }
    setSubject("");
    setBody("");
    load();
  }

  return (
    <div className="guest-info" style={{ marginTop: 4 }}>
      <strong>Messages with your host</strong>
      {loading ? (
        <p className="bk-note" style={{ textAlign: "left" }}>Loading…</p>
      ) : messages.length === 0 ? (
        <p className="bk-note" style={{ textAlign: "left" }}>No messages yet.</p>
      ) : (
        <ul className="msg-list">
          {messages.map((m) => (
            <MessageRow key={m.id} message={m} mine={m.sender === "guest"} />
          ))}
        </ul>
      )}
      <form onSubmit={send} style={{ marginTop: 10 }}>
        <div className="bk-field">
          <input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />
        </div>
        <div className="bk-field">
          <textarea
            rows={3}
            value={body}
            onChange={(e) => setBody(e.target.value)}
            required
          />
        </div>
        <button className="bk-btn" type="submit" disabled={busy}>
          {busy ? "Sending…" : "Send message"}
        </button>
        {error && <div className="bk-error">{error}</div>}
      </form>
    </div>
  );
}

function MessageRow({ message: m, mine }: { message: Message; mine: boolean }) {
  return (
    <li className={`msg-row ${mine ? "msg-mine" : "msg-theirs"}`}>
      <div className="msg-head">
        <span className="msg-from">{mine ? "You" : "Host"}</span>
        <span className="msg-date">{formatDate(m.created_at)}</span>
      </div>
      {m.subject && <div className="msg-subject">{m.subject}</div>}
      <div className="msg-body">{m.body}</div>
    </li>
  );
}
