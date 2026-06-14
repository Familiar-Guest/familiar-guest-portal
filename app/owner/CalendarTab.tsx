"use client";

import { useCallback, useEffect, useState } from "react";
import { formatDate } from "@/lib/format";
import type { Property } from "@/lib/types";
import { Gantt, type GanttRow } from "./Gantt";

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

type View = "calendar" | "list";

export function CalendarTab({ properties }: { properties: Property[] }) {
  const [view, setView] = useState<View>("calendar");
  const [propertyId, setPropertyId] = useState(properties[0]?.id ?? "");
  const [ranges, setRanges] = useState<BusyRange[]>([]);
  const [hasCalendar, setHasCalendar] = useState(false);
  const [allRanges, setAllRanges] = useState<Record<string, BusyRange[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadOne = useCallback(async (id: string) => {
    const res = await fetch(`/api/owner/properties/${id}/calendar`, { cache: "no-store" });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? "Could not load availability.");
    return data as { ranges: BusyRange[]; hasCalendar: boolean };
  }, []);

  const load = useCallback(async (id: string) => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const data = await loadOne(id);
      setRanges(data.ranges ?? []);
      setHasCalendar(Boolean(data.hasCalendar));
    } catch {
      setError("Could not load availability.");
    } finally {
      setLoading(false);
    }
  }, [loadOne]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const entries = await Promise.all(
        properties.map(async (p) => [p.id, (await loadOne(p.id)).ranges ?? []] as const)
      );
      setAllRanges(Object.fromEntries(entries));
    } catch {
      setError("Could not load availability.");
    } finally {
      setLoading(false);
    }
  }, [properties, loadOne]);

  useEffect(() => {
    if (view === "list" && propertyId) load(propertyId);
  }, [view, propertyId, load]);

  useEffect(() => {
    if (view === "calendar" && properties.length > 0) loadAll();
  }, [view, properties, loadAll]);

  if (properties.length === 0) {
    return (
      <div className="op-empty">
        Add a property to see its calendar and link your Airbnb availability.
      </div>
    );
  }

  const upcoming = ranges.filter((r) => r.end >= todayIso());

  const ganttRows: GanttRow[] = properties.map((p) => ({
    id: p.id,
    label: p.name,
    bars: (allRanges[p.id] ?? [])
      .filter((r) => r.end >= todayIso())
      .map((r) => ({ start: r.start, end: r.end, label: r.label, cls: `cal-${r.type}` })),
  }));

  return (
    <div>
      <div className="op-head" style={{ marginBottom: 14 }}>
        <div>
          <h2 className="op-h2">Calendar &amp; availability</h2>
          <p className="op-sub">
            Confirmed bookings, live offer holds, and your linked Airbnb
            calendar — combined.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <div className="op-tabs" style={{ margin: 0, padding: 4 }}>
            <button className={`op-tab ${view === "calendar" ? "op-tab-on" : ""}`} onClick={() => setView("calendar")}>
              Calendar
            </button>
            <button className={`op-tab ${view === "list" ? "op-tab-on" : ""}`} onClick={() => setView("list")}>
              List
            </button>
          </div>
          {view === "list" && properties.length > 1 && (
            <select
              className="op-select"
              value={propertyId}
              onChange={(e) => setPropertyId(e.target.value)}
            >
              {properties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {loading && <p className="op-empty">Loading…</p>}
      {error && <div className="bk-error">{error}</div>}

      {view === "calendar" && !loading && !error && (
        <>
          <Gantt rows={ganttRows} />
          <p className="bk-note" style={{ textAlign: "left", marginTop: 10 }}>
            <span className="cal-dot cal-booked" /> Booked &nbsp;
            <span className="cal-dot cal-offer" /> Offer hold &nbsp;
            <span className="cal-dot cal-airbnb" /> Airbnb
          </p>
        </>
      )}

      {view === "list" && (
        <>
          {!hasCalendar && (
            <div className="bk-note" style={{ textAlign: "left", marginBottom: 12 }}>
              No Airbnb calendar linked for this property yet — add the iCal link on
              the Properties tab to pull in outside bookings.
            </div>
          )}

          {!loading && !error && upcoming.length === 0 && (
            <div className="op-empty">No upcoming busy dates — wide open.</div>
          )}

          {!loading && upcoming.length > 0 && (
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

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}
