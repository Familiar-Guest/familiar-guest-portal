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
  .page { padding: 20mm 18mm; min-height: 297mm; box-sizing: border-box; page-break-after: always; position: relative; }
  .page:last-child { page-break-after: auto; }
  h1, h2, h3 { font-family: 'Fraunces', serif; color: #14543F; }
  .brand { font-family:'Fraunces',serif; font-size: 22px; color:#14543F; font-weight:700; letter-spacing:0.5px; }
  .cover { background:#14543F; color:#fff; border-radius:16px; padding: 34px 30px; margin-top: 14px; }
  .cover .ktag { color:#e8d5b7; font-size:13px; text-transform:uppercase; letter-spacing:2px; font-weight:600; }
  .cover h1 { color:#fff; font-size: 46px; line-height:1.08; font-weight:900; margin: 14px 0 12px 0; }
  .cover p { color:#f1e9dc; font-size: 18px; line-height:1.5; margin: 0; }
  .badge { display:inline-block; background:#C0673E; color:#fff; font-weight:700; font-size:17px; padding:10px 18px; border-radius:30px; margin-top:22px; }
  .cover-foot { color:#cfe0d4; font-size:13px; margin-top:26px; }
  h2.section { font-size: 30px; margin: 0 0 6px 0; }
  .kicker { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color:#C0673E; font-weight:700; margin-bottom: 4px; }
  .lead { font-size: 17px; line-height:1.6; color:#3d362e; }
  .problem { font-size: 17px; line-height:1.45; margin: 12px 0; padding-left: 30px; position: relative; }
  .problem::before { content: "\2715"; position:absolute; left:0; top:0; color:#C0673E; font-weight:700; font-size:17px; }
  .problem b { color:#14543F; }
  .solverow { display:flex; gap: 13px; margin: 14px 0; align-items: flex-start; }
  .solvecheck { color:#14543F; font-size: 21px; font-weight:700; line-height:1.1; }
  .solvetext { font-size: 16.5px; line-height:1.45; }
  .solvetext b { color:#14543F; }
  .booking { display:flex; gap: 14px; margin-top: 14px; }
  .card { background:#fff; border:1px solid #E6DBCB; border-radius:12px; padding: 14px 16px; flex:1; }
  .card-h { font-family:'Fraunces',serif; font-size:15px; color:#14543F; font-weight:700; margin-bottom: 9px; }
  .cal-month { font-size:13px; font-weight:600; color:#2A241E; margin-bottom:7px; }
  .cal-grid { display:grid; grid-template-columns: repeat(7, 1fr); gap:3px; }
  .cal-dow { font-size:9px; text-transform:uppercase; color:#8a7e72; text-align:center; font-weight:600; }
  .cal-day { text-align:center; font-size:12px; padding:6px 0; border-radius:6px; color:#2A241E; }
  .cal-bk { background:#efe7d8; color:#b3a890; text-decoration: line-through; }
  .cal-sel { background:#14543F; color:#fff; font-weight:700; }
  .legend { display:flex; gap:12px; margin-top:10px; font-size:10.5px; color:#5a5047; }
  .ldot { display:inline-block; width:10px; height:10px; border-radius:3px; vertical-align:middle; margin-right:4px; }
  .payrow { display:flex; justify-content:space-between; font-size:13.5px; padding:6px 0; border-bottom:1px solid #F1E9DB; }
  .payrow.muted { color:#8a7e72; }
  .paytotal { display:flex; justify-content:space-between; font-size:16px; font-weight:700; color:#14543F; padding-top:9px; }
  .paybtn { background:#14543F; color:#fff; text-align:center; padding:10px; border-radius:8px; font-weight:700; font-size:14px; margin-top:11px; }
  .paynote { font-size:11px; color:#8a7e72; margin-top:8px; line-height:1.4; }
  .trust { background:#fff; border:1px solid #E6DBCB; border-radius:12px; padding: 16px 20px; margin-top: 16px; }
  .trust p { font-size: 16px; margin:0; }
  .plans { display:flex; gap: 12px; margin-top: 16px; }
  .plan { flex:1; background:#fff; border:1px solid #E6DBCB; border-radius:12px; padding: 16px 14px; }
  .plan.feature { background:#14543F; border-color:#14543F; }
  .plan-name { font-family:'Fraunces',serif; font-size:18px; font-weight:700; color:#14543F; }
  .plan.feature .plan-name { color:#fff; }
  .plan-price { font-family:'Fraunces',serif; font-size:28px; font-weight:900; color:#C0673E; margin: 5px 0 2px 0; }
  .plan.feature .plan-price { color:#e8d5b7; }
  .plan-unit { font-size:12.5px; color:#8a7e72; }
  .plan.feature .plan-unit { color:#cfe0d4; }
  .plan-for { font-size:12.5px; color:#5a5047; margin: 7px 0 9px 0; min-height: 32px; }
  .plan.feature .plan-for { color:#dfeae0; }
  .plan ul { padding-left:17px; margin:0; }
  .plan li { font-size:13px; line-height:1.5; margin-bottom:4px; }
  .plan.feature li { color:#f3ede2; }
  .offer { background:#C0673E; color:#fff; border-radius:14px; padding: 22px 24px; margin-top: 18px; }
  .offer h3 { color:#fff; font-size: 24px; margin:0 0 6px 0; }
  .offer p { color:#fff; font-size:16px; margin: 4px 0; }
  .offer .fine { font-size:12px; color:#f7e6dc; margin-top:10px; line-height:1.45; }
  .everyplan { font-size:13.5px; color:#5a5047; margin-top:12px; text-align:center; font-style:italic; }
  .cta { text-align:center; margin-top:18px; }
  .cta h3 { font-size:23px; margin:0 0 6px 0; }
  .cta p { font-size:16px; margin:0; color:#3d362e; }
  .footer { position:absolute; bottom: 11mm; left:18mm; right:18mm; text-align:center; color:#8a7e72; font-size:11px; }
</style>
<div class="page">
<div class="brand">Familiar Guest</div>
<div class="cover">
<div class="ktag">For homeowners in Los Cabos · Todos Santos · La Paz</div>
<h1>Take your guests<br>direct. Keep what<br>you earn.</h1>
<p>You already have guests who return to your home year after year. Familiar Guest lets you book them directly — under your own name — with payments, rental agreements, and trust protections handled for you. No 15% Airbnb cut. No website to build.</p>
<div class="badge">★ First month free — try it with your guests</div>
<div class="cover-foot">famguest.com · Direct booking, made effortless for everyday rental owners</div>
</div>
<div style="margin-top: 30px;"><div class="kicker">Sound familiar?</div><h2 class="section">The problems you live with</h2></div>
<div class="problem">Airbnb takes <b>~15.5% of every booking</b> — even from guests who already know you.</div>
<div class="problem">The platform <b>owns your guest list.</b> You can't easily invite past guests back next season.</div>
<div class="problem"><b>Getting paid across borders</b> is a hassle — currencies, fees, and foreign bank accounts.</div>
<div class="problem">Your guests wonder: <b>"Is it safe to send money</b> for a home in Mexico?"</div>
<div class="problem">You manage it all <b>from thousands of miles away.</b></div>
<div class="footer">famguest.com</div>
</div>
<div class="page">
<div class="kicker">Here's the fix</div>
<h2 class="section">Everything you need, built in</h2>
<p class="lead">All the booking power of Airbnb — without the parts that frustrate you.</p>
<div class="solverow"><div class="solvecheck">✓</div><div class="solvetext"><b>Keep your rate.</b> A flat $15–$49/month, or just 5% per booking — never a 15% cut.</div></div>
<div class="solverow"><div class="solvecheck">✓</div><div class="solvetext"><b>Own your guests.</b> A private guest list that's yours, with one-click re-invites timed to the winter season.</div></div>
<div class="solverow"><div class="solvecheck">✓</div><div class="solvetext"><b>Get paid your way.</b> Take payment in dollars, Canadian dollars, or pesos — paid out to a U.S., Canadian, or Mexican bank.</div></div>
<div class="solverow"><div class="solvecheck">✓</div><div class="solvetext"><b>Trust built in.</b> Funds held safely until check-in. Every owner verified. Optional ID screening and up to $1M damage protection.</div></div>
<div class="solverow"><div class="solvecheck">✓</div><div class="solvetext"><b>Two languages, automatically.</b> Booking and guest messaging work in English and Spanish, translated for you.</div></div>
<div class="solverow"><div class="solvecheck">✓</div><div class="solvetext"><b>Run it from anywhere.</b> Give your local caretaker their own access, and let guests check in on their own.</div></div>
<div class="trust"><p>🛡️ <b>The trust difference:</b> because we hold the payment in escrow until check-in, your guests book a home in Mexico with total confidence — and you look as polished as any resort, under your own property's name.</p></div>
<div class="footer">famguest.com</div>
</div>
<div class="page">
<div class="kicker">See it in action</div>
<h2 class="section">A booking, start to finish</h2>
<p class="lead">Your guest opens your private link, picks open dates, signs the agreement, and pays — on their phone, in their language and currency. You're notified, and the money is held safely until check-in.</p>
<div class="booking"><div class="card"><div class="card-h">1 · Guest picks open dates</div><div class="cal-month">March 2026 — Casa del Mar</div><div class="cal-grid"><div class="cal-dow">S</div><div class="cal-dow">M</div><div class="cal-dow">T</div><div class="cal-dow">W</div><div class="cal-dow">T</div><div class="cal-dow">F</div><div class="cal-dow">S</div><div class="cal-day">1</div><div class="cal-day">2</div><div class="cal-day">3</div><div class="cal-day cal-bk">4</div><div class="cal-day cal-bk">5</div><div class="cal-day cal-bk">6</div><div class="cal-day cal-bk">7</div><div class="cal-day">8</div><div class="cal-day">9</div><div class="cal-day">10</div><div class="cal-day">11</div><div class="cal-day">12</div><div class="cal-day">13</div><div class="cal-day cal-sel">14</div><div class="cal-day cal-sel">15</div><div class="cal-day cal-sel">16</div><div class="cal-day cal-sel">17</div><div class="cal-day cal-sel">18</div><div class="cal-day cal-sel">19</div><div class="cal-day cal-sel">20</div><div class="cal-day cal-sel">21</div><div class="cal-day">22</div><div class="cal-day">23</div><div class="cal-day">24</div><div class="cal-day">25</div><div class="cal-day">26</div><div class="cal-day">27</div><div class="cal-day cal-bk">28</div><div class="cal-day">29</div><div class="cal-day">30</div><div class="cal-day">31</div></div><div class="legend"><span><span class="ldot" style="background:#FBF6EE;border:1px solid #E6DBCB;"></span>Open</span><span><span class="ldot" style="background:#14543F;"></span>Their stay</span><span><span class="ldot" style="background:#efe7d8;"></span>Booked</span></div></div><div class="card"><div class="card-h">2 · Guest pays securely</div><div class="payrow"><span>$280 × 7 nights</span><span>$1,960</span></div><div class="payrow"><span>Cleaning fee</span><span>$120</span></div><div class="payrow muted"><span>Refundable deposit (held)</span><span>$300</span></div><div class="paytotal"><span>Total due today</span><span>$2,080</span></div><div class="paybtn">Confirm &amp; Pay</div><div class="paynote">Held in escrow until check-in. Pay in USD, CAD, or MXN — or split 50% now, 50% before arrival.</div></div></div>
<div style="margin-top:18px;"><div class="kicker">Effortless from day one</div><h2 class="section" style="font-size:24px;">Live in an afternoon</h2><p class="lead">Add your photos. Let AI help write your description. Sync your calendar with Airbnb and VRBO. Verify once. Share your link. That's it.</p></div>
<div class="footer">famguest.com</div>
</div>
<div class="page">
<div class="kicker">Simple pricing</div>
<h2 class="section">Plans that fit how you rent</h2>
<p class="lead">No commission on monthly plans. All plans are subject to payment processing fees, passed through at cost — no markup, ever.</p>
<div class="plans"><div class="plan"><div class="plan-name">Starter</div><div class="plan-price">$15</div><div class="plan-unit">per month · 1 property</div><div class="plan-for">For single-home owners.</div><ul><li>0% commission</li><li>1 property</li><li>Free friends &amp; family bookings</li></ul></div><div class="plan feature"><div class="plan-name">Host</div><div class="plan-price">$29</div><div class="plan-unit">per month · up to 5 homes</div><div class="plan-for">For active owners.</div><ul><li>0% commission</li><li>Up to 5 properties</li><li>Everything in Starter</li></ul></div><div class="plan"><div class="plan-name">Pro</div><div class="plan-price">$49</div><div class="plan-unit">per month · 6–10 homes</div><div class="plan-for">For owners with several homes.</div><ul><li>6–10 properties</li><li>Consolidated income reports</li><li>Priority support</li></ul></div></div>
<p style="font-size:14px; color:#5a5047; margin-top:11px; text-align:center;">Prefer no monthly fee? <b>Pay-as-you-go</b> — just 5% per booking.</p>
<div class="everyplan">Every plan includes cross-border payments, bilingual booking, escrow, verified-owner trust, calendar sync, and your private guest list. Optional add-ons: Guest Screening ($5/booking) and Protected Booking with up to $1M damage protection ($19.99/booking).</div>
<div class="offer">
<h3>★ Your first month is free</h3>
<p>Try Familiar Guest with your own guests at no subscription cost for 30 days. Bring your repeat guests over and take your first direct bookings risk-free.</p>
<p class="fine">The free month waives your monthly subscription fee only. You remain responsible for payment processing (card) fees and for any add-ons you choose to use — guest screening and damage protection. Cancel anytime before the month ends and pay nothing in subscription.</p>
</div>
<div class="cta"><h3>Keep your guests. Keep your earnings.</h3><p>Start your free month at <b>famguest.com</b></p></div>
<div class="footer">famguest.com &nbsp;·&nbsp; Direct booking, made effortless for everyday rental owners</div>
</div>
