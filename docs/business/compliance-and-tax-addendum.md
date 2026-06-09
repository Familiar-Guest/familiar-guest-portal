---
pdf_options:
  margin:
    top: 26mm
    bottom: 20mm
    left: 18mm
    right: 18mm
  displayHeaderFooter: true
  headerTemplate: "<span></span>"
  footerTemplate: "<div style='font-size:9px; color:#8a7e72; width:100%; text-align:center; padding:0 40px;'>Familiar Guest — Compliance &amp; Tax Addendum &nbsp;|&nbsp; Confidential — not legal/tax advice</div>"
stylesheet: https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@300;400;500;600;700&display=swap
---

<style>
  body { font-family: 'Hanken Grotesk', sans-serif; color: #2A241E; line-height: 1.5; font-size: 11.5px; }
  h1, h2, h3 { font-family: 'Fraunces', serif; color: #14543F; }
  h1 { font-size: 26px; margin-bottom: 2px; }
  h2 { font-size: 16px; border-bottom: 2px solid #E6DBCB; padding-bottom: 5px; margin-top: 20px; }
  h3 { font-size: 13px; color: #C0673E; margin-top: 12px; margin-bottom: 3px; }
  .subtitle { font-size: 14px; color: #C0673E; font-weight: 500; margin-bottom: 12px; }
  .lead { font-size: 12.5px; color: #3d362e; }
  table { font-size: 10.5px; border-collapse: collapse; width: 100%; margin: 8px 0; }
  th { background-color: #14543F; color: white; padding: 6px 8px; text-align: left; font-weight: 500; }
  td { padding: 5px 8px; border-bottom: 1px solid #E6DBCB; vertical-align: top; }
  tr:nth-child(even) { background-color: #FBF6EE; }
  strong { color: #14543F; }
  .warn { background:#fbf0ea; border-left:5px solid #C0673E; padding:12px 16px; margin:12px 0; border-radius:0 6px 6px 0; }
  .warn p { margin:3px 0; font-size:12px; }
  .flag { background:#14543F; color:white; padding:12px 16px; border-radius:6px; margin:12px 0; }
  .flag p { margin:3px 0; color:white; }
  .flag strong { color:#e8d5b7; }
  .who { font-weight:700; white-space:nowrap; font-size:9.5px; padding:2px 6px; border-radius:9px; }
  .you { background:#C0673E; color:#fff; }
  .ai { background:#14543F; color:#fff; }
  .counsel { background:#6b4e9e; color:#fff; }
  hr { border:none; border-top:1px solid #E6DBCB; margin:14px 0; }
  .page-break { page-break-before: always; }
  ul { padding-left:16px; margin:4px 0; } li { margin-bottom:3px; }
</style>

# Compliance &amp; Tax Addendum

<div class="subtitle">Cross-border obligations: US &amp; Mexico homes, non-US renters, US-based tools</div>

<div class="warn">
<p><strong>This is not legal or tax advice.</strong> It identifies areas to address and questions to take to professionals. Engage a <strong>cross-border tax attorney</strong>, <strong>Mexican tax/legal counsel</strong>, and a <strong>privacy attorney</strong> before launch. Rules change and vary by city/state; web research was unavailable when this was written, so verify everything against current law.</p>
</div>

<p class="lead">Familiar Guest will have homes in both the <strong>US and Mexico</strong>, owners who may be US, Canadian, or Mexican persons, and renters from the US, Canada, Mexico, and beyond. That mix triggers obligations in multiple jurisdictions across tax, payments, identity, contracts, and privacy.</p>

---

## 1 · The Big One: Mexico Digital-Platform Tax Withholding

<div class="flag">
<p><strong>Highest-priority item.</strong> Since 2020 Mexico requires digital platforms that facilitate lodging to <strong>withhold and remit ISR (income tax) and IVA (VAT) on host earnings</strong>, register with SAT, and report. If Familiar Guest processes payments for Mexico-located stays, it may be treated as such a platform — creating Mexican registration, withholding, and remittance duties (and possibly the need for a Mexican RFC/entity). This is exactly what Airbnb does today.</p>
<p>Resolve the structure with Mexican counsel <strong>before</strong> taking live payments for Mexican homes: does FG withhold as the platform, or is the flow structured so the owner remains the taxpayer of record?</p>
</div>

---

## 2 · Owner Income &amp; Lodging Taxes

| Topic | US home | Mexico home |
|---|---|---|
| Income tax on rent | Owner reports on IRS Schedule E + state income tax | ISR on rental income; foreign owners must register with SAT (RFC) |
| VAT / sales | Generally none on residential STR (varies) | IVA 16% typically applies to short-term lodging |
| Lodging / occupancy tax | City/county TOT or state lodging tax — collect &amp; remit; rules vary widely | State lodging tax (ISH, ~3% in Baja California Sur) |
| Who collects it | Owner, or platform if a "marketplace facilitator" in that state | Owner today; platform if deemed the intermediary (see §1) |
| Our role | Provide income/booking exports; show tax line items; **no tax-advice features** | Same — plus the withholding question in §1 |

<div class="warn"><p><strong>Marketplace-facilitator laws (US):</strong> many US states require the booking platform — not the owner — to collect and remit lodging/sales tax. Whether FG qualifies, and in which states, needs review as US listings are added.</p></div>

---

## 3 · Payments &amp; Financial Compliance

| Area | Action / note | Who |
|---|---|---|
| Money transmission | Keep Stripe as processor/merchant-of-record so FG does **not** take custody of funds (avoids money-transmitter licensing). Escrow = Stripe **delayed payout**, not FG holding funds — describe it accurately. | <span class="who counsel">COUNSEL</span> <span class="who ai">CLAUDE</span> |
| Cross-border payouts | Confirm Stripe Connect supports MX-domiciled connected accounts and payouts to Mexican banks, and the entity/structure required | <span class="who you">YOU</span> |
| KYC / AML | Stripe Connect performs KYC/AML on owners (payees) and sanctions/OFAC screening; ensure flows accept non-US persons | <span class="who ai">CLAUDE</span> |
| PCI-DSS | Use Stripe-hosted/embedded card elements → keep FG in the lightest scope (SAQ-A); never touch raw card data | <span class="who ai">CLAUDE</span> |
| 1099-K (US) | Stripe issues 1099-K to US owners over thresholds; collect **W-9** from US owners and **W-8BEN** from non-US owners | <span class="who counsel">COUNSEL</span> |
| FX / disclosures | If an FX spread is adopted, disclose it transparently; show currency + rate on every transaction | <span class="who ai">CLAUDE</span> |

---

## 4 · Identity &amp; Ownership Verification (US vs non-US)

<div class="warn"><p><strong>US-centric verification will not work for everyone.</strong> SSN-based checks and US background screens fail for Mexican and other non-US owners and guests. Verification must be document/passport-based and internationally capable.</p></div>

| Check | US person | Non-US (MX / other) |
|---|---|---|
| Owner identity (Gate 1) | Stripe KYC: SSN last 4, US ID | Stripe KYC with passport / INE / CURP / RFC — confirm Stripe supports the owner's country |
| Property ownership (Gate 2) | Deed, property-tax statement, utility bill, insurance dec | Mexico: **fideicomiso (bank trust)** or **escritura** / Mexican-corp docs |
| Guest screening (add-on) | Truvi ID + fraud check | Confirm Truvi covers non-US guest IDs (Mexican/EU/etc.); avoid US-only SSN-trace screens |
| Guest payment identity | Card AVS/3-D Secure | Support Mexican cards and 3-D Secure; consider local methods (e.g., OXXO) via Stripe |

---

## 5 · E-Signatures &amp; Contracts (DocuSeal differences)

| Aspect | US | Mexico |
|---|---|---|
| E-signature validity | ESIGN Act + UETA — simple e-signatures broadly enforceable; DocuSeal audit trail sufficient | Código de Comercio recognizes electronic signatures; stronger evidentiary weight may need **NOM-151** conservation/timestamp or advanced signature (e.firma). Keep a robust audit trail |
| Contract language | English acceptable | Provide a **Spanish** version; Spanish generally controls for Mexican consumers |
| Governing law / venue | State the governing law and dispute venue clearly per home's location | Same — and account for Mexican consumer-protection rules |
| Consumer protection | State consumer law; clear disclosures | **PROFECO / LFPC** may apply to contracts with Mexican consumers — fair terms, Spanish disclosures |

<p>Action: bilingual rental agreement and booking terms, governing-law clause keyed to the home's country, NOM-151-style conservation for Mexican agreements, attorney review of templates. DocuSeal works for both, but the <strong>legal wrapper</strong> around it differs by country. <span class="who counsel">COUNSEL</span> <span class="who ai">CLAUDE</span></p>

<div class="page-break"></div>

## 6 · Data Privacy (Mexican &amp; other non-US renters)

We will hold personal data of owners, guests, and caretakers across countries — triggering multiple privacy regimes.

| Regime | Applies to | Key obligations |
|---|---|---|
| **LFPDPPP** (Mexico) | Mexican data subjects | Spanish **aviso de privacidad** (privacy notice), consent, ARCO rights, cross-border transfer disclosure |
| **GDPR / UK GDPR** | EU/UK guests (a target guest origin) | Lawful basis, data-subject rights, transfer safeguards (SCCs), DPA with subprocessors |
| **CCPA/CPRA** | California (US) residents | Notice, opt-out, data-subject requests |
| **PIPEDA** | Canadian residents | Consent, access, accountability |

Actions: a multi-jurisdiction **privacy policy** (EN/ES), cookie/consent handling, a subprocessor list (Supabase, Stripe, Resend, DocuSeal, Truvi, Anthropic, Vercel) with data-processing agreements, data-retention and deletion workflows, and PII minimization (already a design principle — no SSNs stored). <span class="who counsel">COUNSEL</span> <span class="who ai">CLAUDE</span>

---

## 7 · Short-Term-Rental Local Regulations

| | US homes | Mexico homes |
|---|---|---|
| Permits / registration | Many cities require STR permits, registration numbers, occupancy/zoning limits | Municipal STR/tourism registration and lodging-tax enrollment in some states |
| Platform exposure | Some cities require the listing to display a permit number | Lower, but evolving |
| Our approach | Require owner to **attest** local compliance at listing; store the attestation; display permit field where needed | Same attestation model |

---

## 8 · Platform Legal Foundation

- **Entity structure:** US LLC for the platform; determine with counsel whether a **Mexican entity / RFC** is required for the §1 withholding/payments question. <span class="who counsel">COUNSEL</span> <span class="who you">YOU</span>
- **Core legal docs (EN/ES):** Terms of Service, Privacy Policy, Acceptable Use, Owner Agreement, Guest Booking Terms, cancellation/refund policy. <span class="who counsel">COUNSEL</span>
- **Insurance:** platform general liability, E&amp;O/professional, and cyber. <span class="who you">YOU</span>
- **Escrow language:** describe the hold accurately (Stripe delayed payout) — do not imply FG holds funds in a regulated trust. <span class="who counsel">COUNSEL</span>
- **Booking guarantee:** keep deferred until a funded reserve and clear payout rules exist (already noted). <span class="who you">YOU</span>

---

## Compliance Steps to Add (summary checklist)

| ☐ | Step | Who |
|---|---|---|
| ☐ | Engage cross-border tax attorney + Mexican counsel + privacy counsel | <span class="who you">YOU</span> |
| ☐ | Resolve Mexico digital-platform withholding (ISR/IVA, SAT, RFC) structure | <span class="who counsel">COUNSEL</span> |
| ☐ | Determine US marketplace-facilitator lodging-tax obligations per state | <span class="who counsel">COUNSEL</span> |
| ☐ | Confirm Stripe MX connected accounts + cross-border payout structure | <span class="who you">YOU</span> |
| ☐ | Collect W-9 (US) / W-8BEN (non-US) from owners; 1099-K handling | <span class="who counsel">COUNSEL</span> |
| ☐ | Verification flows for non-US IDs (passport/INE/CURP/RFC); confirm Truvi non-US coverage | <span class="who ai">CLAUDE</span> |
| ☐ | Gate-2 ownership docs: accept fideicomiso/escritura + US deeds | <span class="who ai">CLAUDE</span> |
| ☐ | Bilingual rental agreement + booking terms; governing-law clause; NOM-151 for MX | <span class="who counsel">COUNSEL</span> <span class="who ai">CLAUDE</span> |
| ☐ | Multi-jurisdiction privacy policy (LFPDPPP/GDPR/CCPA/PIPEDA) + aviso de privacidad | <span class="who counsel">COUNSEL</span> <span class="who ai">CLAUDE</span> |
| ☐ | Subprocessor list + DPAs; data retention/deletion workflows | <span class="who ai">CLAUDE</span> |
| ☐ | Owner local-STR-compliance attestation at listing | <span class="who ai">CLAUDE</span> |
| ☐ | Lodging-tax line items (US TOT / MX ISH) shown per booking | <span class="who ai">CLAUDE</span> |
| ☐ | Platform entity + insurance (GL, E&amp;O, cyber) | <span class="who you">YOU</span> |
| ☐ | Tax-export reports for owners (no tax advice) | <span class="who ai">CLAUDE</span> |

<p style="font-size:10px;color:#8a7e72;margin-top:8px;"><span class="who you">YOU</span> founder action &nbsp; <span class="who counsel">COUNSEL</span> needs a professional &nbsp; <span class="who ai">CLAUDE</span> buildable in product</p>

---

<div style="text-align:center; margin-top:14px; color:#8a7e72; font-size:11px;">famguest.com &nbsp;|&nbsp; Compliance &amp; Tax Addendum &nbsp;|&nbsp; June 2026 &nbsp;|&nbsp; Not legal or tax advice</div>
