"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import type { Booking, Message } from "@/lib/types";

export function MessagePanel({
  booking,
  onClose,
}: {
  booking: Booking;
  onClose: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/owner/bookings/${booking.id}/messages`, {
        cache: "no-store",
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) setMessages(data.messages ?? []);
    } finally {
      setLoading(false);
    }
  }, [booking.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setSending(true);
    setError(null);
    const res = await fetch(`/api/owner/bookings/${booking.id}/messages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not send the message.");
      setSending(false);
      return;
    }
    setBody("");
    setSending(false);
    load();
  }

  return (
    <div className="op-modal-backdrop" onClick={onClose}>
      <div className="op-modal" onClick={(e) => e.stopPropagation()}>
        <div className="op-modal-head">
          <div>
            <h2 className="op-h2">Message {booking.guest_name}</h2>
            <p className="op-sub">
              {booking.property_name} · {formatDate(booking.check_in)} →{" "}
              {formatDate(booking.check_out)}
            </p>
          </div>
          <button className="op-link" onClick={onClose}>
            Close
          </button>
        </div>

        <div className="op-thread">
          {loading && <p className="op-empty">Loading…</p>}
          {!loading && messages.length === 0 && (
            <p className="op-empty">
              No messages yet. Your note is emailed to {booking.guest_email}.
            </p>
          )}
          {messages.map((m) => (
            <div key={m.id} className="op-msg">
              <div className="op-msg-body">{m.body}</div>
              <div className="op-msg-time">{formatDate(m.created_at.slice(0, 10))}</div>
            </div>
          ))}
        </div>

        <form onSubmit={send}>
          <div className="bk-field">
            <textarea
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={`Write to ${booking.guest_name}…`}
              required
            />
          </div>
          <button className="bk-btn" type="submit" disabled={sending}>
            {sending ? "Sending…" : "Send message"}
          </button>
          {error && <div className="bk-error">{error}</div>}
        </form>
      </div>
    </div>
  );
}
