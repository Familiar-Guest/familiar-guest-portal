import { Resend } from "resend";
import type { Booking, Property } from "./types";
import { formatDate, formatMoney, nights } from "./format";
import { expiryDate } from "./offers";
import { hasContact, type OwnerContact } from "./welcome";
import { createAdminClient } from "./supabase/admin";
import { buildBookingEmail } from "./emails/bookingEmail";
import { buildCheckInEmail, type CheckInInstruction } from "./emails/checkInEmail";
import { getOwnerPolicies, type OwnerPolicy } from "./policies";

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

/** Owner contact details, rendered at the bottom of the welcome message. */
function contactBlock(c: OwnerContact): string {
  const rows: string[] = [];
  if (c.email) rows.push(`<div>Email: <a href="mailto:${c.email}" style="color:${FOREST};text-decoration:none;">${c.email}</a></div>`);
  if (c.phone) rows.push(`<div>Phone: ${c.phone}</div>`);
  if (c.whatsapp) rows.push(`<div>WhatsApp: ${c.whatsapp}</div>`);
  if (rows.length === 0) return "";
  return `<div style="margin-top:12px;padding-top:12px;border-top:1px solid ${LINE};font-size:13px;color:${INK};">
    <strong style="display:block;margin-bottom:4px;">Contact</strong>${rows.join("")}</div>`;
}

/** The owner's contact details, rendered as a standalone block in the offer email. */
function contactSection(contact?: OwnerContact | null): string {
  if (!hasContact(contact)) return "";
  return `<div style="margin:18px 0;padding:16px 18px;background:${PAPER};border:1px solid ${LINE};border-radius:10px;font-size:14px;line-height:1.55;">${contactBlock(contact!)}</div>`;
}

/** 1. Offer — sent when the owner creates the booking. Contains the pay link.
 *  Handles both a fresh offer and a one-click rebook (same pipeline). */
export function buildOfferEmail(b: Booking, contact?: OwnerContact | null): { subject: string; html: string } {
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
  const contactHtml = contactSection(contact);
  const inner =
    heading(
      isRebook
        ? `Ready to book ${b.property_name} again?`
        : `You're invited to book ${b.property_name}`
    ) +
    p(lead) +
    contactHtml +
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

// ── Booking confirmation + check-in (Tidewater templates) ───────────────────

interface BookingEmailContext {
  property: Property | null;
  ownerName: string;
}

/** Load the live property + owner name needed to hydrate the email templates. */
async function loadBookingContext(b: Booking): Promise<BookingEmailContext> {
  const admin = createAdminClient();
  let property: Property | null = null;
  if (b.property_id) {
    const { data } = await admin
      .from("properties")
      .select("*")
      .eq("id", b.property_id)
      .maybeSingle();
    property = (data as Property | null) ?? null;
  }
  let ownerName = "Your host";
  if (b.owner_id) {
    const { data } = await admin
      .from("owners")
      .select("full_name")
      .eq("id", b.owner_id)
      .maybeSingle();
    const fn = (data as { full_name: string | null } | null)?.full_name;
    if (fn) ownerName = fn;
  }
  return { property, ownerName };
}

/** Short human-friendly confirmation code derived from the booking id. */
function confirmationNumber(b: Booking): string {
  return `FG-${b.id.replace(/-/g, "").slice(0, 6).toUpperCase()}`;
}

/** True if this guest email already has another paid booking. */
async function isRepeatGuest(b: Booking): Promise<boolean> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("bookings")
    .select("id", { count: "exact", head: true })
    .eq("guest_email", b.guest_email)
    .eq("status", "paid")
    .neq("id", b.id);
  return (count ?? 0) > 0;
}

/** Best available street/region address for the email's address line. */
function emailAddress(b: Booking, property: Property | null): string {
  return property?.address || property?.location || b.property_name;
}

/** The refund-policy lines shown to guests (payment schedule + cancellation terms). */
function policyLines(b: Booking, policy: OwnerPolicy, kind: PaymentKind): string[] {
  const lines: string[] = [];
  if (kind === "deposit" && b.balance_due_date) {
    lines.push(
      `Balance of ${formatMoney(b.balance_cents, b.currency)} is due by ${formatDate(
        b.balance_due_date
      )} (${policy.full_payment_due_days} days before check-in).`
    );
  }
  lines.push(
    `Cancellation: full refund if cancelled ${policy.refund_100_days}+ days before check-in; ` +
      `${policy.refund_50_days}–${policy.refund_100_days} days before, 50%; after that, no refund.`
  );
  return lines;
}

