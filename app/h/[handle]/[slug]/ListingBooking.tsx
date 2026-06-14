"use client";

import { useMemo, useState } from "react";
import { formatMoney, nights as nightsBetween } from "@/lib/format";

interface Busy {
  start: string;
  end: string;
}

function overlaps(busy: Busy[], ci: string, co: string): boolean {
  return busy.some((b) => b.start < co && b.end > ci);
}

const todayIso = () => new Date().toISOString().slice(0, 10);

export function ListingBooking({
  propertyId,
  currency,
  nightlyRateCents,
  cleaningFeeCents,
  minNights,
  busy,
  loginNext,
}: {
  propertyId: string;
  currency: string;
  nightlyRateCents: number;
  cleaningFeeCents: number;
  minNights: number;
  busy: Busy[];
  loginNext: string;
}) {
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const calc = useMemo(() => {
    if (!checkIn || !checkOut) return null;
    if (checkOut <= checkIn) return { error: "Check-out must be after check-in." };
    const n = nightsBetween(checkIn, checkOut);
    if (n < minNights) return { error: `${minNights}-night minimum.` };
    if (overlaps(busy, checkIn, checkOut)) return { error: "Some of those nights are unavailable." };
    const nightly = nightlyRateCents * n;
    const total = nightly + cleaningFeeCents;
    return { n, nightly, total };
  }, [checkIn, checkOut, minNights, busy, nightlyRateCents, cleaningFeeCents]);

  const valid = calc && !("error" in calc);

  async function requestBooking() {
    setSubmitting(true);
    setError(null);
    const res = await fetch("/api/guest/request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ property_id: propertyId, check_in: checkIn, check_out: checkOut }),
    });
    if (res.status === 401) {
      // Must have a guest account first — send them to sign in, then back here.
      window.location.href = `/guest/login?next=${encodeURIComponent(loginNext)}`;
      return;
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error ?? "Could not submit your request.");
      setSubmitting(false);
      return;
    }
    setDone(true);
    setSubmitting(false);
  }

  if (done) {
    return (
      <div className="listing-book">
        <span className="bk-badge">✓ Request sent</span>
        <p className="bk-lead" style={{ marginTop: 10 }}>
          Your host will review your dates and email you a secure payment link.
          You can track it on your stays page.
        </p>
        <a className="bk-btn" href="/guest" style={{ display: "block", textAlign: "center" }}>
          Go to my stays
        </a>
      </div>
    );
  }

  return (
    <div className="listing-book">
      <div className="bk-grid2">
        <div className="bk-field">
          <label htmlFor="ci">Check-in</label>
          <input id="ci" type="date" min={todayIso()} value={checkIn} onChange={(e) => setCheckIn(e.target.value)} />
        </div>
        <div className="bk-field">
          <label htmlFor="co">Check-out</label>
          <input id="co" type="date" min={checkIn || todayIso()} value={checkOut} onChange={(e) => setCheckOut(e.target.value)} />
        </div>
      </div>

      {calc && "error" in calc && <p className="listing-hint">{calc.error}</p>}

      {valid && calc && (
        <div className="listing-quote">
          <div className="lq-row">
            <span>{formatMoney(nightlyRateCents, currency)} × {calc.n} nights</span>
            <span>{formatMoney(calc.nightly, currency)}</span>
          </div>
          {cleaningFeeCents > 0 && (
            <div className="lq-row">
              <span>Cleaning fee</span>
              <span>{formatMoney(cleaningFeeCents, currency)}</span>
            </div>
          )}
          <div className="lq-row lq-total">
            <span>Total</span>
            <span>{formatMoney(calc.total, currency)}</span>
          </div>
        </div>
      )}

      <button className="bk-btn" disabled={!valid || submitting} onClick={requestBooking}>
        {submitting ? "Sending…" : "Request to book"}
      </button>
      <p className="bk-note">
        You&rsquo;ll create a free guest account to confirm. Your host approves
        the dates, then you pay securely — nothing is charged now.
      </p>
      {error && <div className="bk-error">{error}</div>}

      {busy.length > 0 && (
        <details className="listing-busy">
          <summary>Unavailable dates</summary>
          <ul>
            {busy
              .filter((b) => b.end >= todayIso())
              .slice(0, 30)
              .map((b, i) => (
                <li key={i}>{b.start} → {b.end}</li>
              ))}
          </ul>
        </details>
      )}
    </div>
  );
}
