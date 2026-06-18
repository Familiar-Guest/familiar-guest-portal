"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import type { Booking, Message } from "@/lib/types";

export interface StartBooking {
  id: string;
  guest_name: string;
  property_name: string;
}

interface Thread {
  booking: Pick<Booking, "id" | "guest_name" | "property_name" | "check_in" | "check_out" | "status">;
  latest: Message;
  unread: number;
  count: number;
}

export function MessagesTab({
  startBooking,
  onConsumeStart,
}: {
  startBooking: StartBooking | null;
  onConsumeStart: () => void;
}) {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StartBooking | null>(null);

  const loadThreads = useCallback(async () => {
    setLoading(true);
    const res = await fetch("/api/owner/messages", { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setThreads(data.threads ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadThreads();
  }, [loadThreads]);

  // A "Message" click from a booking row opens that thread directly.
  useEffect(() => {
    if (startBooking) {
      setSelected(startBooking);
      onConsumeStart();
    }
  }, [startBooking, onConsumeStart]);

  if (selected) {
    return (
      <ThreadView
        booking={selected}
        onBack={() => {
          setSelected(null);
          loadThreads();
        }}
      />
    );
  }

  return (
    <div>
      <div className="op-head">
        <div>
          <h2 className="op-h2">Messages</h2>
          <p className="op-sub">Your conversations with guests, one thread per booking.</p>
        </div>
      </div>

      {loading && <p className="op-empty">Loading…</p>}
      {!loading && threads.length === 0 && (
        <div className="op-empty">
          No messages yet. Open a booking and choose <strong>Message</strong> to start a conversation.
        </div>
      )}
      {threads.length > 0 && (
        <ul className="msg-thread-list">
          {threads.map((t) => (
            <li key={t.booking.id}>
              <button
                className="msg-thread"
                onClick={() =>
                  setSelected({
                    id: t.booking.id,
                    guest_name: t.booking.guest_name,
                    property_name: t.booking.property_name,
                  })
                }
              >
                <span style={{ minWidth: 0 }}>
                  <span className="op-title">
                    {t.booking.guest_name} · {t.booking.property_name}
                  </span>
                  <span className="mt-snippet" style={{ display: "block" }}>
                    {t.latest.sender === "owner" ? "You: " : ""}
                    {t.latest.body}
                  </span>
                </span>
                <span style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0 }}>
                  <span className="op-meta">{formatDate(t.latest.created_at)}</span>
                  {t.unread > 0 && <span className="msg-unread">{t.unread}</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ThreadView({
  booking,
  onBack,
}: {
  booking: StartBooking;
  onBack: () => void;
}) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const res = await fetch(`/api/owner/messages?booking_id=${booking.id}`, {
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) setMessages(data.messages ?? []);
    setLoading(false);
  }, [booking.id]);

  useEffect(() => {
    load();
  }, [load]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/owner/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ booking_id: booking.id, subject, body }),
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
    <div>
      <div className="op-head">
        <div>
          <h2 className="op-h2">{booking.guest_name}</h2>
          <p className="op-sub">{booking.property_name}</p>
        </div>
        <button className="op-link" onClick={onBack}>
          ← All messages
        </button>
      </div>

      {loading ? (
        <p className="op-empty">Loading…</p>
      ) : messages.length === 0 ? (
        <div className="op-empty">No messages yet. Send the first one below.</div>
      ) : (
        <ul className="msg-list">
          {messages.map((m) => (
            <li key={m.id} className={`msg-row ${m.sender === "owner" ? "msg-mine" : "msg-theirs"}`}>
              <div className="msg-head">
                <span className="msg-from">{m.sender === "owner" ? "You" : booking.guest_name}</span>
                <span className="msg-date">{formatDate(m.created_at)}</span>
              </div>
              {m.subject && <div className="msg-subject">{m.subject}</div>}
              <div className="msg-body">{m.body}</div>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={send} style={{ marginTop: 14 }}>
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
