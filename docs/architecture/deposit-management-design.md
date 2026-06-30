# Deposit Management — Simplified Design

> **Status:** Draft for review · **Author:** Claude Code · **Date:** 2026-06-30
> **Area:** Payments / money-movement (safety-critical — flagged for contract review in `CLAUDE.md`)
> **Goal:** Simplify deposit handling to two owner settings, auto-charge the balance from a saved card, and reassure the guest with clear, scheduled notifications.

---

## 1. Objective

Make deposits effortless for the owner and predictable for the guest:

- **Owner sets two numbers, not four.** Deposit percentage and how many days before check-in the balance is collected.
- **The balance is collected automatically** from the card the guest used at booking — no chasing, no "pay your balance" link the guest has to remember to click.
- **The guest is told exactly what will be charged and when**, repeatedly, before it happens.

**New defaults (this revision):** **25% deposit**, **balance auto-charged 45 days before check-in.**

---

## 2. Current model (what we're replacing)

Today's policy (`lib/policies.ts`, `OwnerPolicy`) carries four deposit-related knobs:

| Field | Default | Meaning |
|---|---|---|
| `deposit_pct` | 25 | Deposit as % of total |
| `deposit_required_days` | 30 | Stay must be ≥ this many days out for a deposit to apply |
| `full_payment_due_days` | 15 | Balance due this many days before check-in |
| (derived) forfeit grace | +5 | `forfeitDeadline = balance_due_date + 5 days` |

**How it works now:** `depositPlanFor()` splits the payment if the stay is ≥ `deposit_required_days` away. The guest pays the deposit, the booking goes to `deposit_paid`, and the guest **must return and pay the balance via a pay link**. The `cron/reminders` job sends one overdue reminder on/after the due date and, if still unpaid past the grace window, flips the booking to `forfeited` and the owner keeps the deposit.

**Problems:**
- Two separate date knobs (`deposit_required_days`, `full_payment_due_days`) that owners conflate.
- Balance collection is **guest-initiated** → missed payments, forfeitures, awkward owner follow-up, lost bookings.
- Reminders fire **after** the due date (collection-chasing), not before (reassurance).

---

## 3. Proposed model

### 3.1 Two owner settings

| Setting | Default | Notes |
|---|---|---|
| **Deposit %** (`deposit_pct`) | **25%** | 0 disables deposits (full payment always due at booking) |
| **Balance lead days** (`balance_lead_days`) | **45** | Balance is auto-charged this many days before check-in |

Everything else is **derived**:

- **Deposit-eligibility cutoff = `balance_lead_days`.** A booking only splits into deposit + balance when it is made **more than `balance_lead_days` before check-in**. This replaces the separate `deposit_required_days` knob — they are the same date.
- **Balance charge date = `check_in − balance_lead_days`.**

### 3.2 Decision at booking time

```
total = stay total (cents)
leadDays = policy.balance_lead_days        // default 45
depositPct = policy.deposit_pct            // default 25

if depositPct == 0 OR daysUntil(check_in) <= leadDays:
    → collect FULL payment now             // too close to bother splitting
else:
    deposit = round(total * depositPct/100)
    balance = total - deposit
    balanceChargeDate = check_in - leadDays
    → collect deposit now, SAVE CARD, schedule auto-charge of balance on balanceChargeDate
```

**Worked examples** (25% / 45 days, $2,400 stay):

| Booked | Behavior | At booking | Later |
|---|---|---|---|
| 90 days out | Split | $600 now | $1,800 auto-charged on day −45 |
| 50 days out | Split | $600 now | $1,800 auto-charged on day −45 (in 5 days) |
| 45 days out | **Full** | $2,400 now | — |
| 10 days out | **Full** | $2,400 now | — |

> Note: the comparison uses `<=` so that bookings exactly at the lead-day boundary pay in full (no near-instant second charge).

---

## 4. Auto-charge design (Stripe Connect)

This is the core new capability and the main implementation effort.

### 4.1 Saving the card at booking
- The deposit PaymentIntent is created with the customer's PaymentMethod **saved for future off-session use** (Stripe `setup_future_usage: "off_session"`, or a SetupIntent alongside the deposit charge).
- We store the resulting `payment_method` id and `customer` id on the booking (or a related record) so the balance can be charged later without the guest present.
- **Consent/mandate:** at checkout the guest must see explicit text and agree, e.g.
  > *"You're paying a 25% deposit of $600 today. The remaining **$1,800** will be **automatically charged to this card on February 14, 2026**. We'll remind you before then."*
  This disclosure is both a trust feature and a card-network/Stripe requirement for saved-card future charges.

