import type { SupabaseClient } from "@supabase/supabase-js";
import type { Booking, Message, MessageSender } from "./types";
import { sendEmail, siteUrl, buildMessageNotificationEmail } from "./email";
import { ensureGuestPortal, guestPortalUrl } from "./guestPortal";

const MAX_BODY = 5000;
const MAX_SUBJECT = 200;

/** Validate + normalize a composed message. */
export function parseMessageInput(
  body: unknown,
  subject: unknown
): { body: string; subject: string | null } | { error: string } {
  const b = String(body ?? "").trim();
  if (!b) return { error: "Enter a message." };
  if (b.length > MAX_BODY) return { error: "Message is too long." };
  const s = String(subject ?? "").trim().slice(0, MAX_SUBJECT) || null;
  return { body: b, subject: s };
}

/**
 * Insert a message into a booking thread and notify the other party by email
 * (best-effort — a failed notification does not fail the send). Owner messages
 * link the guest to their permanent portal; guest messages link the owner to
 * their portal.
 */
export async function postMessage(
  admin: SupabaseClient,
  opts: { booking: Booking; sender: MessageSender; subject: string | null; body: string }
): Promise<{ message: Message } | { error: string }> {
  const { booking, sender, subject, body } = opts;
  if (!booking.owner_id) return { error: "This booking can't receive messages." };

  const direction = sender === "owner" ? "outbound" : "inbound";
  const { data, error } = await admin
    .from("messages")
    .insert({ booking_id: booking.id, owner_id: booking.owner_id, sender, direction, subject, body })
    .select()
    .single();
  if (error || !data) {
    console.error("message insert failed", error);
    return { error: "Could not send your message." };
  }
  const message = data as Message;

  try {
    const { data: ownerRow } = await admin
      .from("owners")
      .select("email, full_name")
      .eq("id", booking.owner_id)
      .maybeSingle();
    const owner = ownerRow as { email: string; full_name: string | null } | null;

    if (sender === "owner") {
      const token = await ensureGuestPortal(booking.guest_email, admin);
      const ownerName = owner?.full_name || booking.property_name;
      const { subject: subj, html } = buildMessageNotificationEmail({
        toName: booking.guest_name,
        fromLabel: `${ownerName} (your host at ${booking.property_name})`,
        subject: subject ?? "",
        snippet: body,
        link: guestPortalUrl(token),
        linkLabel: "View & reply",
      });
      await sendEmail({ to: booking.guest_email, subject: subj, html, fromName: booking.property_name });
    } else if (owner?.email) {
      const { subject: subj, html } = buildMessageNotificationEmail({
        toName: owner.full_name ?? "",
        fromLabel: `${booking.guest_name} (guest at ${booking.property_name})`,
        subject: subject ?? "",
        snippet: body,
        link: `${siteUrl()}/owner`,
        linkLabel: "Open your portal",
      });
      await sendEmail({ to: owner.email, subject: subj, html });
    }
  } catch (err) {
    console.error("message notification failed", err);
  }

  return { message };
}
