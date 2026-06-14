import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildReminderEmail,
  buildCheckinEmail,
  sendEmail,
} from "@/lib/email";
import { daysUntil } from "@/lib/format";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const supabase = createAdminClient();

  // Housekeeping: lapse any open offers past their hold window so their dates
  // free up. (Expiry is also enforced live at checkout, but this keeps the
  // table tidy and the owner portal accurate.)
  const nowIso = new Date().toISOString();
  const { data: expiredRows } = await supabase
    .from("bookings")
    .update({ status: "expired" })
    .eq("status", "offer_sent")
    .lt("expires_at", nowIso)
    .select("id");
  const expired = expiredRows?.length ?? 0;

  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .eq("status", "paid");

  if (error) {
    console.error("reminders cron query failed", error);
    return NextResponse.json({ error: "Query failed." }, { status: 500 });
  }

  const bookings = (data ?? []) as Booking[];
  let reminders = 0;
  let checkins = 0;

  for (const b of bookings) {
    const days = daysUntil(b.check_in);
    if (days < 0) continue;

    // 7-day reminder: fire once in the 3–7 day window (robust to missed runs).
    if (b.reminder7_sent_at === null && days >= 3 && days <= 7) {
      const { subject, html } = buildReminderEmail(b);
      const sent = await sendEmail({
        to: b.guest_email,
        subject,
        html,
        fromName: b.property_name,
      });
      if (sent) {
        await supabase
          .from("bookings")
          .update({ reminder7_sent_at: new Date().toISOString() })
          .eq("id", b.id);
        reminders++;
      }
    }

    // Check-in email: fire once at 0–2 days before check-in.
    if (b.checkin_sent_at === null && days <= 2) {
      const { subject, html } = buildCheckinEmail(b);
      const sent = await sendEmail({
        to: b.guest_email,
        subject,
        html,
        fromName: b.property_name,
      });
      if (sent) {
        await supabase
          .from("bookings")
          .update({ checkin_sent_at: new Date().toISOString() })
          .eq("id", b.id);
        checkins++;
      }
    }
  }

  return NextResponse.json({ ok: true, reminders, checkins, expired });
}
