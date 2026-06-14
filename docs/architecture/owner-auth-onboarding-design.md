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
  footerTemplate: "<div style='font-size:9px; color:#8a7e72; width:100%; text-align:center; padding:0 40px;'>Familiar Guest — Owner Auth &amp; Onboarding Design &nbsp;|&nbsp; Confidential</div>"
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
  code { background:#FBF6EE; border:1px solid #E6DBCB; border-radius:4px; padding:1px 5px; font-size:10px; }
  .stages { display:flex; gap:6px; align-items:stretch; margin:10px 0; }
  .stage { flex:1; background:#fff; border:1px solid #E6DBCB; border-radius:8px; padding:9px 8px; font-size:10px; }
  .stage b { color:#14543F; font-size:10.5px; }
  .stage.gate { background:#14543F; color:#fff; } .stage.gate b { color:#e8d5b7; }
  .arrow { align-self:center; color:#C0673E; font-weight:700; font-size:15px; }
  .footer-note { font-size:10px; color:#8a7e72; font-style:italic; }
  .ok { color:#14543F; font-weight:700; }
</style>

# Owner Auth &amp; Onboarding — Design

<div class="subtitle">MVP step 2: authentication, Gate 1 (identity) and Gate 2 (property ownership)</div>

<p class="lead">Design for owner sign-up, sign-in, and the two-gate onboarding flow defined in the project memory: Stripe Connect Custom identity verification (Gate&nbsp;1, required before any listing or payout) and property-ownership verification (Gate&nbsp;2, required only to unlock Public Mode). Code is not yet implemented — this document defines the schema, flows, and routes to build against.</p>

---

## 1 · Authentication Flow

Supabase Auth, email magic-link only (no passwords). Session refresh handled by Next.js middleware on every request.

<div class="stages">
  <div class="stage"><b>1. Enter email</b><br/>/login — owner enters email, requests magic link</div>
  <div class="arrow">&#8594;</div>
  <div class="stage"><b>2. Magic link email</b><br/>Supabase Auth sends link (custom SMTP via Resend before launch)</div>
  <div class="arrow">&#8594;</div>
  <div class="stage"><b>3. Callback</b><br/>/auth/callback exchanges code for session, sets cookies</div>
  <div class="arrow">&#8594;</div>
  <div class="stage gate"><b>4. Owner row check</b><br/>DB trigger ensures an <code>owners</code> row exists for this auth user</div>
  <div class="arrow">&#8594;</div>
  <div class="stage"><b>5. Route by status</b><br/>New → /onboarding; Gate&nbsp;1 done → /dashboard</div>
</div>

<div class="callout"><p><strong>Routes:</strong> <code>/login</code> (public), <code>/auth/callback</code> (public, route handler), <code>/onboarding/*</code> (authenticated, Gate-1 incomplete), <code>/dashboard/*</code> (authenticated, Gate-1 complete). <code>middleware.ts</code> refreshes the Supabase session cookie and redirects unauthenticated users to <code>/login</code>.</p></div>

---

## 2 · Owner Onboarding Flow — Two Gates

<div class="stages">
  <div class="stage"><b>Sign up</b><br/>Magic-link auth creates <code>owners</code> row (status: <code>new</code>)</div>
  <div class="arrow">&#8594;</div>
  <div class="stage"><b>Profile</b><br/>Name, phone, country, language (EN/ES), currency preference</div>
  <div class="arrow">&#8594;</div>
  <div class="stage gate"><b>Gate 1 — Identity</b><br/>Stripe Connect Custom embedded onboarding (KYC). Hard gate: no listing, no payout until passed.</div>
  <div class="arrow">&#8594;</div>
  <div class="stage"><b>Trusted-Guest Mode</b><br/>Owner can create properties &amp; send booking links to known guests</div>
</div>

<div class="stages">
  <div class="stage"><b>Owner adds property</b><br/>Listing form, photos, GPS (required for MX), pricing/policy defaults</div>
  <div class="arrow">&#8594;</div>
  <div class="stage"><b>Owner enables &quot;Open to public&quot;</b><br/>Triggers Gate 2 for that specific property</div>
  <div class="arrow">&#8594;</div>
  <div class="stage gate"><b>Gate 2 — Ownership</b><br/>Upload tax statement / deed / utility bill / insurance decl. (or fideicomiso / MX-corp docs). Manual review.</div>
  <div class="arrow">&#8594;</div>
  <div class="stage"><b>Public Mode</b><br/>&quot;Verified Owner&quot; badge on that listing; escrow + booking-guarantee rules apply</div>
</div>

<div class="callout"><p><strong>Key rule:</strong> Gate 1 is per <em>owner</em> (one Stripe Connect account). Gate 2 is per <em>property</em> — an owner with five properties can have some in Trusted-Guest Mode and others in Public Mode independently, since the ownership document must match each property's address/coordinates.</p></div>

<div class="page-break"></div>

## 3 · Database Schema (Supabase / Postgres)

All tables use Postgres <code>uuid</code> primary keys (`gen_random_uuid()`) and `created_at` / `updated_at` timestamps (`timestamptz`, default `now()`). Row-Level Security (RLS) is enabled on every table; policies are summarized per table.

### `owners`
One row per authenticated user. Created by a trigger on `auth.users` insert.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | = `auth.users.id` |
| `email` | text | mirrored from auth for convenience/search |
| `full_name` | text | nullable until profile step |
| `phone` | text | nullable |
| `country` | text | owner's home country (US/CA/etc.) |
| `locale` | text | `en` \| `es`, default `en` |
| `payout_currency` | text | default `USD`; `CAD`/`MXN` selectable later |
| `onboarding_status` | text | `new` \| `profile_complete` \| `gate1_complete` |
| `stripe_account_id` | text | Stripe Connect Custom account id, nullable |
| `stripe_onboarding_status` | text | `not_started` \| `pending` \| `verified` \| `restricted` |
| `stripe_requirements_due` | jsonb | cached `requirements.currently_due` for support visibility |
| `created_at`, `updated_at` | timestamptz | |

**RLS:** owner can `select`/`update` only their own row (`id = auth.uid()`). Service-role only for `insert` (via trigger) and for writing `stripe_*` columns from webhooks.

### `properties`
Minimal stub sufficient to support Gate 2 and the onboarding flow; full listing fields (pricing, policies, amenities) are out of scope for this design and land with the Property Creation step.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `owner_id` | uuid, FK → `owners.id` | |
| `name` | text | working title, e.g. "Casa Azul — Todos Santos" |
| `country` | text | `US` \| `MX` |
| `address` | text | nullable for MX |
| `latitude`, `longitude` | numeric | **required when `country = 'MX'`** |
| `mode` | text | `trusted_guest` \| `public`, default `trusted_guest` |
| `created_at`, `updated_at` | timestamptz | |

**RLS:** owner can CRUD rows where `owner_id = auth.uid()`. Public booking-page reads happen through a separate `select`-only policy scoped by listing id (added when the booking page is built) — not required for this step.

### `ownership_verifications` (Gate 2)
One row per Gate-2 submission for a property. A property may have multiple rows if a submission is rejected and resubmitted.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid, PK | |
| `property_id` | uuid, FK → `properties.id` | |
| `owner_id` | uuid, FK → `owners.id` | denormalized for RLS simplicity |
| `document_type` | text | `property_tax_statement` \| `deed` \| `utility_bill` \| `insurance_declaration` \| `fideicomiso` \| `mx_corp_docs` |
| `storage_path` | text | path in `ownership-documents` bucket |
| `status` | text | `pending` \| `approved` \| `rejected`, default `pending` |
| `reviewer_notes` | text | nullable, set on reject |
| `reviewed_by` | uuid | nullable, admin user id |
| `reviewed_at` | timestamptz | nullable |
| `submitted_at` | timestamptz | default `now()` |

**RLS:** owner can `insert`/`select` their own rows (`owner_id = auth.uid()`); only service-role (admin console) can `update` status/review fields.

### Storage buckets

| Bucket | Access | Contents |
|---|---|---|
| `ownership-documents` | private — owner can upload/read own files; service-role for admin review | Gate-2 documents (PII — tax statements, deeds, fideicomiso) |
| `property-photos` | public read, authenticated write (owner-scoped folder) | Listing photos |

<div class="callout"><p><strong>Compliance note:</strong> no SSNs or government IDs are stored anywhere in this schema — Stripe Connect's embedded components handle that PII directly (per <code>CLAUDE.md</code> hard constraint #3). The <code>ownership-documents</code> bucket holds property-ownership PII only and is access-controlled accordingly.</p></div>

<div class="page-break"></div>

## 4 · Application Routes

| Route | Auth | Purpose |
|---|---|---|
| `/login` | public | Email entry, sends magic link |
| `/auth/callback` | public | Exchanges magic-link code for session |
| `/onboarding/profile` | owner, pre-Gate1 | Name, phone, country, locale, currency |
| `/onboarding/verify` | owner, pre-Gate1 | Embeds Stripe Connect Custom onboarding component (Gate 1) |
| `/dashboard` | owner, Gate1 complete | Landing — properties list, status summary |
| `/dashboard/properties/new` | owner, Gate1 complete | Create property (stub fields per schema above) |
| `/dashboard/properties/[id]/verify` | owner, Gate1 complete | Upload Gate-2 ownership document, shows review status |

`middleware.ts` enforces: unauthenticated → `/login`; authenticated + `onboarding_status != 'gate1_complete'` → `/onboarding/*`; authenticated + Gate-1 complete visiting `/onboarding/*` → redirect to `/dashboard`.

---

## 5 · Coverage Check Against Required Features

| Requirement (from project memory) | Covered by this design |
|---|---|
| Email + magic-link auth (Supabase Auth) | <span class="ok">✓</span> Section 1 |
| Gate 1 — Stripe Connect Custom embedded KYC, hard gate before listing/payout | <span class="ok">✓</span> `owners.stripe_*` columns + `/onboarding/verify`; middleware blocks `/dashboard` until `gate1_complete` |
| No SSNs/ID documents stored on our servers | <span class="ok">✓</span> Stripe-hosted components only; schema has no PII fields for Gate 1 |
| Trusted-Guest Mode unlocked on Gate-1 pass | <span class="ok">✓</span> `onboarding_status = 'gate1_complete'` unlocks `/dashboard` + property creation |
| Gate 2 — property ownership verification, per listing, manual review | <span class="ok">✓</span> `ownership_verifications` table + `/dashboard/properties/[id]/verify`, status `pending/approved/rejected` |
| Gate 2 accepts US docs (tax statement, deed, utility bill, insurance) AND MX (fideicomiso, MX-corp docs) | <span class="ok">✓</span> `document_type` enum covers both |
| Public Mode unlocked per-property on Gate-2 pass | <span class="ok">✓</span> `properties.mode` flips `trusted_guest` → `public` on `approved` |
| GPS coordinates required for Mexico properties | <span class="ok">✓</span> `properties.latitude/longitude`, required when `country = 'MX'` |
| Bilingual (EN/ES) support | <span class="ok">✓</span> `owners.locale` drives UI language from first profile step |
| Multi-currency payout preference captured early | <span class="ok">✓</span> `owners.payout_currency` (USD default, CAD/MXN selectable) |
| RLS — owners see only their own data | <span class="ok">✓</span> policies defined per table |
| Caretaker seats (5 per plan) | <em>Not in this design</em> — deferred; will extend `owners`/`properties` with a `caretakers` join table when the caretaker portal is built |
| Property listing fields (pricing, policies, amenities) | <em>Not in this design</em> — `properties` is intentionally a stub; full listing schema arrives with the Property Creation step (MVP step 3) |

<p class="footer-note">This design covers MVP build-sequence step 2 (owner auth and onboarding) in full, including both onboarding gates. Caretaker access and full property/listing fields are explicitly out of scope and noted for their respective later steps.</p>
