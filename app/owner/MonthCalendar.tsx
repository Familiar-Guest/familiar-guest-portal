"use client";

import { useState } from "react";

export interface CalendarBar {
  start: string;       // YYYY-MM-DD inclusive
  end: string;         // YYYY-MM-DD exclusive (checkout date)
  shortLabel: string;  // text shown on the bar (guest first name, property name…)
  fullLabel: string;   // tooltip
  type: "booked" | "offer" | "airbnb";
}

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DOW_LABELS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Safe date-only arithmetic — avoids DST shifts.
function shiftDays(iso: string, n: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(y, m - 1, d + n);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function daysBetween(fromIso: string, toIso: string): number {
  const [y1, m1, d1] = fromIso.split("-").map(Number);
  const [y2, m2, d2] = toIso.split("-").map(Number);
  return Math.round(
    (new Date(y2, m2 - 1, d2).getTime() - new Date(y1, m1 - 1, d1).getTime()) / 86400000
  );
}

interface WeekBar extends CalendarBar {
  leftPct: number;
  widthPct: number;
  track: number;
  continuesLeft: boolean;
  continuesRight: boolean;
}

function computeWeekBars(bars: CalendarBar[], weekStart: string): WeekBar[] {
  const weekEnd = shiftDays(weekStart, 7);
  const overlapping = bars.filter(b => b.start < weekEnd && b.end > weekStart);

  // Greedy track assignment so non-overlapping bars share tracks.
  const trackEnds: string[] = [];
  return overlapping.map(bar => {
    const clipStart = bar.start < weekStart ? weekStart : bar.start;
    const clipEnd   = bar.end   > weekEnd   ? weekEnd   : bar.end;
    const startOff  = Math.max(0, daysBetween(weekStart, clipStart));
    const endOff    = Math.min(7, daysBetween(weekStart, clipEnd));
    const continuesLeft  = bar.start < weekStart;
    const continuesRight = bar.end   > weekEnd;

    let track = trackEnds.findIndex(e => e <= bar.start);
    if (track === -1) track = trackEnds.length;
    trackEnds[track] = bar.end;

    return {
      ...bar,
      leftPct: (startOff / 7) * 100,
      widthPct: ((endOff - startOff) / 7) * 100,
      track,
      continuesLeft,
      continuesRight,
    };
  });
}

export function MonthCalendar({ bars }: { bars: CalendarBar[] }) {
  const todayIso = new Date().toISOString().slice(0, 10);
  const [year,  setYear]  = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());

  function prev() {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  }
  function next() {
    if (month === 11) { setYear(y => y + 1); setMonth(0); }
    else setMonth(m => m + 1);
  }

  const monthStr   = `${year}-${String(month + 1).padStart(2, "0")}`;
  const firstDow   = new Date(year, month, 1).getDay();          // 0 = Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const numWeeks   = Math.ceil((firstDow + daysInMonth) / 7);
  const gridStart  = shiftDays(`${monthStr}-01`, -firstDow);

  return (
    <div className="mc-wrap">
      {/* Navigation */}
      <div className="mc-nav">
        <button className="mc-nav-btn" onClick={prev} aria-label="Previous month">‹</button>
        <span className="mc-nav-title">{MONTHS[month]} {year}</span>
        <button className="mc-nav-btn" onClick={next} aria-label="Next month">›</button>
      </div>

      {/* Day-of-week header */}
      <div className="mc-dow-row">
        {DOW_LABELS.map(d => <div key={d} className="mc-dow">{d}</div>)}
      </div>

      {/* Week rows */}
      {Array.from({ length: numWeeks }, (_, wi) => {
        const weekStart = shiftDays(gridStart, wi * 7);
        const weekBars  = computeWeekBars(bars, weekStart);

        return (
          <div key={wi} className="mc-week">
            {/* Day number cells */}
            <div className="mc-day-nums">
              {Array.from({ length: 7 }, (_, di) => {
                const iso     = shiftDays(weekStart, di);
                const dayNum  = parseInt(iso.slice(8), 10);
                const inMonth = iso.startsWith(monthStr);
                const isToday = iso === todayIso;
                return (
                  <div
                    key={di}
                    className={`mc-cell${inMonth ? "" : " mc-out"}${isToday ? " mc-today" : ""}`}
                  >
                    <span className="mc-day-num">{dayNum}</span>
                  </div>
                );
              })}
            </div>

            {/* Booking bars */}
            <div className="mc-bar-layer">
              {weekBars.map((bar, i) => (
                <div
                  key={i}
                  className={[
                    "mc-bar",
                    `mc-bar-${bar.type}`,
                    bar.continuesLeft  ? "mc-cl" : "",
                    bar.continuesRight ? "mc-cr" : "",
                  ].filter(Boolean).join(" ")}
                  style={{
                    left:  `${bar.leftPct}%`,
                    width: `${bar.widthPct}%`,
                    top:   `${bar.track * 24 + 4}px`,
                  }}
                  title={bar.fullLabel}
                >
                  {!bar.continuesLeft && (
                    <span className="mc-bar-name">{bar.shortLabel}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
