---
pdf_options:
  printBackground: true
  margin:
    top: 0mm
    bottom: 0mm
    left: 0mm
    right: 0mm
stylesheet: https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap
---

<style>
  body { font-family: 'Inter', system-ui, sans-serif; color: #16302B; margin: 0; padding: 0; background: #F6F1E8; -webkit-print-color-adjust: exact; }
  .page { padding: 18mm 18mm 16mm 18mm; min-height: 297mm; box-sizing: border-box; page-break-after: always; position: relative; }
  .page:last-child { page-break-after: auto; }
  h1, h2, h3, .brand, .display { font-family: Georgia, 'Times New Roman', serif; color: #0F4D45; }
  .brand { font-size: 18px; font-weight: 600; letter-spacing: 0.3px; }
  .tag { float: right; font-family:'Inter',sans-serif; font-size: 10.5px; letter-spacing: 1.5px; text-transform: uppercase; color: #4F605A; font-weight: 600; margin-top: 4px; }
  .kicker { font-size: 11px; text-transform: uppercase; letter-spacing: 2px; color:#D9663F; font-weight:700; margin: 0 0 5px 0; }
  .rule { height: 1px; background: #E0D6C5; border: 0; margin: 12px 0 18px 0; }
  h1.title { font-size: 34px; line-height: 1.08; margin: 14px 0 10px 0; }
  .sub { font-size: 17px; color:#14635A; font-weight: 500; line-height: 1.42; margin: 0 0 14px 0; }
  h2.section { font-size: 24px; margin: 0 0 4px 0; }
  h3 { font-size: 15px; margin: 16px 0 5px 0; color:#14635A; }
  p { font-size: 12.5px; line-height: 1.5; color:#2c3b36; margin: 0 0 10px 0; }
  .lead { font-size: 14px; line-height: 1.55; color:#2c3b36; }
  ul { margin: 4px 0 10px 0; padding-left: 18px; }
  li { font-size: 12.3px; line-height: 1.5; margin-bottom: 4px; color:#2c3b36; }
  li b, p b { color:#0F4D45; }
  .band { background:#0F4D45; color:#fff; border-radius:12px; padding: 14px 18px; margin: 12px 0; }
  .band p { color:#eaf2ef; font-size: 13px; margin: 0; line-height: 1.55; }
  .band b { color:#9fd3c5; }
  .card { background:#fff; border:1px solid #E0D6C5; border-radius:12px; padding: 14px 16px; }
  .card h3 { margin-top: 0; }
  .grid2 { display:grid; grid-template-columns: 1fr 1fr; gap: 12px; margin: 12px 0; }
  .pillars { display:grid; grid-template-columns: 1fr 1fr; gap: 9px 18px; margin: 12px 0; }
  .pill b { color:#0F4D45; }
  .pill { font-size: 12.5px; line-height: 1.45; padding-left: 16px; position: relative; }
  .pill::before { content: "▸"; position:absolute; left:0; color:#5FB8A4; font-weight:700; }
  table { width:100%; border-collapse: collapse; margin: 10px 0 14px 0; }
  th { text-align:left; font-size: 10.5px; text-transform: uppercase; letter-spacing: 1px; color:#4F605A; font-weight:700; border-bottom: 1.5px solid #0F4D45; padding: 6px 8px; }
  td { font-size: 11.8px; padding: 6px 8px; border-bottom: 1px solid #E0D6C5; color:#2c3b36; vertical-align: top; }
  td b { color:#0F4D45; }
  .badge { display:inline-block; background:#E4F0EC; color:#0F4D45; font-size:10px; font-weight:600; padding:2px 8px; border-radius:6px; border:1px solid #cfe3dc; }
  .badge.live { background:#e7f3ee; color:#14635A; }
  .badge.next { background:#fbeee7; color:#D9663F; border-color:#f0d4c6; }
  .note { font-size: 11px; color:#4F605A; font-style: italic; line-height:1.45; }
  .seq { counter-reset: step; margin: 10px 0; padding: 0; list-style: none; }
  .seq li { position: relative; padding-left: 30px; margin-bottom: 7px; font-size: 12.3px; }
  .seq li::before { counter-increment: step; content: counter(step); position:absolute; left:0; top:-1px; width:20px; height:20px; background:#0F4D45; color:#fff; border-radius:6px; font-size:11px; font-weight:700; text-align:center; line-height:20px; }
  .footer { position:absolute; bottom: 9mm; left:18mm; right:18mm; display:flex; justify-content:space-between; color:#9a8e7d; font-size:10px; border-top: 1px solid #E0D6C5; padding-top: 7px; }
  .footer .l { font-weight:600; color:#4F605A; }
</style>

<div class="page">
<div class="brand">Familiar&nbsp;Guest <span class="tag">Product Overview · Internal</span></div>
<hr class="rule">

<div class="kicker">Direct booking & guest management for vacation-rental owners</div>
<h1 class="title">Familiar Guest:<br>the trust layer for an owner's own guests</h1>
<p class="sub">A private booking and guest-management platform that lets individual vacation-property owners take direct bookings from their repeat and trusted guests — with payments, rental agreements, escrow, and cross-border tax handling built in.</p>

<div class="band"><p>Owners on Airbnb and VRBO lose <b>~15% of every booking</b> and never own the guest relationship. Familiar Guest flips that: the booking page carries <b>the owner's property name</b>, the guest list belongs to the owner, and trust (escrow + verification) is on by default. Our brand stays invisible — we are the <b>infrastructure</b>, not the marketplace.</p></div>

<h2 class="section">What it is — and is not</h2>
<div class="grid2">
<div class="card">
<h3>It is</h3>
<ul>
<li><b>Owner-first.</b> Built for individual/casual owners, not professional property managers.</li>
<li><b>Relationship-led.</b> For repeat and trusted guests, not stranger discovery.</li>
<li><b>Invisible infrastructure.</b> The owner's brand fronts every booking.</li>
<li><b>Trust by default.</b> Escrow, owner verification, optional guest screening.</li>
</ul>
</div>
<div class="card">
<h3>It is not</h3>
<ul>
<li><b>Not a marketplace.</b> No discovery feed, no competing for visibility.</li>
<li><b>Not for portfolios.</b> Capped at 10 properties per owner — deliberately.</li>
<li><b>Not an OTA scraper.</b> Calendar sync via iCal only; owner-provided content only.</li>
<li><b>Not a tax advisor.</b> We handle and report; owners keep their own pros.</li>
</ul>
</div>
</div>

<h2 class="section">Positioning pillars</h2>
<div class="pillars">
<div class="pill"><b>Effortless setup.</b> An owner is live in under an afternoon — minutes, not days.</div>
<div class="pill"><b>Keep the relationship.</b> A private guest CRM the owner owns and re-invites each season.</div>
<div class="pill"><b>Keep the earnings.</b> 5% PAYG or a flat monthly plan — no 15% platform cut.</div>
<div class="pill"><b>Cross-border native.</b> Multi-currency, bilingual, snowbird long-stays, remote ops.</div>
</div>

<div class="band" style="background:#14635A;"><p><b>Beachhead (June 2026):</b> US & Canadian owners who rent homes in Mexico — the <b>Todos Santos · Los Cabos · La Paz</b> corridor in Baja California Sur. These owners typically run <b>2+ units</b>, already have returning guests, and feel cross-border payment, trust, and tax pain most acutely. The product edge for them is the cross-border stack below.</p></div>

<div class="footer"><span class="l">Familiar Guest — Product Sheet</span><span>famguest.com · Page 1 of 5</span></div>
</div>

<div class="page">
<div class="brand">Familiar&nbsp;Guest <span class="tag">Features · 1 of 2</span></div>
<hr class="rule">

<div class="kicker">The feature set — onboarding, trust & the booking</div>
<h2 class="section">Getting an owner live, safely</h2>

<h3>Owner onboarding — two gates, two capability levels</h3>
<table>
<tr><th style="width:18%">Gate</th><th style="width:42%">What it unlocks</th><th>How it works</th></tr>
<tr><td><b>Gate 1</b><br>Identity</td><td>Required for all owners. Unlocks <b>Trusted-Guest Mode</b> — send booking links to known guests and collect payment.</td><td>Stripe Connect <b>Custom</b> with embedded/hosted verification. Most owners clear in minutes. Sensitive KYC never touches our servers.</td></tr>
<tr><td><b>Gate 2</b><br>Ownership</td><td>Required only to list publicly. Unlocks <b>Public Mode</b> — escrow + booking guarantee + the Verified Owner badge.</td><td>One ownership document in the owner's name (deed, tax statement, fideicomiso for MX). Lightweight manual review at launch.</td></tr>
</table>
<p class="note">Hard gate: no owner may list a property or collect payment before Stripe identity verification completes — no exceptions, no workarounds.</p>

<h3>Two booking modes</h3>
<p><b>Trusted-guest mode</b> is the core, low-bar use case: a private booking link to a known guest, no marketplace listing required. <b>Public mode</b> is the expansion path — accept stranger bookings with escrow, guarantee, and optional screening once ownership is verified.</p>

<h2 class="section">The guest booking flow</h2>
<p>A guest receives a private link — <b>no account hurdle, mobile-first</b> — and sees dates, a transparent fee breakdown (now a <b>daily rate × nights + cleaning fee</b>), the Verified-Owner badge, the rental agreement, and a payment summary. Funds are held in escrow until check-in; the damage deposit is held separately and released automatically after an inspection window.</p>

<h3>Trust & safeguards — lead with these in UX</h3>
<ul>
<li><b>Escrow.</b> Guest funds held until check-in via Stripe delayed payout — the single most important consumer-trust feature. Never described as a regulated trust; FG never takes fund custody.</li>
<li><b>Verified Owner badge.</b> Every owner is identity-verified via Stripe KYC as a condition of payout.</li>
<li><b>Rental agreement.</b> Auto-generated per booking (DocuSeal), signed digitally before payment clears, stored permanently. Bilingual EN/ES with a governing-law clause keyed to the home's country.</li>
<li><b>Property verification.</b> Ownership document gates public-listing mode and awards the badge.</li>
</ul>

<div class="band"><p><b>Compliance is a feature, not an afterthought.</b> No Airbnb/OTA scraping (iCal sync only). No storage of SSNs or government IDs (Stripe handles KYC). No fund release before check-in without owner instruction. Verification works for non-US persons (passport / INE / CURP / RFC / fideicomiso). These are hard constraints baked into the design.</p></div>

<div class="footer"><span class="l">Familiar Guest — Product Sheet</span><span>famguest.com · Page 2 of 5</span></div>
</div>

<div class="page">
<div class="brand">Familiar&nbsp;Guest <span class="tag">Features · 2 of 2</span></div>
<hr class="rule">

<div class="kicker">The feature set — relationship, money & cross-border</div>
<h2 class="section">The moat: the owner's guest relationship</h2>

<h3>Guest CRM — the core moat</h3>
<p>A private guest directory the owner owns and never shares: contact, stay history, notes, preferences. Trust tiers (<b>vetted / returning / referral</b>) drive different booking rules. <b>One-click re-invite</b> at season end, <b>one-click rebook</b> ("same dates next year?"), and a <b>referral system</b> where a trusted guest's link pre-vets the new guest by association.</p>

<h3>Messaging & house manual</h3>
<p>Automated, multi-channel (SMS, WhatsApp, email — owner/guest choice), bilingual: booking confirmation, pre-arrival info, day-of check-in (with a <b>Google Maps GPS link</b> — required because Mexican street addresses are unreliable), optional mid-stay, checkout, and deposit-release. A private <b>digital house manual</b> (WiFi, codes, rules, local tips) is set once and delivered forever.</p>

<h2 class="section">The cross-border differentiators</h2>
<table>
<tr><th style="width:32%">Capability</th><th>What it does</th></tr>
<tr><td><b>Multi-currency + payouts</b></td><td>Price in USD/CAD/MXN; owner chooses payout currency and destination bank. FX passed at cost (a modest transparent spread is a planned future revenue line).</td></tr>
<tr><td><b>Bilingual + AI translation</b></td><td>EN/ES booking pages and two-way translated guest messaging.</td></tr>
<tr><td><b>Long-stay + installments</b></td><td>Weekly/monthly rates and deposit-now / balance-later for snowbird stays.</td></tr>
<tr><td><b>Remote-owner ops</b></td><td>Scoped caretaker/cleaner login (no payments, no full guest list) + digital check-in via lockbox/smart codes.</td></tr>
<tr><td><b>Income & Tax Accounting</b></td><td><b>The standout no competitor offers.</b> Lodging-tax line items (US TOT / MX ISH/IVA), Mexican host-tax withholding to SAT where FG is platform-of-record, and tax-ready exports (Schedule E, MX filings) consolidated across units. Handling + reporting — never advice.</td></tr>
</table>

<h2 class="section">Pricing model</h2>
<table>
<tr><th>Plan</th><th>Price</th><th>For</th></tr>
<tr><td><b>Pay-as-you-go</b></td><td>5% + processing</td><td>No monthly; the acquisition front door (first month commission-free, no card).</td></tr>
<tr><td><b>Starter</b></td><td>$15/mo</td><td>One property, no commission.</td></tr>
<tr><td><b>Host</b></td><td>$29/mo</td><td>Up to 5 properties — the likely modal plan for the 2+-unit beachhead.</td></tr>
<tr><td><b>Pro</b></td><td>$49/mo</td><td>6–10 properties + consolidated reporting + priority support.</td></tr>
</table>
<p class="note">All plans carry payment-processing and FX fees, passed through at cost (net-zero to FG). Trust and money-movement features are never paywalled — plans differ only on commission-vs-flat, property count, and reporting. Calendar sync is iCal-based (15–30 min inbound refresh) with a visible "last synced" timestamp.</p>

<div class="footer"><span class="l">Familiar Guest — Product Sheet</span><span>famguest.com · Page 3 of 5</span></div>
</div>

<div class="page">
<div class="brand">Familiar&nbsp;Guest <span class="tag">How it was built · 1 of 2</span></div>
<hr class="rule">

<div class="kicker">How it was created — stack, decisions & method</div>
<h2 class="section">A solo founder, building with AI</h2>
<p class="lead">Familiar Guest is built by a single founder with professional developer and product-management experience, using AI-assisted tooling (<b>Claude Code, Cursor</b>) to compress what would traditionally take a small team. There are no full-time hires until unit economics justify it; a <b>$5,000 budget</b> is reserved for expert contract review of the safety-critical money paths.</p>

<h2 class="section">The stack — decided, deliberate</h2>
<table>
<tr><th style="width:26%">Layer</th><th style="width:30%">Choice</th><th>Why</th></tr>
<tr><td>Frontend / hosting</td><td><b>Next.js (App Router) on Vercel</b></td><td>Fast iteration; deploy straight from GitHub.</td></tr>
<tr><td>Database / auth</td><td><b>Supabase (Postgres)</b></td><td>Auth, storage, and edge functions in one managed layer.</td></tr>
<tr><td>Payments</td><td><b>Stripe Connect Custom</b></td><td>Maximum insulation — owners feel "Familiar Guest pays me," Stripe invisible.</td></tr>
<tr><td>Email / messaging</td><td><b>Resend</b> · <b>Twilio</b></td><td>Transactional email; SMS + WhatsApp for reminders.</td></tr>
<tr><td>Agreements / screening</td><td><b>DocuSeal</b> · <b>Truvi</b></td><td>E-signatures; guest screening that covers US <i>and</i> Mexico.</td></tr>
<tr><td>Calendar</td><td><b>iCal (.ics)</b></td><td>Standard, compliant, zero per-platform dev — no OTA APIs.</td></tr>
</table>

<h2 class="section">The decisions that shaped the build</h2>
<h3>Stripe Connect Custom over Standard</h3>
<p>Custom accounts keep the Stripe brand fully out of the owner's experience and let Stripe own KYC, payout banking, and fund-holding compliance — so FG never stores SSNs or ID documents and never takes fund custody (avoiding money-transmitter licensing). The trade-off FG accepts: owning owner support, payout timing, and disputes.</p>

<h3>iCal-only calendar sync</h3>
<p>A hard compliance line — no scraping Airbnb/VRBO. Two one-way iCal feeds (not real-time), with a visible "last synced" timestamp so owners understand the double-booking window honestly.</p>

<h3>Compliance-driven data model</h3>
<p>Key entities — <i>owners, properties, listings, guests, bookings, agreements, calendar_feeds, payouts, screening_results</i> — are shaped by the constraints first: minimize PII, gate capabilities behind verification, and keep escrow hold/release auditable. Multi-jurisdiction privacy (LFPDPPP, GDPR, CCPA/CPRA, PIPEDA) is designed in, not retrofitted.</p>

<div class="footer"><span class="l">Familiar Guest — Product Sheet</span><span>famguest.com · Page 4 of 5</span></div>
</div>

<div class="page">
<div class="brand">Familiar&nbsp;Guest <span class="tag">How it was built · 2 of 2</span></div>
<hr class="rule">

<div class="kicker">How it was created — sequence, safety & status</div>
<h2 class="section">The MVP build sequence</h2>
<ol class="seq">
<li><b>Marketing site</b> + waitlist capture — live on Vercel at famguest.com.</li>
<li><b>Owner auth & onboarding</b> — Supabase Auth (email + magic link, Google/Apple), Stripe Connect Custom + embedded KYC.</li>
<li><b>Property creation</b> — listing form, photo upload (cloud OAuth + drag-drop + mobile), AI-written descriptions.</li>
<li><b>iCal calendar sync</b> — inbound feeds, generated outbound feed, last-synced status.</li>
<li><b>Booking page</b> — branded, guest-facing, works without a guest account.</li>
<li><b>Payments & escrow</b> — payment intents, escrow hold, deposit, webhook-driven check-in release.</li>
<li><b>Rental agreement</b> — DocuSeal auto-generate + stored signed copy.</li>
<li><b>Guest CRM & messaging</b> — directory + automated bilingual sequence.</li>
<li><b>Guest screening</b> add-on, then <b>one-click rebook + referrals</b>.</li>
</ol>

<h2 class="section">Built with guardrails</h2>
<p>Feature branches off a protected <b>main</b>; secrets in env vars (never committed); a staging environment and Stripe test mode until stable. Every Stripe webhook is signature-verified, logged, and idempotent. Guest-facing errors are mapped to friendly copy — raw Stripe/Supabase errors never reach the booking page. Accessibility is a requirement: keyboard-navigable, screen-reader-friendly (guests include older and non-technical users).</p>

<h3>Reserved for expert review ($5,000)</h3>
<p>The safety-critical paths get an experienced engineer's eyes before production: <b>Stripe webhook handling</b> (silent-failure risk), <b>escrow hold-and-release timing</b>, <b>Connect negative-balance & fraud liability</b>, <b>security hardening</b>, and <b>ownership-document storage</b>.</p>

<div class="band"><p><b>Status (June 2026):</b> The site is live on famguest.com. Owner accounts, multi-property portal, calendar, public listings, request-to-book, and the pay-by-link booking flow are <b>live in production</b> — including escrow-style delayed payout, Airbnb iCal conflict checks, daily-rate + cleaning-fee pricing, and guest payment confirmation by email or SMS. Next up: deepening the cross-border tax accounting and bilingual messaging, gated on Mexican counsel before any live MX payment-of-record flows.</p></div>

<p class="note">Open items flagged for counsel before owner-facing claims: Mexican digital-platform tax withholding (ISR/IVA/SAT registration), the legal wrapper for MX e-signatures (NOM-151), and fideicomiso/restricted-zone ownership documents. Tax features ship phased — line items + withholding + exports first.</p>

<div class="footer"><span class="l">Familiar Guest — Product Sheet</span><span>famguest.com · Page 5 of 5</span></div>
</div>
