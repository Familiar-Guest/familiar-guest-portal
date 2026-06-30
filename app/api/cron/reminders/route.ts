import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  buildReminderEmail,
  buildCheckinForBooking,
  buildBalanceReminderEmail,
  buildBalanceChargeReminderEmail,
  buildBalanceChargeFailedEmail,
  buildOwnerBalanceCollectedEmail,
  buildOwnerBalancePastDueEmail,
  buildBookingConfirmation,
  sendEmail,
  siteUrl,
} from "@/lib/email";
import { ensureGuestPortal, guestPortalUrl } from "@/lib/guestPortal";
import { daysUntil, formatDate, formatMoney } from "@/lib/format";
import { forfeitDeadline, effectivePolicyForBooking } from "@/lib/policies";
import { releaseBookingPayout } from "@/lib/payouts";
import { autoChargeBalance } from "@/lib/balanceCharge";
import { paymentsGateEnabled } from "@/lib/flags";
import type { Booking } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  // Vercel Cron sends `Authorization: Bearer <CRON_SECRET>` when CRON_SECRET is set.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Not authorized." }, { status: 401 });
  }

  const supabase = createAdminClient();

  const ownerEmailFor = async (ownerId: string): Promise<string | null> => {
    const { data } = await supabase.from("owners").select("email").eq("id", ownerId).maybeSingle();
    return (data as { email: string } | null)?.email ?? null;
  };

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

  // Confirmed (paid) and deposit-paid bookings both need scheduled actions.
  const { data, error } = await supabase
    .from("bookings")
    .select("*")
    .in("status", ["paid", "deposit_paid"]);

  if (error) {
    console.error("reminders cron query failed", error);
    return NextResponse.json({ error: "Query failed." }, { status: 500 });
  }

  const bookings = (data ?? []) as Booking[];

  // ── Owner alerts for unpaid invite offers approaching/passing check-in ──────
  // Separately query offer_sent bookings with check-ins within the alert window
  // (-2 to +2 days) so we catch every case even if a cron run is skipped.
  const windowStart = new Date();
  windowStart.setDate(windowStart.getDate() - 2);
  const windowEnd = new Date();
  windowEnd.setDate(windowEnd.getDate() + 2);
  const { data: unpaidData } = await supabase
    .from("bookings")
    .select("*")
    .eq("status", "offer_sent")
    .gte("check_in", windowStart.toISOString().slice(0, 10))
    .lte("check_in", windowEnd.toISOString().slice(0, 10));

  let ownerUnpaidAlerts = 0;

  for (const b of (unpaidData ?? []) as Booking[]) {
    const days = daysUntil(b.check_in);
    if (!b.owner_id) continue;

    const { data: ownerRow } = await supabase
      .from("owners")
      .select("email")
      .eq("id", b.owner_id)
      .maybeSingle();
    const ownerEmail = (ownerRow as { email: string } | null)?.email;
    if (!ownerEmail) continue;

    const portalLink = `${siteUrl()}/owner`;

    // 1 day before check-in: fire in the 1–2 day window for robustness.
    if (b.owner_unpaid_1day_sent_at === null && days >= 1 && days <= 2) {
      const sent = await sendEmail({
        to: ownerEmail,
        subject: `Guest hasn't paid yet — ${b.property_name} (${formatDate(b.check_in)})`,
        html: `<p>Hi, just a heads up: ${b.guest_name} hasn't completed payment for their stay at ${b.property_name} (${formatDate(b.check_in)} → ${formatDate(b.check_out)}), and check-in is tomorrow. You may want to follow up with them.</p><p><a href="${portalLink}">Open your portal</a></p>`,
      });
      if (sent) {
        await supabase
          .from("bookings")
          .update({ owner_unpaid_1day_sent_at: nowIso })
          .eq("id", b.id);
        ownerUnpaidAlerts++;
      }
    }

    // Day of check-in: fire in the 0–1 day window.
    if (b.owner_unpaid_checkin_sent_at === null && days >= 0 && days <= 1) {
      const sent = await sendEmail({
        to: ownerEmail,
        subject: `Check-in day — payment not received for ${b.property_name}`,
        html: `<p>Today is the check-in date for ${b.guest_name}'s stay at ${b.property_name} (${formatDate(b.check_in)} → ${formatDate(b.check_out)}), but no payment has been received. Consider reaching out to your guest.</p><p><a href="${portalLink}">Open your portal</a></p>`,
      });
      if (sent) {
        await supabase
          .from("bookings")
          .update({ owner_unpaid_checkin_sent_at: nowIso })
          .eq("id", b.id);
        ownerUnpaidAlerts++;
      }
    }

    // 1 day after check-in: fire in the -2 to -1 day window.
    if (b.owner_unpaid_after_sent_at === null && days >= -2 && days <= -1) {
      const sent = await sendEmail({
        to: ownerEmail,
        subject: `Payment still not received — ${b.property_name} (${formatDate(b.check_in)})`,
        html: `<p>The check-in date has passed for ${b.guest_name}'s stay at ${b.property_name} (${formatDate(b.check_in)} → ${formatDate(b.check_out)}) and payment was never received. The offer may have lapsed — check your portal to review.</p><p><a href="${portalLink}">Open your portal</a></p>`,
      });
      if (sent) {
        await supabase
          .from("bookings")
          .update({ owner_unpaid_after_sent_at: nowIso })
          .eq("id", b.id);
        ownerUnpaidAlerts++;
      }
    }
  }

  let reminders = 0;
  let checkins = 0;
  let balanceReminders = 0;
  let balanceCharges = 0;
  let balanceChargeFails = 0;
  let forfeits = 0;

  for (const b of bookings) {
    const days = daysUntil(b.check_in);
    const policy = await effectivePolicyForBooking(supabase, b);

    // ── Deposit-paid: pre-charge reminders, balance auto-charge, forfeiture ──
    if (b.status === "deposit_paid" && b.balance_paid_at === null) {
      const chargeDate = b.balance_charge_date ?? b.balance_due_date;
      if (!chargeDate) continue;
      const forfeitOn = forfeitDeadline(chargeDate);
      const daysToCharge = daysUntil(chargeDate);
      const hasCard = Boolean(b.stripe_customer_id && b.stripe_payment_method_id);

      // Forfeit once the grace window (charge date + 5 days) has fully passed.
      if (daysUntil(forfeitOn) < 0) {
        const { error: upErr } = await supabase
          .from("bookings")
          .update({ status: "forfeited", balance_forfeited_at: nowIso })
          .eq("id", b.id)
          .eq("status", "deposit_paid");
        if (!upErr) {
          forfeits++;
          await sendEmail({
            to: b.guest_email,
            subject: `Reservation released — ${b.property_name}`,
            html: `<p>Hi ${b.guest_name}, the balance for your stay at ${b.property_name} (${formatDate(b.check_in)} → ${formatDate(b.check_out)}) wasn't received by the deadline, so the reservation has been released and the deposit forfeited per your host's policy. If you believe this is a mistake, please reply to this email.</p>`,
            fromName: b.property_name,
          });
          if (b.owner_id) {
            const ownerEmail = await ownerEmailFor(b.owner_id);
            if (ownerEmail) {
              await sendEmail({
                to: ownerEmail,
                subject: `Deposit forfeited — ${b.property_name} (${formatDate(b.check_in)})`,
                html: `<p>${b.guest_name} did not pay the ${formatMoney(b.balance_cents, b.currency)} balance for ${b.property_name} by the deadline. The reservation is released, the dates are free again, and the ${formatMoney(b.deposit_cents, b.currency)} deposit is retained per your policy.</p><p><a href="${siteUrl()}/owner">Open your portal</a></p>`,
              });
            }
          }
        }
        continue;
      }

      if (hasCard && paymentsGateEnabled()) {
        // Pre-charge reminders so the guest is never surprised by the charge.
        if (b.balance_reminder7_sent_at === null && daysToCharge >= 2 && daysToCharge <= 7) {
          const { subject, html } = buildBalanceChargeReminderEmail(b, chargeDate, "in about a week");
          if (await sendEmail({ to: b.guest_email, subject, html, fromName: b.property_name })) {
            await supabase.from("bookings").update({ balance_reminder7_sent_at: nowIso }).eq("id", b.id);
            balanceReminders++;
          }
        }
        if (b.balance_reminder1_sent_at === null && daysToCharge >= 0 && daysToCharge <= 1) {
          const { subject, html } = buildBalanceChargeReminderEmail(b, chargeDate, "tomorrow");
          if (await sendEmail({ to: b.guest_email, subject, html, fromName: b.property_name })) {
            await supabase.from("bookings").update({ balance_reminder1_sent_at: nowIso }).eq("id", b.id);
            balanceReminders++;
          }
        }

        // Auto-charge the balance on/after its charge date (retries daily).
        if (daysToCharge <= 0) {
          const result = await autoChargeBalance(supabase, b);
          if (result.ok) {
            balanceCharges++;
            const portalToken = await ensureGuestPortal(b.guest_email, supabase);
            const { subject, html } = await buildBookingConfirmation(b, "balance", guestPortalUrl(portalToken));
            await sendEmail({ to: b.guest_email, subject, html, fromName: b.property_name });
            if (b.owner_id && b.owner_balance_paid_sent_at === null) {
              const ownerEmail = await ownerEmailFor(b.owner_id);
              if (ownerEmail) {
                const m = buildOwnerBalanceCollectedEmail(b);
                await sendEmail({ to: ownerEmail, subject: m.subject, html: m.html });
                await supabase.from("bookings").update({ owner_balance_paid_sent_at: nowIso }).eq("id", b.id);
              }
            }
          } else {
            balanceChargeFails++;
            // Tell the guest once that the charge failed (pay link + deadline).
            if (b.balance_reminder_sent_at === null) {
              const { subject, html } = buildBalanceChargeFailedEmail(b, forfeitOn);
              if (await sendEmail({ to: b.guest_email, subject, html, fromName: b.property_name })) {
                await supabase.from("bookings").update({ balance_reminder_sent_at: nowIso }).eq("id", b.id);
              }
            }
            // Tell the owner once, a day past the charge date.
            if (b.owner_id && b.owner_balance_failed_sent_at === null && daysToCharge <= -1) {
              const ownerEmail = await ownerEmailFor(b.owner_id);
              if (ownerEmail) {
                const m = buildOwnerBalancePastDueEmail(b, forfeitOn);
                await sendEmail({ to: ownerEmail, subject: m.subject, html: m.html });
                await supabase.from("bookings").update({ owner_balance_failed_sent_at: nowIso }).eq("id", b.id);
              }
            }
          }
        }
      } else {
        // No saved card (legacy bookings): overdue reminder + manual pay link.
        if (b.balance_reminder_sent_at === null && daysToCharge <= 0) {
          const { subject, html } = buildBalanceReminderEmail(b, forfeitOn);
          if (await sendEmail({ to: b.guest_email, subject, html, fromName: b.property_name })) {
            await supabase.from("bookings").update({ balance_reminder_sent_at: nowIso }).eq("id", b.id);
            balanceReminders++;
          }
        }
      }
      continue;
    }

    if (b.status !== "paid" || days < 0) continue;

    // 7-day reminder: fire once in the 3–7 day window (robust to missed runs).
    if (b.reminder7_sent_at === null && days >= 3 && days <= 7) {
      const portalToken = await ensureGuestPortal(b.guest_email, supabase);
      const portalUrl = guestPortalUrl(portalToken);
      const { subject, html } = buildReminderEmail(b, portalUrl);
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

    // Check-in email: fire once within the owner's configured window.
    if (b.checkin_sent_at === null && days <= policy.checkin_email_days) {
      const { subject, html } = await buildCheckinForBooking(b);
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

  // ── Escrow release: transfer the owner's share once the stay has started ────
  // Funds are held on the platform until check-in, then released to the owner's
  // connected account. releaseBookingPayout is idempotent (guarded + idempotency
  // key), so re-runs are safe.
  let payouts = 0;
  if (paymentsGateEnabled()) {
    for (const b of bookings) {
      if (b.payout_released_at) continue;
      if (daysUntil(b.check_in) > 0) continue; // not yet check-in day
      const res = await releaseBookingPayout(supabase, b);
      if (res.ok) payouts++;
    }
  }

  return NextResponse.json({
    ok: true,
    reminders,
    checkins,
    balanceReminders,
    balanceCharges,
    balanceChargeFails,
    forfeits,
    expired,
    ownerUnpaidAlerts,
    payouts,
  });
}
