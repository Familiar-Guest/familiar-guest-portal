"use client";

import { useEffect, useState } from "react";

/* Reused checkmark used in the suggested-shots and pricing lists */
function Check() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M5 12l5 5L20 6"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* Familiar Guest key+heart logo mark (the original artwork, cropped) */
function HomeMark() {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src="/key-logo.png" alt="Familiar Guest" />;
}

function SignupCTA({ buttonStyle, label = "Get started free" }: { buttonStyle?: React.CSSProperties; label?: string }) {
  return (
    <div className="waitlist reveal d4">
      <a className="btn btn-primary" href="/owner/signup" style={buttonStyle}>
        {label}
      </a>
      <a className="btn btn-ghost" href="/owner/login" style={{ marginLeft: 8 }}>
        Sign in
      </a>
    </div>
  );
}

export default function Home() {
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const nav = document.getElementById("nav");
    const onScroll = () =>
      nav?.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Mobile menu: lock background scroll and close on Escape while open.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <nav id="nav">
        <div className="nav-in">
          <a href="#" className="logo">
            <span className="mark">
              <HomeMark />
            </span>
            Familiar Guest
          </a>
          <div className="nav-links">
            <a className="txt" href="#how">
              How it works
            </a>
            <a className="txt" href="#features">
              Features
            </a>
            <a className="txt" href="#pricing">
              Pricing
            </a>
            <a className="txt" href="#guests">
              For guests
            </a>
            <span className="nav-auth">
              <a className="txt" href="/guest/login">
                Guest sign-in
              </a>
              <a className="btn btn-ghost" href="/owner/login">
                Owner login
              </a>
              <a className="btn btn-primary" href="/owner/signup">
                Get started free
              </a>
            </span>
          </div>
          <button
            className="nav-toggle"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </nav>

      {/* MOBILE MENU */}
      {menuOpen && (
        <div className="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            className="mm-close"
            aria-label="Close menu"
            onClick={() => setMenuOpen(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
          <div className="mm-links">
            <a href="#how" onClick={() => setMenuOpen(false)}>How it works</a>
            <a href="#features" onClick={() => setMenuOpen(false)}>Features</a>
            <a href="#pricing" onClick={() => setMenuOpen(false)}>Pricing</a>
            <a href="#trust" onClick={() => setMenuOpen(false)}>Trust &amp; safety</a>
            <a href="#guests" onClick={() => setMenuOpen(false)}>For guests</a>
          </div>
          <div className="mm-actions">
            <a className="btn btn-primary" href="/owner/signup">Get started free</a>
            <a className="btn btn-ghost" href="/owner/login">Owner login</a>
            <a className="btn btn-ghost" href="/guest/login">Guest sign-in</a>
          </div>
        </div>
      )}

      {/* HERO */}
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="hero-topline reveal d1">
              <span>Rent to Trusted Guests</span>
              <span>Rent from Trusted Owners</span>
            </div>
            <h1 className="reveal d2">
              Host familiar
              <br />
              guests <span className="it">direct.</span>
            </h1>
            <p className="sub reveal d3">
              Familiar Guest lets you take bookings directly from guests you
              already know. You keep the guest relationship, avoid the 15–20%
              platform fees, and we handle the booking, payment, and paperwork.
            </p>
            <SignupCTA />
            <p className="micro reveal d5">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M9 12l2 2 4-4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
              </svg>
              First month commission-free · No monthly fee · No card to start
            </p>
          </div>
          <div className="preview reveal d4">
            <div className="browser">
              <div className="bar">
                <span className="dot" style={{ background: "#E0857A" }}></span>
                <span className="dot" style={{ background: "#E8C26B" }}></span>
                <span className="dot" style={{ background: "#8FC09A" }}></span>
                <span className="url">seaglass.famguest.com</span>
              </div>
              <div className="photo">
                <span className="vbadge">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  </svg>{" "}
                  Verified owner
                </span>
              </div>
              <div className="pbody">
                <p className="loc">Cape San Blas, Florida</p>
                <h3>Sea Glass Cottage</h3>
                <div className="daterow">
                  <div className="pill">
                    Check in<b>Jul 12</b>
                  </div>
                  <div className="pill">
                    Check out<b>Jul 19</b>
                  </div>
                  <div className="pill">
                    Guests<b>4</b>
                  </div>
                </div>
                <div className="priceline">
                  <span className="p">
                    $1,840 <span>/ week</span>
                  </span>
                  <span style={{ fontSize: "13px", color: "var(--ink-soft)" }}>
                    + $90 cleaning
                  </span>
                </div>
                <button className="reserve">Reserve your dates</button>
                <p className="ptrust">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="4"
                      y="10"
                      width="16"
                      height="10"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" />
                  </svg>{" "}
                  Payment held until check-in
                </p>
              </div>
            </div>
            <div className="float-chip fc1">
              <svg viewBox="0 0 24 24" fill="none">
                <path
                  d="M3 8l7.5 4.5L18 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M21 7v10l-9 5-9-5V7l9-5 9 5z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinejoin="round"
                />
              </svg>
              <span>Welcome back, the Hendersons 👋</span>
            </div>
          </div>
        </div>
      </header>

      {/* TRUST STRIP */}
      <div className="strip">
        <div className="strip-in">
          <div className="strip-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M12 2l3 6 6 .9-4.5 4.3L17.5 20 12 16.8 6.5 20l1-6.8L3 8.9 9 8z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>{" "}
            Fees typically ~50% less than big rental platforms
          </div>
          <div className="strip-item">
            <svg viewBox="0 0 24 24" fill="none">
              <rect
                x="4"
                y="10"
                width="16"
                height="10"
                rx="2"
                stroke="currentColor"
                strokeWidth="1.8"
              />
              <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="1.8" />
            </svg>{" "}
            Funds held until check-in
          </div>
          <div className="strip-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M9 12l2 2 4-4"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
            </svg>{" "}
            Every owner identity-verified
          </div>
          <div className="strip-item">
            <svg viewBox="0 0 24 24" fill="none">
              <path
                d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
            </svg>{" "}
            Direct line to the owner
          </div>
        </div>
      </div>

      {/* AUDIENCE ROUTER */}
      <section className="audience" aria-label="Choose where to go">
        <div className="wrap aud-grid">
          <a className="aud-card" href="#how">
            <h3>I own a place</h3>
            <p>See how direct booking works and how to get set up.</p>
            <span className="aud-go">How it works →</span>
          </a>
          <a className="aud-card" href="/owner/login">
            <h3>I&rsquo;m an owner</h3>
            <p>Log in to your dashboard, bookings, and payouts.</p>
            <span className="aud-go">Owner login →</span>
          </a>
          <a className="aud-card" href="/guest/login">
            <h3>I&rsquo;m a guest</h3>
            <p>Find your booking, house guide, and check-in details.</p>
            <span className="aud-go">Find my stay →</span>
          </a>
        </div>
      </section>

      {/* SHIFT */}
      <section className="block">
        <div className="wrap">
          <div className="shift">
            <h2>You found these guests. Why keep paying to rebook them?</h2>
            <p>
              Your repeat guests already know your place. When they rebook
              through a big platform, you still pay a cut of every stay, and the
              guest stays the platform&rsquo;s contact rather than yours.
              Familiar Guest lets you take that booking directly, with the
              escrow and verification guests expect.
            </p>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="block" id="how" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Setup</p>
            <h2>Three things to get started.</h2>
            <p>
              To go live, you provide your listing details, a few facts about
              yourself, and a Stripe account for payouts. There&rsquo;s no
              website to build or spreadsheet to keep up.
            </p>
          </div>
          <div className="bring-grid">
            {/* 1 — Listing info */}
            <div className="bring-card">
              <div className="bring-shot">
                <div className="mock">
                  <div className="mock-head">
                    <span className="mock-dot"></span>
                    <span className="mock-dot"></span>
                    <span className="mock-dot"></span>
                    <span className="mock-title">New listing</span>
                  </div>
                  <div className="mock-body">
                    <div className="mock-thumbs">
                      <span style={{ background: "linear-gradient(135deg,#2f6f57,#5fa37e)" }}></span>
                      <span style={{ background: "linear-gradient(135deg,#5fa37e,#cdb893)" }}></span>
                      <span style={{ background: "linear-gradient(135deg,#cdb893,#c0673e)" }}></span>
                    </div>
                    <div className="mock-line">
                      <span className="mock-lbl">Name</span>
                      <span className="mock-inp">Sea Glass Cottage</span>
                    </div>
                    <div className="mock-line">
                      <span className="mock-lbl">Location</span>
                      <span className="mock-inp">Cape San Blas, FL</span>
                    </div>
                    <div className="mock-line">
                      <span className="mock-lbl">Rate</span>
                      <span className="mock-inp">$1,840 / week</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bring-meta">
                <span className="bring-n">1</span>
                <h3>Your listing</h3>
                <p>
                  Your place&rsquo;s name, location, the photos you already have,
                  and your rate. We turn it into a polished booking page.
                </p>
              </div>
            </div>

            {/* 2 — Owner info */}
            <div className="bring-card">
              <div className="bring-shot">
                <div className="mock">
                  <div className="mock-head">
                    <span className="mock-dot"></span>
                    <span className="mock-dot"></span>
                    <span className="mock-dot"></span>
                    <span className="mock-title">About you</span>
                  </div>
                  <div className="mock-body">
                    <div className="mock-line">
                      <span className="mock-lbl">Name</span>
                      <span className="mock-inp">Jane Carter</span>
                    </div>
                    <div className="mock-line">
                      <span className="mock-lbl">Email</span>
                      <span className="mock-inp">jane@email.com</span>
                    </div>
                    <div className="mock-line">
                      <span className="mock-lbl">Phone</span>
                      <span className="mock-inp">+1 (•••) •••</span>
                    </div>
                    <span className="mock-pill">
                      <svg viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                      </svg>
                      Identity verified
                    </span>
                  </div>
                </div>
              </div>
              <div className="bring-meta">
                <span className="bring-n">2</span>
                <h3>A few details about you</h3>
                <p>
                  Your name and contact info, then a quick identity check — most
                  owners clear it in minutes.
                </p>
              </div>
            </div>

            {/* 3 — Stripe */}
            <div className="bring-card">
              <div className="bring-shot">
                <div className="mock">
                  <div className="mock-head">
                    <span className="mock-dot"></span>
                    <span className="mock-dot"></span>
                    <span className="mock-dot"></span>
                    <span className="mock-title">Get paid</span>
                  </div>
                  <div className="mock-body">
                    <div className="mock-stripe">
                      <span className="s-name">stripe</span>
                      <span className="mock-pill">
                        <svg viewBox="0 0 24 24" fill="none">
                          <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                          <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        Connected
                      </span>
                    </div>
                    <div className="mock-line">
                      <span className="mock-lbl">Payout</span>
                      <span className="mock-inp">Bank •••• 4242</span>
                    </div>
                    <div className="mock-line">
                      <span className="mock-lbl">Next deposit</span>
                      <span className="mock-inp">$1,840.00</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bring-meta">
                <span className="bring-n">3</span>
                <h3>A Stripe account</h3>
                <p>
                  Link Stripe to get paid — guest payments land straight in your
                  bank, with funds held safely until check-in.
                </p>
              </div>
            </div>
          </div>

          <p className="bring-after">
            After that, you share your booking link. The booking page, payment,
            rental agreement, and house guide are handled for each reservation.
          </p>
        </div>
      </section>

      {/* FEATURES */}
      <section className="block" id="features" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">What you get</p>
            <h2>The tools to run direct bookings.</h2>
          </div>
          <div className="feat-grid">
            <div className="feat">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 11.5a8.5 8.5 0 11-8.5-8.5 8.38 8.38 0 014.74 1.46"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                  <path
                    d="M21 3l-9 9-3-3"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3>Direct bookings on your terms</h3>
                <p>
                  Set your own prices and rules and book guests directly,
                  without an algorithm in between. Lower fees than the big
                  platforms mean you keep more and can pass some on.
                </p>
              </div>
            </div>
            <div className="feat">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none">
                  <path d="M21 12a9 9 0 11-3-6.7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path
                    d="M21 4v5h-5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3>Stay offers &amp; one-click rebook</h3>
                <p>
                  Pre-define a stay and send a payment link to anyone who
                  inquires, or rebook last year&rsquo;s guests from their saved
                  details.
                </p>
              </div>
            </div>
            <div className="feat">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 10h18" stroke="currentColor" strokeWidth="1.8" />
                </svg>
              </div>
              <div>
                <h3>Payments &amp; escrow</h3>
                <p>
                  Guest payments are held until check-in, and damage deposits
                  release automatically after the inspection window.
                </p>
              </div>
            </div>
            <div className="feat">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 3l8 3v6c0 4.5-3.2 7.5-8 9-4.8-1.5-8-4.5-8-9V6z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 12l2 2 4-4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3>Built-in safeguards</h3>
                <p>
                  Add optional guest screening and damage protection when you
                  open a place to the public.
                </p>
              </div>
            </div>
            <div className="feat">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M12 2v20M17 5.5c0-1.93-2.24-3.5-5-3.5s-5 1.57-5 3.5 2.24 3.5 5 3.5 5 1.57 5 3.5-2.24 3.5-5 3.5-5-1.57-5-3.5"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3>Rental income &amp; tax accounting</h3>
                <p>
                  Track income, handle lodging taxes, and produce year-end
                  documents for your accountant, across every property you list.
                </p>
              </div>
            </div>
            <div className="feat">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none">
                  <path
                    d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-11.8 3.8L3 20l1.1-3.3a8.5 8.5 0 113.2-13A8.38 8.38 0 0121 11.5z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3>Reminders &amp; check-in messages</h3>
                <p>
                  Automatic text, WhatsApp, and email, with GPS directions to
                  the door, so guests arrive knowing what they need.
                </p>
              </div>
            </div>
            <div className="feat">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 12h18" stroke="currentColor" strokeWidth="1.8" />
                  <path
                    d="M12 3c2.6 2.6 2.6 15.4 0 18M12 3c-2.6 2.6-2.6 15.4 0 18"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h3>Multi-currency pricing</h3>
                <p>
                  Price each property — or any single offer — in USD, CAD, MXN,
                  or EUR. Guests pay in their currency; you get paid in yours,
                  with FX passed through at cost.
                </p>
              </div>
            </div>
            <div className="feat">
              <div className="ic">
                <svg viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4.5" width="18" height="16" rx="2" stroke="currentColor" strokeWidth="1.8" />
                  <path d="M3 9h18M8 3v3M16 3v3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M9 14l2 2 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3>Two-way calendar sync</h3>
                <p>
                  Keep every platform in step. Import calendars from{" "}
                  <strong>Airbnb, VRBO, Booking.com, and Houfy</strong>, and export
                  Familiar Guest bookings back to each — so a booking anywhere blocks
                  the dates everywhere. Standard iCal, no extra tools.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OFFER SPOTLIGHT */}
      <section className="block" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="offer-spot">
            <div>
              <p className="eyebrow">Send a stay offer</p>
              <h2>Turn an inquiry into a booking with one link.</h2>
              <p className="lead">
                When someone asks about your place by text, DM, or email, you
                pre-define the stay, set your price, and send a single link they
                can accept and pay. It replaces the back-and-forth of arranging
                a booking by hand.
              </p>
              <ul className="spot-list">
                <li>
                  <Check /> You set the dates and price — we send the secure
                  payment link.
                </li>
                <li>
                  <Check /> The dates stay held for your guest right up to
                  check-in — they can pay any time before they arrive.
                </li>
                <li>
                  <Check /> Your guest accepts and pays — no account or app
                  required, and it works on mobile.
                </li>
                <li>
                  <Check /> The same flow handles one-click rebooking for
                  returning guests.
                </li>
              </ul>
            </div>
            <div className="offer-visual">
              <div className="mock">
                <div className="mock-head">
                  <span className="mock-dot"></span>
                  <span className="mock-dot"></span>
                  <span className="mock-dot"></span>
                  <span className="mock-title">Your booking offer</span>
                </div>
                <div className="mock-body">
                  <span className="mock-pill warn">Offer · held until check-in</span>
                  <div className="mock-line">
                    <span className="mock-lbl">Property</span>
                    <span className="mock-inp">Casa del Mar</span>
                  </div>
                  <div className="mock-line">
                    <span className="mock-lbl">Dates</span>
                    <span className="mock-inp">Mar 3 → Mar 10</span>
                  </div>
                  <div className="mock-line">
                    <span className="mock-lbl">Total</span>
                    <span className="mock-inp">$2,400</span>
                  </div>
                  <div className="mock-cta">Reserve your dates</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STOREFRONT SPOTLIGHT */}
      <section className="block" id="storefront" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="offer-spot">
            {/* Faithful mini-render of the actual sf-* storefront design */}
            <div className="offer-visual">
              <div className="sf-preview">
                {/* Teal masthead — matches sf-head exactly */}
                <div className="sf-preview-head">
                  <div className="sf-preview-brand">famguest.com/owner/casa-sol</div>
                  <div className="sf-preview-badge">
                    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Verified owner &middot; Secure payment
                  </div>
                  <div className="sf-preview-title">Casa Sol Rentals</div>
                  <div className="sf-preview-sub">Book directly — no platform fees, payment held in escrow.</div>
                </div>

                {/* Property grid — matches sf-grid / sf-card exactly */}
                <div className="sf-preview-body">
                  <div className="sf-preview-count">2 properties available</div>
                  <div className="sf-preview-grid">

                    <div className="sf-preview-card">
                      <div className="sf-preview-photo" style={{ background: "linear-gradient(135deg,#1a6a4a 0%,#5fa37e 60%,#a0c890 100%)" }}>
                        <span className="sf-preview-pill">Book direct</span>
                      </div>
                      <div className="sf-preview-info">
                        <div className="sf-preview-loc">120 Beach Dr., San Diego, CA 92107</div>
                        <div className="sf-preview-name">Villa Azul</div>
                        <div className="sf-preview-desc">Hilltop retreat with panoramic ocean views, private pool.</div>
                        <div className="sf-preview-footer">
                          <span><strong>$280</strong><span className="sf-preview-per">/night</span></span>
                          <span className="sf-preview-cta">View &amp; book →</span>
                        </div>
                      </div>
                    </div>

                    <div className="sf-preview-card">
                      <div className="sf-preview-photo" style={{ background: "linear-gradient(135deg,#2d5a8e 0%,#5b8db0 55%,#a8c4d8 100%)" }}>
                        <span className="sf-preview-pill">Book direct</span>
                      </div>
                      <div className="sf-preview-info">
                        <div className="sf-preview-loc">542 Viewpoint Rd., Carlsbad, CA 92010</div>
                        <div className="sf-preview-name">Casa Palmas</div>
                        <div className="sf-preview-desc">Steps from the beach, sleeps 6, rooftop terrace.</div>
                        <div className="sf-preview-footer">
                          <span><strong>$195</strong><span className="sf-preview-per">/night</span></span>
                          <span className="sf-preview-cta">View &amp; book →</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Footer strip — matches sf-foot */}
                <div className="sf-preview-foot">
                  Powered by <strong>Familiar Guest</strong>
                </div>
              </div>
            </div>
            <div>
              <p className="eyebrow">Your booking page</p>
              <h2>One link to all your places.</h2>
              <p className="lead">
                Every owner gets a permanent storefront link. Add it to your
                rental profiles, email signature, or social bio, and guests can
                browse your available properties and book the dates they want.
              </p>
              <ul className="spot-list">
                <li>
                  <Check /> One link for your whole portfolio — guests browse and
                  pick.
                </li>
                <li>
                  <Check /> The link stays the same, so you only share it once.
                </li>
                <li>
                  <Check /> Guests book themselves — live availability, secure
                  payment.
                </li>
                <li>
                  <Check /> Your name on the page, not ours —
                  famguest.com/owner/your-name.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section className="block" id="pricing" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head center">
            <p className="eyebrow">Simple pricing</p>
            <h2>Start free. Pay only when you get paid.</h2>
          </div>
          <div className="launch-offer reveal">
            <span className="lo-badge">Launch offer</span>
            <span className="lo-text">
              <strong>Your first month is commission-free</strong> — no monthly
              fee, no card to start. Founding owners lock <strong>Host at $19/mo
              for life</strong>.
            </span>
          </div>
          <div className="price-grid">
            <div className="plan">
              <span className="tag tag-soft">Start here</span>
              <h3>Pay-as-you-go</h3>
              <div className="amt">
                Free<span> to start</span>
              </div>
              <p className="pdesc">No monthly fee, no card to start. Cancel anytime.</p>
              <ul>
                <li>
                  <Check /> <strong>First month commission-free</strong>
                </li>
                <li>
                  <Check /> Then just 5% per paid booking
                </li>
                <li>
                  <Check /> No commitment, no card to sign up
                </li>
              </ul>
              <a href="/owner/signup" className="btn btn-ghost">
                Get started free
              </a>
            </div>
            <div className="plan">
              <h3>Starter</h3>
              <div className="amt">
                $15<span>/mo</span>
              </div>
              <p className="pdesc">One property, unlimited bookings, no commission.</p>
              <ul>
                <li>
                  <Check /> 1 property
                </li>
                <li>
                  <Check /> Unlimited paid &amp; free bookings
                </li>
                <li>
                  <Check /> No per-booking commission
                </li>
              </ul>
              <a href="/owner/signup" className="btn btn-ghost">
                Get started
              </a>
            </div>
            <div className="plan feature">
              <span className="tag">Most owners land here</span>
              <h3>Host</h3>
              <div className="amt">
                $29<span>/mo</span>
              </div>
              <p className="pdesc">Up to 5 properties — built for multi-unit owners.</p>
              <ul>
                <li>
                  <Check /> Up to 5 properties
                </li>
                <li>
                  <Check /> Everything in Starter
                </li>
                <li>
                  <Check /> Full guest book &amp; messaging
                </li>
                <li>
                  <Check /> <strong>Founding owners: $19/mo for life</strong>
                </li>
              </ul>
              <a href="/owner/signup" className="btn btn-primary">
                Get started
              </a>
            </div>
            <div className="plan">
              <h3>Pro</h3>
              <div className="amt">
                $49<span>/mo</span>
              </div>
              <p className="pdesc">For a small portfolio, with consolidated reporting.</p>
              <ul>
                <li>
                  <Check /> 6–10 properties
                </li>
                <li>
                  <Check /> Everything in Host
                </li>
                <li>
                  <Check /> Consolidated reports + priority support
                </li>
              </ul>
              <a href="/owner/signup" className="btn btn-ghost">
                Get started
              </a>
            </div>
          </div>
          <p className="price-note">
            All plans are subject to credit-card processing fees on guest
            payments, deducted from each guest payment at cost. Currency
            conversion is passed through at cost. Every owner is
            identity-verified.
          </p>
        </div>
      </section>

      {/* TRUST */}
      <section className="block" id="trust" style={{ paddingTop: 0 }}>
        <div className="wrap trust-wrap">
          <div>
            <p className="eyebrow">Trust &amp; safety</p>
            <h2 style={{ fontSize: "clamp(30px,3.6vw,42px)", margin: "14px 0 28px" }}>
              The same safeguards, booking direct.
            </h2>
            <div className="trust-list">
              <div className="trust-item">
                <div className="ic">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="10" width="16" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
                    <path d="M8 10V7a4 4 0 018 0v3" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <h3>Money held in escrow</h3>
                  <p>
                    Your guest&rsquo;s payment is held and only released to you
                    after check-in.
                  </p>
                </div>
              </div>
              <div className="trust-item">
                <div className="ic">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M9 12l2 2 4-4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
                  </svg>
                </div>
                <div>
                  <h3>Verified owners only</h3>
                  <p>
                    Every owner passes identity verification before taking a
                    booking, so guests know who they&rsquo;re paying.
                  </p>
                </div>
              </div>
              <div className="trust-item">
                <div className="ic">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 3l8 3v6c0 4.5-3.2 7.5-8 9-4.8-1.5-8-4.5-8-9V6z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <h3>Optional guest screening</h3>
                  <p>
                    Opening to the public? Add identity screening and damage
                    protection with one toggle.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="trust-visual">
            <div className="big">~50%</div>
            <div className="lbl">
              lower fees, typically, than the big rental platforms — so more of
              every booking stays yours
            </div>
            <hr />
            <div className="vs">
              <div>
                <div className="num us">Direct</div>
                <div className="t">You keep the guest</div>
              </div>
              <div>
                <div className="num us">Built-in</div>
                <div className="t">Escrow &amp; verification</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOR GUESTS */}
      <section className="block guests-sec" id="guests" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="guests-card">
            <div>
              <p className="eyebrow">For guests</p>
              <h2>Booking a stay through Familiar Guest?</h2>
              <p className="guests-lead">
                You&rsquo;re booking direct with the owner — with the safeguards
                you&rsquo;d expect from a big platform. Here&rsquo;s how
                you&rsquo;re protected, and how to get back to your trip anytime.
              </p>
              <ul className="spot-list">
                <li>
                  <Check /> Your payment is <strong>held until check-in</strong>{" "}
                  and released to the owner only after you arrive.
                </li>
                <li>
                  <Check /> Every owner is <strong>identity-verified</strong>{" "}
                  before they can take a single booking.
                </li>
                <li>
                  <Check /> Your dates, agreement, receipts, and house guide are{" "}
                  <strong>emailed and always re-openable</strong>.
                </li>
              </ul>
              <div className="guests-actions">
                <a className="btn btn-primary" href="/guest/login">
                  Find my booking
                </a>
                <a className="btn btn-ghost" href="/guest/login">
                  Open my house guide
                </a>
              </div>
            </div>
            <div className="guests-aside">
              <h3>Returning guest?</h3>
              <p>
                Sign in with the email your host has on file to see all your
                stays in one place.
              </p>
              <a
                className="btn btn-primary"
                href="/guest/login"
                style={{ width: "100%", justifyContent: "center" }}
              >
                Find my stay
              </a>
              <p className="guests-aside-note">
                No account needed — your host&rsquo;s booking link is all you
                need. No app, no password.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="block" id="signup" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta">
            <h2>Host your repeat guests directly.</h2>
            <p>
              Sign up free. Your first month is commission-free, and founding
              owners lock Host at $19/mo for life.
            </p>
            <SignupCTA buttonStyle={{ background: "var(--forest)" }} label="Create your free account" />
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="wrap">
          <div className="foot-in">
            <div>
              <a href="#" className="logo" style={{ fontSize: "20px" }}>
                <span className="mark">
                  <HomeMark />
                </span>
                Familiar Guest
              </a>
              <p
                style={{
                  fontSize: "14px",
                  color: "var(--ink-soft)",
                  maxWidth: "24em",
                  marginTop: "14px",
                }}
              >
                Direct booking, made effortless for everyday rental owners.
              </p>
            </div>
            <div className="foot-cols">
              <div className="foot-col">
                <h4>Product</h4>
                <a href="#how">How it works</a>
                <a href="#features">Features</a>
                <a href="#storefront">Your booking page</a>
                <a href="#pricing">Pricing</a>
              </div>
              <div className="foot-col">
                <h4>Trust</h4>
                <a href="#trust">Safety</a>
                <a href="#">How escrow works</a>
                <a href="#">Verification</a>
              </div>
              <div className="foot-col">
                <h4>Company</h4>
                <a href="#">About</a>
                <a href="mailto:info@famguest.com">Contact</a>
                <a href="#">Help</a>
              </div>
              <div className="foot-col">
                <h4>Sign in</h4>
                <a href="/owner/login">Owner login</a>
                <a href="/guest/login">Guest — find my stay</a>
                <a href="/owner/login">Caretaker login</a>
              </div>
              <div className="foot-col">
                <h4>Legal</h4>
                <a href="/terms">Terms of Service</a>
                <a href="/privacy">Privacy Policy</a>
                <a href="/cookies">Cookie Policy</a>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Familiar Guest</span>
            <span>Direct booking for the guests you already have.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
