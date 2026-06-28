---
title: Platform Tax Obligations — Mexico, US, and Canada — Familiar Guest
date: June 2026
---

<style>
  body {
    font-family: 'Georgia', 'Times New Roman', serif;
    color: #16302B;
    background: #fff;
    line-height: 1.65;
    font-size: 13px;
    max-width: 780px;
    margin: 0 auto;
    padding: 40px 48px;
  }
  h1 {
    font-family: Georgia, serif;
    font-size: 24px;
    color: #0F4D45;
    font-weight: 600;
    border-bottom: 2px solid #0F4D45;
    padding-bottom: 10px;
    margin-bottom: 6px;
  }
  .subtitle {
    font-size: 12px;
    color: #4F605A;
    margin-bottom: 28px;
  }
  h2 {
    font-family: Georgia, serif;
    font-size: 17px;
    color: #0F4D45;
    font-weight: 600;
    margin-top: 32px;
    margin-bottom: 8px;
    border-left: 4px solid #5FB8A4;
    padding-left: 10px;
  }
  h3 {
    font-family: Georgia, serif;
    font-size: 14px;
    color: #14635A;
    font-weight: 600;
    margin-top: 20px;
    margin-bottom: 6px;
  }
  h4 {
    font-size: 13px;
    color: #16302B;
    font-weight: 700;
    margin-top: 16px;
    margin-bottom: 4px;
  }
  blockquote {
    background: #FBF0EA;
    border-left: 4px solid #D9663F;
    border-radius: 4px;
    padding: 10px 16px;
    margin: 16px 0;
    font-size: 12px;
    color: #C25A3A;
  }
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 12px;
  }
  th {
    background: #0F4D45;
    color: #fff;
    padding: 7px 10px;
    text-align: left;
    font-weight: 600;
  }
  td {
    padding: 6px 10px;
    border-bottom: 1px solid #E0D6C5;
    vertical-align: top;
  }
  tr:nth-child(even) td { background: #F6F1E8; }
  code {
    background: #F6F1E8;
    border: 1px solid #E0D6C5;
    border-radius: 3px;
    padding: 1px 5px;
    font-size: 11px;
    font-family: 'Courier New', monospace;
  }
  ul, ol { padding-left: 20px; margin: 8px 0; }
  li { margin-bottom: 4px; }
  strong { color: #0B3A34; }
  hr { border: none; border-top: 1px solid #E0D6C5; margin: 28px 0; }
  p { margin: 0 0 10px; }
  .warn {
    background: #FBF0EA;
    border: 1px solid #F0D9C9;
    border-radius: 6px;
    padding: 10px 14px;
    margin: 14px 0;
    font-size: 12px;
    color: #C25A3A;
  }
  .pill {
    display: inline-block;
    background: #E7F2EE;
    color: #14635A;
    border-radius: 4px;
    padding: 2px 8px;
    font-size: 11px;
    font-weight: 700;
  }
  .pill-amber {
    background: #FBF0EA;
    color: #C25A3A;
  }
</style>

# Platform Tax Obligations — Mexico, US, and Canada — Familiar Guest

<div class="subtitle">Status: Pre-launch research &nbsp;|&nbsp; Date: June 2026 &nbsp;|&nbsp; Applies to: All Familiar Guest property transactions</div>

> **Do NOT collect live MX payments until Mexican tax counsel confirms the legal structure.** This document is internal research, not legal advice.

---

## Short Answer: Mandatory Withholding, Not Optional

Mexico distinguishes between two platform types:

| Platform type | Example | Tax obligation |
|---|---|---|
| Marketplace only (connects buyer/seller) | Craigslist | Lighter |
| **Payment-processing platform** | **Familiar Guest, Airbnb** | **Mandatory withholding** |

Because Familiar Guest collects money from guests and remits to owners via Stripe Connect, Mexican law classifies FG as a **withholding agent**. This obligation cannot be waived or shifted to owners — the moment FG processes the payment, FG is legally responsible for withholding and remitting.

---

## The Three Tax Layers

### 1. IVA (Federal VAT) — Mandatory

**Legal basis:** ISR/IVA law Articles 18-D and 18-J (effective June 2020).

- Rate: **8%** on rental amount (reduced tourism/border rate — not the standard 16%)
- FG must withhold from each guest payment and remit to SAT monthly
- FG must file monthly informational returns
- **Owners cannot opt out.** If FG touches the payment, FG is the withholding agent.

### 2. ISR (Federal Income Tax) — Mandatory

**Legal basis:** Same 2020 legislative package as IVA.

FG must withhold ISR from the **owner's payout** at:

| Monthly rental income | ISR withholding rate |
|---|---|
| Up to MXN 25,000 | 2% |
| MXN 25,000 – 50,000 | 4% |
| Above MXN 50,000 | 10% |
| **Owner has no Mexican RFC** | **20% flat** |

Owners with an RFC who file their own Mexican returns can potentially recover/offset withheld ISR — but FG still withholds and remits upfront. FG provides owners an annual statement of amounts withheld.

### 3. ISH (State Lodging Tax) — Ambiguous for platforms

ISH is a **state-level** tax. Rates vary:

| State | ISH Rate |
|---|---|
| Baja California Sur (our beachhead) | 3% |
| Jalisco | 4% |
| Quintana Roo | 3% |
| Others | 2–5% |

The digital platform mandate for ISH is **not uniformly codified** at the state level. BCS specifically needs counsel confirmation.

**Tentative approach:** Collect ISH as a guest-facing line item; remittance method (FG vs. owner) depends on BCS counsel guidance.

---

## SAT Registration Requirement

FG must register with SAT as a **plataforma tecnológica**. This requires:

- A Mexican legal presence or designated representative
- An RFC (Mexican tax ID) for FG as an entity
- Monthly transaction reporting for all Mexico-located stays
- Monthly IVA and ISR remittances

Airbnb, Vrbo, and Booking.com all completed this process in 2020–2021. Budget significant lead time.

---

## Specific Questions for Mexican Tax Counsel

Before taking any live MX payments, resolve these:

1. **Entity structure:** Can FG register with SAT as a foreign platform, or is a Mexican entity required?
2. **ISH in BCS:** Does FG have a direct ISH collection/remittance obligation in Baja California Sur?
3. **US-Mexico tax treaty:** For US-based owners with no RFC, does the treaty modify the 20% flat ISR withholding?
4. **Stripe as intermediary:** Does the Stripe Connect structure shift any withholding obligations? Does SAT view FG or Stripe as the "collector"?
5. **RFC collection:** What is FG's obligation to obtain and verify owner RFCs before processing MX payments?
6. **fideicomiso:** For owners whose Mexico property is held in a bank trust, any special ISR treatment?

---

## Product Features Required to Support IVA and ISR

The following describes the complete feature set needed to be legally compliant. Features are grouped by area and roughly ordered by build sequence.

### Feature Group 1: Mexico Property Identification

Before any tax calculation can happen, FG must know which properties are in Mexico and what state they're in.

**1.1 Country flag on properties**
Add a `country` field to the property form (`MX` / `US`). Auto-detect based on GPS coordinates as a default, but allow manual override. This flag gates all MX tax logic.

**1.2 Mexican state on properties**
Add a `state_mx` field (e.g., `BCS`, `JAL`, `QR`) used to look up the ISH rate. Required for all Mexico properties.

**1.3 ISH rate table**
Maintain a lookup table of ISH rates by Mexican state, updatable without a code deploy (e.g., a `tax_rates` table in Supabase).

---

### Feature Group 2: Owner RFC Collection

The ISR withholding rate depends entirely on whether the owner has provided a Mexican RFC. This must be collected during onboarding for any owner with a Mexico property.

**2.1 RFC field in owner profile**
Add an optional `rfc` text field to the owner's profile/settings. RFC format is: 4 letters + 6 digits + 3 alphanumeric (e.g., `XAXX010101000`). Validate the format client-side.

**2.2 RFC gate in MX payout flow**
If an owner has a Mexico property and no RFC on file, show a prominent prompt to provide one. Warn that without an RFC, 20% ISR withholding applies (vs. 2–10%). Do not block payouts — just warn and apply the 20% rate.

**2.3 RFC verification (optional, phase 2)**
Integrate with SAT's free RFC verification API to confirm the RFC exists and matches the owner's legal name. Not required for launch but reduces compliance risk.

---

### Feature Group 3: Tax Calculation at Booking Time

When a guest pays for a Mexico-located property, the tax amounts must be calculated, stored, and displayed before payment is taken.

**3.1 Tax breakdown on the booking page**
For Mexico properties, show a guest-facing tax breakdown:

```
Rental (5 nights × MXN 3,000)    MXN 15,000
IVA (8%)                           MXN  1,200
ISH — Baja California Sur (3%)     MXN    450
────────────────────────────────────────────
Total charged to guest             MXN 16,650
```

IVA and ISH are collected **on top of** the rental price. The guest pays gross; the rental price is the net.

**3.2 Tax fields on the booking record**
Store all tax amounts on every booking so they can be reported and audited:

| New DB column | What it stores |
|---|---|
| `iva_cents` | IVA collected from guest (8% of rental) |
| `ish_cents` | ISH collected from guest (state rate) |
| `isr_cents` | ISR withheld from owner payout |
| `gross_amount_cents` | Total guest payment including all taxes |
| `isr_rate_pct` | The ISR rate applied (2, 4, 10, or 20) |

**3.3 ISR pre-calculation**
At payout time, look up the owner's total MXN rental income for the current calendar month (summing all paid MX bookings for that owner in the month), determine the rate bracket, and calculate ISR to withhold. This requires a monthly income tracker.

**3.4 Tax amounts on the offer form (owner-facing)**
When an owner creates an offer for a Mexico property, show the tax impact:

```
Guest pays:  MXN 16,650 (incl. IVA + ISH)
Your payout: MXN 13,800 (after ISR withholding)
Taxes remitted to SAT on your behalf: IVA MXN 1,200 + ISR MXN 450
```

---

### Feature Group 4: Payout Split and Remittance Tracking

The tax amounts collected must be held separately from the owner's payout so they can be remitted to SAT.

**4.1 Tax holding account logic**
When Stripe settles funds, logically split each booking payment:
- Owner payout portion → send to owner (less ISR)
- IVA portion → hold for SAT remittance
- ISH portion → hold for SAT or pass to owner (pending counsel)
- ISR withheld from owner → hold for SAT remittance

In practice this is an accounting ledger within FG (Stripe settles the full amount to FG, then FG pays out the owner's net share).

**4.2 Monthly tax remittance ledger (new table: `tax_remittances`)**
Track each month's tax obligations per owner:

| Column | Description |
|---|---|
| `owner_id` | Which owner |
| `month` | YYYY-MM |
| `iva_owed_cents` | Total IVA to remit this month |
| `isr_owed_cents` | Total ISR to remit this month |
| `ish_owed_cents` | Total ISH to remit this month |
| `remitted_at` | When FG actually paid SAT |
| `sat_confirmation` | SAT confirmation reference (optional) |

**4.3 Admin tax dashboard**
An internal (admin-only) view showing:
- Total IVA/ISR/ISH owed per month, across all owners
- Which owners have been paid out, total owner payouts
- Amounts due to SAT this month vs. amounts already remitted
- Per-owner breakdown for SAT informational return preparation

---

### Feature Group 5: Owner Tax Statements

Owners need documentation for their own Mexican and US tax filings.

**5.1 Monthly tax statement**
Generate a downloadable PDF per owner per month showing:
- Gross rental income (MXN)
- IVA collected (8%)
- ISH collected (state rate)
- ISR withheld (rate + amount)
- Net payout to owner (MXN and USD equivalent)

**5.2 Annual Constancia de Retenciones**
Year-end summary of all ISR withheld (equivalent in function to a US 1099). Owners submit this to their Mexican accountant. Generate automatically on January 1 for the prior year, downloadable from the owner portal.

**5.3 Annual income export (existing feature, extended)**
The existing income export should be extended to include a MX-specific column layout with IVA, ISH, ISR, gross rental income, and net payout — formatted for Mexican accountant use.

---

### Feature Group 6: CFDI Electronic Invoicing (Hardest Requirement)

<div class="warn">⚠️ This is the most technically complex requirement and the one most likely to require external integration. Do not underestimate it.</div>

Mexico requires that all commercial transactions be documented with a **CFDI** (Comprobante Fiscal Digital por Internet — digital tax receipt). This is a government-mandated XML document signed and certified by a PAC (Proveedor Autorizado de Certificación — an authorized certification provider).

**6.1 What CFDI covers**
- Every rental transaction must have a CFDI
- FG (as the platform) issues the CFDI as the "emisor" (issuer)
- The owner is the "receptor" (recipient) — their RFC must be on it
- Guest-facing receipts may use a "global CFDI" for B2C transactions (simplified — no individual guest RFC required)

**6.2 PAC integration**
FG must integrate with a SAT-authorized PAC to:
- Receive the transaction data
- Get the CFDI stamped (timbrado) by the PAC
- Store the UUID and XML of every stamped CFDI
- Handle CFDI cancellation if a booking is cancelled

Recommended PACs with APIs suitable for platforms: **Facturapi** (developer-friendly REST API), **Finkok**, **SW SAPiens**. Facturapi costs approximately MXN 5–15 per CFDI stamped.

**6.3 FG's own CSD (Certificado de Sello Digital)**
To issue CFDIs, FG needs its own CSD — a government-issued digital certificate. Requires FG's Mexican entity/RFC and FIEL (Firma Electrónica Avanzada). One-time setup through SAT.

**6.4 CFDI storage**
CFDIs must be stored for 5 years (SAT audit requirement). Store the XML and UUID on each booking record and make them downloadable from the owner portal.

**6.5 Build vs. buy**
Given the complexity, strongly consider a managed CFDI service like Facturapi rather than building direct SAT integration. Facturapi's API abstracts most of the complexity; FG sends a JSON payload, Facturapi handles stamping and returns the signed CFDI.

---

### Feature Group 7: SAT Informational Returns

FG must file monthly informational returns with SAT listing all transactions involving Mexico-located properties.

**7.1 DIOT-equivalent report**
The monthly declaration (currently DIOT — Declaración Informativa de Operaciones con Terceros, or the digital platform equivalent) requires:
- Owner RFC (or CURP if no RFC)
- Total rental income per owner per month
- IVA collected
- ISR withheld
- Property details

**7.2 Admin export for SAT filing**
Generate a machine-readable export (CSV or XML) in SAT's required format that can be uploaded to the SAT portal or submitted programmatically. Initially this can be a manual admin operation; automate later.

---

### Build Sequence Summary

| Phase | Features | Prerequisite |
|---|---|---|
| **Pre-build** | Mexican tax counsel engagement, SAT entity registration, FIEL/CSD | Before any code |
| **Phase 1** | Country/state flag on properties, RFC collection, tax calculation on bookings, DB columns, owner-facing tax breakdown | Counsel sign-off |
| **Phase 2** | Payout split logic, monthly remittance ledger, admin tax dashboard | Phase 1 |
| **Phase 3** | Monthly/annual owner tax statements, income export extension | Phase 2 |
| **Phase 4** | CFDI integration (Facturapi), CFDI storage, owner CFDI download | SAT entity + CSD ready |
| **Phase 5** | SAT informational return export, RFC verification API | Phase 4 |

---

### Complexity and Effort Estimate

| Feature group | Effort | Notes |
|---|---|---|
| Property country/state flag | Small (1–2 days) | DB column + form field |
| Owner RFC collection | Small (1 day) | Profile field + validation |
| Tax calculation + booking DB columns | Medium (3–5 days) | Math + UI on booking/offer pages |
| Payout split + remittance ledger | Medium (3–5 days) | Accounting logic + admin view |
| Owner tax statements (monthly + annual) | Medium (3–4 days) | PDF generation, portal download |
| CFDI integration (Facturapi) | **Large (2–4 weeks)** | API integration, CSD setup, testing |
| SAT informational return export | Small–Medium (2–3 days) | Data export in SAT format |
| **Total (excluding CFDI)** | **~3–4 weeks** | After counsel and entity setup |
| **Total (including CFDI)** | **~6–10 weeks** | The hard part is the CFDI |

---

## Planned Product Flow (Complete)

1. Guest visits booking page for a Mexico property
2. Guest sees rental price + IVA + ISH line items and pays the gross total
3. Stripe processes the gross payment; funds settle to FG's platform account
4. FG's payout engine:
   - Calculates ISR based on owner's MXN income this month (or 20% if no RFC)
   - Remits `rental_net − ISR` to the owner in USD (Stripe FX conversion)
   - Records IVA, ISH, ISR in the monthly remittance ledger
5. FG generates a CFDI for the transaction (via Facturapi) and stores the UUID
6. Monthly: FG remits IVA + ISR to SAT, files the informational return
7. Monthly: Owner receives a downloadable tax statement from their portal
8. January: Owner receives annual Constancia de Retenciones for the prior year

---

## Budget Estimate (Updated)

| Item | Estimated Cost |
|---|---|
| Mexican tax counsel engagement | $3,000–$8,000 USD |
| SAT registration + FIEL/CSD setup | ~$500–$1,500 |
| Facturapi API (per CFDI stamped) | ~MXN 5–15 per booking |
| Ongoing monthly SAT filing (if outsourced) | $200–$500/mo |
| Engineering (ex-CFDI) | ~3–4 weeks dev time |
| Engineering (CFDI integration) | ~2–4 weeks additional |

---

---

## US Tax Obligations for Short-Term Rentals

### The Core Difference from Mexico

Mexico has one uniform federal mandate: if you process MX payments, you must collect IVA and withhold ISR — full stop. The US has **no equivalent federal rental tax**, just a federal *reporting* obligation (1099-K), plus a patchwork of state and local occupancy taxes where FG's obligation depends on each jurisdiction's specific marketplace facilitator laws.

### Federal Level — Reporting Only, No Withholding

| Obligation | Detail |
|---|---|
| **1099-K** | Any platform processing $600+ to a US owner in a calendar year must file a 1099-K with the IRS and send one to the owner. This is a **reporting** obligation, not withholding. The owner pays their own income taxes. |
| **W-9 collection** | FG must collect a W-9 (Taxpayer ID certification) from all US owners before the first payout. Required to issue 1099-K. |
| **W-8BEN collection** | For non-US owners receiving US-source rental income (rare in FG's market), collect W-8BEN instead. |
| **No income tax withholding** | Unlike Mexico's ISR, the US does NOT require platforms to withhold income tax from domestic owners. |
| **No federal rental tax** | There is no US equivalent of Mexico's IVA. No platform-level federal tax to collect. |

### State and Local Level — The Complex Part

Short-term rentals are subject to **Transient Occupancy Tax (TOT)** — also called hotel tax, lodging tax, or bed tax — at the state and/or city/county level. Rates range from 1% to 15%+ depending on jurisdiction.

**The critical question per jurisdiction: is FG a marketplace facilitator?**

Many US states and cities now require platforms that process payments (Airbnb, Vrbo, FG) to collect and remit TOT on behalf of owners. But this varies enormously:

| Jurisdiction type | Marketplace facilitator law? | FG's obligation |
|---|---|---|
| States with explicit platform rules (CO, FL, AZ, and many others) | Yes | Must collect + remit TOT |
| States without platform rules | No | Owner self-reports; FG reports income via 1099-K only |
| Cities/counties with their own rules | Varies | Requires city-by-city analysis |

**The 30-day exemption (important for snowbird market):** Most US jurisdictions exempt stays of 30+ consecutive nights from TOT. Snowbird long-stays — a key use case for the Baja beachhead — would often be tax-exempt from TOT, significantly reducing compliance complexity for that segment.

### US vs Mexico: Side-by-Side

| | Mexico | United States |
|---|---|---|
| Federal rental tax | IVA 8% — mandatory collection | **None** |
| Platform income withholding | ISR mandatory (2–20%) | **None** — owners self-pay; FG reports via 1099-K |
| Occupancy/lodging tax | ISH (2–5% by state) | TOT — state/city patchwork (1–15%+) |
| Obligation uniformity | **High** — one federal rule covers all | **Low** — thousands of jurisdictions, each with own rules |
| Government reporting | Monthly SAT informational returns | Annual 1099-K to IRS |
| Platform electronic invoicing | CFDI required | Not required |
| Tax rate | Fixed (8% IVA, 2–5% ISH) | Highly variable by location |

### US-Specific Features Required

**A. W-9 / W-8BEN Collection**
Collect from every owner before their first payout. Store securely (not on FG servers — use a secure form or integrate with a TIN-matching service). Gate payouts until received.

**B. 1099-K Generation (Annual)**
Each January, generate a 1099-K for every US owner who received $600+ through the platform in the prior year. E-file with the IRS and deliver a copy to the owner via the portal. Services like **Track1099** or **Yearli** provide APIs to handle IRS filing; this is not DIY territory.

**C. Property Jurisdiction Tagging**
Add US state and county/city to each US property's profile. This determines which TOT rates apply and whether a marketplace facilitator law requires FG to collect.

**D. TOT Rate Database**
Maintain a lookup table of TOT rates by US state/county. This is inherently complex — there are thousands of jurisdictions. Pragmatic approach for launch:
- **Phase 1:** Cover the top 15–20 US vacation rental markets (Florida counties, Colorado resorts, California coastal cities, etc.) where marketplace facilitator laws are clear
- **Phase 2:** Expand coverage; use a third-party tax rate API (TaxJar, Avalara, or similar) to automate jurisdiction lookup

**E. TOT Collection and Remittance**
For jurisdictions where FG is a marketplace facilitator, collect TOT from guests as a line item and remit monthly to the applicable state/city. Each jurisdiction has its own remittance portal and schedule.

**F. Owner Self-Report Documentation**
For jurisdictions where FG is NOT required to remit (owner self-reports), provide owners a quarterly breakdown of TOT owed by jurisdiction so they can file themselves.

**G. 30-Day Stay Flag**
Automatically flag bookings of 30+ nights and suppress TOT collection for those stays (subject to jurisdiction-specific confirmation — some jurisdictions use 28 nights, some use 31).

---

## Canada (Non-Critical — Brief Overview)

Canada has federal GST (5%) and provincial taxes (HST up to 15% combined in some provinces, Quebec's QST at 9.975%, etc.). Short-term rentals are subject to GST/HST. Canada has been rolling out OECD-model digital platform reporting rules similar to Mexico's 2020 legislation, but implementation is more gradual and enforcement is lighter.

**FG's obligation in Canada:**
- If FG crosses the GST registration threshold (~CAD 30,000 in taxable supplies in Canada), register for and collect GST/HST
- Canada's new platform economy rules may require reporting rental income to CRA
- No income tax withholding obligation for Canadian owners (they self-file)

**When to address:** Canada shares the same architecture as US (see below) and adding it would be ~20% incremental work on top of US support. Address after US is stable.

---

## Shared Architecture — What Works for All Three Countries

The underlying plumbing for tax collection is nearly identical regardless of country. What differs is the *configuration* (rates, jurisdictions, form names), not the *structure*.

### Shared Data Model

**`tax_line_items` table** — replaces the Mexico-specific `iva_cents`, `ish_cents`, `isr_cents` columns with a generic, extensible structure:

| Column | Description |
|---|---|
| `booking_id` | The booking this tax applies to |
| `tax_type` | `IVA`, `ISH`, `ISR`, `TOT`, `GST`, `HST`, `QST`, `PST` |
| `jurisdiction` | `MX-BCS`, `US-CO-SUMMIT`, `US-FL-MIAMI-DADE`, `CA-QC`, etc. |
| `rate_pct` | The rate applied (e.g., 8.0, 3.0, 14.975) |
| `base_cents` | The amount the tax is calculated on |
| `amount_cents` | The tax amount collected |
| `collected_from` | `guest` (TOT, IVA, ISH) or `owner` (ISR) |
| `remit_by` | `platform` or `owner` |
| `remitted_at` | When FG paid the government |

**`tax_rates` configuration table** — lookup table, updatable without code:

| Column | Description |
|---|---|
| `country` | `MX`, `US`, `CA` |
| `state_province` | `BCS`, `CO`, `FL`, `QC`, etc. |
| `city_county` | Optional (for city-level TOT) |
| `tax_type` | `IVA`, `ISH`, `TOT`, `GST`, etc. |
| `rate_pct` | Current rate |
| `platform_remits` | `true` if FG remits; `false` if owner self-reports |
| `long_stay_exempt_days` | Nights threshold for exemption (e.g., 30) |
| `effective_date` | When this rate took effect |

**`tax_remittances` table** — tracks monthly payment obligations (same for all countries):

| Column | Description |
|---|---|
| `jurisdiction` | Same as above |
| `month` | YYYY-MM |
| `tax_type` | Which tax |
| `amount_owed_cents` | Total to remit this month |
| `remitted_at` | When paid |
| `reference` | SAT/IRS/CRA confirmation number |

### Shared Feature Components

| Component | Mexico | United States | Canada |
|---|---|---|---|
| Tax calculation engine | IVA 8%, ISH by state | TOT by city/county | GST 5% + provincial |
| Guest-facing tax breakdown | IVA + ISH lines | TOT line(s) | GST/HST line |
| Booking tax storage | `tax_line_items` | Same table | Same table |
| Property jurisdiction tagging | Country + MX state | Country + US state + county/city | Country + CA province |
| Admin remittance ledger | Monthly SAT | Monthly per jurisdiction | Monthly CRA |
| Owner income statements | Constancia de Retenciones | 1099-K | T4A (future) |
| Long-stay exemption | Not applicable | 30-day TOT exemption | 30-day GST exemption |

### What Is NOT Shared

| Feature | Country | Notes |
|---|---|---|
| ISR owner withholding | Mexico only | No US/CA equivalent for domestic owners |
| CFDI electronic invoicing | Mexico only | No equivalent in US or Canada |
| SAT monthly informational return | Mexico only | 1099-K (US) and CRA reporting (CA) are different formats |
| W-9/W-8BEN collection | US only | Mexico uses RFC; Canada uses SIN/BN |
| 1099-K generation and IRS filing | US only | |

---

## Three-Country Feature Build Plan

### What to build first (shared foundation)

Building these first serves all three countries:

1. **Generic `tax_line_items` table** — replaces any Mexico-specific tax columns
2. **`tax_rates` configuration table** — seed with MX and top US markets
3. **Tax calculation engine** — given property country/state/city + rates table, produce line items
4. **Guest-facing tax breakdown UI** — works for any tax type
5. **Remittance ledger** — works for SAT and US jurisdictions equally
6. **Property jurisdiction tagging** — country + state + city, required for both

**Estimated effort for shared foundation:** 1–2 weeks

### Mexico-specific additions (on top of foundation)

- ISR calculation and owner withholding
- CFDI integration (Facturapi)
- SAT informational return export
- Constancia de Retenciones (annual owner statement)
- RFC collection from owners

**Estimated effort:** 4–8 weeks (mostly CFDI)

### US-specific additions (on top of foundation)

- W-9/W-8BEN collection workflow
- 1099-K generation and IRS e-filing (via Track1099 or similar API)
- TOT rate database for top 15–20 US vacation rental markets
- Marketplace facilitator determination per jurisdiction
- 30-day exemption flag
- Owner self-report TOT documentation

**Estimated effort:** 3–5 weeks

### Canada additions (on top of foundation)

- GST/HST rate table by province
- CRA registration trigger (when CAD 30K threshold crossed)
- Owner income reporting for CRA

**Estimated effort:** 1–2 weeks (much simpler than MX or US)

---

## Recommended Build Sequence

| Priority | What | Why |
|---|---|---|
| 1 | **Shared foundation** (generic tax table, rate config, calculation engine) | Prerequisite for all countries; low waste |
| 2 | **Mexico IVA + ISH** (with counsel sign-off first) | Legal requirement; biggest market differentiator |
| 3 | **US W-9 + 1099-K** | Federal reporting obligation from first payout; relatively simple |
| 4 | **US TOT** (top markets) | Legal obligation in marketplace facilitator states |
| 5 | **Mexico CFDI** | Required but complex; can follow basic MX tax in phases |
| 6 | **Mexico ISR** | Required; needs CFDI and RFC collection in place first |
| 7 | **Canada GST/HST** | Non-critical; add when Canadian owners appear |

---

## Budget Estimate (All Countries)

| Item | Estimated Cost |
|---|---|
| Mexican tax counsel | $3,000–$8,000 USD |
| US tax counsel (marketplace facilitator analysis) | $2,000–$4,000 USD |
| SAT registration (Mexico) | $500–$1,500 |
| Track1099 or Yearli (US 1099-K filing, annual) | ~$1–$3 per form |
| Facturapi (Mexico CFDI, per transaction) | ~MXN 5–15 per booking |
| TaxJar/Avalara (US TOT rate API, optional) | $200–$600/mo |
| Ongoing monthly SAT filing (if outsourced) | $200–$500/mo |
| Engineering — shared foundation | ~1–2 weeks |
| Engineering — Mexico (ex-CFDI) | ~2–3 weeks |
| Engineering — Mexico CFDI | ~2–4 weeks |
| Engineering — US | ~3–5 weeks |
| Engineering — Canada | ~1–2 weeks |

---

## Related Documents

- `docs/business/compliance-and-tax-addendum.md` — Cross-border compliance overview (US + MX)
- CLAUDE.md → "Cross-border tax & compliance" section
- CLAUDE.md → "Rental Income & Tax Payment Accounting" feature spec
