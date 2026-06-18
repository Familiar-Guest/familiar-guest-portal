/**
 * HTML email template for check-in instructions — Familiar Guest / Tidewater style.
 *
 * Shares the same visual language as bookingEmail (header band, card, footer)
 * so guests recognize it as part of the same trip communication thread. Built
 * with the same email-client-safe constraints: table layout, inline styles,
 * web-safe font fallbacks.
 *
 * Check-in instructions are passed as a flexible list of { label, value } pairs
 * (door code, wifi, parking, house rules, etc.) since these vary a lot property
 * to property — rather than hardcoding fixed fields. Ported from the provided
 * checkInEmail.js (2026-06-17 update); HTML unchanged.
 */

const COLORS = {
  background: "#F6F3EC",
  card: "#FFFFFF",
  ink: "#1E3A3A",
  body: "#445555",
  accent: "#E07A4F",
  accentDeep: "#C25A33",
  divider: "#E3DDC9",
  detailBg: "#EFF4F1",
};

export interface CheckInInstruction {
  label: string;
  value: string;
}

export interface CheckInEmailFields {
  guestName: string;
  ownerName: string;
  rentalName: string;
  address: string;
  checkInDate: string;
  checkInTime?: string;
  latitude?: number | null;
  longitude?: number | null;
  instructions: CheckInInstruction[];
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

function buildMapsUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps?q=${latitude},${longitude}`;
}

/**
 * Renders one check-in instruction as a row inside the instructions card.
 * Supports multi-line values (e.g. door code + a short note) via \n.
 */
function instructionRow(label: string, value: string): string {
  const formattedValue = String(value).replace(/\n/g, "<br />");
  return `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid ${COLORS.divider}; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 13px; color: ${COLORS.body}; width: 34%; vertical-align: top;">
        ${label}
      </td>
      <td style="padding: 12px 0; border-bottom: 1px solid ${COLORS.divider}; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: ${COLORS.ink}; text-align: right; vertical-align: top;">
        ${formattedValue}
      </td>
    </tr>`;
}

/**
 * Builds a full HTML email document (subject + html string) for check-in
 * instructions.
 */
export function buildCheckInEmail(fields: CheckInEmailFields): {
  subject: string;
  html: string;
} {
  const required: (keyof CheckInEmailFields)[] = [
    "guestName",
    "ownerName",
    "rentalName",
    "address",
    "checkInDate",
    "instructions",
  ];
  const missing = required.filter((key) => !fields?.[key]);
  if (missing.length > 0) {
    throw new Error(
      `buildCheckInEmail: missing required field(s): ${missing.join(", ")}`
    );
  }
  if (!Array.isArray(fields.instructions) || fields.instructions.length === 0) {
    throw new Error(
      "buildCheckInEmail: instructions must be a non-empty array of { label, value }"
    );
  }

  const {
    guestName: _guestName,
    ownerName,
    rentalName,
    address,
    checkInDate,
    checkInTime = "3:00 PM",
    latitude,
    longitude,
    instructions,
  } = fields;
  void _guestName; // present for API parity; greeting is generic ("Hello!")

  const hasCoordinates = latitude != null && longitude != null;
  const mapsUrl = hasCoordinates ? buildMapsUrl(latitude, longitude) : null;

  const subject = `Check-in instructions — ${rentalName}`;

  const addressValue = hasCoordinates
    ? `${address}<br /><a href="${mapsUrl}" style="color: ${COLORS.accentDeep}; font-weight: 600; text-decoration: none; font-size: 13px;">Get directions ↗</a>`
    : address;

  const instructionRows = [
    instructionRow("Address", addressValue),
    instructionRow("Check-in time", `After ${checkInTime}`),
    ...instructions.map((item) => instructionRow(item.label, item.value)),
  ].join("");

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
                Hello!
              </h1>
              <p style="margin: 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 15px; color: ${COLORS.body}; line-height: 1.6;">
                We look forward to your stay at ${rentalName} on ${formatDate(checkInDate)}. Please see check-in instructions below.
              </p>
            </td>
          </tr>

          <!-- Instructions card -->
          <tr>
            <td style="padding: 24px 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.detailBg}; border-radius: 10px; padding: 8px 20px;">
                <tr>
                  <td style="padding: 12px 0 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      ${instructionRows}
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Closing -->
          <tr>
            <td style="padding: 28px 32px 32px;">
              <p style="margin: 0 0 20px; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; color: ${COLORS.body}; line-height: 1.6;">
                If anything is unclear or you run into trouble getting in, just reply to this email — we're happy to help.
              </p>
              <p style="margin: 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; color: ${COLORS.ink};">
                See you soon,<br />
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
