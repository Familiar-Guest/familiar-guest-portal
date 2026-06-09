---
pdf_options:
  margin:
    top: 28mm
    bottom: 22mm
    left: 20mm
    right: 20mm
  displayHeaderFooter: true
  headerTemplate: "<span></span>"
  footerTemplate: "<div style='font-size:9px; color:#8a7e72; width:100%; text-align:center; padding:0 40px;'>Familiar Guest — Financial Model & Feasibility (v2) &nbsp;&nbsp;|&nbsp;&nbsp; Confidential</div>"
stylesheet: https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700&family=Hanken+Grotesk:wght@300;400;500;600&display=swap
---

<style>
  body { font-family: 'Hanken Grotesk', sans-serif; color: #2A241E; line-height: 1.55; font-size: 12px; }
  h1, h2, h3 { font-family: 'Fraunces', serif; color: #14543F; }
  h1 { font-size: 28px; margin-bottom: 2px; }
  h2 { font-size: 17px; border-bottom: 2px solid #E6DBCB; padding-bottom: 5px; margin-top: 22px; }
  h3 { font-size: 13.5px; color: #C0673E; margin-top: 14px; margin-bottom: 4px; }
  table { font-size: 11px; border-collapse: collapse; width: 100%; margin: 10px 0; }
  th { background-color: #14543F; color: white; padding: 6px 9px; text-align: left; font-weight: 500; }
  td { padding: 6px 9px; border-bottom: 1px solid #E6DBCB; vertical-align: top; }
  tr:nth-child(even) { background-color: #FBF6EE; }
  td.num, th.num { text-align: right; }
  .subtitle { font-size: 14px; color: #C0673E; font-weight: 500; margin-bottom: 14px; }
  .lead { font-size: 13px; line-height: 1.6; color: #3d362e; }
  .callout { background-color: #FBF6EE; border-left: 4px solid #14543F; padding: 11px 15px; margin: 12px 0; border-radius: 0 6px 6px 0; }
  .callout p { margin: 3px 0; }
  .warn { background-color: #fbf0ea; border-left: 4px solid #C0673E; padding: 11px 15px; margin: 12px 0; border-radius: 0 6px 6px 0; }
  .warn p { margin: 3px 0; }
  .good { background-color: #eef3ee; border-left: 4px solid #14543F; padding: 11px 15px; margin: 12px 0; border-radius: 0 6px 6px 0; }
  .highlight-box { background-color: #14543F; color: white; padding: 14px 18px; border-radius: 6px; margin: 14px 0; }
  .highlight-box p { margin: 3px 0; color: white; }
  .highlight-box strong { color: #e8d5b7; }
  strong { color: #14543F; }
  .loss { color: #b23b1e; font-weight: 600; }
  .pos { color: #14543F; font-weight: 600; }
  hr { border: none; border-top: 1px solid #E6DBCB; margin: 18px 0; }
  ul { padding-left: 18px; margin: 5px 0; }
  li { margin-bottom: 3px; }
  .page-break { page-break-before: always; }
</style>

# Financial Model & Feasibility (v2)

<div class="subtitle">Re-modeled for the Starter / Host / Pro pricing — June 2026</div>

<p class="lead">The new lineup (Starter $12, Host $29, Pro $49, plus 5% Pay-as-you-go) lowers blended revenue per owner. This model re-projects the business on that basis, stress-tests the central risk you flagged — operating expenses outrunning revenue — and recommends strategy changes to keep the business durably profitable.</p>

<div class="highlight-box">
<p><strong>Verdict:</strong> the business is viable and profitable in the base case, but the margin is now <strong>made or broken by one variable: the cost of supporting cross-border owners as the base grows.</strong> Subscription revenue scales with owner count; so does support. To make revenue outrun OpEx you must add revenue that scales with <strong>booking volume (GMV)</strong> — chiefly a modest FX spread and add-on attach — and hold support cost per owner flat with AI-first, nearshore support.</p>
</div>

---

## Revised Assumptions

| Assumption | Value | Basis |
|---|---|---|
| Avg active owners (Y1 / Y2 / Y3) | 250 / 2,000 / 7,500 | Unchanged from prior plan |
| Year-end owners | 600 / 3,500 / 12,000 | Unchanged |
| Plan mix (PAYG / Starter / Host / Pro) | 25% / 50% / 20% / 5% | Beachhead skews to single-home owners → Starter-heavy |
| Annual value per owner — PAYG | $90 | Low-volume by self-selection (<$2,880/yr bookings) |
| Annual value — Starter / Host / Pro | $144 / $348 / $588 | 12× monthly |
| Add-on margin per owner / yr | ~$6 | Screening/protection attach, modest |
| Gross margin | 76% | After Stripe platform fees, hosting, DocuSeal, AI, email |
| Avg booking volume (GMV) per owner | ~$10,000/yr | Cross-border Baja, higher ADRs (validate in test) |

### Blended ARPU (the key change)

| Plan | Mix | Annual value | Contribution |
|---|---:|---:|---:|
| Pay-as-you-go | 25% | $90 | $22.50 |
| Starter | 50% | $144 | $72.00 |
| Host | 20% | $348 | $69.60 |
| Pro | 5% | $588 | $29.40 |
| Add-ons | — | — | ~$6.00 |
| **Blended ARPU** | | | **≈ $200** |

<div class="warn">
<p><strong>ARPU dropped from ~$350 to ~$200 — a 43% reduction.</strong> The $12 Starter, expected to be the most-adopted plan in a single-home beachhead, is the main driver. Revenue projections fall proportionally unless we add GMV-linked revenue (below).</p>
</div>

---

## Base-Case P&L (subscription/commission only)

| Line | Year 1 | Year 2 | Year 3 |
|---|---:|---:|---:|
| Avg active owners | 250 | 2,000 | 7,500 |
| Blended ARPU | $200 | $200 | $200 |
| **Revenue** | **$50,000** | **$400,000** | **$1,500,000** |
| Gross profit (76%) | $38,000 | $304,000 | $1,140,000 |
| Operating expenses (Base) | $35,000 | $200,000 | $650,000 |
| **Operating profit** | **$3,000** | **$104,000** | **$490,000** |
| Operating margin | 6% | 26% | 33% |

Profitable, but Year 1 is now wafer-thin, and the OpEx line is the swing factor.

<div class="page-break"></div>

## The Core Risk: OpEx vs. Revenue Growth

The earlier solo-founder model assumed ~$11k–$48k OpEx across three years. **That is unrealistic at 12,000 cross-border owners moving money.** Support, disputes/chargebacks, payment ops, and compliance scale with owner count and booking volume. The table below holds revenue constant and varies only OpEx to show how fast the business can flip from healthy to loss-making.

### OpEx scenarios → operating profit

| | Year 1 | Year 2 | Year 3 |
|---|---:|---:|---:|
| Gross profit (constant) | $38,000 | $304,000 | $1,140,000 |
| **Lean** OpEx (AI-deflected support, mostly solo) | $25,000 | $90,000 | $280,000 |
| → Operating profit | <span class="pos">$13,000</span> | <span class="pos">$214,000</span> | <span class="pos">$860,000</span> |
| **Base** OpEx (small support team + marketing) | $35,000 | $200,000 | $650,000 |
| → Operating profit | <span class="pos">$3,000</span> | <span class="pos">$104,000</span> | <span class="pos">$490,000</span> |
| **Stress** OpEx (support scales ~linearly w/ owners) | $50,000 | $350,000 | $1,150,000 |
| → Operating profit | <span class="loss">($12,000)</span> | <span class="loss">($46,000)</span> | <span class="loss">($10,000)</span> |

<div class="warn">
<p><strong>The danger is real:</strong> in the Stress case the company generates $1.5M of revenue in Year 3 and still loses money. A cross-border, money-handling product is support-heavy; if each owner generates even a few bilingual support tickets a year and support is staffed linearly, OpEx eats the entire gross profit. This is exactly the failure mode to guard against.</p>
</div>

---

## The Fix: Add Revenue That Scales With GMV, Not Owner Count

Subscription/commission revenue and support cost both scale with **owner count**. To make revenue grow *faster* than OpEx, add revenue that scales with **booking volume (GMV)** — it grows with usage while costing almost nothing extra to serve.

### Upside case: Base P&L + a 0.75% FX spread

At ~$10,000 GMV per owner and a modest, transparent 0.75% currency-conversion spread (still far cheaper than the 3–4% banks charge):

| Line | Year 1 | Year 2 | Year 3 |
|---|---:|---:|---:|
| Subscription/commission revenue | $50,000 | $400,000 | $1,500,000 |
| FX-spread revenue (0.75% of GMV) | $18,750 | $150,000 | $562,500 |
| **Total revenue** | **$68,750** | **$550,000** | **$2,062,500** |
| Gross profit (76%) | $52,250 | $418,000 | $1,567,500 |
| Operating profit @ Base OpEx | <span class="pos">$17,250</span> | <span class="pos">$218,000</span> | <span class="pos">$917,500</span> |
| Operating profit @ **Stress** OpEx | <span class="pos">$2,250</span> | <span class="pos">$68,000</span> | <span class="pos">$417,500</span> |

<div class="good">
<p><strong>This is the hedge.</strong> With a GMV-linked revenue line, even the Stress OpEx case stays profitable in every year. FX-spread revenue grows with booking dollars (and with each new high-value Baja booking) — not with the number of support tickets. It structurally protects you against OpEx outrunning revenue.</p>
</div>

<div class="page-break"></div>

## Pricing Assessment

| Plan | Verdict | Note |
|---|---|---|
| **Starter $12** | ⚠️ Thinnest margin | After ~$8/yr payment fees, even a few support tickets can erase the margin. Viable only if AI deflects most support, or if priced at $15–$19. Best used as a funnel that upgrades to Host. |
| **Host $29 (up to 5)** | ✅ Strong value | Arguably underpriced for 5 properties — fine for adoption; capture upside via add-ons + FX rather than a higher fee. |
| **Pro $49 (6–10)** | ✅ Reasonable | Small segment; not a volume driver. |
| **PAYG 5%** | ✅ Very generous | vs. Airbnb's ~15.5%. Room to test 6% and still be a dramatic bargain — pure GMV-linked upside. |
| **Add-ons** | ✅ High-margin, GMV-linked | Drive attach hard; this revenue scales with bookings, not support. |

---

## Strategy Recommendations (ranked)

1. **Add a modest, transparent FX spread (~0.5–1%).** The single biggest lever. GMV-linked, high-margin, scales with bookings not support, and still beats banks. Adjust the "all fees at cost" stance for FX only; keep card processing at cost. *(Biggest impact on the OpEx-vs-revenue risk.)*
2. **Make AI the first line of support.** Extend the AI Concierge into bilingual support that deflects >70% of tickets. Support is the cost that scales with owners — AI deflection is what keeps it sublinear. *(Directly attacks the Stress scenario.)*
3. **Tilt revenue toward GMV-linked streams.** Push add-on attach (screening/protection), test a +1pt PAYG take (6%), and consider a small per-booking fee. Revenue then tracks booking volume while OpEx tracks owner count — keep the former growing faster.
4. **Nearshore, variable support.** Use bilingual Mexico-based contract support tied to ticket volume; avoid premature full-time hires. Keep support a variable cost, not a fixed one.
5. **Protect ARPU.** Test Starter at $15–$19, or hold $12 strictly as an upgrade funnel; default new owners to PAYG and let the crossover pull them up; push annual billing (cash + retention).
6. **Keep CAC near zero.** Lean on owner + guest referral loops inside the tight Baja expat community; let marketing stay sublinear to owner growth.
7. **Instrument the tripwire.** Track **support cost per owner** and **OpEx growth rate vs. revenue growth rate** monthly. Rule of thumb: support cost per owner must trend flat or down. If it rises two months running, fix deflection before adding owners.

<div class="callout">
<p><strong>Net:</strong> the lineup is viable, but a Starter-heavy mix at $12 makes subscription revenue alone too thin to comfortably outrun support cost at scale. Adding a small FX spread and add-on attach — both GMV-linked — plus AI-first support is what converts this from "profitable if we're disciplined" to "structurally hard to lose money."</p>
</div>

---

## Caveats

- Figures are illustrative planning estimates. The three numbers that most move the outcome — **plan mix, GMV per owner, and support cost per owner** — should be measured in the 30-day owner test and the first live pilot, then fed back into the model (`Familiar_Guest_Financial_Model_v2.xlsx`).
- The FX spread has competitive and trust trade-offs; keep it modest and transparent so it doesn't undercut the "fair, no-markup" positioning.
- Cross-border support load is the largest unknown and the largest risk — treat the Stress OpEx column as a live possibility, not a worst case to ignore.

---

<div style="text-align: center; margin-top: 22px; color: #8a7e72; font-size: 11px;">
famguest.com &nbsp;|&nbsp; June 2026
</div>
