---
pdf_options:
  printBackground: true
  margin:
    top: 26mm
    bottom: 20mm
    left: 16mm
    right: 16mm
  displayHeaderFooter: true
  headerTemplate: "<span></span>"
  footerTemplate: "<div style='font-size:9px; color:#8a7e72; width:100%; text-align:center; padding:0 40px;'>Familiar Guest — Product Roadmap (Phase 2 and later) &nbsp;|&nbsp; Confidential</div>"
stylesheet: https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap
---

<style>
  body { font-family: 'Hanken Grotesk', sans-serif; color: #2A241E; line-height: 1.5; font-size: 11px; }
  h1, h2, h3, h4 { font-family: 'Fraunces', serif; color: #14543F; }
  h1 { font-size: 27px; margin-bottom: 2px; }
  h2 { font-size: 17px; border-bottom: 2px solid #E6DBCB; padding-bottom: 5px; margin-top: 22px; }
  h3 { font-size: 13px; color: #C0673E; margin-top: 15px; margin-bottom: 4px; }
  .subtitle { font-size: 14px; color: #C0673E; font-weight: 500; margin-bottom: 12px; }
  .lead { font-size: 12px; color: #3d362e; }
  table { font-size: 10px; border-collapse: collapse; width: 100%; margin: 9px 0; }
  th { background-color: #14543F; color: white; padding: 5px 7px; text-align: left; font-weight: 500; }
  td { padding: 4px 7px; border-bottom: 1px solid #E6DBCB; vertical-align: top; }
  tr:nth-child(even) { background-color: #FBF6EE; }
  strong { color: #14543F; }
  hr { border: none; border-top: 1px solid #E6DBCB; margin: 16px 0; }
  ul { padding-left: 16px; margin: 4px 0; }
  li { margin-bottom: 2px; }
  .page-break { page-break-before: always; }
  .callout { background:#FBF6EE; border-left:4px solid #14543F; padding:9px 13px; margin:10px 0; border-radius:0 6px 6px 0; }
  .callout p { margin: 3px 0; }
  .callout.warn { border-left-color:#C0673E; background:#fbf0ea; }
  code { background:#FBF6EE; border:1px solid #E6DBCB; border-radius:4px; padding:1px 4px; font-size:9.5px; }
  .phase { display:inline-block; font-size:9px; font-weight:700; padding:2px 9px; border-radius:10px; color:#fff; background:#14543F; vertical-align:middle; }
  .phase.p3 { background:#C0673E; }
  .phase.later { background:#9a8d7c; }
</style>

# Familiar Guest — Product Roadmap

<div class="subtitle">Phase 2 and later — what is designed-in but ships after the Trusted-Guest-Mode launch</div>

<p class="lead">This roadmap tracks every capability that is <strong>not</strong> part of the launch product. The launch scope (Trusted-Guest Mode: owner verifies → lists → guest books → signs → pays into escrow → messages → owner paid after check-in, with lodging-tax line items and iCal sync) is defined in <code>docs/architecture/full-solution-design.md</code>. Items here are sequenced after that ships.</p>

<div class="callout"><p><strong>How phases are used:</strong> <span class="phase">PHASE 2</span> is the first wave after launch — expansion of the core money/trust product and low-cost differentiators. <span class="phase p3">PHASE 3</span> is deeper integration work that depends on Phase-2 data being live and stable. <span class="phase later">LATER</span> is gated on an external condition (counsel, a funded reserve, or volume) and is not yet scheduled.</p></div>

---

## Phase 2 — first wave after launch

| Capability | Notes / dependency |
|---|---|
| **Public Mode** — Gate 2 ownership verification, Verified-Owner badge | Accept stranger bookings; admin-reviewed ownership doc (deed / tax statement / fideicomiso) unlocks `mode=public` |
| **Guest screening (Truvi)** + **Protected Booking / damage coverage** | Add-on revenue; verify non-US guest-ID coverage |
| **Multi-currency payout + FX** | USD payout at launch; add MXN/CAD + transparent FX spread; gated on Mexican counsel |
| **Installments / long-stay** | Deposit-now/balance-later for snowbird stays; weekly/monthly rates |
| **Year-end tax exports + consolidated Pro reporting** | Per-booking tax breakdown → year-end income & tax statements across all units |
| **Standard accounting file export (Feature A)** | Download bookings, income, payouts, and tax as **CSV · XLSX · QuickBooks IIF · OFX/QBO (Web Connect)**. No third-party dependency — a server-side generator over data we already hold (`bookings`, `booking_line_items`, `payments`, `payouts`, `tax_records`). Covers QuickBooks Desktop (IIF/QBO), Xero/other (CSV), spreadsheets (XLSX). One new table (`accounting_exports`), one signed-download route, one private storage bucket. Ships alongside the year-end tax exports. |
| **SMS / WhatsApp messaging (Twilio)** | Email-only at launch; add text + WhatsApp channels to the reminder sequence |
| **AI-translated two-way messaging** | EN↔ES owner↔guest threads (Anthropic) |
| **Cloud-photo OAuth import** | Google Photos / iCloud / Drive / Dropbox; drag-drop + mobile cover launch |
| **Caretaker portal** | Scoped arrivals view (no payments, no full guest list); 5 seats on every plan |
| **One-click rebook + referrals** | Post-checkout rebook nudge; trusted-guest referral links |
| **Meta Pixel + CAPI** | Stood up only when Meta ad campaigns run; consent-respecting server-side fallback |

---

## Phase 3 — deeper integrations (depend on Phase-2 data being stable)

| Capability | Notes / dependency |
|---|---|
| **QuickBooks Online API sync (Feature B)** | Owner connects QBO via OAuth; each completed booking pushes as a **sales receipt/invoice + payment**, guest → QBO **customer**, property → QBO **class/location**, lodging tax → tax line. Idempotent re-sync. **Depends on** the booking + payout tables being live and stable (nothing to push before then). New tables: `accounting_connections` (per-owner OAuth + account/class mapping) and `accounting_sync_log` (one row per pushed object, idempotent). New surfaces: OAuth connect/disconnect + an account-mapping UI in owner Money/Settings. New routes/jobs: `/api/accounting/quickbooks/{connect,callback,disconnect}`, `webhooks/quickbooks`, an `accounting-sync` cron (retries + token refresh). **Secrets:** OAuth refresh tokens live in a secret store, never in app tables (no new PII category). Operational load: QBO app review (sandbox→production), rate limits, support-heavy. Candidate **Pro-tier** differentiator. |

---

## Later — gated on an external condition (not yet scheduled)

| Capability | Gate |
|---|---|
| **Mexican host-tax withholding & remittance (ISR/IVA → SAT)** | Mexican counsel confirms FG's platform-of-record obligation; possible RFC/entity |
| **Mexican electronic invoice (CFDI / factura via SAT)** | SAT integration; often required for Mexican guests |
| **Booking guarantee** | Do NOT launch until a funded reserve exists and payout rules are written |
| **Additional accounting platforms (e.g. Xero API)** | Demand-driven; the Phase-2 file exports already cover Xero via CSV |

---

<p class="footer-note" style="font-size:9.5px; color:#8a7e72; font-style:italic;">Last updated: June 2026. Source of truth for launch scope: <code>docs/architecture/full-solution-design.md</code>. This roadmap supersedes the inline P2/P3 tags for accounting features, which have been removed from the design doc pending scheduling.</p>