/** Payment breakdown rows for the confirmation card. */
function paymentRows(
  b: Booking,
  kind: PaymentKind
): { label: string; value: string }[] {
  const money = (c: number) => formatMoney(c, b.currency);
  if (kind === "deposit") {
    return [
      { label: "Total", value: money(b.amount_cents) },
      { label: "Deposit paid", value: money(b.deposit_cents) },
      {
        label: "Balance due",
        value: b.balance_due_date
          ? `${money(b.balance_cents)} by ${formatDate(b.balance_due_date)}`
          : money(b.balance_cents),
      },
    ];
  }
  return [{ label: "Paid in full", value: money(b.amount_cents) }];
}

type PaymentKind = "full" | "deposit" | "balance";

/**
 * 2. Confirmation — sent on successful payment. Uses the provided Tidewater
 * booking-confirmation template, hydrated from the live property + owner, and
 * carries the owner's payment + refund policy. `kind` selects the deposit-
 * received vs paid-in-full variant.
 */
export async function buildBookingConfirmation(
  b: Booking,
  kind: PaymentKind = "full"
): Promise<{ subject: string; html: string }> {
  const { property, ownerName } = await loadBookingContext(b);
  const admin = createAdminClient();
  const policy = await getOwnerPolicies(admin, b.owner_id);
  return buildBookingEmail({
    guestName: b.guest_name,
    ownerName,
    rentalName: b.property_name,
    address: emailAddress(b, property),
    startDate: b.check_in,
    endDate: b.check_out,
    checkInTime: property?.check_in_time || undefined,
    checkOutTime: property?.check_out_time || undefined,
    confirmationNumber: confirmationNumber(b),
    latitude: property?.gps_lat ?? null,
    longitude: property?.gps_lng ?? null,
    isRepeatGuest: await isRepeatGuest(b),
    bookingUrl: bookingUrl(b.token),
    paymentTitle: kind === "deposit" ? "Payment schedule & policy" : "Payment & policy",
    paymentRows: paymentRows(b, kind),
    policyLines: policyLines(b, policy, kind),
  });
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

/**
 * Overdue-balance reminder — sent after a deposit when the balance is past due.
 * States the forfeiture deadline (5 days past the due date) professionally.
 */
export function buildBalanceReminderEmail(
  b: Booking,
  forfeitDate: string
): { subject: string; html: string } {
  const inner =
    heading("Your balance is due") +
    p(`Hi ${b.guest_name}, the remaining balance for your stay at ${b.property_name} (${formatDate(b.check_in)} → ${formatDate(b.check_out)}) is now due.`) +
    `<table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;border-top:1px solid ${LINE};border-bottom:1px solid ${LINE};">
      <tr><td style="padding:7px 0;color:#8a7e72;font-size:14px;">Deposit paid</td><td style="padding:7px 0;text-align:right;font-size:14px;color:${INK};font-weight:600;">${formatMoney(b.deposit_cents, b.currency)}</td></tr>
      <tr><td style="padding:7px 0;color:#8a7e72;font-size:14px;">Balance due</td><td style="padding:7px 0;text-align:right;font-size:14px;color:${INK};font-weight:600;">${formatMoney(b.balance_cents, b.currency)}</td></tr>
    </table>` +
    p(`Please complete your balance by <strong>${formatDate(forfeitDate)}</strong>. If the balance remains unpaid after this date, your reservation will be released and your deposit forfeited, in line with your host's policy.`) +
    button(bookingUrl(b.token), "Pay your balance") +
    p(`<span style="font-size:13px;color:#8a7e72;">If you've already paid or have any questions, just reply to this email.</span>`);
  return {
    subject: `Balance due for your stay at ${b.property_name}`,
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

/** Collapse owner rich-text (per-booking note) down to plain text for a table row. */
function stripHtml(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\n{2,}/g, "\n")
    .trim();
}

/**
 * 4. Check-in — 2 days before check-in. Driven by the property's structured
 * check-in fields (entry instructions, wifi, parking, house rules), rendered
 * with the provided Tidewater check-in template.
 */
export async function buildCheckinForBooking(
  b: Booking
): Promise<{ subject: string; html: string }> {
  const { property, ownerName } = await loadBookingContext(b);

  const instructions: CheckInInstruction[] = [];
  const add = (label: string, value: string | null | undefined) => {
    const v = (value ?? "").trim();
    if (v) instructions.push({ label, value: v });
  };
  add("Entry instructions", property?.entry_instructions);
  add("Wifi", property?.wifi);
  add("Parking", property?.parking);
  add("House rules", property?.house_rules);

  // Any per-booking note the owner customized at offer time (rich text → plain).
  const note = b.checkin_instructions ? stripHtml(b.checkin_instructions) : "";
  if (note) instructions.push({ label: "Notes", value: note });

  if (instructions.length === 0) {
    instructions.push({
      label: "Check-in",
      value: "Your host will share check-in details shortly.",
    });
  }

  return buildCheckInEmail({
    guestName: b.guest_name,
    ownerName,
    rentalName: b.property_name,
    address: emailAddress(b, property),
    checkInDate: b.check_in,
    checkInTime: property?.check_in_time || undefined,
    latitude: property?.gps_lat ?? null,
    longitude: property?.gps_lng ?? null,
    instructions,
  });
}

/** 5. Change — sent when an owner changes the dates of an existing booking. */
export function buildChangeEmail(
  b: Booking,
  oldCheckIn: string,
  oldCheckOut: string
): { subject: string; html: string } {
  const datesChanged = oldCheckIn !== b.check_in || oldCheckOut !== b.check_out;
  const changeNote = datesChanged
    ? `<table width="100%" cellpadding="0" cellspacing="0" style="margin:18px 0;border:1px solid ${LINE};border-radius:10px;background:${PAPER};">
        <tr><td style="padding:14px 16px;font-size:14px;color:${INK};">
          <div style="color:#8a7e72;text-decoration:line-through;">${formatDate(oldCheckIn)} → ${formatDate(oldCheckOut)}</div>
          <div style="font-weight:600;margin-top:4px;">${formatDate(b.check_in)} → ${formatDate(b.check_out)}</div>
        </td></tr>
      </table>`
    : "";
  const inner =
    heading("Your booking has been updated") +
    p(`Hi ${b.guest_name}, your host has updated your booking at ${b.property_name}.${datesChanged ? " Here are the new dates:" : ""}`) +
    changeNote +
    summaryTable(b) +
    p(`If anything doesn't look right, just reply to this email.`) +
    button(bookingUrl(b.token), "View your booking");
  return {
    subject: `Updated: your stay at ${b.property_name}`,
    html: layout(inner),
  };
}

/** 6. Cancellation — sent when an owner removes an active booking. */
export function buildCancellationEmail(
  b: Booking,
  refundNote?: string
): { subject: string; html: string } {
  const inner =
    heading("Your booking has been cancelled") +
    p(`Hi ${b.guest_name}, your host has cancelled your booking at ${b.property_name}. The details below are no longer reserved.`) +
    summaryTable(b) +
    (refundNote ? p(refundNote) : "") +
    p(`If you have questions or this was unexpected, please reply to this email to reach your host.`);
  return {
    subject: `Cancelled: your stay at ${b.property_name}`,
    html: layout(inner),
  };
}

/** Escape user-supplied text before embedding it in an HTML email. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * Notification that a new owner⇄guest message arrived. The recipient reads and
 * replies in their portal (link), keeping the thread in one place.
 */
export function buildMessageNotificationEmail(args: {
  toName: string;
  fromLabel: string;
  subject: string;
  snippet: string;
  link: string;
  linkLabel?: string;
}): { subject: string; html: string } {
  const { toName, fromLabel, subject, snippet, link, linkLabel = "Read & reply" } = args;
  const greeting = toName ? `Hi ${escapeHtml(toName)},` : "Hi there,";
  const safeSubject = escapeHtml(subject);
  const inner =
    heading("You have a new message") +
    p(`${greeting} ${escapeHtml(fromLabel)} sent you a message${subject ? ` about &ldquo;${safeSubject}&rdquo;` : ""}:`) +
    `<div style="margin:18px 0;padding:16px 18px;background:${PAPER};border:1px solid ${LINE};border-radius:10px;font-size:14px;line-height:1.55;white-space:pre-wrap;">${escapeHtml(snippet)}</div>` +
    button(link, linkLabel);
  return {
    subject: subject ? `New message: ${subject}` : "You have a new message",
    html: layout(inner),
  };
}
