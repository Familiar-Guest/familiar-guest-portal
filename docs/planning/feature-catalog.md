---
pdf_options:
  margin:
    top: 24mm
    bottom: 18mm
    left: 18mm
    right: 18mm
  displayHeaderFooter: true
  headerTemplate: "<span></span>"
  footerTemplate: "<div style='font-size:9px; color:#8a7e72; width:100%; text-align:center; padding:0 40px;'>Familiar Guest — Feature Catalog &nbsp;|&nbsp; Confidential</div>"
stylesheet: https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap
---

<style>
  body { font-family: 'Hanken Grotesk', sans-serif; color: #2A241E; line-height: 1.45; font-size: 11px; }
  h1, h2, h3 { font-family: 'Fraunces', serif; color: #14543F; }
  h1 { font-size: 27px; margin-bottom: 2px; }
  h2 { font-size: 15.5px; border-bottom: 2px solid #E6DBCB; padding-bottom: 4px; margin-top: 18px; }
  .subtitle { font-size: 14px; color: #C0673E; font-weight: 500; margin-bottom: 12px; }
  .lead { font-size: 12px; color: #3d362e; }
  table { font-size: 10px; border-collapse: collapse; width: 100%; margin: 7px 0; }
  th { background-color: #14543F; color: white; padding: 5px 8px; text-align: left; font-weight: 500; }
  td { padding: 4px 8px; border-bottom: 1px solid #E6DBCB; vertical-align: top; }
  tr:nth-child(even) { background-color: #FBF6EE; }
  strong { color: #14543F; }
  .legend { background:#FBF6EE; border-left:4px solid #14543F; padding:9px 13px; margin:10px 0; border-radius:0 6px 6px 0; font-size:11px; }
  .legend p { margin:2px 0; }
  .tag { font-weight:700; font-size:9px; padding:1px 6px; border-radius:8px; white-space:nowrap; }
  .core { background:#14543F; color:#fff; }
  .new { background:#C0673E; color:#fff; }
  .grpnum { color:#C0673E; }
  hr { border:none; border-top:1px solid #E6DBCB; margin:12px 0; }
  .page-break { page-break-before: always; }
</style>

# Feature Catalog

<div class="subtitle">All Familiar Guest features, grouped by type — plus gaps the grouping reveals</div>

<p class="lead">A complete inventory of every feature discussed so far, organized into functional groups. Grouping is deliberate: it surfaces the missing pieces each area needs. Use it as the master backlog and to drive scoping.</p>

<div class="legend">
<p><span class="tag core">CORE</span> &nbsp;Already defined/in scope from prior docs (positioning, product brief, solution design, compliance).</p>
<p><span class="tag new">NEW</span> &nbsp;Surfaced by this grouping exercise — proposed for consideration, not yet committed.</p>
</div>

---

## 1 · <span class="grpnum">Owner Registration &amp; Onboarding</span>

| Feature | Status | Notes |
|---|---|---|
| Email magic-link signup | <span class="tag core">CORE</span> | No passwords |
| Owner identity verification (Stripe KYC, Gate 1) | <span class="tag core">CORE</span> | Required before listing/collecting |
| Property ownership verification (Gate 2) | <span class="tag core">CORE</span> | Accepts fideicomiso/escritura (MX) + deed/tax doc (US) |
| Payout bank setup (US/CA/MX) | <span class="tag core">CORE</span> | Via Stripe Connect |
| Tax forms — W-9 (US) / W-8BEN (non-US) | <span class="tag core">CORE</span> | Compliance |
| Local STR-compliance attestation | <span class="tag core">CORE</span> | Owner attests permits/registration |
| Owner profile &amp; preferences (currency, language, payout) | <span class="tag new">NEW</span> | Defaults that flow through the product |
| Onboarding progress checklist | <span class="tag new">NEW</span> | Guides owner to "live" |
| Co-owner / multi-owner access | <span class="tag new">NEW</span> | Compounds with multiple owners |
| Owner-to-owner referral | <span class="tag new">NEW</span> | Growth loop |

## 2 · <span class="grpnum">Rental Unit Setup (in famguest)</span>

| Feature | Status | Notes |
|---|---|---|
| Listing creation form | <span class="tag core">CORE</span> | Title, description, capacity, beds/baths |
| Photo upload (phone, cloud OAuth, drag-drop) | <span class="tag core">CORE</span> | Owner-provided only (no scraping) |
| AI-written listing description | <span class="tag core">CORE</span> | From owner text/prompts |
| GPS coordinates (required for Mexico) | <span class="tag core">CORE</span> | Addresses unreliable; powers maps/directions |
| Amenities, house rules, capacity | <span class="tag new">NEW</span> | Structured fields |
| Digital house manual (incl. Baja templates) | <span class="tag core">CORE</span> | WiFi, codes, parking, local recs |
| Damage-deposit amount config | <span class="tag core">CORE</span> | Per unit |
| Cancellation policy selection | <span class="tag new">NEW</span> | Flexible/moderate/strict |
| Cleaning fee / extra-guest fee config | <span class="tag new">NEW</span> | Per-booking fees |
| Min/max nights, gaps, blackout dates | <span class="tag new">NEW</span> | Availability rules |
| Unit-level tax settings (rates by jurisdiction) | <span class="tag new">NEW</span> | Feeds tax accounting |
| Multi-unit / compound management | <span class="tag core">CORE</span> | Many units, one account |

## 3 · <span class="grpnum">Calendar &amp; Availability</span>

| Feature | Status | Notes |
|---|---|---|
| Inbound iCal import (Airbnb/VRBO/Booking.com/PMS) | <span class="tag core">CORE</span> | Refreshed 15–30 min |
| Outbound .ics feed per listing | <span class="tag core">CORE</span> | Others import it |
| "Last synced" timestamp | <span class="tag core">CORE</span> | Sets expectations |
| Manual block / unblock dates | <span class="tag new">NEW</span> | Owner control |
| Double-booking radar / conflict alerts | <span class="tag new">NEW</span> | Turns iCal lag into a trust feature |
| Seasonal availability windows | <span class="tag new">NEW</span> | Open only Nov–Apr, etc. |

## 4 · <span class="grpnum">Pricing, Promotions &amp; Plans</span>

| Feature | Status | Notes |
|---|---|---|
| Plan tiers — PAYG 5% / Starter $15 / Host $29 / Pro $49 | <span class="tag core">CORE</span> | All-features-on-all-plans |
| Add-ons — Guest Screening $5, Protected Booking $19.99 | <span class="tag core">CORE</span> | Per booking |
| Annual billing (~2 months free) | <span class="tag core">CORE</span> | Retention/cash flow |
| Card + FX passed at cost; optional FX spread | <span class="tag core">CORE</span> | FX spread = future revenue |
| Free-booking mechanic ($5 friends/family) | <span class="tag core">CORE</span> | Owner card on file |
| **Promo code engine** (%/fixed/free; expiry; usage limits) | <span class="tag new">NEW</span> | Requested — different price tiers incl. free/comped |
| Owner-set guest discounts (returning, long-stay, last-minute) | <span class="tag new">NEW</span> | Owner-controlled price tiers |
| Referral credits / account credit ledger | <span class="tag new">NEW</span> | Powers referral + comps |
| Nightly/weekly/monthly &amp; seasonal rate setup | <span class="tag new">NEW</span> | Snowbird-friendly |
| Dynamic pricing suggestions | <span class="tag new">NEW</span> | Future |

<div class="page-break"></div>

## 5 · <span class="grpnum">Booking Process (guest-facing)</span>

| Feature | Status | Notes |
|---|---|---|
| Branded private booking link, no guest account | <span class="tag core">CORE</span> | Owner's property name |
| Availability calendar + date selection | <span class="tag core">CORE</span> | Live availability |
| Transparent multi-currency price breakdown | <span class="tag core">CORE</span> | USD/CAD/MXN |
| Rental agreement e-signed before payment | <span class="tag core">CORE</span> | DocuSeal |
| Payment + escrow + damage deposit | <span class="tag core">CORE</span> | Stripe |
| Split payments / installments | <span class="tag core">CORE</span> | Deposit now, balance later |
| Booking confirmation + state machine | <span class="tag core">CORE</span> | pending→signed→paid→confirmed |
| Instant-book vs request-to-book (owner approval) | <span class="tag new">NEW</span> | Owner choice per unit/guest tier |
| Date-hold / quote window | <span class="tag new">NEW</span> | For re-invites |
| Cancellation &amp; refund flow | <span class="tag new">NEW</span> | Tied to policy |
| Booking modification (date change) | <span class="tag new">NEW</span> | Self-serve change |

## 6 · <span class="grpnum">Renter (Guest) Registration &amp; Profile</span>

| Feature | Status | Notes |
|---|---|---|
| Book with no account (name + contact) | <span class="tag core">CORE</span> | Low friction |
| Optional guest screening (Truvi) | <span class="tag core">CORE</span> | ID + fraud |
| Guest consent / privacy notice capture (aviso de privacidad) | <span class="tag core">CORE</span> | Compliance |
| Magic-link guest portal (booking, agreement, manual, messages) | <span class="tag new">NEW</span> | View without an account |
| Guest trust tiers (vetted / returning / referral) | <span class="tag core">CORE</span> | From CRM |
| Saved details for one-click rebook | <span class="tag new">NEW</span> | Convenience |

## 7 · <span class="grpnum">Payments &amp; Money Movement</span>

| Feature | Status | Notes |
|---|---|---|
| Stripe Connect (Custom) | <span class="tag core">CORE</span> | FG never custodies funds |
| Escrow (delayed payout until check-in) | <span class="tag core">CORE</span> | Core trust |
| Damage deposit hold + auto-release | <span class="tag core">CORE</span> | Separate from rent |
| Multi-currency charge (USD/CAD/MXN) | <span class="tag core">CORE</span> | |
| Cross-border payouts (US/CA/MX bank) | <span class="tag core">CORE</span> | |
| Split payments / installments | <span class="tag core">CORE</span> | |
| Card + FX at cost | <span class="tag core">CORE</span> | |
| Refunds &amp; partial refunds | <span class="tag new">NEW</span> | |
| Security-deposit claim flow | <span class="tag new">NEW</span> | Owner files claim against deposit |
| Chargeback / dispute handling | <span class="tag new">NEW</span> | Ops + Stripe |
| Payout scheduling &amp; statements | <span class="tag new">NEW</span> | Owner clarity |

## 8 · <span class="grpnum">Trust, Safety &amp; Verification</span>

| Feature | Status | Notes |
|---|---|---|
| Verified Owner badge (Stripe KYC) | <span class="tag core">CORE</span> | Condition of payout |
| Escrow | <span class="tag core">CORE</span> | |
| Guest screening (Truvi) | <span class="tag core">CORE</span> | Add-on |
| Protected booking / up to $1M damage | <span class="tag core">CORE</span> | Add-on (Truvi) |
| Rental agreement (e-signed, stored) | <span class="tag core">CORE</span> | |
| Property ownership verification | <span class="tag core">CORE</span> | Gate 2 |
| Payment fraud/risk screening (Stripe Radar) | <span class="tag new">NEW</span> | |
| Guest "trust passport" / portable reputation | <span class="tag new">NEW</span> | Future, network effect |

<div class="page-break"></div>

## 9 · <span class="grpnum">Language &amp; Localization</span>

| Feature | Status | Notes |
|---|---|---|
| Bilingual booking page (EN/ES) | <span class="tag core">CORE</span> | |
| AI-translated two-way messaging | <span class="tag core">CORE</span> | |
| Multi-currency display | <span class="tag core">CORE</span> | |
| Localized date/number/currency formats | <span class="tag new">NEW</span> | |
| Localized legal docs (Spanish agreements, aviso) | <span class="tag core">CORE</span> | Compliance |
| French (Canadian) option | <span class="tag new">NEW</span> | Future |

## 10 · <span class="grpnum">Owner–Renter Communication</span>

| Feature | Status | Notes |
|---|---|---|
| Messaging thread (owner ↔ guest) | <span class="tag core">CORE</span> | |
| AI translation in the thread | <span class="tag core">CORE</span> | |
| Unified inbox across all units | <span class="tag new">NEW</span> | Multi-unit owners |
| Saved templates / canned responses | <span class="tag new">NEW</span> | |
| AI guest concierge (auto-answer from manual/listing) | <span class="tag new">NEW</span> | Deflects Q&amp;A |
| Broadcast to past guests (season re-invite) | <span class="tag core">CORE</span> | |

## 11 · <span class="grpnum">Reminder &amp; Check-in Automation</span>

| Feature | Status | Notes |
|---|---|---|
| Automated sequence (confirm→pre-arrival→check-in→mid-stay→checkout→deposit-release) | <span class="tag core">CORE</span> | |
| Multi-channel: SMS / WhatsApp / email | <span class="tag core">CORE</span> | Twilio + Resend |
| Google Maps GPS-directions link in check-in | <span class="tag core">CORE</span> | Critical for MX |
| Check-in instructions / lockbox codes | <span class="tag core">CORE</span> | |
| Configurable timing per message | <span class="tag new">NEW</span> | Owner control |
| Smart-lock code generation/expiry | <span class="tag new">NEW</span> | Future hardware |
| Post-checkout review request | <span class="tag new">NEW</span> | Feeds reviews |
| Rebook nudge ("same dates next year") | <span class="tag core">CORE</span> | |

## 12 · <span class="grpnum">Guest CRM &amp; Retention</span>

| Feature | Status | Notes |
|---|---|---|
| Private guest directory (history, notes, prefs) | <span class="tag core">CORE</span> | The moat |
| Trust tiers (vetted/returning/referral) | <span class="tag core">CORE</span> | |
| Past-guest import (contacts/CSV) | <span class="tag core">CORE</span> | Cold-start fix |
| Season-timed re-invite | <span class="tag core">CORE</span> | |
| One-click rebook | <span class="tag core">CORE</span> | |
| Referral system | <span class="tag core">CORE</span> | |
| Owner-owned guest reviews | <span class="tag new">NEW</span> | Private testimonials |
| Guest tags / segmentation + LTV | <span class="tag new">NEW</span> | |

## 13 · <span class="grpnum">Revenue, Tax &amp; Accounting</span>

| Feature | Status | Notes |
|---|---|---|
| Rental-income tracking (per booking, consolidated) | <span class="tag core">CORE</span> | |
| Income summary (nights, occupancy, top guests) | <span class="tag core">CORE</span> | |
| Consolidated multi-property reports (Pro) | <span class="tag core">CORE</span> | |
| Lodging-tax handling (IVA/ISH/US TOT calc/collect/remit) | <span class="tag core">CORE</span> | Where platform-of-record |
| Mexican host-tax withholding (ISR/IVA → SAT) | <span class="tag core">CORE</span> | Counsel-gated |
| Documents for tax reporting (Schedule E, MX filings) | <span class="tag core">CORE</span> | Handling, not advice |
| Payout statements / financial ledger (CSV) | <span class="tag new">NEW</span> | |
| Expense tracking (cleaning, fees) for net income | <span class="tag new">NEW</span> | |
| 1099-K visibility (US) | <span class="tag new">NEW</span> | |

<div class="page-break"></div>

## 14 · <span class="grpnum">Owner Operations (Remote / Absentee)</span>

| Feature | Status | Notes |
|---|---|---|
| Caretaker / cleaner scoped role | <span class="tag core">CORE</span> | No payments/guest list |
| Digital check-in (codes, lockbox) | <span class="tag core">CORE</span> | |
| Cleaning schedule / turnover tasks | <span class="tag new">NEW</span> | |
| Maintenance log / vendor contacts | <span class="tag new">NEW</span> | |
| Staff roles &amp; permissions | <span class="tag new">NEW</span> | Beyond single caretaker |

## 15 · <span class="grpnum">Free Trial &amp; Plan / Billing Management</span>

| Feature | Status | Notes |
|---|---|---|
| First-month-free trial | <span class="tag core">CORE</span> | Subscription only; fees/add-ons still apply |
| Plan selection &amp; upgrade/downgrade | <span class="tag new">NEW</span> | Self-serve |
| Trial → paid conversion (card capture + reminders) | <span class="tag new">NEW</span> | |
| Subscription management (cancel / pause) | <span class="tag new">NEW</span> | |
| Failed-payment dunning / retries | <span class="tag new">NEW</span> | Ops |
| Proration on plan changes | <span class="tag new">NEW</span> | |
| Founding-owner / comp accounts | <span class="tag new">NEW</span> | Ties to promo codes |

## 16 · <span class="grpnum">Admin, Operations &amp; Monitoring</span>

| Feature | Status | Notes |
|---|---|---|
| Admin console (verification review, support, escalations) | <span class="tag core">CORE</span> | |
| Monitoring + automated resolution (retry/resync/dunning) | <span class="tag core">CORE</span> | |
| Nightly Stripe ↔ DB reconciliation | <span class="tag core">CORE</span> | |
| Support ticketing + AI deflection | <span class="tag new">NEW</span> | Keeps support sublinear |
| Audit log | <span class="tag new">NEW</span> | |
| Feature flags / config | <span class="tag new">NEW</span> | |

## 17 · <span class="grpnum">Compliance &amp; Legal (cross-cutting)</span>

| Feature | Status | Notes |
|---|---|---|
| KYC / AML (via Stripe) | <span class="tag core">CORE</span> | |
| Bilingual ToS / Privacy / Owner / Booking terms | <span class="tag core">CORE</span> | |
| Multi-jurisdiction privacy (LFPDPPP/GDPR/CCPA/PIPEDA) | <span class="tag core">CORE</span> | |
| Subprocessor list + DPAs | <span class="tag core">CORE</span> | |
| Data retention / deletion (DSAR workflow) | <span class="tag new">NEW</span> | |
| Consent management | <span class="tag new">NEW</span> | |

---

<div class="legend">
<p><strong>What this exercise surfaced (highest-value NEW items):</strong> a <strong>promo-code &amp; discount engine</strong> (your price-tiers-including-free requirement), a <strong>refunds + deposit-claim flow</strong> (missing from payments), a <strong>guest portal</strong> (renter side is thin today), <strong>subscription/billing management</strong> (trial→paid, cancel, dunning), and <strong>cancellation/modification</strong> in the booking process. These are the gaps to scope next.</p>
</div>

<div style="text-align:center; margin-top:12px; color:#8a7e72; font-size:11px;">famguest.com &nbsp;|&nbsp; Feature Catalog &nbsp;|&nbsp; June 2026</div>
