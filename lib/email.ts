import { Resend } from "resend";
import type { Booking } from "./types";
import { formatDate, formatMoney, nights } from "./format";
import { expiryDate } from "./offers";

const FOREST = "#14543F";
const CLAY = "#C0673E";
const PAPER = "#FBF6EE";
const INK = "#2A241E";
const LINE = "#E6DBCB";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://famguest.com").replace(
    /\/$/,
    ""
  );
}

/** Guest welcome — sent when a guest account is created. Links to their stays. */
export function buildGuestWelcomeEmail(name: string): {
  subject: string;
  html: string;
} {
  const greeting = name ? `Hi ${name},` : "Hi there,";
  const inner =
    heading("Welcome to Familiar Guest") +
    p(`${greeting} your guest account is ready.`) +
    p(`Your stays page keeps every Familiar Guest booking in one place — current and past — with check-in details and payment links.`) +
    button(`${siteUrl()}/guest`, "Go to your stays");
  return { subject: "Your Familiar Guest account is ready", html: layout(inner) };
}

export function bookingUrl(token: string): string {
  return `${siteUrl()}/book/${token}`;
}

interface SendArgs {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
}

/** Send via Resend. Returns true on success; logs and returns false otherwise. */
export async function sendEmail({
  to,
  subject,
  html,
  fromName = "Familiar Guest",
}: SendArgs): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.error("sendEmail skipped: RESEND_API_KEY not set");
    return false;
  }
  const from = `${fromName} <${process.env.RESEND_FROM_EMAIL ?? "info@famguest.com"}>`;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({ from, to, subject, html });
    if (error) {
      console.error("Resend send error", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Resend send threw", err);
    return false;
  }
}

function layout(inner: string): string {
  return `<!doctype html><html><body style="margin:0;background:${PAPER};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:${INK};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER};padding:32px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border:1px solid ${LINE};border-radius:14px;overflow:hidden;">
        <tr><td style="padding:22px 28px;border-bottom:1px solid ${LINE};">
          <span style="font-family:Georgia,'Times New Roman',serif;font-size:18px;color:${FOREST};font-weight:600;">Familiar&nbsp;Guest</span>
        </td></tr>
        <tr><td style="padding:28px;">${inner}</td></tr>
        <tr><td style="padding:18px 28px;border-top:1px solid ${LINE};font-size:12px;color:#8a7e72;">
          Sent by Familiar Guest on behalf of your host. Questions about your stay? Just reply to this email.
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function summaryTable(b: Booking): string {
  const n = nights(b.check_in, b.check_out);
  const row = (label: string, value: string) =>
    `<tr><td style="padding:7px 0;color:#8a7e72;font-size:14px;">${label}</td><td style="padding:7px 0;text-align:right;font-size:14px;color:${INK};font-weight:600;">${value}</td></tr>`;
  const priceRows =
    b.nightly_rate_cents != null
      ? row(
          `${formatMoney(b.nightly_rate_cents, b.currency)} × ${n} ${
            n === 1 ? "night" : "nights"
          }`,
          formatMoney(b.nightly_rate_cents * n, b.currency)
        ) +
        (b.cleaning_fee_cents > 0
          ? row("Cleaning fee", formatMoney(b.cleaning_fee_cents, b.currency))
          : "")
      : "";
  return `<table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;border-top:1px solid ${LINE};border-bottom:1px solid ${LINE};">
    ${row("Property", b.property_name)}
    ${row("Check-in", formatDate(b.check_in))}
    ${row("Check-out", formatDate(b.check_out))}
    ${row("Nights", String(n))}
    ${priceRows}
    ${row("Total", formatMoney(b.amount_cents, b.currency))}
  </table>`;
}

function button(href: string, label: string): string {
  return `<table cellpadding="0" cellspacing="0" style="margin:8px 0 4px;"><tr><td style="border-radius:10px;background:${CLAY};">
    <a href="${href}" style="display:inline-block;padding:13px 26px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px;">${label}</a>
  </td></tr></table>`;
}

function heading(text: string): string {
  return `<h1 style="font-family:Georgia,'Times New Roman',serif;font-size:22px;color:${FOREST};margin:0 0 6px;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="font-size:15px;line-height:1.55;margin:0 0 14px;">${text}</p>`;
}

// ── Templates ───────────────────────────────────────────────────────────

/** 1. Offer — sent when the owner creates the booking. Contains the pay link.
 *  Handles both a fresh offer and a one-click rebook (same pipeline). */
