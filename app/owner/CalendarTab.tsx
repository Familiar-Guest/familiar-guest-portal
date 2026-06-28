"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate, formatMoney } from "@/lib/format";
import { isActiveOffer } from "@/lib/offers";
import type { Booking, Property } from "@/lib/types";
import { MonthCalendar, type CalendarBar } from "./MonthCalendar";

interface BusyRange {
  start: string;
  end: string;
  label: string;
  type: "booked" | "offer" | "airbnb";
}

const TYPE_LABEL: Record<BusyRange["type"], string> = {
  booked: "Booked",
  offer: "Offer hold",
  airbnb: "Airbnb",
};

/** Extract first name from "Booked · John Smith" → "John", or return the whole label. */
function shortLabelFrom(label: string): string {
  const idx = label.indexOf("·");
  if (idx === -1) return label.split(/[\s-]/)[0]; // "Airbnb - blocked" → "Airbnb"
  return label.slice(idx + 1).trim().split(/\s+/)[0];
}

function toCalendarBars(ranges: BusyRange[], bookings: Booking[]): CalendarBar[] {
  return ranges.map(r => {
    // Match to a real booking so we can link the Gantt bar to /book/<token>.
    const linked = r.type !== "airbnb"
      ? bookings.find(b => b.check_in === r.start && b.check_out === r.end)
      : undefined;
    return {
      start: r.start,
      end: r.end,
      shortLabel: shortLabelFrom(r.label),
      fullLabel: r.label,
      type: r.type,
      href: linked ? `/book/${linked.token}` : undefined,
    };
  });
}

type View = "calendar" | "list";

