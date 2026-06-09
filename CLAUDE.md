# Familiar Guest — Project Memory for Claude Code

> This file is the authoritative context document for all Claude Code sessions.
> Read it fully before writing any code or suggesting any architecture changes.

---

## What This Product Is

**Familiar Guest** is a private rental booking and guest-management platform for individual vacation-property owners — not professional property managers. It lets owners take direct bookings from their own repeat and trusted guests, with payments, rental agreements, and trust safeguards handled automatically.

**Domain:** famguest.com
**GitHub:** https://github.com/Familiar-Guest/familiar-guest-portal
**Target market:** US and Mexico vacation rental owners (individual/casual, not operators)
**Guest origins served:** US, Canada, Latin America, Western Europe, and Asia (Japan, China, India, Taiwan, South Korea)

### Initial market focus / beachhead (decided June 2026)
Launch is focused on **US and Canadian homeowners who own and rent property in Mexico**, starting with the **Todos Santos · Los Cabos · La Paz corridor (Baja California Sur)**. These owners already rent on Airbnb and have a base of return guests. The product edge for this segment is **cross-border**: multi-currency payments + payouts, bilingual (EN/ES) booking, trust strong enough to book a home abroad, snowbird long-stays, and remote/absentee owner operations. See `docs/planning/` for the market analysis and feature briefs.

### The Core Positioning (do not drift from this)
- Owner-first, not property-manager-first
- Repeat/trusted guests, NOT a discovery/marketplace platform
- Invisible infrastructure: Familiar Guest brand stays in the background; the booking page carries the owner's property name
- Simple to start — an owner should be live in under an afternoon
- Trust built in by default (escrow, owner verification, optional guest screening)

---

## Tech Stack (decided — do not change without discussion)

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js (App Router) | Deployed on Vercel |
| Hosting | Vercel | Auto-deploy from GitHub main branch |
| Database | Supabase (Postgres) | Auth, storage, edge functions included |
| Payments | Stripe Connect **Custom** accounts | Maximum owner insulation from Stripe brand |
| Email (transactional) | Resend | Booking confirmations, guest messaging, reminders |
| Calendar sync | iCal (.ics) | Standard — works with all platforms, no per-platform dev |
| E-signatures | DocuSeal | Rental agreements |
| Guest screening | Truvi (formerly Superhog) | Supports US + Mexico; Safely and Waivo are US-only |
| Source control | GitHub | Familiar-Guest/familiar-guest-portal |

---

## Critical Legal and Compliance Constraints

### NEVER do any of the following — these are hard stops:

1. **Do NOT scrape Airbnb listings, photos, or content.** Airbnb's ToS explicitly prohibits automated data collection from their platform. Any feature that fetches an Airbnb URL, pulls listing data, or extracts photos from Airbnb is forbidden.
   - iCal calendar sync IS permitted — Airbnb provides export calendar links as a deliberate feature. Use only this.
   - Owner-pasted text (their own words, copied manually) is fine.
   - Owner-authorized cloud storage (Google Photos, iCloud, Drive, Dropbox OAuth) is fine.

2. **Do NOT pull content from VRBO, Booking.com, or any OTA without verifying their specific terms.** Default to owner-provided content only.

3. **Do NOT store Social Security Numbers, government IDs, or sensitive KYC documents.** Stripe Connect handles all identity verification. Use Stripe-hosted or embedded verification components so sensitive PII never touches our servers.

4. **Do NOT release held funds before check-in** without explicit owner instruction. Escrow hold-and-release logic is safety-critical.

5. **Do NOT allow an owner to list a property or collect payment before Stripe identity verification is complete.** This is a hard gate — no exceptions, no workarounds.

---

## Owner Onboarding Flow

Two gates, two capability levels:

### Gate 1 — Identity verification (required for all owners)
Triggers: owner tries to list a property or connect a payout account.
- Use **Stripe Connect Custom** accounts with **embedded/hosted verification components**
- Stripe collects: legal name, date of birth, address, SSN last 4, bank account
- Most owners clear in minutes; ID document upload only if auto-verify fails
- On pass -> owner can use Familiar Guest in **Trusted-Guest Mode** (send booking links to known guests, collect payment)
- On fail -> cannot proceed; support flow

### Gate 2 — Property ownership verification (required for public listings only)
Triggers: owner enables "open to public" on any listing.
- Owner uploads ONE document in their verified name matching the listing address: property tax statement, deed, utility bill, or insurance declaration page
- Manual/lightweight review at launch — no API to automate this
- On pass -> "Verified Owner" badge awarded, **Public Mode** unlocked (escrow + booking guarantee apply)
- Until pass -> trusted-guest mode only, no public listing

