---
pdf_options:
  margin:
    top: 30mm
    bottom: 25mm
    left: 22mm
    right: 22mm
  displayHeaderFooter: true
  headerTemplate: "<span></span>"
  footerTemplate: "<div style='font-size:9px; color:#8a7e72; width:100%; text-align:center; padding:0 40px;'>Familiar Guest — Product Feature Brief (Mexico) &nbsp;&nbsp;|&nbsp;&nbsp; Confidential</div>"
stylesheet: https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@300;400;500;600&display=swap
---

<style>
  body { font-family: 'Hanken Grotesk', sans-serif; color: #2A241E; line-height: 1.6; font-size: 12.5px; }
  h1, h2, h3, h4 { font-family: 'Fraunces', serif; color: #14543F; }
  h1 { font-size: 29px; margin-bottom: 2px; }
  h2 { font-size: 18px; border-bottom: 2px solid #E6DBCB; padding-bottom: 6px; margin-top: 26px; }
  h3 { font-size: 14px; color: #C0673E; margin-top: 18px; margin-bottom: 6px; }
  h4 { font-size: 13px; color: #14543F; margin-top: 12px; margin-bottom: 4px; }
  table { font-size: 11px; border-collapse: collapse; width: 100%; margin: 12px 0; }
  th { background-color: #14543F; color: white; padding: 7px 9px; text-align: left; font-weight: 500; }
  td { padding: 6px 9px; border-bottom: 1px solid #E6DBCB; vertical-align: top; }
  tr:nth-child(even) { background-color: #FBF6EE; }
  .subtitle { font-size: 15px; color: #C0673E; font-weight: 500; margin-bottom: 18px; }
  .lead { font-size: 13.5px; line-height: 1.7; color: #3d362e; }
  .callout { background-color: #FBF6EE; border-left: 4px solid #14543F; padding: 12px 16px; margin: 14px 0; border-radius: 0 6px 6px 0; }
  .callout p { margin: 4px 0; }
  .warn { background-color: #fbf0ea; border-left: 4px solid #C0673E; padding: 12px 16px; margin: 14px 0; border-radius: 0 6px 6px 0; }
  .warn p { margin: 4px 0; }
  .highlight-box { background-color: #14543F; color: white; padding: 16px 20px; border-radius: 6px; margin: 16px 0; }
  .highlight-box p { margin: 4px 0; color: white; }
  .highlight-box strong { color: #e8d5b7; }
  strong { color: #14543F; }
  hr { border: none; border-top: 1px solid #E6DBCB; margin: 22px 0; }
  ul { padding-left: 18px; margin: 6px 0; }
  li { margin-bottom: 4px; }
  .page-break { page-break-before: always; }
  .check { color: #14543F; font-weight: 700; }
  .dash { color: #c9bfae; }
  .pill { background:#14543F; color:white; font-size:9px; padding:1px 7px; border-radius:8px; text-transform:uppercase; letter-spacing:0.5px; }
  .pill-x { background:#C0673E; color:white; font-size:9px; padding:1px 7px; border-radius:8px; text-transform:uppercase; letter-spacing:0.5px; }
  .price-card { border: 1px solid #E6DBCB; border-radius: 8px; padding: 14px 16px; }
  .price-name { font-family:'Fraunces',serif; font-size:16px; color:#14543F; font-weight:600; }
  .price-amt { font-family:'Fraunces',serif; font-size:22px; color:#C0673E; font-weight:700; }
</style>

# Product Feature Brief

<div class="subtitle">Familiar Guest for the Mexico market — built for US & Canadian homeowners</div>

<p class="lead">Familiar Guest lets US and Canadian homeowners who own rental property in Mexico take bookings directly from their own repeat and trusted guests — keeping the guest relationship and the revenue that Airbnb's ~15.5% fee takes away. This brief defines the full feature set for launch and a recommended pricing plan.</p>

<div class="highlight-box">
<p><strong>Positioning:</strong> owner-first, repeat-guest-focused, invisible infrastructure (the booking page carries the owner's property name), simple to start, and trust built in by default. For this market the edge is <strong>cross-border</strong>: clean money movement, two languages, and trust strong enough to book a home in another country.</p>
</div>

---

## Who It's For

- **Owners:** US and Canadian individuals who own one or a few homes in Mexico (initial beachhead: the Todos Santos · Los Cabos · La Paz corridor in Baja California Sur). They already rent on Airbnb and have a base of return guests.
- **Guests:** travelers from the US, Canada, and Mexico — including snowbirds on long winter stays and Spanish-first Mexican nationals.

---

## Feature Set

Features are grouped by function. Each is marked <span class="pill">core</span> (original product) or <span class="pill-x">cross-border</span> (the six Mexico-market additions).

### A. Effortless Onboarding
- <span class="pill">core</span> **Photo upload** — phone (QR/text-a-link), cloud storage (Google Photos, iCloud, Drive, Dropbox OAuth), and drag-and-drop. *No Airbnb scraping; owner-provided content only.*
- <span class="pill">core</span> **AI-written listing** — owner pastes their own text or answers a few prompts; AI produces a polished title, description, and amenity list to edit.
- <span class="pill">core</span> **Owner identity verification (Gate 1)** — Stripe-powered KYC; required before listing or collecting payment.
- <span class="pill">core</span> **Property ownership verification (Gate 2)** — for public listings; accepts Mexico-appropriate proof including **fideicomiso (bank trust)** and Mexican-corporation documents. Unlocks the Verified Owner badge and public mode.
- <span class="pill-x">cross-border</span> **Bilingual setup (EN/ES)** — the owner works in English; the listing publishes in both English and Spanish.

### B. Calendar & Availability
- <span class="pill">core</span> **Inbound iCal sync** — paste export URLs from Airbnb, VRBO, Booking.com, Google/Apple Calendar, and PMS tools; refreshed every 15–30 min.
- <span class="pill">core</span> **Outbound .ics feed** — a unique export URL per listing for other platforms to read.
- <span class="pill">core</span> **"Last synced" timestamp** — sets clear expectations (iCal is near-real-time, not instant).

### C. Booking Experience (Guest-Facing)
- <span class="pill">core</span> **Private branded booking link** — carries the property's name, not ours; works on mobile; no guest account required.
- <span class="pill-x">cross-border</span> **Bilingual booking page + AI-translated messaging** — guest and owner each communicate in their own language; AI translates both ways in real time.
- <span class="pill-x">cross-border</span> **Multi-currency display** — prices shown in the guest's currency (USD / CAD / MXN), all-in and transparent.
- <span class="pill-x">cross-border</span> **Long-stay support** — weekly and monthly rates for snowbird stays.
- <span class="pill-x">cross-border</span> **Installment payments** — deposit now, balance before arrival (or split a long stay), reducing friction on large bookings.
- <span class="pill">core</span> **Rental agreement** — auto-generated per booking (DocuSeal), signed digitally before payment clears; stored permanently.

<div class="page-break"></div>

### D. Payments, Escrow & Cross-Border Money
- <span class="pill">core</span> **Stripe Connect (Custom)** — owners are paid "by Familiar Guest"; Stripe stays invisible and handles KYC and payee compliance.
- <span class="pill">core</span> **Escrow** — guest funds held until check-in via delayed payout. The cornerstone trust feature.
- <span class="pill">core</span> **Damage deposit** — held separately, released automatically after the inspection window.
- <span class="pill-x">cross-border</span> **Cross-border payouts** — owner chooses payout currency and destination bank (US, Canada, or Mexico).
- <span class="pill">core</span> **Fees at cost** — card processing **and** currency conversion passed through to the owner at cost; net-zero to us.
- <span class="pill">core</span> **Free bookings** — owner marks a booking free (friends/family); charged $5 from card on file. Card on file only required if this is enabled.

### E. Trust & Safety
- <span class="pill">core</span> **Verified Owner badge** — every owner identity-verified via Stripe as a condition of payout.
- <span class="pill-x">cross-border</span> **Cross-border trust framing** — escrow + verification + coverage packaged and messaged as *"safe to book a home in Mexico."*
- <span class="pill">core</span> **Guest screening** *(add-on)* — ID + fraud check via Truvi (supports Mexico).
- <span class="pill">core</span> **Protected booking** *(add-on)* — screening plus up to $1M damage protection via Truvi.

### F. Owner Operations (Remote / Absentee)
- <span class="pill-x">cross-border</span> **Caretaker role** — a scoped, limited-access login for the local cleaner/caretaker (sees bookings, dates, prep tasks; never payments or the full guest list).
- <span class="pill-x">cross-border</span> **Digital check-in** — automated check-in instructions and lockbox/smart-code support for self-arrival.
- <span class="pill">core</span> **Two booking modes** — trusted-guest mode (after Gate 1) and public mode (after Gate 2).

### G. Guest Relationship & Retention
- <span class="pill">core</span> **Private Guest CRM** — directory with contact, stay history, notes, preferences, and trust tiers (vetted / returning / referral). Owned by the owner, never shared.
- <span class="pill-x">cross-border</span> **Guest import + season-timed re-invite** — import past guests (contacts/spreadsheet) and auto-send "book again" invites timed to the Nov–Apr high season.
- <span class="pill">core</span> **One-click rebook** — post-checkout "same dates next year?" with details pre-filled.
- <span class="pill">core</span> **Referral system** — a trusted guest shares a link; the new guest is pre-vetted by association.
- <span class="pill">core</span> **Automated messaging (bilingual)** — confirmation, pre-arrival, check-in, mid-stay, checkout, deposit-release, via Resend.

### H. Digital House Manual
- <span class="pill">core</span> **Private link** — accessible without an app; updated once, delivered forever.
- <span class="pill-x">cross-border</span> **Baja-specific templates** — water/cistern, drinking water, power/blackouts, 4×4 roads, nearest services, emergency contacts, and useful Spanish phrases.

### I. Owner Insights
- <span class="pill">core</span> **Income summary** — total income, nights booked, occupancy, top guests; export-ready.
- <span class="pill">core</span> **Consolidated multi-property view** — across all of an owner's listings (Pro plan).

<div class="warn">
<p><strong>Not in this release:</strong> the cross-border tax helper (US/Canada vs. Mexican ISR/IVA/ISH reconciliation) is intentionally excluded for now due to complexity and liability. Income exports give owners and their accountants the raw data; Familiar Guest does not provide tax advice.</p>
</div>

<div class="page-break"></div>

## Recommended Pricing Plan

Plans are priced in **USD** (owners are US/Canadian and think in dollars). Card processing and currency conversion are always passed through at cost on every plan.

<table>
<tr><th>&nbsp;</th><th>Pay-as-you-go</th><th>Solo</th><th>Pro</th></tr>
<tr><td><strong>Price</strong></td><td>5% per paid booking<br>+ fees at cost</td><td><strong>$29</strong> / month</td><td><strong>$59</strong> / month</td></tr>
<tr><td>Best for</td><td>Seasonal / testing</td><td>Active single-home owners</td><td>Multi-property owners</td></tr>
<tr><td>Properties</td><td>Unlimited (pay per booking)</td><td>1</td><td>Up to 5</td></tr>
<tr><td>Commission</td><td>5% per paid booking</td><td class="check">None</td><td class="check">None</td></tr>
<tr><td>Free bookings</td><td>$5 each</td><td class="check">Included</td><td class="check">Included</td></tr>
<tr><td>Multi-currency + cross-border payouts</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td></tr>
<tr><td>Bilingual booking + AI translation</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td></tr>
<tr><td>Escrow + Verified Owner</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td></tr>
<tr><td>Rental agreement (e-sign)</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td></tr>
<tr><td>Calendar sync (iCal)</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td></tr>
<tr><td>Long-stay rates + installments</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td></tr>
<tr><td>Guest CRM + season re-invite</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td></tr>
<tr><td>Automated bilingual messaging</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td></tr>
<tr><td>Digital house manual (Baja templates)</td><td class="check">✓</td><td class="check">✓</td><td class="check">✓</td></tr>
<tr><td>Caretaker seats</td><td>1</td><td>1</td><td>5</td></tr>
<tr><td>Consolidated multi-property reports</td><td class="dash">—</td><td class="dash">—</td><td class="check">✓</td></tr>
<tr><td>Priority support</td><td class="dash">—</td><td class="dash">—</td><td class="check">✓</td></tr>
</table>

### Add-ons (any plan)

| Add-on | Price | What the guest gets |
|---|---|---|
| **Guest Screening** | $5 per booking | ID verification + fraud check (Truvi) |
| **Protected Booking** | $19.99 per booking | Screening + up to $1M damage protection (Truvi) |

### Pricing logic

- **Every core and cross-border feature is available on every plan.** Trust and money-movement are the product — paywalling them would undercut the value proposition. Plans differ on **commission vs. flat fee, property count, caretaker seats, and reporting/support.**
- **The crossover:** an owner books more than ~$7,000/year through Familiar Guest should move from Pay-as-you-go (5%) to Solo ($348/yr). Given Los Cabos/Baja nightly rates, most active owners cross this quickly — which steers the base toward predictable subscription revenue.
- **Annual option:** offer ~2 months free on annual billing (Solo $290/yr, Pro $590/yr) to improve retention and cash flow.
- **Fees at cost:** card + FX passed through with no markup preserves the trust positioning. *(A modest FX spread is a possible future revenue line, but not at launch.)*

<div class="callout">
<p><strong>Why this works for the Mexico market:</strong> the owner keeps essentially all of their nightly rate (vs. losing ~15.5% to Airbnb), pays only a small flat fee or commission, and gets cross-border payments, bilingual booking, and a built-in trust layer that a DIY site or a Venmo request can never match.</p>
</div>

---

## Launch Scope Summary

| Included at launch | Deferred (post-launch) |
|---|---|
| All core features + the 6 cross-border features above | Cross-border tax helper |
| Trusted-guest + public modes | Platform-backed booking guarantee (needs funded reserve) |
| Truvi screening & damage coverage (add-ons) | Guest "trust passport" / portable reputation |
| Three-tier pricing + two add-ons | Double-booking radar, owner-owned reviews (next iteration) |

---

<div style="text-align: center; margin-top: 26px; color: #8a7e72; font-size: 11px;">
familiarguest.com &nbsp;&nbsp;|&nbsp;&nbsp; June 2026
</div>
