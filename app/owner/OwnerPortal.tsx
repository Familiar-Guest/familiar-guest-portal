"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate, formatMoney, daysUntil } from "@/lib/format";
import { isExpired, expiryDate } from "@/lib/offers";
import type { Booking } from "@/lib/types";
import { OfferForm, type FormMode, type OfferInitial } from "./OfferForm";

type View =
  | { name: "list" }
  | { name: "form"; mode: FormMode; initial?: OfferInitial };

function centsToAmount(cents: number): string {
  return (cents / 100).toFixed(2);
}

function statusLabel(b: Booking): { text: string; cls: string } {
  if (b.status === "paid") return { text: "Paid", cls: "op-paid" };
  if (b.status === "cancelled") return { text: "Removed", cls: "op-muted" };
  if (b.status === "expired" || isExpired(b))
    return { text: "Expired", cls: "op-muted" };
  // active offer
  const left = b.expires_at ? daysUntil(expiryDate(b.expires_at)) : null;
  const suffix =
    left === null
      ? ""
      : left <= 0
      ? " · expires today"
      : ` · ${left} day${left === 1 ? "" : "s"} left`;
  return { text: `Offer sent${suffix}`, cls: "op-open" };
}

export function OwnerPortal() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<View>({ name: "list" });
  const [copied, setCopied] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/owner/offers", { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "Could not load offers.");
      } else {
        setBookings((data.bookings ?? []) as Booking[]);
      }
    } catch {
      setError("Could not load offers.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  function backToList() {
    setView({ name: "list" });
    load();
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

  async function remove(b: Booking) {
    if (
      !window.confirm(
        `Remove the offer for ${b.guest_name}? This frees the dates and the payment link will stop working.`
      )
    )
      return;
    const res = await fetch(`/api/owner/offer/${b.id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      alert(data.error ?? "Could not remove the offer.");
      return;
    }
    load();
  }

  function editInitial(b: Booking): OfferInitial {
    return {
      id: b.id,
      property_name: b.property_name,
      guest_name: b.guest_name,
      guest_email: b.guest_email,
      check_in: b.check_in,
      check_out: b.check_out,
      amount: centsToAmount(b.amount_cents),
      currency: b.currency,
      checkin_instructions: b.checkin_instructions ?? "",
    };
  }

  function rebookInitial(b: Booking): OfferInitial {
    return {
      property_name: b.property_name,
      guest_name: b.guest_name,
      guest_email: b.guest_email,
      amount: centsToAmount(b.amount_cents),
      currency: b.currency,
      checkin_instructions: b.checkin_instructions ?? "",
      // dates intentionally blank — owner picks the new stay
    };
  }

  if (view.name === "form") {
    return (
      <OfferForm
        mode={view.mode}
        initial={view.initial}
        onDone={backToList}
        onCancel={() => setView({ name: "list" })}
      />
    );
  }

  return (
    <div className="op-wrap">
      <div className="op-head">
        <div>
          <h1>Your offers</h1>
          <p className="op-sub">
            Pre-define a stay and send a payment link. Offers hold the dates for
            7 days.
          </p>
        </div>
        <button
          className="bk-btn op-new"
          onClick={() => setView({ name: "form", mode: "create" })}
        >
          + New offer
        </button>
      </div>

      {loading && <p className="op-empty">Loading…</p>}
      {error && <div className="bk-error">{error}</div>}

      {!loading && !error && bookings.length === 0 && (
        <div className="op-empty">
          No offers yet. Send your first one with <strong>+ New offer</strong>.
        </div>
      )}

      {!loading && bookings.length > 0 && (
        <ul className="op-list">
          {bookings.map((b) => {
            const s = statusLabel(b);
            const canEdit = b.status !== "paid";
            const isRebookable = b.status === "paid";
            return (
              <li key={b.id} className="op-item">
                <div className="op-main">
                  <div className="op-title">
                    {b.property_name}
                    {b.kind === "rebook" && <span className="op-tag">Rebook</span>}
                  </div>
                  <div className="op-meta">
                    {b.guest_name} · {formatDate(b.check_in)} →{" "}
                    {formatDate(b.check_out)} ·{" "}
                    {formatMoney(b.amount_cents, b.currency)}
                  </div>
                </div>
                <div className="op-side">
                  <span className={`op-status ${s.cls}`}>{s.text}</span>
                  <div className="op-actions">
                    {b.status !== "cancelled" && (
                      <button className="op-link" onClick={() => copyLink(b.token)}>
                        {copied === b.token ? "Copied!" : "Copy link"}
                      </button>
                    )}
                    {canEdit && (
                      <button
                        className="op-link"
                        onClick={() =>
                          setView({
                            name: "form",
                            mode: "edit",
                            initial: editInitial(b),
                          })
                        }
                      >
                        Edit
                      </button>
                    )}
                    {isRebookable && (
                      <button
                        className="op-link"
                        onClick={() =>
                          setView({
                            name: "form",
                            mode: "rebook",
                            initial: rebookInitial(b),
                          })
                        }
                      >
                        Rebook
                      </button>
                    )}
                    {canEdit && (
                      <button
                        className="op-link op-danger"
                        onClick={() => remove(b)}
                      >
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
  );
}