### Content and Photo Onboarding (no Airbnb scraping — see above)
- **Connect cloud storage:** Google Photos, iCloud, Google Drive, or Dropbox OAuth -> owner selects an album -> photos come in. Owner authorizes access to their own storage — fully compliant.
- **Mobile upload:** QR code or text-a-link -> owner picks from phone camera roll
- **Drag-and-drop:** standard multi-file upload from computer
- **AI-written description:** owner pastes their own existing text OR answers a few quick questions; we generate a polished title, description, and amenity list for them to review and edit
- **NO concierge service** — decided against offering this

### Suggested Photos (show this guidance in onboarding UI)
When owner is uploading, display these prompts:
1. A bright photo of the front of the home
2. The main living area and the kitchen
3. Each bedroom and each bathroom
4. Your standout feature — the view, pool, deck, or fireplace
5. A welcoming detail — a made bed or fresh towels
*Tip: Shoot in daylight, tidy up first, hold your phone sideways. Eight to twelve photos is plenty.*

### Calendar Sync (iCal — the ONLY mechanism, no OTA API)
- **Inbound:** owner pastes each platform's iCal export URL into Familiar Guest. FG fetches and re-checks on a frequent schedule (target: every 15-30 min) to keep our availability view fresh.
- **Outbound:** FG generates a unique .ics export URL per listing. Owner pastes this URL into each other platform's "import calendar" field. The other platform re-reads it on its own schedule (typically hours — not real-time).
- **Important:** two-way iCal is two one-way feeds. It is NOT real-time. A double-booking window of up to several hours exists on the outbound side. Display a clear "last synced" timestamp and set owner expectations accordingly.
- Platforms supporting iCal import/export (no custom dev needed): Airbnb, VRBO, Booking.com, Google Calendar, Apple/iCloud Calendar, and virtually all PMS tools (OwnerRez, Hostaway, Guesty, Lodgify, Hospitable, Smoobu).

---

## Pricing Model (current — may evolve)

### Plans
| Plan | Price | What's included |
|---|---|---|
| Pay-as-you-go | 5% commission + payment fees; $5 per free booking | No monthly, cancel anytime |
| Starter | $12/mo (1 property) | No commission, free bookings included |
| Host | $29/mo (up to 5 properties) | Unlimited bookings, no commission, free bookings included |
| Pro | $49/mo (6–10 properties) | Everything in Host + consolidated income reports + priority support |

**All plans are subject to payment processing fees** (card + currency conversion), passed through to the owner at cost.

**With damage protection bundled (option in discussion):**
| Plan | Price |
|---|---|
| Pay-as-you-go | 6.5% + payment fees |
| Host | ~$49/mo (damage included, fair-use cap ~4 bookings/mo) |
| Pro | ~$89/mo (included, fair-use cap ~6/mo) |

### Add-ons (any plan)
- **Guest Screening:** $5/booking (our cost ~$4, +25% markup) — ID + fraud check
- **Protected Booking:** $19.99/booking (our cost ~$16, +25%) — screening + $1M damage protection

### Key rules
- Card processing fees are ALWAYS passed through to the owner at cost (net zero to us)
- **Currency conversion (FX) is also passed through at cost** for cross-border payouts (net zero). A modest FX spread is a possible FUTURE revenue line — not at launch.
- **All core and cross-border features are available on EVERY plan.** Trust and money-movement are the product; do not paywall them. Plans differ only on commission-vs-flat, property count, and reporting/support.
- All owners must pass Stripe identity verification — no exceptions, no unverified accounts
- Card on file required from owner ONLY if they enable free bookings
- Stripe Connect Custom: owners identify as "getting paid by Familiar Guest," not as Stripe accounts
- Plan prices are in USD (owners are US/Canadian). Offer ~2 months free on annual billing (Starter $120/yr, Host $290/yr, Pro $490/yr).
- Plan tiering detail: Pay-as-you-go = pay per booking. Starter = 1 property. Host = up to 5 properties. Pro = 6–10 properties, consolidated multi-property reports, priority support. **All plans include 5 caretaker seats** — this is a baseline feature, NOT a marketed/highlighted differentiator; keep it out of pricing comparisons and sales copy.
- **ALL plans (including monthly subscriptions) are subject to payment processing fees** — card + FX, passed through at cost. State this clearly on every pricing surface.
- **Property cap: 10 per owner for now.** We are deliberately NOT offering tiers above 10 properties — the focus is individual renters, not professional managers/portfolios.

