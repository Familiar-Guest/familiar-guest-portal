/** Owner contact details shared with the guest at the bottom of the offer email. */
export interface OwnerContact {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
}

/** True if the owner has at least one contact method to show. */
export function hasContact(c: OwnerContact | null | undefined): boolean {
  return Boolean(c && (c.email || c.phone || c.whatsapp));
}
