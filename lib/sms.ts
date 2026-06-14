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

/** Confirmation text — sent on successful payment when the guest chose SMS. */
export function buildConfirmationSms(b: Booking): string {
  const n = nights(b.check_in, b.check_out);
  return (
    `Familiar Guest: You're confirmed at ${b.property_name}! ` +
    `${formatDate(b.check_in)} -> ${formatDate(b.check_out)} (${n} night${n === 1 ? "" : "s"}), ` +
    `${formatMoney(b.amount_cents, b.currency)}. Details: ${bookingUrl(b.token)}`
  );
}
