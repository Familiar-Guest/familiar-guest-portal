"use client";

import { addDays, monthLabel, nights } from "@/lib/format";

export interface GanttBar {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD (exclusive)
  label: string;
  cls: string;
}

export interface GanttRow {
  id: string;
  label: string;
  bars: GanttBar[];
}

const todayIso = () => new Date().toISOString().slice(0, 10);

/** A simple horizontal-scroll gantt chart: rows of labeled bars over a day timeline. */
export function Gantt({ rows, days = 120 }: { rows: GanttRow[]; days?: number }) {
  const today = todayIso();

  // Build month-header segments (consecutive days sharing a month).
  const segments: { label: string; width: number }[] = [];
  for (let i = 0; i < days; i++) {
    const label = monthLabel(addDays(today, i));
    if (segments.length && segments[segments.length - 1].label === label) {
      segments[segments.length - 1].width += 1;
    } else {
      segments.push({ label, width: 1 });
    }
  }

  return (
    <div className="gantt-wrap">
      <div className="gantt" style={{ "--gantt-days": days } as React.CSSProperties}>
        <div className="gantt-header">
          <div className="gantt-label" />
          <div className="gantt-track">
            {segments.map((s, i) => (
              <div key={i} className="gantt-month" style={{ width: `${(s.width / days) * 100}%` }}>
                {s.label}
              </div>
            ))}
          </div>
        </div>
        {rows.map((row) => (
          <div key={row.id} className="gantt-row">
            <div className="gantt-label">{row.label}</div>
            <div className="gantt-track">
              {row.bars.map((bar, i) => {
                const startOffset = Math.max(0, nights(today, bar.start));
                const endOffset = Math.min(days, nights(today, bar.end));
                if (endOffset <= 0 || startOffset >= days) return null;
                const left = (startOffset / days) * 100;
                const width = ((endOffset - startOffset) / days) * 100;
                return (
                  <div
                    key={i}
                    className={`gantt-bar ${bar.cls}`}
                    style={{ left: `${left}%`, width: `${width}%` }}
                    title={bar.label}
                  >
                    {bar.label}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
