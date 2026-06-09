---
pdf_options:
  printBackground: true
  margin:
    top: 0mm
    bottom: 0mm
    left: 0mm
    right: 0mm
stylesheet: https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,600;9..144,700;9..144,900&family=Hanken+Grotesk:wght@400;500;600;700&display=swap
---

<style>
  body { font-family: 'Hanken Grotesk', sans-serif; color: #2A241E; margin: 0; padding: 0; background: #FBF6EE; }
  .page { padding: 22mm 20mm; min-height: 297mm; box-sizing: border-box; page-break-after: always; position: relative; }
  .page:last-child { page-break-after: auto; }
  h1, h2, h3 { font-family: 'Fraunces', serif; color: #14543F; }
  .brand { font-family:'Fraunces',serif; font-size: 22px; color:#14543F; font-weight:700; letter-spacing:0.5px; }
  .hero-title { font-size: 48px; line-height: 1.07; color:#14543F; font-weight:900; margin: 30px 0 16px 0; }
  .hero-sub { font-size: 21px; color:#C0673E; font-weight:500; line-height:1.4; margin-bottom: 26px; }
  .hero-band { background:#14543F; color:white; border-radius:12px; padding: 22px 26px; }
  .hero-band p { font-size: 19px; color:white; margin:0; line-height:1.5; }
  .hero-band strong { color:#e8d5b7; }
  h2.section { font-size: 31px; margin: 0 0 6px 0; }
  .kicker { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color:#C0673E; font-weight:700; margin-bottom: 4px; }
  .problem { font-size: 19px; line-height:1.45; margin: 18px 0; padding-left: 32px; position: relative; }
  .problem::before { content: "\2715"; position:absolute; left:0; top:0; color:#C0673E; font-weight:700; font-size:19px; }
  .problem b { color:#14543F; }
  .benefits { display:grid; grid-template-columns: 1fr 1fr; gap: 12px 22px; margin: 18px 0 8px 0; }
  .ben { font-size: 16px; line-height:1.35; }
  .ben b { color:#14543F; }
  .booking { display:flex; gap: 16px; margin-top: 18px; }
  .card { background:#fff; border:1px solid #E6DBCB; border-radius:12px; padding: 16px 18px; flex:1; }
  .card-h { font-family:'Fraunces',serif; font-size:16px; color:#14543F; font-weight:700; margin-bottom: 10px; }
  .cal-month { font-size:14px; font-weight:600; color:#2A241E; margin-bottom:8px; }
  .cal-grid { display:grid; grid-template-columns: repeat(7, 1fr); gap:4px; }
  .cal-dow { font-size:10px; text-transform:uppercase; color:#8a7e72; text-align:center; font-weight:600; }
  .cal-day { text-align:center; font-size:13px; padding:7px 0; border-radius:7px; color:#2A241E; }
  .cal-bk { background:#efe7d8; color:#b3a890; text-decoration: line-through; }
  .cal-sel { background:#14543F; color:#fff; font-weight:700; }
  .legend { display:flex; gap:14px; margin-top:12px; font-size:11px; color:#5a5047; align-items:center; }
  .ldot { display:inline-block; width:11px; height:11px; border-radius:3px; vertical-align:middle; margin-right:4px; }
  .payrow { display:flex; justify-content:space-between; font-size:14px; padding:7px 0; border-bottom:1px solid #F1E9DB; }
  .payrow.muted { color:#8a7e72; }
  .paytotal { display:flex; justify-content:space-between; font-size:17px; font-weight:700; color:#14543F; padding-top:10px; }
  .paybtn { background:#14543F; color:#fff; text-align:center; padding:11px; border-radius:8px; font-weight:700; font-size:15px; margin-top:12px; }
  .paynote { font-size:11.5px; color:#8a7e72; margin-top:9px; line-height:1.4; }
  .plans { display:flex; gap: 14px; margin-top: 20px; }
  .plan { flex:1; background:#fff; border:1px solid #E6DBCB; border-radius:12px; padding: 18px 16px; }
  .plan.feature { background:#14543F; border-color:#14543F; }
  .plan-name { font-family:'Fraunces',serif; font-size:19px; font-weight:700; color:#14543F; }
  .plan.feature .plan-name { color:#fff; }
  .plan-price { font-family:'Fraunces',serif; font-size:30px; font-weight:900; color:#C0673E; margin: 6px 0 2px 0; }
  .plan.feature .plan-price { color:#e8d5b7; }
  .plan-unit { font-size:13px; color:#8a7e72; }
  .plan.feature .plan-unit { color:#cfe0d4; }
  .plan-for { font-size:13px; color:#5a5047; margin: 8px 0 10px 0; min-height: 34px; }
  .plan.feature .plan-for { color:#dfeae0; }
  .plan ul { padding-left:18px; margin:0; }
  .plan li { font-size:13.5px; line-height:1.5; margin-bottom:5px; }
  .plan.feature li { color:#f3ede2; }
  .addons { background:#fff; border:1px dashed #C0673E; border-radius:12px; padding:14px 20px; margin-top:18px; }
  .addons p { font-size:15px; margin:6px 0; }
  .addons b { color:#C0673E; }
  .cta { background:#C0673E; color:#fff; border-radius:12px; padding: 24px 26px; margin-top: 24px; text-align:center; }
  .cta h3 { color:#fff; font-size: 26px; margin:0 0 8px 0; }
  .cta p { color:#fff; font-size:17px; margin:0; }
  .footer { position:absolute; bottom: 12mm; left:20mm; right:20mm; text-align:center; color:#8a7e72; font-size:12px; }
  .everyplan { font-size:14px; color:#5a5047; margin-top:14px; text-align:center; font-style:italic; }
</style>
<div class="page">
<div class="brand">Familiar Guest</div>
<div class="hero-title">Your guests love<br>your place. Keep<br>what you earn.</div>
<div class="hero-sub">Direct bookings for your home in Mexico — without losing 15% to Airbnb.</div>
<div class="hero-band"><p>You own a home in <strong>Los Cabos, Todos Santos, or La Paz</strong> and have guests who return year after year. Book them directly — under your own name — with payments, agreements, and trust handled for you. <strong>Live in an afternoon.</strong></p></div>
<div style="margin-top: 44px;"><div class="kicker">Sound familiar?</div><h2 class="section">The problems you live with</h2></div>
<div class="problem">Airbnb takes <b>~15.5% of every booking</b> — even from repeat guests.</div>
<div class="problem">The platform <b>owns your guest list</b> — you can't easily invite past guests back.</div>
<div class="problem"><b>Cross-border payments</b> are a headache — currencies, fees, foreign accounts.</div>
<div class="problem">Guests hesitate: <b>"Is it safe to send money</b> for a home in Mexico?"</div>
<div class="footer">famguest.com</div>
</div>
<div class="page">
<div class="kicker">Here's the fix</div>
<h2 class="section">Everything you need, built in</h2>
<div class="benefits"><div class="ben">💵 <b>Keep your rate</b> — 5% or $15–49/mo, no 15% cut</div><div class="ben">👥 <b>Own your guest list</b> — re-invite each season</div><div class="ben">🌎 <b>Get paid your way</b> — USD, CAD, or pesos</div><div class="ben">🧾 <b>Taxes handled</b> — lodging taxes &amp; accounting, done for you</div><div class="ben">🛡️ <b>Trust built in</b> — escrow + verified owners</div><div class="ben">🗣️ <b>Two languages</b> — English & Spanish, auto</div></div>
<div class="kicker" style="margin-top:22px;">See it in action</div>
<h2 class="section" style="font-size:26px;">A booking, start to finish</h2>
<div class="booking"><div class="card"><div class="card-h">1 · Guest picks open dates</div><div class="cal-month">March 2026 — Casa del Mar</div><div class="cal-grid"><div class="cal-dow">S</div><div class="cal-dow">M</div><div class="cal-dow">T</div><div class="cal-dow">W</div><div class="cal-dow">T</div><div class="cal-dow">F</div><div class="cal-dow">S</div><div class="cal-day">1</div><div class="cal-day">2</div><div class="cal-day">3</div><div class="cal-day cal-bk">4</div><div class="cal-day cal-bk">5</div><div class="cal-day cal-bk">6</div><div class="cal-day cal-bk">7</div><div class="cal-day">8</div><div class="cal-day">9</div><div class="cal-day">10</div><div class="cal-day">11</div><div class="cal-day">12</div><div class="cal-day">13</div><div class="cal-day cal-sel">14</div><div class="cal-day cal-sel">15</div><div class="cal-day cal-sel">16</div><div class="cal-day cal-sel">17</div><div class="cal-day cal-sel">18</div><div class="cal-day cal-sel">19</div><div class="cal-day cal-sel">20</div><div class="cal-day cal-sel">21</div><div class="cal-day">22</div><div class="cal-day">23</div><div class="cal-day">24</div><div class="cal-day">25</div><div class="cal-day">26</div><div class="cal-day">27</div><div class="cal-day cal-bk">28</div><div class="cal-day">29</div><div class="cal-day">30</div><div class="cal-day">31</div></div><div class="legend"><span><span class="ldot" style="background:#FBF6EE;border:1px solid #E6DBCB;"></span>Open</span><span><span class="ldot" style="background:#14543F;"></span>Their stay</span><span><span class="ldot" style="background:#efe7d8;"></span>Booked</span></div></div><div class="card"><div class="card-h">2 · Guest pays securely</div><div class="payrow"><span>$280 × 7 nights</span><span>$1,960</span></div><div class="payrow"><span>Cleaning fee</span><span>$120</span></div><div class="payrow muted"><span>Refundable deposit (held)</span><span>$300</span></div><div class="paytotal"><span>Total due today</span><span>$2,080</span></div><div class="paybtn">Confirm &amp; Pay</div><div class="paynote">Held in escrow until check-in. Pay in USD, CAD, or MXN — or split 50% now, 50% before arrival.</div></div></div>
<div class="footer">famguest.com</div>
</div>
<div class="page">
<div class="kicker">Simple pricing</div>
<h2 class="section">Plans that fit how you rent</h2>
<p style="font-size:16px;margin-top:4px;">No commission on monthly plans. All plans are subject to payment processing fees, passed through at cost — no markup, ever.</p>
<div class="plans"><div class="plan"><div class="plan-name">Starter</div><div class="plan-price">$15</div><div class="plan-unit">per month · 1 property</div><div class="plan-for">For single-home owners.</div><ul><li>0% commission</li><li>1 property</li><li>Free friends &amp; family bookings</li></ul></div><div class="plan feature"><div class="plan-name">Host</div><div class="plan-price">$29</div><div class="plan-unit">per month · up to 5 homes</div><div class="plan-for">For active owners — no commission.</div><ul><li>0% commission</li><li>Up to 5 properties</li><li>Everything in Starter</li></ul></div><div class="plan"><div class="plan-name">Pro</div><div class="plan-price">$49</div><div class="plan-unit">per month · 6–10 homes</div><div class="plan-for">For owners with several homes.</div><ul><li>6–10 properties</li><li>Consolidated income reports</li><li>Priority support</li></ul></div></div>
<p style="font-size:14px; color:#5a5047; margin-top:12px; text-align:center;">Prefer no monthly fee? <b>Pay-as-you-go</b> — just 5% per booking.</p>
<div class="everyplan">Every plan includes cross-border payments, bilingual booking, escrow, verified-owner trust, calendar sync, and your private guest list.</div>
<div class="addons"><p><b>Add when you need it:</b></p><p>🔎 <b>Guest Screening</b> — $5/booking — ID + fraud check for new guests</p><p>🛡️ <b>Protected Booking</b> — $19.99/booking — screening + up to $1M damage protection</p></div>
<div class="cta"><h3>Keep your guests. Keep your earnings.</h3><p>Get set up in an afternoon at <b>famguest.com</b></p></div>
<div class="footer">famguest.com &nbsp;·&nbsp; Direct booking, made effortless for everyday rental owners</div>
</div>
