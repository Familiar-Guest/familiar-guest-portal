import type { NonStandardRate } from "./types";
import { addDays } from "./format";

/** A run of consecutive nights that share the same nightly rate. */
export interface RateSegment {
  name: string;
  rate_cents: number;
  nights: number;
}

export interface StayQuote {
  nights: number;
  subtotalCents: number; // accommodation only (no cleaning fee)
  segments: RateSegment[];
  uniform: boolean; // every night priced the same
  uniformRateCents: number | null; // the single rate when uniform, else null
}

/** The nightly rate (cents) + label for a single night, by its date (YYYY-MM-DD). */
export function rateForNight(
  standardCents: number,
  nonstandard: NonStandardRate[],
  dateStr: string
): { rate_cents: number; name: string } {
  for (const r of nonstandard) {
    if (dateStr >= r.start && dateStr <= r.end) {
      return { rate_cents: r.rate_cents, name: r.name };
    }
  }
  return { rate_cents: standardCents, name: "Standard Daily Rate" };
}

/**
 * Price a stay across [checkIn, checkOut) by summing each night's applicable
 * rate (a Non-Standard Rate when its range covers the night, else the Standard
 * Daily Rate). Returns the subtotal plus a per-rate breakdown for display.
 */
export function quoteStay(
  standardCents: number,
  nonstandard: NonStandardRate[],
  checkIn: string,
  checkOut: string
): StayQuote {
  const segments: RateSegment[] = [];
  const rates = new Set<number>();
  let subtotalCents = 0;
  let nights = 0;

  for (let d = checkIn; d < checkOut; d = addDays(d, 1)) {
    const { rate_cents, name } = rateForNight(standardCents, nonstandard, d);
    subtotalCents += rate_cents;
    nights++;
    rates.add(rate_cents);
    const last = segments[segments.length - 1];
    if (last && last.name === name && last.rate_cents === rate_cents) {
      last.nights++;
    } else {
      segments.push({ name, rate_cents, nights: 1 });
    }
  }

  const uniform = rates.size <= 1;
  return {
    nights,
    subtotalCents,
    segments,
    uniform,
    uniformRateCents: uniform ? segments[0]?.rate_cents ?? standardCents : null,
  };
}
