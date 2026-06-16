import { getOwner } from "./auth";

/** Returns the admin session if the current user is the site admin, else null. */
export async function getAdmin() {
  const owner = await getOwner();
  if (!owner) return null;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!adminEmail) return null;
  if (owner.email.toLowerCase() !== adminEmail.toLowerCase()) return null;
  return owner;
}