### Crossover logic
Owner should switch from Pay-as-you-go to **Starter** when annual booking volume exceeds ~$2,880 (the point where the $144/yr Starter flat fee beats 5% commission), then to **Host** when they add a second property. Given Los Cabos/Baja nightly rates, most active owners cross the first threshold quickly — steering the base toward predictable subscription revenue.

---

## Feature Specifications

### Guest CRM (the core moat)
- Private guest directory: name, contact, stay history, notes, preferences — owned by the owner, never shared
- Guest trust tiers: "vetted," "returning," "referral" — different booking rules per tier
- One-click re-invite: season-end email to past guests with a date-hold window
- Referral system: trusted guest shares a link, new guest is pre-vetted by association
- One-click rebook: post-checkout email ("same dates next year?") with all guest info pre-filled

### Booking Flow (guest-facing)
- Guest receives a private booking link (no public marketplace listing required)
- Guest sees: dates, price, verified-owner badge, rental agreement, payment summary
- No account required for guest; works on mobile
- Transparent fee breakdown — no hidden charges
- Payment held in escrow until check-in
- Damage deposit held separately, released automatically after inspection window

### Trust and Safeguards
- **Escrow:** guest funds held until check-in via Stripe delayed payout. This is the most important consumer trust feature — lead with it in UX copy.
- **Verified Owner badge:** all owners identity-verified via Stripe Connect KYC as condition of payout
- **Property verification:** ownership document upload, manual review, gates public listing mode
- **Rental agreement:** auto-generated per booking (DocuSeal), guest signs digitally before payment clears; signed copies stored permanently
- **Booking guarantee (future):** platform-backed promise for public bookings — do NOT launch this until a funded reserve exists and clear payout rules are written

### Messaging (automated)
Auto-send these messages on schedule:
1. Booking confirmation (immediate)
2. Pre-arrival info (configurable days before check-in)
3. Check-in instructions (day of check-in)
4. Mid-stay check-in (optional)
5. Checkout reminder
6. Deposit release confirmation

### Digital House Manual
- Private link, accessible without app download
- Contains: WiFi, check-in codes, appliance instructions, parking, house rules, local recommendations
- Updated once by owner, delivered automatically forever

