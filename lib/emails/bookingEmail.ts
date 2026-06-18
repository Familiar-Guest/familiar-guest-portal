/**
 * HTML email template for booking confirmations — Familiar Guest / Tidewater style.
 *
 * Built for email client compatibility:
 *  - Table-based layout (flexbox/grid unreliable in Outlook)
 *  - All styles inline (most clients strip <style> blocks)
 *  - Web-safe fallback fonts since email clients don't reliably load custom fonts
 *  - Max width 600px, standard for email
 *
 * Optional latitude/longitude fields (pulled from the property profile) add a
 * "Get directions" link under the address, pointing to an exact map pin
 * rather than relying on geocoding the text address.
 *
 * Ported from the provided bookingEmail.js (2026-06-17 update); HTML unchanged
 * except the CTA, which now links to the guest's booking page when a
 * `bookingUrl` is supplied.
 */

const COLORS = {
  background: "#F6F3EC", // warm sand
  card: "#FFFFFF",
  ink: "#1E3A3A", // deep sea ink (headings, primary text)
  body: "#445555", // muted slate for body copy
  accent: "#E07A4F", // sunset coral (CTA, accents)
  accentDeep: "#C25A33",
  divider: "#E3DDC9",
  detailBg: "#EFF4F1", // pale sea
};

export interface BookingEmailFields {
  guestName: string;
  ownerName: string;
  rentalName: string;
  address: string;
  startDate: string;
  endDate: string;
  checkInTime?: string;
  checkOutTime?: string;
  confirmationNumber?: string;
  latitude?: number | null;
  longitude?: number | null;
  isRepeatGuest?: boolean;
  bookingUrl?: string;
  /** Optional payment breakdown rows (e.g. deposit paid, balance due). */
  paymentRows?: { label: string; value: string }[];
  /** Optional policy lines (payment schedule + refund terms) shown to the guest. */
  policyLines?: string[];
  /** Heading for the payment/policy card (defaults to "Payment & policy"). */
  paymentTitle?: string;
}

