---
pdf_options:
  printBackground: true
  margin:
    top: 26mm
    bottom: 20mm
    left: 18mm
    right: 18mm
  displayHeaderFooter: true
  headerTemplate: "<span></span>"
  footerTemplate: "<div style='font-size:9px; color:#8a7e72; width:100%; text-align:center; padding:0 40px;'>Familiar Guest — Solution Design &nbsp;|&nbsp; Confidential</div>"
stylesheet: https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap
---

<style>
  body { font-family: 'Hanken Grotesk', sans-serif; color: #2A241E; line-height: 1.5; font-size: 11.5px; }
  h1, h2, h3 { font-family: 'Fraunces', serif; color: #14543F; }
  h1 { font-size: 28px; margin-bottom: 2px; }
  h2 { font-size: 17px; border-bottom: 2px solid #E6DBCB; padding-bottom: 5px; margin-top: 22px; }
  h3 { font-size: 13px; color: #C0673E; margin-top: 14px; margin-bottom: 4px; }
  .subtitle { font-size: 14px; color: #C0673E; font-weight: 500; margin-bottom: 12px; }
  .lead { font-size: 12.5px; color: #3d362e; }
  table { font-size: 10.5px; border-collapse: collapse; width: 100%; margin: 9px 0; }
  th { background-color: #14543F; color: white; padding: 6px 8px; text-align: left; font-weight: 500; }
  td { padding: 5px 8px; border-bottom: 1px solid #E6DBCB; vertical-align: top; }
  tr:nth-child(even) { background-color: #FBF6EE; }
  strong { color: #14543F; }
  hr { border: none; border-top: 1px solid #E6DBCB; margin: 16px 0; }
  ul { padding-left: 16px; margin: 4px 0; }
  li { margin-bottom: 3px; }
  .page-break { page-break-before: always; }
  .callout { background:#FBF6EE; border-left:4px solid #14543F; padding:10px 14px; margin:10px 0; border-radius:0 6px 6px 0; }
  .callout p { margin: 3px 0; }
  /* diagram */
  .band { border:1px solid #E6DBCB; border-radius:10px; padding:10px 12px; margin:8px 0; background:#fff; }
  .band-title { font-family:'Fraunces',serif; font-size:12px; color:#14543F; font-weight:700; margin-bottom:7px; text-transform:uppercase; letter-spacing:0.5px; }
  .row { display:flex; gap:8px; flex-wrap:wrap; }
  .box { flex:1; min-width:120px; background:#FBF6EE; border:1px solid #E6DBCB; border-radius:8px; padding:8px 10px; font-size:10.5px; }
  .box b { color:#14543F; font-size:11px; }
  .box.users { background:#14543F; color:#fff; text-align:center; font-weight:600; }
  .box.ext { background:#fbf0ea; border-color:#e6c9b8; }
  .box.data { background:#eef3ee; border-color:#cfe0d4; }
  .box.obs { background:#f4f0e6; }
  .flowdown { text-align:center; color:#C0673E; font-size:18px; line-height:1; margin:-2px 0; font-weight:700; }
  .stages { display:flex; gap:6px; align-items:stretch; margin:10px 0; }
  .stage { flex:1; background:#fff; border:1px solid #E6DBCB; border-radius:8px; padding:9px 8px; font-size:10px; }
  .stage b { color:#14543F; font-size:10.5px; }
  .stage.loop { background:#14543F; color:#fff; } .stage.loop b { color:#e8d5b7; }
  .arrow { align-self:center; color:#C0673E; font-weight:700; font-size:15px; }
  .footer-note { font-size:10px; color:#8a7e72; font-style:italic; }
</style>

# Familiar Guest — Solution Design

<div class="subtitle">Reference design: features &amp; value, architecture, data quality, operations, personas</div>

<p class="lead">A solution-level design for the Familiar Guest platform: a direct-booking and guest-management product for US/Canadian owners renting homes in Mexico. It maps features to business value, defines the recommended component architecture, the data-quality and operational-monitoring model with automated resolution, and the user personas and their interactions.</p>

---

## 1 · Features &amp; Business Value

| Feature | What it does | Business value |
|---|---|---|
| **Branded booking link** | Private, mobile, no guest account; owner's property name | Keeps the guest relationship; avoids Airbnb's ~15.5% fee |
| **Guest CRM** | Private directory: history, notes, trust tiers | The retention moat — repeat bookings, higher LTV, lock-in |
| **Escrow (delayed payout)** | Funds held until check-in | Core consumer trust; makes cross-border direct booking safe |
| **Multi-currency + cross-border payouts** | Price in USD/CAD/MXN; pay out to US/CA/MX bank | Key differentiator for US/CA owners with MX property |
| **Bilingual + AI translation** | EN/ES booking &amp; messaging | Expands guest base to MX nationals; removes owner effort |
| **iCal calendar sync** | Inbound + outbound feeds | Prevents double-bookings; no per-OTA development |
| **Rental agreement (DocuSeal)** | Auto-generated, e-signed, stored | Legal protection; professional credibility |
| **Damage deposit + Protected Booking** | Hold + up to $1M coverage (Truvi) | Owner risk mitigation; high-margin add-on revenue |
| **Guest screening (Truvi)** | ID + fraud check | Trust for unknown guests; add-on revenue |
| **Verified Owner (Stripe KYC)** | Identity verification gate | Guest trust + compliance; condition of payout |
| **AI listing description** | Owner content → polished listing | Fast, low-effort onboarding |
| **Automated messaging (Resend)** | Confirmation → checkout sequence | Consistent guest experience; less owner work |
| **Digital house manual** | Private link, Baja templates | Fewer guest questions; better stays/reviews |
| **Caretaker role + digital check-in** | Scoped local access; self-arrival | Enables absentee ownership |
| **Income reporting** | Summary + consolidated (Pro) | Owner value at tax time; Pro upsell |
| **Season re-invite + one-click rebook** | Timed Nov–Apr nudges | Recurring revenue from the existing guest base |
| **Long-stay rates + installments** | Weekly/monthly + split pay | Fits snowbird behavior; closes large bookings |
| **Rental Income &amp; Tax Payment Accounting** | Track rental income; calculate/collect/remit lodging taxes; withhold &amp; remit Mexican host taxes; documents for tax reporting across units | **Core differentiator** — solves the hardest part of cross-border renting; no competitor offers it; drives retention &amp; trust (handling + reporting, not advice) |
| **FX spread (recommended)** | Modest transparent currency margin | GMV-linked revenue — the hedge against OpEx outrunning revenue |

<div class="page-break"></div>

## 2 · Architecture — Recommended Components

<div class="band"><div class="band-title">Users</div><div class="row"><div class="box users">Owner<br>(US / Canada)</div><div class="box users">Returning Guest<br>(US / CA / MX)</div><div class="box users">Caretaker<br>(local, MX)</div><div class="box users">Founder / Admin</div></div></div>
<div class="flowdown">&#8595;</div>
<div class="band"><div class="band-title">Experience layer — Next.js (App Router) on Vercel</div><div class="row"><div class="box"><b>Owner Dashboard</b><br>listings, calendar, bookings, payouts, CRM</div><div class="box"><b>Guest Booking Page</b><br>branded, bilingual, mobile, no account</div><div class="box"><b>Caretaker Portal</b><br>scoped: arrivals &amp; prep tasks</div><div class="box"><b>Admin Console</b><br>verification, support, ops</div></div></div>
<div class="flowdown">&#8595;</div>
<div class="band"><div class="band-title">Application &amp; orchestration — serverless functions + Vercel Cron</div><div class="row"><div class="box"><b>Booking Engine</b><br>availability, holds, state machine</div><div class="box"><b>Payments &amp; Escrow</b><br>intents, deposit holds, payouts</div><div class="box"><b>Calendar Sync</b><br>iCal in/out, freshness</div><div class="box"><b>Messaging</b><br>templated, bilingual</div></div><div class="row" style="margin-top:8px;"><div class="box"><b>AI Services</b><br>descriptions, translation, support deflection</div><div class="box"><b>Webhook Handlers</b><br>signed, idempotent</div><div class="box"><b>Schedulers (Cron)</b><br>escrow release, sync, re-invites</div><div class="box"><b>Screening/Agreements</b><br>Truvi + DocuSeal orchestration</div></div></div>
<div class="flowdown">&#8595;</div>
<div class="band"><div class="band-title">Data — Supabase (Postgres + Auth + Storage), row-level security</div><div class="row"><div class="box data"><b>Core tables</b><br>owners, properties, listings, guests, bookings, agreements, payouts, calendar_feeds, screening_results</div><div class="box data"><b>Auth</b><br>email magic-link; role-scoped (owner / caretaker / admin)</div><div class="box data"><b>Storage</b><br>photos, signed agreements, ownership docs</div></div></div>
<div class="flowdown">&#8595;</div>
<div class="band"><div class="band-title">External integrations</div><div class="row"><div class="box ext"><b>Stripe Connect (Custom)</b><br>KYC, escrow, payouts, FX</div><div class="box ext"><b>Resend</b><br>transactional email</div><div class="box ext"><b>DocuSeal</b><br>e-signatures</div><div class="box ext"><b>Truvi</b><br>screening + damage</div></div><div class="row" style="margin-top:8px;"><div class="box ext"><b>Anthropic API</b><br>AI copy, translation, support</div><div class="box ext"><b>OTA iCal feeds</b><br>Airbnb / VRBO / Booking.com</div><div class="box ext"><b>Cloud photos (OAuth)</b><br>Google / iCloud / Dropbox</div><div class="box ext"><b>Smart locks (later)</b><br>check-in codes</div></div></div>
<div class="band" style="border-style:dashed;"><div class="band-title">Cross-cutting — observability &amp; ops</div><div class="row"><div class="box obs"><b>Sentry</b> — errors/traces</div><div class="box obs"><b>Logs &amp; metrics</b> — structured, per-event</div><div class="box obs"><b>Alerting</b> — thresholds → on-call</div><div class="box obs"><b>Auto-remediation</b> — retry, resync, dunning</div></div></div>

<div class="callout"><p><strong>Design principles:</strong> serverless-first (no servers to manage), webhooks always signature-verified and idempotent, money actions never auto-executed outside safe idempotent bounds, PII minimized (Stripe-hosted KYC — no SSNs stored), and every external call wrapped with retries + a dead-letter path.</p></div>

<div class="page-break"></div>

## 3 · Data Quality

| Domain | Controls | Why it matters |
|---|---|---|
| **Financial integrity** | Webhook signature verification; idempotency keys; nightly Stripe↔DB reconciliation; amounts stored in minor units + currency code; captured FX rate per transaction | No double charges, lost payments, or mismatched payouts |
| **Booking integrity** | Explicit state machine; DB constraints; availability locks preventing overlapping dates | Eliminates double-bookings and invalid states |
| **Calendar data** | iCal parse validation; per-feed "last synced" timestamp; stale-feed (&gt;45 min) detection | Availability stays accurate across platforms |
| **Identity / PII** | Stripe-hosted KYC (no SSN/ID stored); RLS on every table; encryption at rest; least-privilege roles | Compliance and security; limits breach blast radius |
| **CRM records** | Schema validation; email/phone normalization; duplicate detection/merge | A clean, trustworthy guest list (the moat) |
| **Documents** | Signed-agreement integrity (immutable store + checksum); retention policy | Defensible legal record per booking |
| **Cross-border money** | Currency code on every amount; FX rate snapshot; payout-destination validation | Accurate multi-currency accounting and payouts |

---

## 4 · Operational Monitoring &amp; Automated Resolution

### Monitored signals → automated response

| Signal | Detection | Automated resolution | Escalate when |
|---|---|---|---|
| App errors / latency | Sentry + Vercel | Auto-rollback on bad deploy; surface error | Error spike persists |
| Stripe webhooks | Delivery / signature failures | Idempotent replay from queue | Dead-letter queue grows |
| Payment / payout failure | Failed intent / payout | Smart retries + dunning; notify owner | Retries exhausted |
| Escrow-release job | Cron heartbeat | Re-run idempotent job | Missed window |
| Calendar freshness | last-synced age | Auto re-fetch feed | Feed fails repeatedly → flag |
| Email delivery | Resend bounce/fail | Re-send; suppress hard bounces | Domain reputation drop |
| Agreement signing | DocuSeal status | Auto reminder to guest | Stuck past threshold |
| Screening | Truvi timeout/error | Retry; fall back to manual review | Repeated failure |
| Support load | Ticket volume/topic | AI deflection + auto-resolve known issues | Novel/complex issue |

### Automated resolution process

<div class="stages"><div class="stage"><b>1 · Detect</b><br>monitor or webhook fires a signal</div><div class="arrow">&#8594;</div><div class="stage"><b>2 · Classify</b><br>severity + type; auto-eligible &amp; idempotent-safe?</div><div class="arrow">&#8594;</div><div class="stage"><b>3 · Auto-remediate</b><br>retry / resync / dunning / re-send / re-run job</div><div class="arrow">&#8594;</div><div class="stage"><b>4 · Verify</b><br>re-check the signal cleared</div><div class="arrow">&#8594;</div><div class="stage loop"><b>5 · Escalate</b><br>runbook + human (founder/support) if unresolved</div></div>

<div class="callout"><p><strong>Safety rule:</strong> financial actions are auto-retried only within idempotent, bounded limits; anything that could move or release funds incorrectly stops and escalates to a human. Every escalation feeds a post-incident step that updates the runbook and, where possible, adds a new monitor or auto-remediation so the same issue self-heals next time.</p></div>

<div class="page-break"></div>

## 5 · User Personas &amp; Expected Interactions

| Persona | Who they are | Primary goals | Key interactions |
|---|---|---|---|
| **Owner** | US/Canadian; owns **1–10 units in Mexico**; rents on Airbnb, has repeat guests, mostly absentee | Take repeat guests direct across all their units, keep earnings, get paid cross-border, minimal effort | Onboard &amp; verify, build listings (often several), sync calendars, share links, manage multi-unit bookings/payouts, work the guest CRM |
| **Returning Guest** | From US, Canada, or Mexico; knows/trusts the owner; may be a snowbird | Book a trusted home easily, pay safely in own currency &amp; language | Open link, pick dates, sign agreement, pay (or split), get check-in info &amp; house manual |
| **Caretaker** | Local (Mexico) cleaner/property manager | Know who's arriving and prepare the home | Scoped portal: upcoming arrivals, prep tasks, check-in details (no payments / no full guest list) |
| **Founder / Admin** | Platform operator (you) | Keep the platform trustworthy and running; support owners | Review property-ownership (Gate 2) docs, handle escalations, watch monitoring dashboards |

### Owner journey

<div class="stages"><div class="stage"><b>Sign up</b><br>magic-link</div><div class="arrow">&#8594;</div><div class="stage"><b>Verify identity</b><br>Stripe KYC</div><div class="arrow">&#8594;</div><div class="stage"><b>Build listing</b><br>photos + AI copy</div><div class="arrow">&#8594;</div><div class="stage"><b>Sync calendar</b><br>iCal in/out</div><div class="arrow">&#8594;</div><div class="stage"><b>Share link</b><br>invite past guests</div><div class="arrow">&#8594;</div><div class="stage loop"><b>Get paid</b><br>escrow → payout</div></div>

### Guest journey

<div class="stages"><div class="stage"><b>Open link</b><br>branded, bilingual</div><div class="arrow">&#8594;</div><div class="stage"><b>Pick dates</b><br>live availability</div><div class="arrow">&#8594;</div><div class="stage"><b>Sign agreement</b><br>DocuSeal</div><div class="arrow">&#8594;</div><div class="stage"><b>Pay</b><br>own currency / split</div><div class="arrow">&#8594;</div><div class="stage"><b>Arrive</b><br>check-in + manual</div><div class="arrow">&#8594;</div><div class="stage loop"><b>Rebook</b><br>season re-invite</div></div>

### Interaction notes
- **Owner ↔ Guest** messaging is bilingual and AI-translated both ways; the owner never needs Spanish, the guest never needs English.
- **Caretaker** sees only operational data for confirmed stays — never payment or guest-contact detail beyond what's needed to host.
- **Admin** touches a booking only on exception (verification review or an escalated incident); the happy path is fully automated.
- **Multi-unit owners** manage several listings under one account; consolidated income reporting (Pro), scoped caretaker access, and a single shared guest CRM span all their units.

---

<div style="text-align:center; margin-top:18px; color:#8a7e72; font-size:11px;">famguest.com &nbsp;|&nbsp; Solution Design &nbsp;|&nbsp; June 2026</div>
