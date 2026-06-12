---
pdf_options:
  margin:
    top: 26mm
    bottom: 20mm
    left: 18mm
    right: 18mm
  displayHeaderFooter: true
  headerTemplate: "<span></span>"
  footerTemplate: "<div style='font-size:9px; color:#8a7e72; width:100%; text-align:center; padding:0 40px;'>Familiar Guest — Setup To-Do Checklist &nbsp;|&nbsp; Confidential</div>"
stylesheet: https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap
---

<style>
  body { font-family: 'Hanken Grotesk', sans-serif; color: #2A241E; line-height: 1.5; font-size: 11.5px; }
  h1, h2, h3 { font-family: 'Fraunces', serif; color: #14543F; }
  h1 { font-size: 27px; margin-bottom: 2px; }
  h2 { font-size: 16px; border-bottom: 2px solid #E6DBCB; padding-bottom: 5px; margin-top: 20px; }
  .subtitle { font-size: 14px; color: #C0673E; font-weight: 500; margin-bottom: 12px; }
  .lead { font-size: 12.5px; color: #3d362e; }
  table { font-size: 10.5px; border-collapse: collapse; width: 100%; margin: 8px 0; }
  th { background-color: #14543F; color: white; padding: 6px 8px; text-align: left; font-weight: 500; }
  td { padding: 5px 8px; border-bottom: 1px solid #E6DBCB; vertical-align: top; }
  tr:nth-child(even) { background-color: #FBF6EE; }
  strong { color: #14543F; }
  .who { font-weight:700; white-space:nowrap; font-size:10px; padding:2px 7px; border-radius:10px; }
  .you { background:#C0673E; color:#fff; }
  .ai { background:#14543F; color:#fff; }
  .both { background:#7a6a52; color:#fff; }
  .legend { background:#FBF6EE; border-left:4px solid #14543F; padding:10px 14px; margin:10px 0; border-radius:0 6px 6px 0; font-size:11px; }
  .legend p { margin:3px 0; }
  .phase { font-family:'Fraunces',serif; }
  .chk { color:#8a7e72; }
  hr { border: none; border-top: 1px solid #E6DBCB; margin: 14px 0; }
  .page-break { page-break-before: always; }
  .note { font-size:10.5px; color:#5a5047; }
</style>

# Setup To-Do Checklist

<div class="subtitle">Phased plan to stand up the recommended Familiar Guest solution</div>

<p class="lead">Everything needed to go from today to an owner-testable platform, in phases. Each step is tagged by who does it. The build (code/config) I can do; anything that needs your identity, money, legal sign-off, account ownership, or DNS is yours.</p>

<div class="legend">
<p><span class="who you">YOU</span> &nbsp;Owner of famguest.com — requires your account, credentials, payment, legal sign-off, or DNS. I can't do these for you.</p>
<p><span class="who ai">CLAUDE</span> &nbsp;I can fully build/configure this in the repo (you review &amp; approve).</p>
<p><span class="who both">BOTH</span> &nbsp;I build it; you provide a credential/API key or click an authorize button.</p>
</div>

<p class="note">☐ = not started. Safety-critical items (escrow, webhooks, security) are flagged ⚠ — budget the $5,000 contract review for these before going live with real money.</p>

---

## Phase 0 · Accounts &amp; Foundations

| ☐ | Step | Who |
|---|---|---|
| ☐ | Register / confirm **famguest.com** domain &amp; access DNS | <span class="who you">YOU</span> |
| ☐ | Decide business entity (LLC) &amp; open a business bank account for payouts | <span class="who you">YOU</span> |
| ☐ | Create **Vercel** account | <span class="who you">YOU</span> |
| ☐ | Create **Supabase** account + project | <span class="who you">YOU</span> |
| ☐ | Create **Stripe** account, enable **Connect**, add bank/identity | <span class="who you">YOU</span> |
| ☐ | Create **Resend** account | <span class="who you">YOU</span> |
| ☐ | Create **Twilio** account (SMS + WhatsApp for reminder/check-in messages) | <span class="who you">YOU</span> |
| ☐ | Create **Anthropic API** account + key (AI copy/translation/support) | <span class="who you">YOU</span> |
| ☐ | Create **Sentry** account (error monitoring) | <span class="who you">YOU</span> |
| ☐ | Choose a password/secrets manager; share secrets safely | <span class="who you">YOU</span> |
| ☐ | GitHub repo (Familiar-Guest/familiar-guest-portal) | <span class="who ai">DONE</span> |
| ☐ | Document every required env var in `.env.example` | <span class="who ai">CLAUDE</span> |

---

## Phase 0.5 · Legal, Tax &amp; Compliance (start in parallel — see Compliance &amp; Tax Addendum)

| ☐ | Step | Who |
|---|---|---|
| ☐ | Engage cross-border tax attorney + Mexican counsel + privacy counsel | <span class="who you">YOU</span> |
| ☐ | ⚠ Resolve Mexico digital-platform withholding (ISR/IVA, SAT/RFC) before live MX payments | <span class="who you">YOU</span> |
| ☐ | Determine US marketplace-facilitator lodging-tax duties per state | <span class="who you">YOU</span> |
| ☐ | Confirm Stripe MX connected accounts + cross-border payout structure | <span class="who you">YOU</span> |
| ☐ | Platform entity (US LLC; possible MX entity/RFC) + insurance (GL, E&amp;O, cyber) | <span class="who you">YOU</span> |
| ☐ | Bilingual ToS, Privacy Policy, Owner Agreement, Booking Terms (EN/ES) | <span class="who you">YOU</span> |
| ☐ | Multi-jurisdiction privacy policy + Mexican aviso de privacidad; subprocessor DPAs | <span class="who both">BOTH</span> |
| ☐ | W-9 (US) / W-8BEN (non-US) collection; 1099-K handling | <span class="who you">YOU</span> |
| ☐ | Verification for non-US IDs (passport/INE/CURP/RFC); confirm Truvi non-US coverage | <span class="who both">BOTH</span> |
| ☐ | Gate-2 ownership docs accept fideicomiso/escritura + US deeds | <span class="who ai">CLAUDE</span> |
| ☐ | Lodging-tax line items (US TOT / MX ISH) + owner local-STR attestation | <span class="who ai">CLAUDE</span> |

---

## Phase 1 · Scaffold &amp; Deploy Skeleton

| ☐ | Step | Who |
|---|---|---|
| ☐ | Scaffold Next.js + Supabase + Stripe from a SaaS starter | <span class="who ai">CLAUDE</span> |
| ☐ | Apply brand design tokens (fonts, colors, base UI) | <span class="who ai">CLAUDE</span> |
| ☐ | Connect GitHub → Vercel; authorize the integration | <span class="who both">BOTH</span> |
| ☐ | Create staging + production environments | <span class="who ai">CLAUDE</span> |
| ☐ | Paste secrets into Vercel env vars (I tell you which) | <span class="who both">BOTH</span> |
| ☐ | Point famguest.com DNS at Vercel | <span class="who both">BOTH</span> |
| ☐ | Database schema + row-level security | <span class="who ai">CLAUDE</span> |
| ☐ | Supabase Auth (email magic-link) | <span class="who ai">CLAUDE</span> |

---

## Phase 2 · Owner Onboarding &amp; Listings

| ☐ | Step | Who |
|---|---|---|
| ☐ | Owner signup + dashboard | <span class="who ai">CLAUDE</span> |
| ☐ | Listing creation form | <span class="who ai">CLAUDE</span> |
| ☐ | GPS coordinate capture (lat/long) — **required for MX listings**, source of truth for location | <span class="who ai">CLAUDE</span> |
| ☐ | Owner Settings &amp; site parameters page (fees, deposit, check-in/out, min/max nights, blackout, cancellation, tax rates, currency, instant-vs-request, notif prefs, language; per-unit overrides) | <span class="who ai">CLAUDE</span> |
| ☐ | Photo upload — drag/drop + mobile | <span class="who ai">CLAUDE</span> |
| ☐ | Cloud photo OAuth (Google/Dropbox/iCloud) — register OAuth apps | <span class="who both">BOTH</span> |
| ☐ | AI-written listing description (Anthropic) | <span class="who ai">CLAUDE</span> |
| ☐ | Scoped caretaker/cleaner access (5 seats; no payments/full guest list) + digital check-in (lockbox/smart codes) | <span class="who ai">CLAUDE</span> |
| ☐ | Stripe Connect Custom account creation + embedded KYC | <span class="who ai">CLAUDE</span> |
| ☐ | Complete Stripe platform profile &amp; Connect agreement | <span class="who you">YOU</span> |

<div class="page-break"></div>

## Phase 3 · Calendar Sync

| ☐ | Step | Who |
|---|---|---|
| ☐ | Inbound iCal import (Airbnb/VRBO/Booking.com) | <span class="who ai">CLAUDE</span> |
| ☐ | Outbound .ics feed per listing | <span class="who ai">CLAUDE</span> |
| ☐ | Refresh scheduler (Vercel Cron) + "last synced" UI | <span class="who ai">CLAUDE</span> |

## Phase 4 · Guest Booking Page

| ☐ | Step | Who |
|---|---|---|
| ☐ | Branded, mobile, no-account booking page | <span class="who ai">CLAUDE</span> |
| ☐ | Availability + transparent price breakdown | <span class="who ai">CLAUDE</span> |
| ☐ | Multi-currency display (USD/CAD/MXN) | <span class="who ai">CLAUDE</span> |
| ☐ | Bilingual EN/ES + AI-translated messaging | <span class="who ai">CLAUDE</span> |

## Phase 5 · Payments &amp; Escrow ⚠

| ☐ | Step | Who |
|---|---|---|
| ☐ | Payment intents (test mode) | <span class="who ai">CLAUDE</span> |
| ☐ | ⚠ Escrow via delayed payout | <span class="who ai">CLAUDE</span> |
| ☐ | ⚠ Damage deposit hold + auto-release | <span class="who ai">CLAUDE</span> |
| ☐ | Installments (deposit now / balance later) | <span class="who ai">CLAUDE</span> |
| ☐ | ⚠ Webhook handling + idempotency | <span class="who ai">CLAUDE</span> |
| ☐ | Provide Stripe test keys, then live keys when ready | <span class="who you">YOU</span> |
| ☐ | ⚠ Contract review of escrow + webhooks before live money | <span class="who you">YOU</span> |

## Phase 6 · Rental Agreement

| ☐ | Step | Who |
|---|---|---|
| ☐ | DocuSeal integration (self-host or cloud account) | <span class="who both">BOTH</span> |
| ☐ | Auto-generate &amp; store signed agreement per booking | <span class="who ai">CLAUDE</span> |
| ☐ | Rental agreement legal content + attorney review | <span class="who you">YOU</span> |

## Phase 7 · Messaging &amp; House Manual

| ☐ | Step | Who |
|---|---|---|
| ☐ | Verify Resend sending domain (DNS records) | <span class="who both">BOTH</span> |
| ☐ | Configure Twilio SMS + WhatsApp sender (number/WABA approval) | <span class="who both">BOTH</span> |
| ☐ | Automated bilingual sequence across email + SMS + WhatsApp (owner/guest channel choice) | <span class="who ai">CLAUDE</span> |
| ☐ | Check-in message includes Google Maps GPS directions link | <span class="who ai">CLAUDE</span> |
| ☐ | Digital house manual (Baja templates) | <span class="who ai">CLAUDE</span> |

<div class="page-break"></div>

## Phase 7.5 · Rental Income &amp; Tax Payment Accounting ⚠ (CORE differentiator — gated on counsel)

| ☐ | Step | Who |
|---|---|---|
| ☐ | Per-booking tax breakdown + lodging-tax line items (US TOT / MX ISH/IVA) | <span class="who ai">CLAUDE</span> |
| ☐ | ⚠ Mexican host-tax withholding &amp; remittance (ISR/IVA to SAT) where FG is platform-of-record | <span class="who ai">CLAUDE</span> |
| ☐ | ⚠ Confirm withholding/remittance structure + SAT registration before going live | <span class="who you">YOU</span> |
| ☐ | Rental income ledger + year-end income &amp; tax statements (consolidated across units) | <span class="who ai">CLAUDE</span> |
| ☐ | Accountant exports (US Schedule E, Mexican filings) + W-9/W-8BEN, 1099-K data | <span class="who ai">CLAUDE</span> |
| ☐ | Multi-property consolidated income view (Pro) | <span class="who ai">CLAUDE</span> |
| ☐ | Boundary guardrails: handling + reporting only, **no tax advice** in any owner-facing copy | <span class="who both">BOTH</span> |

## Phase 8 · Trust Add-ons (can run in parallel; partly deferred)

| ☐ | Step | Who |
|---|---|---|
| ☐ | Sign Truvi (Superhog) partnership for screening + damage | <span class="who you">YOU</span> |
| ☐ | Integrate Truvi screening + Protected Booking (after contract) | <span class="who ai">CLAUDE</span> |
| ☐ | Confirm Truvi Mexico coverage terms | <span class="who you">YOU</span> |

## Phase 9 · Observability &amp; Ops

| ☐ | Step | Who |
|---|---|---|
| ☐ | Wire Sentry (provide DSN) | <span class="who both">BOTH</span> |
| ☐ | Structured logging + key metrics | <span class="who ai">CLAUDE</span> |
| ☐ | Monitors + alert thresholds | <span class="who ai">CLAUDE</span> |
| ☐ | Automated resolution jobs (retry/resync/dunning) | <span class="who ai">CLAUDE</span> |
| ☐ | Nightly Stripe ↔ DB reconciliation job | <span class="who ai">CLAUDE</span> |
| ☐ | ⚠ Security hardening (validation, rate limiting, auth edges) | <span class="who ai">CLAUDE</span> |
| ☐ | ⚠ Security review before live | <span class="who you">YOU</span> |

## Phase 10 · Test Launch (Stripe test mode)

| ☐ | Step | Who |
|---|---|---|
| ☐ | Seed 2–3 real owner listings | <span class="who you">YOU</span> |
| ☐ | Recruit owner friends as testers | <span class="who you">YOU</span> |
| ☐ | Smoke tests + a full end-to-end test booking | <span class="who ai">CLAUDE</span> |
| ☐ | Owner/guest exploratory testing | <span class="who you">YOU</span> |
| ☐ | Collect feedback; prioritize fixes | <span class="who both">BOTH</span> |

## Phase 11 · Go Live (after the test)

| ☐ | Step | Who |
|---|---|---|
| ☐ | Switch Stripe to live mode; turn on real owner KYC | <span class="who you">YOU</span> |
| ☐ | Upgrade Vercel/Supabase/Resend to paid tiers | <span class="who you">YOU</span> |
| ☐ | Turn on first-month-free launch offer | <span class="who both">BOTH</span> |
| ☐ | Decide on the FX spread (revenue/OpEx hedge) | <span class="who you">YOU</span> |

<div class="legend">
<p><strong>Fastest path:</strong> knock out <span class="who you">YOU</span> items in Phase 0 first (accounts + domain + Stripe) — they unblock everything. Once I have the accounts connected and keys in Vercel, Phases 1–7 are mostly me building while you test and handle the legal/financial items in parallel.</p>
</div>

---

<div style="text-align:center; margin-top:16px; color:#8a7e72; font-size:11px;">famguest.com &nbsp;|&nbsp; Setup To-Do &nbsp;|&nbsp; June 2026</div>