function formatDate(dateInput: string): string {
  const date = new Date(dateInput);
  if (Number.isNaN(date.getTime())) return dateInput;
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Builds a Google Maps URL from coordinates. Using lat/lng (rather than the
 * text address) gives guests an exact pin — useful for rural or
 * hard-to-geocode properties.
 */
function buildMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

function detailRow(label: string, value: string): string {
  return `
    <tr>
      <td style="padding: 10px 0; border-bottom: 1px solid ${COLORS.divider}; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 13px; color: ${COLORS.body}; width: 38%;">
        ${label}
      </td>
      <td style="padding: 10px 0; border-bottom: 1px solid ${COLORS.divider}; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: ${COLORS.ink}; text-align: right;">
        ${value}
      </td>
    </tr>`;
}

/**
 * Builds a full HTML email document (subject + html string) for a booking
 * confirmation. Pass isRepeatGuest: true for the warmer welcome-back variant.
 */
export function buildBookingEmail(fields: BookingEmailFields): {
  subject: string;
  html: string;
} {
  const required: (keyof BookingEmailFields)[] = [
    "guestName",
    "ownerName",
    "rentalName",
    "address",
    "startDate",
    "endDate",
  ];
  const missing = required.filter((key) => !fields?.[key]);
  if (missing.length > 0) {
    throw new Error(
      `buildBookingEmail: missing required field(s): ${missing.join(", ")}`
    );
  }

  const {
    guestName,
    ownerName,
    rentalName,
    address,
    startDate,
    endDate,
    checkInTime = "3:00 PM",
    checkOutTime = "11:00 AM",
    confirmationNumber,
    latitude,
    longitude,
    isRepeatGuest = false,
    bookingUrl,
    paymentRows = [],
    policyLines = [],
    paymentTitle = "Payment & policy",
  } = fields;

  const hasCoordinates = latitude != null && longitude != null;
  const mapsUrl = hasCoordinates ? buildMapsUrl(latitude, longitude) : null;

  const subject = `Booking confirmed — ${rentalName}`;

  const heroLine = isRepeatGuest
    ? `Welcome back to ${rentalName}`
    : `Your stay is confirmed`;

  const introLine = isRepeatGuest
    ? `So glad you're staying with us again, ${guestName}. Here's everything for your upcoming trip.`
    : `Hi ${guestName}, here are your trip details. We're looking forward to hosting you.`;

  const closingLine = isRepeatGuest
    ? `You already know the place — but if anything's changed since your last visit, just reply to this email.`
    : `If you have any questions before your stay, just reply to this email. We're happy to help with recommendations, check-in instructions, or anything else you need.`;

  const addressValue = hasCoordinates
    ? `${address}<br /><a href="${mapsUrl}" style="color: ${COLORS.accentDeep}; font-weight: 600; text-decoration: none; font-size: 13px;">Get directions ↗</a>`
    : address;

  const detailRows = [
    confirmationNumber ? detailRow("Confirmation #", confirmationNumber) : "",
    detailRow("Property", rentalName),
    detailRow("Address", addressValue),
    detailRow("Check-in", `${formatDate(startDate)} · after ${checkInTime}`),
    detailRow("Check-out", `${formatDate(endDate)} · before ${checkOutTime}`),
    detailRow("Host", ownerName),
  ].join("");

  const ctaHref = bookingUrl ?? "#";

  // Optional payment + policy card (deposit/balance schedule, refund terms).
  const paymentRowsHtml = paymentRows.map((r) => detailRow(r.label, r.value)).join("");
  const policyHtml = policyLines.length
    ? `<p style="margin: 14px 0 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 13px; color: ${COLORS.body}; line-height: 1.6;">${policyLines.join("<br />")}</p>`
    : "";
  const paymentCard =
    paymentRows.length || policyLines.length
      ? `
          <tr>
            <td style="padding: 16px 32px 0;">
              <p style="margin: 0 0 8px; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: ${COLORS.ink};">
                ${paymentTitle}
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.detailBg}; border-radius: 10px; padding: 8px 20px;">
                <tr>
                  <td style="padding: 12px 0 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${paymentRowsHtml}
                    </table>
                    ${policyHtml}
                  </td>
                </tr>
              </table>
            </td>
          </tr>`
      : "";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: ${COLORS.background};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.background};">
    <tr>
      <td align="center" style="padding: 40px 16px;">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%; background-color: ${COLORS.card}; border-radius: 12px; overflow: hidden;">

          <!-- Header band -->
          <tr>
            <td style="background-color: ${COLORS.ink}; padding: 28px 32px;">
              <span style="font-family: Georgia, 'Times New Roman', serif; font-size: 20px; color: #FFFFFF; letter-spacing: 0.5px;">
                ${rentalName}
              </span>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding: 36px 32px 8px;">
              <h1 style="margin: 0 0 12px; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; color: ${COLORS.ink}; line-height: 1.3;">
                ${heroLine}
              </h1>
              <p style="margin: 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 15px; color: ${COLORS.body}; line-height: 1.6;">
                ${introLine}
              </p>
            </td>
          </tr>

          <!-- Detail card -->
          <tr>
            <td style="padding: 24px 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.detailBg}; border-radius: 10px; padding: 8px 20px;">
                <tr>
                  <td style="padding: 12px 0 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${detailRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Payment & policy -->${paymentCard}

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 28px 32px 8px;">
              <a href="${ctaHref}" style="display: inline-block; background-color: ${COLORS.accent}; color: #FFFFFF; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 8px;">
                View your booking
              </a>
            </td>
          </tr>

          <!-- Closing -->
          <tr>
            <td style="padding: 20px 32px 32px;">
              <p style="margin: 0 0 20px; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; color: ${COLORS.body}; line-height: 1.6;">
                ${closingLine}
              </p>
              <p style="margin: 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; color: ${COLORS.ink};">
                ${isRepeatGuest ? "Can't wait to host you again," : "See you soon,"}<br />
                <strong>${ownerName}</strong><br />
                <span style="color: ${COLORS.body};">${rentalName}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 32px; background-color: ${COLORS.background}; border-top: 1px solid ${COLORS.divider};">
              <p style="margin: 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 11px; color: ${COLORS.body}; text-align: center;">
                Booked directly through Familiar Guest — no platform fees.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return { subject, html };
}
