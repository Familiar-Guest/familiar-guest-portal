"use client";

import { formatDate, formatMoney } from "@/lib/format";
import { isExpired } from "@/lib/offers";
import type { Booking } from "@/lib/types";

function statusLabel(b: Booking): { text: string; cls: string } {
  if (b.status === "paid") return { text: "Confirmed", cls: "op-paid" };
  if (b.status === "requested") return { text: "Requested — awaiting host", cls: "op-open" };
  if (b.status === "declined") return { text: "Declined", cls: "op-muted" };
  if (b.status === "cancelled") return { text: "Cancelled", cls: "op-muted" };
  if (b.status === "expired" || isExpired(b)) return { text: "Offer expired", cls: "op-muted" };
  return { text: "Awaiting payment", cls: "op-open" };
}

export function GuestStays({
  email,
  bookings,
}: {
  email: string;
  bookings: Booking[];
}) {
  async function logout() {
    await fetch("/api/owner/logout", { method: "POST" });
    window.location.href = "/guest/login";
  }

  return (
    <div className="op-shell">
      <div className="op-topbar">
        <span className="bk-brand" style={{ margin: 0 }}>
          Familiar&nbsp;Guest
        </span>
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
        </div>

        {bookings.length === 0 && (
          <div className="op-empty">
            No stays found for this email. If your host used a different email,
            sign in with that one.
          </div>
        )}

        {bookings.length > 0 && (
          <ul className="op-list">
            {bookings.map((b) => (
              <StayRow key={b.id} booking={b} />
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function StayRow({ booking: b }: { booking: Booking }) {
  const s = statusLabel(b);
  const canPay = b.status === "offer_sent" && !isExpired(b);

  return (
    <li className="op-item" style={{ flexDirection: "column", alignItems: "stretch", gap: 10 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 14, flexWrap: "wrap" }}>
        <div className="op-main">
          <div className="op-title">{b.property_name}</div>
          <div className="op-meta">
            {formatDate(b.check_in)} → {formatDate(b.check_out)} ·{" "}
            {formatMoney(b.amount_cents, b.currency)}
          </div>
        </div>
        <span className={`op-status ${s.cls}`}>{s.text}</span>
      </div>

      {b.status === "paid" && b.checkin_instructions && (
        <div className="guest-info">
          <strong>Check-in details</strong>
          <div style={{ whiteSpace: "pre-wrap", marginTop: 4 }}>{b.checkin_instructions}</div>
        </div>
      )}

      {(canPay || b.status === "paid") && (
        <div className="op-actions" style={{ justifyContent: "flex-start" }}>
          {canPay && (
            <a className="op-link" href={`/book/${b.token}`}>
              Complete payment →
            </a>
          )}
          {b.status === "paid" && (
            <a className="op-link" href={`/book/${b.token}`}>
              View booking
            </a>
          )}
        </div>
      )}
    </li>
  );
}
