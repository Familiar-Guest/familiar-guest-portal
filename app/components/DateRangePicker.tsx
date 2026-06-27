"use client";

import { useMemo, useState } from "react";

interface Busy {
  start: string; // YYYY-MM-DD (inclusive)
  end: string;   // YYYY-MM-DD (exclusive checkout)
}

interface Props {
  checkIn: string;
  checkOut: string;
  onCheckIn: (d: string) => void;
  onCheckOut: (d: string) => void;
  busy?: Busy[];
  minDate?: string;
}

const DOW = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const MON = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function ymd(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function shiftMonth(year: number, month: number, delta: number) {
  const d = new Date(year, month + delta, 1);
  return { year: d.getFullYear(), month: d.getMonth() };
}

export function DateRangePicker({
  checkIn,
  checkOut,
  onCheckIn,
  onCheckOut,
  busy = [],
  minDate,
}: Props) {
  const today = useMemo(() => ymd(new Date()), []);
  const min = minDate ?? today;

  const [nav, setNav] = useState(() => {
    const d = new Date();
    return { year: d.getFullYear(), month: d.getMonth() };
  });

  // Expand busy ranges into a set of individual night dates.
  // End is exclusive (check-out day): [start, end)
  const busySet = useMemo(() => {
    const s = new Set<string>();
    for (const { start, end } of busy) {
      const cur = new Date(start + "T00:00:00");
      const endDate = new Date(end + "T00:00:00");
      while (cur < endDate) {
        s.add(ymd(cur));
        cur.setDate(cur.getDate() + 1);
      }
    }
    return s;
  }, [busy]);

  // Returns true if any night in [ci, co) is busy.
  function rangeHasBusy(ci: string, co: string): boolean {
    const cur = new Date(ci + "T00:00:00");
    const end = new Date(co + "T00:00:00");
    while (cur < end) {
      if (busySet.has(ymd(cur))) return true;
      cur.setDate(cur.getDate() + 1);
    }
    return false;
  }

  function handleDay(day: string) {
    if (day < min || busySet.has(day)) return;

    if (!checkIn || (checkIn && checkOut)) {
      // Start fresh selection
      onCheckIn(day);
      onCheckOut("");
    } else if (day <= checkIn) {
      // Clicked on/before current check-in — restart
      onCheckIn(day);
      onCheckOut("");
    } else if (rangeHasBusy(checkIn, day)) {
      // Would span a booked night — ignore
    } else {
      onCheckOut(day);
    }
  }

  // Build the day cells for the visible month
  const cells = useMemo(() => {
    const first = new Date(nav.year, nav.month, 1);
    const last = new Date(nav.year, nav.month + 1, 0);
    const out: (string | null)[] = [];
    for (let i = 0; i < first.getDay(); i++) out.push(null); // leading blanks
    for (let d = 1; d <= last.getDate(); d++) {
      out.push(ymd(new Date(nav.year, nav.month, d)));
    }
    while (out.length % 7 !== 0) out.push(null); // trailing blanks
    return out;
  }, [nav]);

  const prev = shiftMonth(nav.year, nav.month, -1);
  const prevMonthStart = `${prev.year}-${String(prev.month + 1).padStart(2, "0")}-01`;
  const prevDisabled = prevMonthStart < min.slice(0, 7) + "-01";

  return (
    <div className="drp">
      <div className="drp-nav">
        <button
          type="button"
          className="drp-arrow"
          onClick={() => setNav(prev)}
          disabled={prevDisabled}
          aria-label="Previous month"
        >
          ‹
        </button>
        <span className="drp-month">{MON[nav.month]} {nav.year}</span>
        <button
          type="button"
          className="drp-arrow"
          onClick={() => setNav(shiftMonth(nav.year, nav.month, 1))}
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="drp-grid">
        {DOW.map((d) => (
          <div key={d} className="drp-dow">{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`_${i}`} />;

          const isPast = day < min;
          const isBusy = busySet.has(day);
          const isCI = day === checkIn;
          const isCO = day === checkOut;
          const inRange = !!(checkIn && checkOut && day > checkIn && day < checkOut);
          // A potential checkout date that would span a booked night
          const isConflict =
            !!(checkIn && !checkOut && day > checkIn && rangeHasBusy(checkIn, day) && !isBusy);

          const disabled = isPast || isBusy || isConflict;

          let cls = "drp-day";
          if (isCI || isCO) cls += " drp-sel";
          else if (inRange) cls += " drp-range";
          if (isBusy) cls += " drp-busy";
          if (isPast && !isBusy) cls += " drp-past";
          if (isConflict) cls += " drp-conflict";

          return (
            <button
              key={day}
              type="button"
              className={cls}
              disabled={disabled}
              onClick={() => handleDay(day)}
              aria-label={day}
              aria-pressed={isCI || isCO}
            >
              {Number(day.slice(8))}
            </button>
          );
        })}
      </div>

      <p className="drp-hint">
        {checkIn && checkOut
          ? `${checkIn} → ${checkOut}`
          : checkIn
          ? "Now pick a check-out date"
          : "Pick a check-in date"}
      </p>
    </div>
  );
}
