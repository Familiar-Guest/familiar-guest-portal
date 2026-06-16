"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import type { Property } from "@/lib/types";
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

function toCalendarBars(ranges: BusyRange[]): CalendarBar[] {
  return ranges.map(r => ({
    start: r.start,
    end: r.end,
    shortLabel: shortLabelFrom(r.label),
    fullLabel: r.label,
    type: r.type,
  }));
}

type View = "calendar" | "list";

export function CalendarTab({ properties }: { properties: Property[] }) {
  const [view, setView]           = useState<View>("calendar");
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [ranges, setRanges]       = useState<BusyRange[]>([]);
  const [hasCalendar, setHasCalendar] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState<string | null>(null);

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
  const calBars  = toCalendarBars(ranges);

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
              {upcoming.map((r, i) => (
                <li key={i} className="op-item">
                  <div className="op-main">
                    <div className="op-title">
                      <span className={`cal-dot cal-${r.type}`} />
                      {formatDate(r.start)} → {formatDate(r.end)}
                    </div>
                    <div className="op-meta">{r.label}</div>
                  </div>
                  <span className={`op-status cal-badge-${r.type}`}>
                    {TYPE_LABEL[r.type]}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}
