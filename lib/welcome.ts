/** Owner contact details shared with the guest at the bottom of the welcome message. */
export interface OwnerContact {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
}

/**
 * Default welcome message seeded when an owner adds a property. The bracketed
 * tokens are substituted per-booking when the invitation email is sent.
 */
export const DEFAULT_WELCOME_TEMPLATE =
  "<p>Thank you for booking [property name] for [start date] to [end date]. " +
  "Check-in information will be sent two days prior to your stay. " +
  "Our contact information is below.</p>";

/**
 * Replace the welcome-message placeholders with the booking's real values.
 * Dates should already be formatted for display.
 */
export function fillWelcomePlaceholders(
  html: string,
  vars: { propertyName: string; checkIn: string; checkOut: string }
): string {
  return html
    .replaceAll("[property name]", vars.propertyName)
    .replaceAll("[start date]", vars.checkIn)
    .replaceAll("[end date]", vars.checkOut);
}

/** True if the owner has at least one contact method to show. */
export function hasContact(c: OwnerContact | null | undefined): boolean {
  return Boolean(c && (c.email || c.phone || c.whatsapp));
}
