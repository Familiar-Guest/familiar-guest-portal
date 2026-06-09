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
  body { font-family: 'Hanken Grotesk', sans-serif; color: #20303A; margin: 0; padding: 0; background: #EEF3F6; }
  .page { padding: 20mm 18mm; min-height: 297mm; box-sizing: border-box; page-break-after: always; position: relative; }
  .page:last-child { page-break-after: auto; }
  h1, h2, h3 { font-family: 'Fraunces', serif; color: #135A73; }
  .brand { font-family:'Fraunces',serif; font-size: 22px; color:#135A73; font-weight:700; letter-spacing:0.5px; }
  .cover { background:#135A73; color:#fff; border-radius:16px; padding: 34px 30px; margin-top: 14px; }
  .cover .ktag { color:#F4C58E; font-size:13px; text-transform:uppercase; letter-spacing:2px; font-weight:600; }
  .cover h1 { color:#fff; font-size: 46px; line-height:1.08; font-weight:900; margin: 14px 0 12px 0; }
  .cover p { color:#dbe9f0; font-size: 18px; line-height:1.5; margin: 0; }
  .badge { display:inline-block; background:#E07B39; color:#fff; font-weight:700; font-size:17px; padding:10px 18px; border-radius:30px; margin-top:22px; }
  .cover-foot { color:#aecbd8; font-size:13px; margin-top:26px; }
  h2.section { font-size: 30px; margin: 0 0 6px 0; }
  .kicker { font-size: 13px; text-transform: uppercase; letter-spacing: 2px; color:#E07B39; font-weight:700; margin-bottom: 4px; }
  .lead { font-size: 17px; line-height:1.6; color:#33454E; }
  .problem { font-size: 17px; line-height:1.45; margin: 12px 0; padding-left: 30px; position: relative; }
  .problem::before { content: "\2715"; position:absolute; left:0; top:0; color:#E07B39; font-weight:700; font-size:17px; }
  .problem b { color:#135A73; }
  .solverow { display:flex; gap: 13px; margin: 14px 0; align-items: flex-start; }
  .solvecheck { color:#135A73; font-size: 21px; font-weight:700; line-height:1.1; }
  .solvetext { font-size: 16.5px; line-height:1.45; }
  .solvetext b { color:#135A73; }
  .booking { display:flex; gap: 14px; margin-top: 14px; }
  .card { background:#fff; border:1px solid #D5DEE3; border-radius:12px; padding: 14px 16px; flex:1; }
  .card-h { font-family:'Fraunces',serif; font-size:15px; color:#135A73; font-weight:700; margin-bottom: 9px; }
  .cal-month { font-size:13px; font-weight:600; color:#20303A; margin-bottom:7px; }
  .cal-grid { display:grid; grid-template-columns: repeat(7, 1fr); gap:3px; }
  .cal-dow { font-size:9px; text-transform:uppercase; color:#8395A0; text-align:center; font-weight:600; }
  .cal-day { text-align:center; font-size:12px; padding:6px 0; border-radius:6px; color:#20303A; }
  .cal-bk { background:#E4E9EC; color:#9FB0B8; text-decoration: line-through; }
  .cal-sel { background:#135A73; color:#fff; font-weight:700; }
  .legend { display:flex; gap:12px; margin-top:10px; font-size:10.5px; color:#4A5A63; }
  .ldot { display:inline-block; width:10px; height:10px; border-radius:3px; vertical-align:middle; margin-right:4px; }
  .payrow { display:flex; justify-content:space-between; font-size:13.5px; padding:6px 0; border-bottom:1px solid #E6ECEF; }
  .payrow.muted { color:#8395A0; }
  .paytotal { display:flex; justify-content:space-between; font-size:16px; font-weight:700; color:#135A73; padding-top:9px; }
  .paybtn { background:#135A73; color:#fff; text-align:center; padding:10px; border-radius:8px; font-weight:700; font-size:14px; margin-top:11px; }
  .paynote { font-size:11px; color:#8395A0; margin-top:8px; line-height:1.4; }
  .trust { background:#fff; border:1px solid #D5DEE3; border-radius:12px; padding: 16px 20px; margin-top: 16px; }
  .trust p { font-size: 16px; margin:0; }
  .plans { display:flex; gap: 12px; margin-top: 16px; }
  .plan { flex:1; background:#fff; border:1px solid #D5DEE3; border-radius:12px; padding: 16px 14px; }
  .plan.feature { background:#135A73; border-color:#135A73; }
  .plan-name { font-family:'Fraunces',serif; font-size:18px; font-weight:700; color:#135A73; }
  .plan.feature .plan-name { color:#fff; }
  .plan-price { font-family:'Fraunces',serif; font-size:28px; font-weight:900; color:#E07B39; margin: 5px 0 2px 0; }
  .plan.feature .plan-price { color:#F4C58E; }
  .plan-unit { font-size:12.5px; color:#8395A0; }
  .plan.feature .plan-unit { color:#bcd5e0; }
  .plan-for { font-size:12.5px; color:#4A5A63; margin: 7px 0 9px 0; min-height: 32px; }
  .plan.feature .plan-for { color:#cfe0e8; }
  .plan ul { padding-left:17px; margin:0; }
  .plan li { font-size:13px; line-height:1.5; margin-bottom:4px; }
  .plan.feature li { color:#e6eef2; }
  .offer { background:#E07B39; color:#fff; border-radius:14px; padding: 22px 24px; margin-top: 18px; }
  .offer h3 { color:#fff; font-size: 24px; margin:0 0 6px 0; }
  .offer p { color:#fff; font-size:16px; margin: 4px 0; }
  .offer .fine { font-size:12px; color:#fde7d8; margin-top:10px; line-height:1.45; }
  .everyplan { font-size:13.5px; color:#4A5A63; margin-top:12px; text-align:center; font-style:italic; }
  .cta { text-align:center; margin-top:18px; }
  .cta h3 { font-size:23px; margin:0 0 6px 0; }
  .cta p { font-size:16px; margin:0; color:#33454E; }
  .footer { position:absolute; bottom: 11mm; left:18mm; right:18mm; text-align:center; color:#8395A0; font-size:11px; }
  .feat-grid { display:flex; flex-wrap:wrap; gap:14px; margin-top:18px; }
  .feat { width: calc(50% - 7px); box-sizing:border-box; background:#fff; border:1px solid #D5DEE3; border-radius:12px; padding:15px 16px; }
  .feat-ic { width:44px; height:44px; border-radius:10px; background:#EAF1F4; display:flex; align-items:center; justify-content:center; margin-bottom:10px; }
  .feat-ic svg { width:24px; height:24px; }
  .feat.hl { border-color:#E07B39; }
  .feat.hl .feat-ic { background:#FBE7D6; }
  .feat-t { font-family:'Fraunces',serif; font-size:14px; color:#135A73; font-weight:700; margin-bottom:4px; }
  .feat-d { font-size:11.5px; color:#33454E; line-height:1.45; }
  .feat-only { font-size:9.5px; color:#E07B39; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; margin-top:6px; }
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
<div class="solverow"><div class="solvecheck">✓</div><div class="solvetext"><b>Taxes &amp; accounting handled.</b> We calculate and collect lodging taxes, remit Mexican host taxes where required, and hand you tax-ready statements across all your homes — the hardest part of renting in Mexico, done for you.</div></div>
<div class="solverow"><div class="solvecheck">✓</div><div class="solvetext"><b>Run it from anywhere.</b> Give your local caretaker their own access, and let guests check in on their own.</div></div>
<div class="trust"><p>🛡️ <b>The trust difference:</b> because we hold the payment in escrow until check-in, your guests book a home in Mexico with total confidence — and you look as polished as any resort, under your own property's name.</p></div>
<div class="footer">famguest.com</div>
</div>
<div class="page">
<div class="kicker">What you get</div>
<h2 class="section">Key features</h2>
<p class="lead">Everything that makes a direct booking as easy and trustworthy as a major platform — under your own name.</p>
<div class="feat-grid">
<div class="feat"><div class="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#135A73" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7 0l2-2a5 5 0 0 0-7-7l-1 1"/><path d="M14 11a5 5 0 0 0-7 0l-2 2a5 5 0 0 0 7 7l1-1"/></svg></div><div class="feat-t">Direct Booking Link</div><div class="feat-d">A private, branded booking page in your property's name — no marketplace, no guest account required.</div></div>
<div class="feat"><div class="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#135A73" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="11" width="14" height="9" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/><circle cx="12" cy="15.5" r="1.1"/></svg></div><div class="feat-t">Escrow-Protected Deposits &amp; Payments</div><div class="feat-d">Guest payments and damage deposits are held securely until check-in, so every booking is safe for both sides.</div></div>
<div class="feat"><div class="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#135A73" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9.5" cy="10" r="5.5"/><circle cx="15" cy="14.5" r="5.5"/></svg></div><div class="feat-t">Split Payments</div><div class="feat-d">Collect a booking in two parts — an initial deposit now and the balance before arrival.</div></div>
<div class="feat"><div class="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#135A73" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><path d="M12 3c2.6 2.6 2.6 15.4 0 18"/><path d="M12 3c-2.6 2.6-2.6 15.4 0 18"/></svg></div><div class="feat-t">Multi-Currency &amp; Payouts</div><div class="feat-d">Charge in USD, CAD, or pesos and get paid to a U.S., Canadian, or Mexican bank.</div></div>
<div class="feat"><div class="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#135A73" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="5" width="16" height="16" rx="2"/><path d="M4 9h16"/><path d="M8 3v4"/><path d="M16 3v4"/></svg></div><div class="feat-t">Instant Calendar Sync</div><div class="feat-d">Two-way iCal sync with Airbnb, VRBO, and more keeps availability current and avoids double-bookings.</div></div>
<div class="feat"><div class="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#135A73" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="9" r="3"/><path d="M3.5 19a5.5 5.5 0 0 1 11 0"/><path d="M16 7a3 3 0 0 1 0 6"/><path d="M17.5 19a5.5 5.5 0 0 0-2.2-4.4"/></svg></div><div class="feat-t">Your Private Guest List</div><div class="feat-d">A guest CRM you own — stay history, notes, and one-click re-invites each season.</div></div>
<div class="feat"><div class="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#135A73" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4h11a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H10l-4 3v-3H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/><path d="M7 8h8"/><path d="M7 11h5"/></svg></div><div class="feat-t">Bilingual Messaging</div><div class="feat-d">Booking and guest communication in English and Spanish, translated automatically.</div></div>
<div class="feat hl"><div class="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#E07B39" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h12v18l-2-1.4-2 1.4-2-1.4-2 1.4-2-1.4L6 21z"/><path d="M9 8h6"/><path d="M9 12h6"/></svg></div><div class="feat-t">Rental Income &amp; Tax Payment Accounting</div><div class="feat-d">Track rental income, handle lodging taxes, and get the documents you need for tax reporting — across all your homes.</div><div class="feat-only">No competitor offers this</div></div>
<div class="feat"><div class="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#135A73" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4"/><path d="M9.5 14.5l1.5 1.5 3-3.5"/></svg></div><div class="feat-t">Rental Agreement</div><div class="feat-d">A rental agreement auto-generated and e-signed before every booking is confirmed.</div></div>
<div class="feat"><div class="feat-ic"><svg viewBox="0 0 24 24" fill="none" stroke="#135A73" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg></div><div class="feat-t">Screening &amp; Protection</div><div class="feat-d">Optional guest ID screening and up to $1M in damage protection on any booking.</div></div>
</div>
<div class="footer">famguest.com</div>
</div>
<div class="page">
<div class="kicker">See it in action</div>
<h2 class="section">A booking, start to finish</h2>
<p class="lead">Your guest opens your private link, picks open dates, signs the agreement, and pays — on their phone, in their language and currency. You're notified, and the money is held safely until check-in.</p>
<div class="booking"><div class="card"><div class="card-h">1 · Guest picks open dates</div><div class="cal-month">March 2026 — Casa del Mar</div><div class="cal-grid"><div class="cal-dow">S</div><div class="cal-dow">M</div><div class="cal-dow">T</div><div class="cal-dow">W</div><div class="cal-dow">T</div><div class="cal-dow">F</div><div class="cal-dow">S</div><div class="cal-day">1</div><div class="cal-day">2</div><div class="cal-day">3</div><div class="cal-day cal-bk">4</div><div class="cal-day cal-bk">5</div><div class="cal-day cal-bk">6</div><div class="cal-day cal-bk">7</div><div class="cal-day">8</div><div class="cal-day">9</div><div class="cal-day">10</div><div class="cal-day">11</div><div class="cal-day">12</div><div class="cal-day">13</div><div class="cal-day cal-sel">14</div><div class="cal-day cal-sel">15</div><div class="cal-day cal-sel">16</div><div class="cal-day cal-sel">17</div><div class="cal-day cal-sel">18</div><div class="cal-day cal-sel">19</div><div class="cal-day cal-sel">20</div><div class="cal-day cal-sel">21</div><div class="cal-day">22</div><div class="cal-day">23</div><div class="cal-day">24</div><div class="cal-day">25</div><div class="cal-day">26</div><div class="cal-day">27</div><div class="cal-day cal-bk">28</div><div class="cal-day">29</div><div class="cal-day">30</div><div class="cal-day">31</div></div><div class="legend"><span><span class="ldot" style="background:#EEF3F6;border:1px solid #D5DEE3;"></span>Open</span><span><span class="ldot" style="background:#135A73;"></span>Their stay</span><span><span class="ldot" style="background:#E4E9EC;"></span>Booked</span></div></div><div class="card"><div class="card-h">2 · Guest pays securely</div><div class="payrow"><span>$280 × 7 nights</span><span>$1,960</span></div><div class="payrow"><span>Cleaning fee</span><span>$120</span></div><div class="payrow muted"><span>Refundable deposit (held)</span><span>$300</span></div><div class="paytotal"><span>Total due today</span><span>$2,080</span></div><div class="paybtn">Confirm &amp; Pay</div><div class="paynote">Held in escrow until check-in. Pay in USD, CAD, or MXN — or split 50% now, 50% before arrival.</div></div></div>
<div style="margin-top:18px;"><div class="kicker">Effortless from day one</div><h2 class="section" style="font-size:24px;">Live in an afternoon</h2><p class="lead">Add your photos. Let AI help write your description. Sync your calendar with Airbnb and VRBO. Verify once. Share your link. That's it.</p></div>
<div class="footer">famguest.com</div>
</div>
<div class="page">
<div class="kicker">Simple pricing</div>
<h2 class="section">Plans that fit how you rent</h2>
<p class="lead">No commission on monthly plans. All plans are subject to payment processing fees, passed through at cost — no markup, ever.</p>
<div class="plans"><div class="plan"><div class="plan-name">Starter</div><div class="plan-price">$15</div><div class="plan-unit">per month · 1 property</div><div class="plan-for">For single-home owners.</div><ul><li>0% commission</li><li>1 property</li><li>Free friends &amp; family bookings</li></ul></div><div class="plan feature"><div class="plan-name">Host</div><div class="plan-price">$29</div><div class="plan-unit">per month · up to 5 homes</div><div class="plan-for">For active owners.</div><ul><li>0% commission</li><li>Up to 5 properties</li><li>Everything in Starter</li></ul></div><div class="plan"><div class="plan-name">Pro</div><div class="plan-price">$49</div><div class="plan-unit">per month · 6–10 homes</div><div class="plan-for">For owners with several homes.</div><ul><li>6–10 properties</li><li>Consolidated income reports</li><li>Priority support</li></ul></div></div>
<p style="font-size:14px; color:#4A5A63; margin-top:11px; text-align:center;">Prefer no monthly fee? <b>Pay-as-you-go</b> — just 5% per booking.</p>
<div class="everyplan">Every plan includes cross-border payments, bilingual booking, escrow, verified-owner trust, calendar sync, tax handling, and your private guest list. Optional add-ons: Guest Screening ($5/booking) and Protected Booking with up to $1M damage protection ($19.99/booking).</div>
<div class="offer">
<h3>★ Your first month is free</h3>
<p>Try Familiar Guest with your own guests at no subscription cost for 30 days. Invite your repeat guests over and take your first direct bookings risk-free.</p>
<p class="fine">The free month waives your monthly subscription fee only. You remain responsible for payment processing (card) fees and for any add-ons you choose to use — guest screening and damage protection. Cancel anytime before the month ends and pay nothing in subscription.</p>
</div>
<div class="cta"><h3>Keep your guests. Keep your earnings.</h3><p>Start your free month at <b>famguest.com</b></p></div>
<div class="footer">famguest.com &nbsp;·&nbsp; Direct booking, made effortless for everyday rental owners</div>
</div>