### 4.2 Charging the balance
- A scheduled job (extend `app/api/cron/reminders`) finds `deposit_paid` bookings whose `balance_charge_date <= today` and `balance_paid_at is null`, and creates an **off-session** PaymentIntent for `balance_cents` on the saved method (on the owner's connected account, same as the deposit).
- On success → booking to `paid`, set `balance_paid_at`, send the guest a paid-in-full receipt, notify the owner.
- Funds continue to follow the existing **escrow** model (delayed payout, released at check-in) — auto-charging earlier changes *when money is collected*, not *when the owner is paid*.

### 4.3 Failure handling (required)
Off-session charges fail in real cases — expired cards, insufficient funds, and **3DS/SCA authentication** that the bank requires (common for European/Asian cards, directly relevant to our cross-border guests).

- On a failed/`requires_action` charge:
  1. Keep the booking `deposit_paid` (dates still held).
  2. Immediately email + SMS the guest a **secure pay link** to authenticate/complete the balance, with the deadline stated.
  3. Retry on a short schedule (e.g. day 0, +2, +4) and/or rely on the guest link.
  4. If still unpaid past a **grace window** (e.g. `balance_charge_date + N days`, configurable; default keeps today's `+5`), apply the existing forfeiture path (release dates, retain deposit per policy) **or** notify the owner to decide — see Open Questions.
- This preserves a manual fallback so a saved-card edge case never silently loses a booking.

---

## 5. Booking lifecycle

```
offer_sent ──pay deposit──▶ deposit_paid ──auto-charge OK──▶ paid ──checkin──▶ payout released
                               │
                               ├─ auto-charge fails ─▶ (retry + guest pay link) ─▶ paid
                               │
                               └─ unpaid past grace ─▶ forfeited (dates freed, deposit retained)

offer_sent ──pay in full──▶ paid           (when booked ≤ balance_lead_days out, or deposit_pct = 0)
```

No new statuses are required; `deposit_paid`, `paid`, and `forfeited` already exist (`lib/types.ts`). The change is that the `deposit_paid → paid` transition becomes **system-driven (auto-charge)** instead of guest-driven.

---

## 6. Notification schedule

Delivered over the existing channels (Resend email, Twilio SMS/WhatsApp); guest messages bilingual EN/ES.

### 6.1 Guest (reassurance)

| When | Message |
|---|---|
| **At booking** (deposit paid) | "You paid **$600** today. Your remaining **$1,800** will be charged automatically on **Feb 14, 2026** to your card ending **4242**. We'll remind you beforehand." |
| **7 days before charge** | "Heads up: your balance of **$1,800** for **[property]** will be charged on **Feb 14** to the card on file." |
| **1 day before charge** *(optional)* | Short reminder of date + amount. |
| **On successful charge** | "Paid in full — your **[property]** stay is fully confirmed. Receipt attached." |
| **On failed charge** | "We couldn't charge your card for the **$1,800** balance. Please complete it here **[link]** by **[grace deadline]** to keep your reservation." |

The guest learns the exact date and amount **three times before any money moves** — no surprises.

### 6.2 Owner (visibility)

The owner is emailed at every money movement on a booking (email is the channel owners watch for booking activity):

| When | Email to owner |
|---|---|
| **Booking confirmed** (deposit paid) | "New booking: **[property]**, [dates]. **Deposit of $600 collected today.** Remaining **$1,800** is scheduled to auto-charge on **Feb 14, 2026**." — the **deposit payment is itemized in the booking email**, alongside the scheduled balance. |
| **Full payment made** (balance collected) | "**Balance collected** — **$1,800** charged for **[property]** ([dates]). This booking is now **paid in full**." |
| **Balance 1 day past due** (declined / cancelled / failed charge) | "Heads up: the **$1,800** balance for **[property]** ([dates]) was **not collected** — the card was declined or the charge didn't go through. We've asked the guest to complete it by **[grace deadline]**; the dates are still held for now." Sent the day after the charge date when `balance_paid_at` is still null. |
| **Deposit forfeited** (unpaid past grace) | *(existing)* "Balance never paid — reservation released, dates free, deposit retained per your policy." |

For full-payment-at-booking cases (booked ≤ `balance_lead_days` out, or `deposit_pct = 0`), the booking email shows the **full amount collected** instead of a deposit + scheduled balance.

So the owner sees: the deposit (or full payment) at booking, a confirmation when the balance clears, and a day-one alert whenever a balance is **declined or cancelled** — catching problems before the booking is at risk.

---

## 7. Owner experience

### 7.1 Settings

Settings UI (`SettingsTab` / `PoliciesTab`) collapses to:

- **Deposit:** `[ 25 ]%` of the booking total *(set to 0 to always collect full payment up front)*
- **Collect the balance:** `[ 45 ]` days before check-in *(we charge the guest's card automatically and remind them in advance)*

Helper copy makes the derived behavior explicit: *"Bookings made fewer than 45 days before check-in are charged in full at booking."*

Per-property overrides continue to work via the existing `effectivePolicy` override fields.

### 7.2 Booking view — payments, dates & proof of payment

Each booking in the owner portal shows a **payment record** the owner can rely on for their books and for any guest dispute:

- **Payments ledger** — one row per transaction (deposit, balance, and any refund), each with:
  - amount + currency
  - date/time collected
  - **Stripe transaction ID** (PaymentIntent / charge id) as **proof of payment**
  - card brand + last 4, and status (succeeded / failed / refunded)
- **Key dates** — booked, deposit paid, balance charge date (scheduled, then actual), check-in / check-out, and payout released.
- **Outstanding** — when a booking is `deposit_paid`, show the scheduled balance amount and auto-charge date prominently; if a charge has failed, show the failure + the grace deadline.

Transaction IDs are read from the stored Stripe PaymentIntent/charge ids (see §8). They double as the per-booking records that feed the **Rental Income & Tax Accounting** differentiator, so the owner can reconcile every dollar against Stripe and their bank.

---

## 8. Data model / migration

- **Add** `balance_lead_days` to `owner_policies` (and the per-property/per-booking override columns mirroring the existing pattern). Backfill = existing `full_payment_due_days` value, or default 45.
- **Card-on-file:** persist `stripe_customer_id` and `stripe_payment_method_id` (or equivalent) on the booking for off-session balance charges. Confirm against the "no sensitive card data on our servers" rule — we store **Stripe tokens/ids only**, never PAN.
- **Proof of payment:** persist the **PaymentIntent / charge id** for each transaction — deposit, balance, and any refund — plus card brand/last4 and status, so the owner booking view (§7.2) can show transaction IDs and the accounting layer can reconcile. A small `booking_payments` child table (booking_id, kind, amount, currency, stripe_id, status, created_at) is cleaner than widening `bookings`. Stripe ids only, never card data.
- **Deprecate** `deposit_required_days` (derive from `balance_lead_days`). Keep `full_payment_due_days` as an alias during migration, then remove. `forfeit` grace stays (rename to a `balance_grace_days`, default 5).
- New timestamp columns as needed: `balance_charge_attempted_at`, `balance_charge_failed_at`, plus reuse `balance_paid_at`, `balance_reminder_sent_at`.

A migration must reconcile in-flight `deposit_paid` bookings (created under the old guest-initiated flow) — they likely **lack a saved card**, so they should fall back to the **pay-link** path rather than auto-charge. Gate auto-charge on "has a saved payment method."

---

## 9. Interaction with cancellation / refunds

Deposits (collection) and cancellation (refunds) stay **separate concerns**:
- Refund tiers (`refund_100_days` / `refund_50_days`, `computeRefund`) are unchanged.
- If a guest cancels after the balance was auto-charged, the existing refund logic computes what's owed against **what was actually collected** (`paidAmountCents`), which now may be the full amount — no special-casing needed.
- The recently added rule "date changes only within the cancellation window" is unaffected.

---

## 10. Implementation phases

1. **Settings + derivation (no card-on-file yet):** add `balance_lead_days`, collapse the UI to two knobs, derive the deposit-eligibility cutoff. Balance still collected via pay link + pre-charge reminders. *Low risk, ships value immediately.*
2. **Card-on-file + auto-charge:** SetupIntent/`setup_future_usage`, store tokens, off-session balance PaymentIntent in the cron, success/receipt path. *Safety-critical — contract review.*
3. **Failure & SCA fallback:** retries, guest pay-link on failure, grace-window forfeiture, owner alerts.
4. **Notification schedule:** guest pre-charge disclosure, −7d and −1d reminders, success/failure messages (EN/ES, email + SMS); **owner emails** for deposit-at-booking (itemized), balance-collected, and balance-1-day-past-due.
5. **Owner booking view — payment ledger:** per-booking payments/dates with Stripe transaction IDs as proof of payment (depends on the transaction ids stored in phase 2).

---

## 11. Open questions / risks

- **Grace-window outcome on persistent failure:** auto-forfeit (current behavior) vs. notify the owner to choose? Forfeiture is cleaner; owner-decides is gentler. *Recommend: keep auto-forfeit after the grace window, owner notified at each step.*
- **SCA-heavy markets:** what share of guests use cards that will require 3DS off-session? If high, the pay-link fallback becomes the common path, not the exception — worth measuring early.
- **Refund of an auto-charged balance** must go back to the same PaymentIntent(s); confirm Stripe Connect refund routing on the connected account.
- **Mandate text** wording should be reviewed against Stripe's saved-card requirements and the bilingual booking terms.
- **Idempotency:** the balance auto-charge must be idempotent (idempotency key per booking+date) so a double cron run can't double-charge.

---

## 12. Summary

Two owner knobs (**25% deposit / balance 45 days out**), automatic balance collection from a saved card, and a before-the-fact notification schedule. It removes the `deposit_required_days` knob, turns balance collection from a guest chore into a system action, and reframes reminders from chasing payment to reassuring the guest — while keeping escrow, refunds, and the no-card-data rule intact. The owner is emailed at each money movement (deposit at booking, paid-in-full, and a day-one alert if a balance is declined or cancelled) and sees a per-booking payment ledger with Stripe transaction IDs as proof of payment.
