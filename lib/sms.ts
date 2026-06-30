import twilio from "twilio";
import type { Booking } from "./types";
import { formatDate, formatMoney, nights } from "./format";
import { bookingUrl } from "./email";

/** Send an SMS via Twilio. Returns true on success; logs and returns false otherwise. */
export async function sendSms({
  to,
  body,
}: {
  to: string;
  body: string;
}): Promise<boolean> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_PHONE_NUMBER;
  if (!sid || !token || !from) {
    console.error("sendSms skipped: Twilio not configured");
    return false;
  }
  try {
    const client = twilio(sid, token);
    await client.messages.create({ to, from, body });
    return true;
  } catch (err) {
    console.error("Twilio send failed", err);
    return false;
  }
}

/** Normalize a phone string to E.164 (+1XXXXXXXXXX for NANP, +XXXXXXXXXXX otherwise). */
export function normalizePhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  return raw.startsWith("+") ? raw : `+${digits}`;
}

/** Confirmation text — sent on successful payment when the guest chose SMS. */
export function buildConfirmationSms(
  b: Booking,
  kind: "full" | "deposit" | "balance" = "full"
): string {
  const n = nights(b.check_in, b.check_out);
  const dates = `${formatDate(b.check_in)} → ${formatDate(b.check_out)} (${n} night${n === 1 ? "" : "s"})`;
  if (kind === "deposit") {
    return (
      `Familiar Guest: Deposit received — your booking at ${b.property_name} is confirmed! ` +
      `${dates}. Deposit: ${formatMoney(b.deposit_cents, b.currency)}. ` +
      `Balance due before arrival. Details: ${bookingUrl(b.token)}`
    );
  }
  return (
    `Familiar Guest: You're confirmed at ${b.property_name}! ` +
    `${dates}, ${formatMoney(b.amount_cents, b.currency)}. Details: ${bookingUrl(b.token)}`
  );
}
