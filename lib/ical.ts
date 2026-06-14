/**
 * Minimal iCal (.ics) reader for availability checks. Parses VEVENT busy
 * blocks from an Airbnb (or any) export URL and checks them against a
 * requested stay. Not a full sync — just enough to warn the owner about a
 * conflict before sending an offer.
 */

export interface BusyBlock {
  start: string; // YYYY-MM-DD
  end: string; // YYYY-MM-DD (exclusive, per iCal convention)
  summary: string;
}

function toIsoDate(raw: string): string | null {
  // Accepts 20260718 or 20260718T150000Z — we only need the date part.
  const m = raw.match(/(\d{4})(\d{2})(\d{2})/);
  if (!m) return null;
  return `${m[1]}-${m[2]}-${m[3]}`;
}

export function parseIcal(ics: string): BusyBlock[] {
  // Unfold folded lines (continuation lines start with a space or tab).
  const unfolded = ics.replace(/\r?\n[ \t]/g, "");
  const lines = unfolded.split(/\r?\n/);

  const blocks: BusyBlock[] = [];
  let cur: Partial<BusyBlock> | null = null;

  for (const line of lines) {
    if (line === "BEGIN:VEVENT") {
      cur = {};
    } else if (line === "END:VEVENT") {
      if (cur?.start && cur?.end) {
        blocks.push({
          start: cur.start,
          end: cur.end,
          summary: cur.summary ?? "Busy",
        });
      }
      cur = null;
    } else if (cur) {
      if (line.startsWith("DTSTART")) {
        const d = toIsoDate(line.split(":").pop() ?? "");
        if (d) cur.start = d;
      } else if (line.startsWith("DTEND")) {
        const d = toIsoDate(line.split(":").pop() ?? "");
        if (d) cur.end = d;
      } else if (line.startsWith("SUMMARY")) {
        cur.summary = line.slice(line.indexOf(":") + 1).trim();
      }
    }
  }
  return blocks;
}

/** True if [checkIn, checkOut) overlaps any busy block. End dates are exclusive. */
export function hasConflict(
  blocks: BusyBlock[],
  checkIn: string,
  checkOut: string
): BusyBlock | null {
  for (const b of blocks) {
    if (b.start < checkOut && b.end > checkIn) return b;
  }
  return null;
}

/** Fetch + parse a calendar URL. Returns [] on any failure (non-blocking). */
export async function fetchBusyBlocks(icalUrl: string): Promise<BusyBlock[]> {
  try {
    const res = await fetch(icalUrl, { cache: "no-store" });
    if (!res.ok) return [];
    return parseIcal(await res.text());
  } catch {
    return [];
  }
}
