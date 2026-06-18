/**
 * HTML email template for owner account registration confirmation —
 * Familiar Guest / Tidewater style.
 *
 * Mirrors guestRegistrationEmail structurally (same header, hero, account card,
 * single CTA, security note, footer) so the two read as part of one consistent
 * brand voice. Content is adapted for an owner audience: thanks them for
 * registering and points to the owner portal, where they manage properties,
 * bookings, and guest communication. Ported from the provided
 * ownerRegistrationEmail.js (2026-06-17 update); HTML unchanged.
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

export interface OwnerRegistrationFields {
  ownerName: string;
  ownerEmail: string;
  portalUrl: string;
  supportEmail?: string;
}

/**
 * Builds a full HTML email document (subject + html string) confirming a new
 * famguest.com owner account registration.
 */
export function buildOwnerRegistrationEmail(fields: OwnerRegistrationFields): {
  subject: string;
  html: string;
} {
  const required: (keyof OwnerRegistrationFields)[] = [
    "ownerName",
    "ownerEmail",
    "portalUrl",
  ];
  const missing = required.filter((key) => !fields?.[key]);
  if (missing.length > 0) {
    throw new Error(
      `buildOwnerRegistrationEmail: missing required field(s): ${missing.join(", ")}`
    );
  }

  const {
    ownerName,
    ownerEmail,
    portalUrl,
    supportEmail = "info@famguest.com",
  } = fields;

  const subject = `Welcome to Familiar Guest — your owner account is ready`;

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
                Familiar Guest
              </span>
            </td>
          </tr>

          <!-- Hero -->
          <tr>
            <td style="padding: 36px 32px 8px;">
              <h1 style="margin: 0 0 12px; font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; color: ${COLORS.ink}; line-height: 1.3;">
                Thanks for registering, ${ownerName}
              </h1>
              <p style="margin: 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 15px; color: ${COLORS.body}; line-height: 1.6;">
                Your Familiar Guest owner account has been created successfully. You're ready to start managing direct bookings, no platform fees.
              </p>
            </td>
          </tr>

          <!-- Account detail card -->
          <tr>
            <td style="padding: 24px 32px 8px;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: ${COLORS.detailBg}; border-radius: 10px; padding: 8px 20px;">
                <tr>
                  <td style="padding: 12px 0 0;">
                    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td style="padding: 10px 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 13px; color: ${COLORS.body}; width: 34%;">
                          Account email
                        </td>
                        <td style="padding: 10px 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; color: ${COLORS.ink}; text-align: right;">
                          ${ownerEmail}
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td align="center" style="padding: 28px 32px 8px;">
              <a href="${portalUrl}" style="display: inline-block; background-color: ${COLORS.accent}; color: #FFFFFF; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; font-weight: 600; text-decoration: none; padding: 13px 28px; border-radius: 8px;">
                Go to your owner portal
              </a>
            </td>
          </tr>

          <!-- What the portal does -->
          <tr>
            <td style="padding: 20px 32px 8px;">
              <p style="margin: 0 0 8px; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 13px; font-weight: 600; color: ${COLORS.ink};">
                From your portal, you can:
              </p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding: 6px 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; color: ${COLORS.body}; line-height: 1.6;">
                    • Set up and manage your property listings
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; color: ${COLORS.body}; line-height: 1.6;">
                    • Message guests and manage bookings in one place
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; color: ${COLORS.body}; line-height: 1.6;">
                    • Track payouts held securely until check-in
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Closing -->
          <tr>
            <td style="padding: 20px 32px 32px;">
              <p style="margin: 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 14px; color: ${COLORS.body}; line-height: 1.6;">
                Questions about your account? Reply to this email or reach us at <a href="mailto:${supportEmail}" style="color: ${COLORS.accentDeep}; text-decoration: none; font-weight: 600;">${supportEmail}</a>.
              </p>
            </td>
          </tr>

          <!-- Security note -->
          <tr>
            <td style="padding: 16px 32px; background-color: ${COLORS.detailBg};">
              <p style="margin: 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 12px; color: ${COLORS.body}; line-height: 1.6;">
                Didn't create this account? Reply to this email and we'll help sort it out.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 18px 32px; background-color: ${COLORS.background}; border-top: 1px solid ${COLORS.divider};">
              <p style="margin: 0; font-family: Inter, Helvetica, Arial, sans-serif; font-size: 11px; color: ${COLORS.body}; text-align: center;">
                Familiar Guest — direct bookings, no platform fees.
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
