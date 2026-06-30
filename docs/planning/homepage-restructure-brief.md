# Home Page Restructure — Implementation Brief

> **For:** Claude Code, working in the `familiar-guest-portal` Next.js repo.
> **Goal:** Restructure the famguest.com home page so it serves **three audiences** — prospective owners, current owners, and guests — and gives both owners and guests an obvious way back into their portal.
> **Read first:** `CLAUDE.md` (authoritative product context) and the visual reference mockup `docs/mockups/marketing-site-v2.html`.

---

## Why this change

The current home page is a single funnel aimed only at converting **new owners** (waitlist). It has no login and nothing for guests. But three different people land on famguest.com:

| Audience | Intent on the home page | What they need |
|---|---|---|
| **Prospective owner** | Evaluating / deciding to sign up | The existing owner sales funnel (keep it — it's the main scroll) |
| **Current owner** | "How do I get back to my dashboard?" | A fast, obvious **Owner login** |
| **Guest** | NOT shopping (we're not a marketplace). They want to (a) get back to their booking / house guide, or (b) confirm a booking link is legit before paying | Wayfinding + trust reassurance, and a way back in |

**Guiding principle:** do not turn the page into three competing sales pitches. The owner funnel stays primary. Guest content is *reassurance + re-entry*, not a second funnel.

---

## Source of truth

`docs/mockups/marketing-site-v2.html` is a complete, self-contained HTML/CSS/JS mockup of the target design. **Match its structure, copy, layout, and brand styling.** Translate it into the project's Next.js + component conventions — do not just copy the raw HTML into a page if the repo already has a component system. Reuse existing design tokens (see "Brand tokens" below and `CLAUDE.md`).

If the marketing site does not yet exist in the repo, this brief plus the mockup defines it (MVP build step #1 in `CLAUDE.md`).

---

## Scope of changes

### 1. Top navigation — add a router and two logins
Add to the right side of the nav, in this order:
- **Guest sign-in** (text/link button) → opens the guest "Find my stay" modal
- **Owner login** (ghost button) → opens the owner login modal
- **Join the waitlist** (primary button) → keep as the loudest CTA (owner acquisition is still the business)

Also add a **For guests** link to the nav section links.

### 2. Audience-router strip (under the hero)
Three cards so non-prospects self-select out without scrolling the whole pitch:
- **I own a place** → scrolls to the "How it works" section
- **I'm an owner — log me in** → opens owner login modal
- **I'm a guest** → opens guest "Find my stay" modal

### 3. "For guests" section (new, placed just before the waitlist CTA)
A trust + wayfinding block, **not** a funnel. Include:
- Heading: "Booking a stay through Familiar Guest?"
- Reassurance points (pull exact framing from `CLAUDE.md` → Trust and Safeguards):
  - Payment is **held until check-in**, released to the owner only after arrival
  - The owner is **identity-verified**
  - Everything (dates, agreement, receipts, house guide) is emailed and always re-openable
- Actions: **Find my booking** and **Open my house guide** (both open the guest modal)
- A "Returning guest?" email box → **Find my stay** (magic-link, see #6)
- Give the section `id="guests"` so the nav link anchors to it.

### 4. Footer — add a "Sign in" column
New column with: **Owner login**, **Guest — find my stay**, **Caretaker login** (caretaker = scoped access; see `CLAUDE.md` cross-border feature #5). Footer is where lost users hunt.

### 5. Mobile menu
The hamburger must open a full-screen menu containing all section links **plus** the three auth actions (Join the waitlist, Owner login, Guest find-my-stay). Closes on X, link tap, or Escape; locks background scroll while open. Logins must NOT disappear on mobile — many guests are on phones.

### 6. Login modals (3)
- **Owner login** — email + password, "forgot password" link, link to waitlist for new owners.
- **Caretaker login** — email + password; note that access is set up by the owner.
- **Guest "Find my stay"** — **email only, magic-link** (no password field). See critical note below.

---

## ⚠️ Critical product constraint — guests are account-less

`CLAUDE.md` states **"No account required for guest."** Do **not** build a username/password guest portal — it contradicts the product model.

The guest "sign-in" must be a **magic-link lookup**: guest enters the email their owner invited, and we email a secure link to their booking(s), house guide, receipts, and messages. This is also better UX for the older/non-technical/cross-border guest demographic.

- Stack already chosen (`CLAUDE.md`): **Supabase Auth** (email + magic link) and **Resend** for transactional email. Use these for the real flow.
- Label it **"Guest sign-in"** in the nav for recognition, but the flow is magic-link, not a password.

---

## Real auth wiring (when going beyond the mockup)

The mockup's modal submit handlers are fake (`fakeAuth(...)`). For the real implementation:
- **Owner / Caretaker:** Supabase Auth sign-in → redirect to their respective dashboards. Caretaker accounts are scoped (no payments, no full guest list).
- **Guest:** Supabase magic-link / OTP email via Resend → link resolves to the guest's booking view. Account-less: the link is the credential. Do not require a password.
- Keep the booking page and these flows **keyboard-navigable and screen-reader compatible** (`CLAUDE.md` accessibility rule — guests include older adults).
- Friendly error messages only; never surface raw Supabase/Stripe errors (`CLAUDE.md` conventions).

If the dashboards/booking views don't exist yet, stub the post-auth redirects with TODOs and a clear note in the PR — do not block the home page on them.

---

## Brand tokens (must match — from `CLAUDE.md`)
- Display font: **Fraunces** (Google Fonts, serif)
- Body font: **Hanken Grotesk** (Google Fonts)
- Primary accent: `#14543F` (deep forest green)
- Secondary accent: `#C0673E` (terracotta clay)
- Background: `#FBF6EE` (warm cream)
- Ink: `#2A241E` ・ Border/line: `#E6DBCB`

---

## Content accuracy — fix stale pricing
The OLD mockup (`marketing-site.html`) shows outdated plans ("Solo $29 / Pro $59"). Use the **authoritative pricing from `CLAUDE.md`** (v2 mockup already reflects this):

| Plan | Price | Note |
|---|---|---|
| Pay-as-you-go | 5% + card fees; $5 per free booking | No monthly |
| Starter | $15/mo | 1 property |
| **Host** | **$29/mo** | up to 5 properties — mark **"Most popular"** |
| Pro | $49/mo | 6–10 properties + consolidated reports |

Always state: every owner is identity-verified; card processing (and FX) passed through at cost. Do **not** paywall trust/money-movement features — all plans include them.

---

## Out of scope / do not do
- **No marketplace or public listing discovery.** Guests arrive via a private owner link; the home page never lists properties for browsing.
- **Do not** add a password-based guest account.
- **Do not** change the core owner funnel sections (hero, problem, how-it-works, features, trust) beyond the additions above and the pricing fix.
- Respect all hard stops in `CLAUDE.md` (no Airbnb scraping, no storing SSN/IDs, Stripe handles KYC, etc.).

---

## Acceptance checklist
- [ ] Nav shows Guest sign-in, Owner login, and Join the waitlist (desktop)
- [ ] Audience-router strip with 3 cards under the hero, each routing correctly
- [ ] "For guests" section present (`id="guests"`), reassurance + find-my-stay, linked from nav
- [ ] Footer has a "Sign in" column (Owner / Guest / Caretaker)
- [ ] Hamburger opens a mobile menu with all links + 3 auth actions; closes on X / link / Esc
- [ ] Three modals open/close correctly; guest modal is **email-only (magic link)**, no password
- [ ] Owner funnel intact; pricing updated to Starter/Host/Pro ($15/$29/$49)
- [ ] Matches brand tokens; keyboard- and screen-reader-accessible
- [ ] Real flows use Supabase Auth + Resend (or clearly-marked stubs if dashboards aren't built)

---

*Visual reference: `docs/mockups/marketing-site-v2.html` · Product context: `CLAUDE.md`*