export function buildOfferEmail(b: Booking): { subject: string; html: string } {
  const isRebook = b.kind === "rebook";
  const expiryLine = b.expires_at
    ? p(
        `<span style="font-size:13px;color:#8a7e72;">These dates are held for you until <strong>${formatDate(
          expiryDate(b.expires_at)
        )}</strong>. After that they may be released.</span>`
      )
    : "";
  const lead = isRebook
    ? `Hi ${b.guest_name}, great to have you back! Your host has lined up these dates at ${b.property_name}. Review the details below and complete your payment to lock it in.`
    : `Hi ${b.guest_name}, your host has set aside these dates for you. Review the details below and complete your payment to lock it in.`;
  const welcomeBlock = b.welcome_message_html
    ? instructionsBlock(b.welcome_message_html)
    : "";
  const inner =
    heading(
      isRebook
        ? `Ready to book ${b.property_name} again?`
        : `You're invited to book ${b.property_name}`
    ) +
    p(lead) +
    welcomeBlock +
    summaryTable(b) +
    button(bookingUrl(b.token), "Review & complete payment") +
    expiryLine +
    p(`<span style="font-size:13px;color:#8a7e72;">Your payment is processed securely. You don't need an account.</span>`);
  return {
    subject: isRebook
      ? `Your dates at ${b.property_name} are ready`
      : `Complete your booking for ${b.property_name}`,
    html: layout(inner),
  };
}

/** 2. Confirmation — sent on successful payment. */
export function buildConfirmationEmail(b: Booking): {
  subject: string;
  html: string;
} {
  const inner =
    heading("Your booking is confirmed") +
    p(`Hi ${b.guest_name}, your payment is complete and your stay at ${b.property_name} is booked. We can't wait to host you.`) +
    summaryTable(b) +
    p(`We'll send a reminder a week before your stay, and check-in details two days before you arrive.`) +
    button(bookingUrl(b.token), "View your booking");
  return {
    subject: `Confirmed: your stay at ${b.property_name}`,
    html: layout(inner),
  };
}

/** 3. Reminder — 7 days before check-in. */
export function buildReminderEmail(b: Booking): {
  subject: string;
  html: string;
} {
  const inner =
    heading("Your stay is one week away") +
    p(`Hi ${b.guest_name}, just a friendly reminder that your stay at ${b.property_name} begins on ${formatDate(b.check_in)}.`) +
    summaryTable(b) +
    p(`We'll send your check-in details two days before you arrive.`) +
    button(bookingUrl(b.token), "View your booking");
  return {
    subject: `One week until your stay at ${b.property_name}`,
    html: layout(inner),
  };
}

/** Owner notification — a guest requested a stay (awaiting approval). */
export function buildOwnerRequestEmail(b: Booking): {
  subject: string;
  html: string;
} {
  const inner =
    heading(`New booking request for ${b.property_name}`) +
    p(`${b.guest_name} requested these dates. Review and approve (or decline) in your portal — approving sends them a payment link.`) +
    summaryTable(b) +
    button(`${siteUrl()}/owner`, "Open your portal");
  return {
    subject: `New request: ${b.property_name} (${formatDate(b.check_in)})`,
    html: layout(inner),
  };
}

/** Render owner-supplied instructions as HTML (rich) or plain text block. */
function instructionsBlock(raw: string): string {
  const isHtml = /^<[a-z]/i.test(raw.trim());
  if (isHtml) {
    return `<div style="margin:18px 0;padding:16px 18px;background:${PAPER};border:1px solid ${LINE};border-radius:10px;font-size:14px;line-height:1.55;">${raw}</div>`;
  }
  return `<div style="margin:18px 0;padding:16px 18px;background:${PAPER};border:1px solid ${LINE};border-radius:10px;font-size:14px;line-height:1.55;white-space:pre-wrap;">${raw}</div>`;
}

/** 4. Check-in — 2 days before check-in. Includes any instructions the owner set. */
export function buildCheckinEmail(b: Booking): {
  subject: string;
  html: string;
} {
  const instructions = b.checkin_instructions
    ? instructionsBlock(b.checkin_instructions)
    : p(`Your host will share check-in details shortly.`);
  const inner =
    heading("Check-in details for your stay") +
    p(`Hi ${b.guest_name}, your stay at ${b.property_name} begins on ${formatDate(b.check_in)}. Here's what you need to know:`) +
    instructions +
    summaryTable(b) +
    button(bookingUrl(b.token), "View your booking");
  return {
    subject: `Check-in details for ${b.property_name}`,
    html: layout(inner),
  };
}