export function CalendarTab({
  properties,
  bookings,
  onEdit,
  onCancel,
  onRefresh,
  payoutsEnabled = false,
}: {
  properties: Property[];
  bookings: Booking[];
  onEdit: (b: Booking) => void;
  onCancel: (b: Booking) => void;
  onRefresh?: () => void;
  payoutsEnabled?: boolean;
}) {
  const [releasingId, setReleasingId] = useState<string | null>(null);
  const [releaseErr, setReleaseErr] = useState<string | null>(null);

  async function releasePayout(b: Booking) {
    if (releasingId) return;
    setReleasingId(b.id);
    setReleaseErr(null);
    try {
      const res = await fetch(`/api/owner/bookings/${b.id}/release`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) setReleaseErr(data.error ?? "Could not release the payout.");
      else onRefresh?.();
    } catch {
      setReleaseErr("Could not release the payout.");
    } finally {
      setReleasingId(null);
    }
  }
  const [view, setView]           = useState<View>("calendar");
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [ranges, setRanges]       = useState<BusyRange[]>([]);
  const [hasCalendar, setHasCalendar] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);
  const [origin, setOrigin]       = useState("");
  const [copied, setCopied]       = useState(false);

  useEffect(() => { setOrigin(window.location.origin); }, []);

  const load = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const res  = await fetch(`/api/owner/properties/${id}/calendar`, { cache: "no-store" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not load availability.");
      setRanges(data.ranges ?? []);
      setHasCalendar(Boolean(data.hasCalendar));
    } catch {
      setError("Could not load availability.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(propertyId);
  }, [propertyId, load]);

  if (properties.length === 0) {
    return (
      <div className="op-empty">
        Add a property to see its calendar and link your Airbnb availability.
      </div>
    );
  }

  const todayIso = new Date().toISOString().slice(0, 10);
  const upcoming = ranges.filter(r => r.end >= todayIso);
  const calBars  = toCalendarBars(ranges, bookings);

  const selectedProperty = properties.find(p => p.id === propertyId);
  const exportUrl =
    selectedProperty && origin ? `${origin}/ical/${selectedProperty.ical_token}.ics` : "";

  async function copyExportUrl() {
    if (!exportUrl) return;
    try {
      await navigator.clipboard.writeText(exportUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable — owner can still select the text manually */
    }
  }

  // Editable bookings for the selected property: confirmed stays + live offers,
  // still in the future. Airbnb-synced dates aren't editable here.
  const editableBookings = bookings
    .filter(
      b =>
        b.property_id === propertyId &&
        b.check_out >= todayIso &&
        (b.status === "paid" || isActiveOffer(b))
    )
    .sort((a, b) => (a.check_in < b.check_in ? -1 : 1));

  return (
    <div>
      <div className="op-head" style={{ marginBottom: 14 }}>
        <div>
          <h2 className="op-h2">Calendar &amp; availability</h2>
          <p className="op-sub">
            Confirmed bookings, live offer holds, and your linked Airbnb calendar — combined.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
          {properties.length > 1 && (
            <select
              className="op-select"
              value={propertyId}
              onChange={e => { setPropertyId(e.target.value); }}
            >
              {properties.map(p => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          )}
          <div className="op-tabs" style={{ margin: 0, padding: 4 }}>
            <button
              className={`op-tab ${view === "calendar" ? "op-tab-on" : ""}`}
              onClick={() => setView("calendar")}
            >
              Calendar
            </button>
            <button
              className={`op-tab ${view === "list" ? "op-tab-on" : ""}`}
              onClick={() => setView("list")}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {selectedProperty && (
        <div className="ical-export">
          <div className="ical-export-head">Sync these bookings to Airbnb &amp; VRBO</div>
          <p className="bk-note" style={{ textAlign: "left", margin: "4px 0 8px" }}>
            Paste this link into Airbnb&rsquo;s <strong>Availability → Sync calendars → Import calendar</strong>{" "}
            (or VRBO&rsquo;s &ldquo;Import calendar&rdquo; field). Familiar Guest bookings and holds will then
            block those dates there. Other platforms refresh on their own schedule (usually every few hours).
          </p>
          <div className="ical-export-row">
            <input
              className="ical-export-url"
              readOnly
              value={exportUrl}
              onFocus={(e) => e.currentTarget.select()}
              aria-label="Calendar export link"
            />
            <button type="button" className="bk-btn" onClick={copyExportUrl} disabled={!exportUrl}>
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
          <p className="bk-note" style={{ textAlign: "left", marginTop: 8 }}>
            To pull the other direction (their bookings into Familiar Guest), add that platform&rsquo;s
            iCal link under the property on the Properties tab.
          </p>
        </div>
      )}

      {loading && <p className="op-empty">Loading…</p>}
      {error   && <div className="bk-error">{error}</div>}

      {!loading && !error && view === "calendar" && (
        <>
          <MonthCalendar bars={calBars} />
          <p className="bk-note" style={{ textAlign: "left", marginTop: 10 }}>
            <span className="cal-dot cal-booked" /> Booked &nbsp;
            <span className="cal-dot cal-offer"  /> Offer hold &nbsp;
            <span className="cal-dot cal-airbnb" /> Airbnb
          </p>
        </>
      )}

      {!loading && view === "list" && (
        <>
          {!hasCalendar && (
            <div className="bk-note" style={{ textAlign: "left", marginBottom: 12 }}>
              No Airbnb calendar linked for this property yet — add the iCal link on the Properties tab.
            </div>
          )}
          {!error && upcoming.length === 0 && (
            <div className="op-empty">No upcoming busy dates — wide open.</div>
          )}
          {upcoming.length > 0 && (
            <ul className="op-list">
              {upcoming.map((r, i) => {
                const linked = r.type !== "airbnb"
                  ? bookings.find(b => b.check_in === r.start && b.check_out === r.end)
                  : undefined;
                return (
                  <li key={i} className="op-item">
                    <div className="op-main">
                      <div className="op-title">
                        <span className={`cal-dot cal-${r.type}`} />
                        {formatDate(r.start)} → {formatDate(r.end)}
                      </div>
                      <div className="op-meta">{r.label}</div>
                    </div>
                    <div className="op-side">
                      <span className={`op-status cal-badge-${r.type}`}>
                        {TYPE_LABEL[r.type]}
                      </span>
                      {linked && (
                        <a className="op-link" href={`/book/${linked.token}`} target="_blank" rel="noreferrer">
                          View booking
                        </a>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </>
      )}

      {/* Editable bookings for this property */}
      {!loading && (
        <div style={{ marginTop: 26 }}>
          <h3 className="op-subhead">Bookings on this property</h3>
          {editableBookings.length === 0 ? (
            <div className="op-empty">No upcoming bookings to manage for this property.</div>
          ) : (
            <ul className="op-list">
              {editableBookings.map(b => {
                const paid = b.status === "paid";
                return (
                  <li key={b.id} className="op-item">
                    <div className="op-main">
                      <div className="op-title">
                        <span className={`cal-dot cal-${paid ? "booked" : "offer"}`} />
                        {b.guest_name}
                      </div>
                      <div className="op-meta">
                        {formatDate(b.check_in)} → {formatDate(b.check_out)} ·{" "}
                        {formatMoney(b.amount_cents, b.currency)}
                      </div>
                    </div>
                    <div className="op-side">
                      <span className={`op-status ${paid ? "op-paid" : "op-open"}`}>
                        {paid ? "Booked" : "Offer sent"}
                      </span>
                      <div className="op-actions">
                        <a className="op-link" href={`/book/${b.token}`} target="_blank" rel="noreferrer">
                          View
                        </a>
                        <button className="op-link" onClick={() => onEdit(b)}>
                          Edit
                        </button>
                        {paid && payoutsEnabled && (
                          b.payout_released_at ? (
                            <span className="op-link" style={{ color: "var(--teal)", cursor: "default" }}>
                              Paid out{b.payout_amount_cents != null ? ` · ${formatMoney(b.payout_amount_cents, b.currency)}` : ""}
                            </span>
                          ) : (
                            <button className="op-link" onClick={() => releasePayout(b)} disabled={releasingId === b.id}>
                              {releasingId === b.id ? "Releasing…" : "Release payout"}
                            </button>
                          )
                        )}
                        <button className="op-link op-danger" onClick={() => onCancel(b)}>
                          {paid ? "Cancel" : "Remove"}
                        </button>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          {releaseErr && <div className="bk-error" style={{ marginTop: 10 }}>{releaseErr}</div>}
        </div>
      )}
    </div>
  );
}