### Income Reporting
- Annual income summary: total income, nights booked, occupancy rate, top guests
- Export-ready for tax purposes (raw data for the owner's accountant)
- Multi-property consolidated view (Pro plan)
- **NOT building a cross-border tax helper at launch** (US/Canada vs. Mexican ISR/IVA/ISH). Too complex/liability-sensitive. Provide export data only; FG does not give tax advice.

### Cross-Border Features (Mexico market — committed for launch)
These six are the differentiators for US/Canadian owners renting in Mexico. Detail in `docs/planning/product-feature-brief-mexico.md`.
1. **Multi-currency pricing + cross-border payouts** — show prices in USD/CAD/MXN; owner chooses payout currency and destination bank (US/Canada/Mexico). FX passed at cost.
2. **Bilingual booking + AI-translated messaging** — EN/ES booking pages and two-way translated guest messaging.
3. **Cross-border trust stack** — escrow + Verified Owner + Truvi screening/damage (Truvi supports Mexico), messaged as "safe to book a home in Mexico."
4. **Long-stay support + installment payments** — weekly/monthly rates; deposit-now/balance-later for snowbird stays.
5. **Remote-owner operations** — scoped caretaker/cleaner login (no payments or full guest list) + digital check-in (lockbox/smart codes).
6. **Baja house-manual templates + season-timed re-invite** — local templates (water/cistern, power/blackouts, 4×4 roads, Spanish phrases) + guest import and re-invite timed to Nov–Apr high season.

Property ownership verification (Gate 2) must accept **fideicomiso (bank trust)** and Mexican-corporation documents (coastal property is in the restricted zone). NOTE: Mexican tax/legal specifics (ISR/IVA/ISH, fideicomiso) need professional verification before any owner-facing claims.

---

## Architecture Decisions

### Stripe Connect — use CUSTOM accounts
- Maximum insulation of owners from Stripe brand
- Owner experience: "Familiar Guest pays me" — Stripe invisible
- Use Stripe-hosted/embedded verification components even in Custom so FG never stores SSNs or ID documents
- Stripe Connect handles: KYC identity verification, payout bank accounts, fund holding, and payee compliance
- FG platform is responsible for: owner support, payout timing, disputes (this is the trade-off for insulation)

### Two Booking Modes
1. **Trusted-guest mode** (after Gate 1 / Stripe verification): send booking links to known guests, collect payment. Lower bar — this is the core use case.
2. **Public mode** (after Gate 2 / property verification): accept stranger bookings with escrow + guarantee + optional screening. Higher bar — for owners ready to expand beyond known guests.

### Free Bookings Mechanic
- Owner marks a booking as "free" (friends/family) — $0 guest payment
- Owner is charged $5 per free booking from their card on file
- Card on file only required if the owner has the free-bookings feature enabled
- If charge fails -> booking is blocked with an error to the owner; guest does not see this

### Supabase schema considerations
Key entities: owners, properties, listings, guests, bookings, agreements, calendar_feeds, payouts, screening_results

---

## MVP Build Sequence (in this order)

1. **Marketing site** — Next.js static pages, waitlist email capture (Resend), deploy to Vercel. [Mockup HTML already exists — see below]
2. **Owner auth and onboarding** — Supabase Auth (email + magic link), Stripe Connect Custom account creation + embedded KYC
3. **Property creation** — listing form, photo upload (cloud OAuth + drag-drop + mobile), AI description generation (Anthropic API)
4. **iCal calendar sync** — import inbound feeds, generate and expose outbound feed, display last-synced status
5. **Booking page** — guest-facing, branded, works without guest account
6. **Payments and escrow** — Stripe payment intents, escrow hold, damage deposit, webhook handling for check-in release
7. **Rental agreement** — DocuSeal integration, auto-generate per booking, store signed copy
8. **Guest CRM and messaging** — guest directory, Resend-powered automated sequence
9. **Guest screening add-on** — Truvi/Superhog embedded integration
10. **One-click rebook + referral system**

### What outside contract help should review
The following are safety-critical and should be reviewed by an experienced engineer before going to production ($5,000 budget):
- Stripe Connect webhook handling (silent failure risk — if a booking webhook fails at 11pm, the confirmation never sends)
- Escrow hold-and-release logic (wrong payout timing has legal and financial consequences)
- Stripe Connect negative balance and fraud liability
- Security hardening (input validation, rate limiting, auth edge cases)
- Property ownership document storage security (PII)

---

## Key Files and Assets (already created)

| File | Description | Location |
|---|---|---|
| Marketing site mockup | Self-contained HTML, full design | docs/mockups/marketing-site.html |
| Business Opportunity Brief | Markdown + PDF + Word (solo-founder financials) | docs/business/ |
| Industry & Competitive Assessment | Markdown + PDF + Word | docs/business/ |
| 3-Year Financial Model (v2) | **Authoritative** — re-modeled for Starter/Host/Pro; feasibility + OpEx-risk analysis | docs/business/financial-model-v2.md + Familiar_Guest_Financial_Model_v2.xlsx |
| 3-Year Financial Model (v1, legacy) | Original Excel (pre-pricing-change) | docs/business/Familiar_Guest_Financial_Model.xlsx |
| MVP Development Plan | 30-day build plan, Stripe test-mode strategy, costs | docs/planning/mvp-development-plan.md |
| Differentiating Features Brief | Stack-ranked top-5 general features | docs/planning/differentiating-features-brief.md |
| Baja Beachhead Features Brief | Market analysis + cross-border feature ranking | docs/planning/baja-beachhead-features-brief.md |
| Product Feature Brief (Mexico) | **Authoritative** consolidated feature set + pricing | docs/planning/product-feature-brief-mexico.md |
| Product Sheet (Mexico) | 3-page marketing sheet for owners | docs/marketing/product-sheet-mexico.md |
| Owner Preview Invite | Founding-owner test invitation | docs/business/owner-preview-invite.md |

**Doc generation:** styled docs are authored in Markdown with a CSS `<style>` block + YAML front matter, then rendered to PDF via `npx md-to-pdf <file.md>` and to Word via `npx markdown-docx -i <file.md> -o <file.docx>`. All use the brand design tokens below.

### Marketing site design tokens
- Display font: Fraunces (Google Fonts, serif, warm editorial)
- Body font: Hanken Grotesk (Google Fonts, clean grotesk)
- Primary accent: `#14543F` (deep forest green)
- Secondary accent: `#C0673E` (terracotta clay)
- Background: `#FBF6EE` (warm cream/paper)
- Ink: `#2A241E` (warm near-black)
- Border/line: `#E6DBCB`

---

## Competitive Context (brief)

| Player | Why owners leave |
|---|---|
| Airbnb | 15.5% host fee, owns the guest relationship, no AirCover off-platform |
| OwnerRez | Powerful but utilitarian, longer setup, no native payment processor |
| Lodgify | Depends on owner's own SEO to drive traffic |
| Hospitable | Direct booking is a paid add-on; built around OTA automation |
| Houfy | Fee-free but a discovery marketplace — owner must compete for visibility |

**Our lane:** effortless owner setup (minutes, not days), repeat/trusted guest focus (not discovery), trust built in by default (escrow + verification), invisible to the guest (owner's brand, not ours).

---

## Financial Context (revised June 2026 — solo-founder model)

### Development model
Solo founder with professional developer and product management experience, building with AI-assisted tools (Claude Code, Cursor). $5,000 budgeted for contract review of safety-critical components. No full-time hires planned until unit economics justify it.

### P&L Summary (v2 — re-modeled June 2026 for Starter/Host/Pro pricing)
Authoritative model: `docs/business/financial-model-v2.md` (+ `Familiar_Guest_Financial_Model_v2.xlsx`).

| Metric | Year 1 | Year 2 | Year 3 |
|---|---|---|---|
| Avg active owners | 250 | 2,000 | 7,500 |
| Blended ARPU | $200 | $200 | $200 |
| Revenue (subscription/commission) | $50,000 | $400,000 | $1,500,000 |
| Gross profit (76%) | $38,000 | $304,000 | $1,140,000 |
| Operating expenses (Base) | $35,000 | $200,000 | $650,000 |
| Operating profit (Base) | $3,000 | $104,000 | $490,000 |
| Operating margin (Base) | 6% | 26% | 33% |

**Blended ARPU dropped ~$350 → ~$200** (the $12 Starter dominates a single-home beachhead). Mix assumed: PAYG 25% / Starter 50% / Host 20% / Pro 5%.

### THE central risk — guard against OpEx outrunning revenue
Subscription revenue AND support cost both scale with owner count. A cross-border, money-handling product is support-heavy. The prior ultra-lean OpEx ($11k–$48k) is unrealistic at 12,000 owners. Stress case (support staffed ~linearly) → Year 3 OpEx ~$1.15M → **operating LOSS despite $1.5M revenue.**

**The fix (do these): add revenue that scales with GMV, not owner count.**
1. **Modest transparent FX spread (~0.5–1%)** — biggest lever; GMV-linked; still beats banks. With a 0.75% spread the business stays profitable even in the Stress OpEx case. (Keep card processing at cost; apply spread to FX only.)
2. **AI-first bilingual support** (extend the AI Concierge) — deflect >70% of tickets; keeps the owner-scaling cost sublinear.
3. **Tilt revenue to GMV-linked streams** — add-on attach, test 6% PAYG take, small per-booking fee.
4. **Nearshore variable support**, no premature FT hires.
5. **Protect ARPU** — test Starter $15–19 or hold $12 strictly as an upgrade funnel; annual billing.
6. **Tripwire metric:** track support-cost-per-owner and OpEx-growth-rate vs revenue-growth-rate monthly; support cost per owner must trend flat/down.

Pricing note: **$12 Starter is the thinnest-margin plan** — viable only with AI support deflection, else raise to $15–19. PAYG 5% is generous (room to test 6%).

---

## Things Decided Against (do not revisit without flagging)

- **No concierge listing-build service** — owner self-serves with cloud/phone/drag-drop + AI description
- **No advertising revenue** — trust-based positioning; ads would undermine it
- **No marketplace/discovery** — Familiar Guest is the trust layer for the owner's own guests, not a guest-finding service
- **Not targeting property managers** — casual individual owners only at launch
- **No Airbnb API partnership pursuit** — program largely closed, not worth the effort at this stage
- **Stripe Connect Standard declined** — too much Stripe exposure for owners; Custom is the choice

---

## Development Conventions

- **Branch:** feature branches off `main`, PR to merge. Protect `main`.
- **Env vars:** never commit secrets. Use `.env.local` locally, Vercel environment variables in production. Document every required variable in `.env.example`.
- **Staging vs. production:** maintain a staging environment on Vercel before any production deploy. Use Stripe test mode until staging is stable.
- **Webhooks:** all Stripe webhooks must be verified with the webhook signing secret before processing. Log every webhook event. Handle idempotency.
- **Errors:** never expose raw Stripe or Supabase errors to the guest-facing booking page. Map to friendly messages.
- **Accessibility:** booking page and owner onboarding must be keyboard-navigable and screen-reader compatible. Guests booking include older adults and non-technical users.

---

*Last updated: June 2026 — revised with solo-founder operating model.*
*For questions about decisions in this file, the rationale is in the original chat session.*
