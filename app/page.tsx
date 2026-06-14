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

/* The home / logo mark */
function HomeMark() {
  return (
    <svg viewBox="0 0 24 24" fill="none">
      <path
        d="M3 11.5 12 4l9 7.5"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 10v9h14v-9"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10 19v-5h4v5"
        stroke="#E7C8B5"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WaitlistForm({ buttonStyle }: { buttonStyle?: React.CSSProperties }) {
  const [joined, setJoined] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (joined) {
    return (
      <div className="waitlist">
        <div
          style={{
            padding: "11px 20px",
            fontWeight: 600,
            color: "var(--forest)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path
              d="M9 12l2 2 4-4"
              stroke="#14543F"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="12" cy="12" r="9" stroke="#14543F" strokeWidth="2" />
          </svg>{" "}
          You&rsquo;re on the list — we&rsquo;ll be in touch.
        </div>
      </div>
    );
  }

  return (
    <form
      className="waitlist reveal d4"
      onSubmit={async (e) => {
        e.preventDefault();
        setError(null);
        const form = e.currentTarget;
        const email = (form.elements.namedItem("email") as HTMLInputElement).value;
        setSubmitting(true);
        try {
          const res = await fetch("/api/waitlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email }),
          });
          if (!res.ok) {
            const data = await res.json().catch(() => null);
            setError(data?.error ?? "Something went wrong. Please try again.");
            return;
          }
          setJoined(true);
        } catch {
          setError("Something went wrong. Please try again.");
        } finally {
          setSubmitting(false);
        }
      }}
    >
      <input type="email" name="email" placeholder="you@email.com" aria-label="Email" required />
      <button className="btn btn-primary" type="submit" style={buttonStyle} disabled={submitting}>
        {submitting ? "Joining…" : "Join the waitlist"}
      </button>
      {error && (
        <div style={{ color: "var(--clay)", fontSize: "13px", marginTop: "8px", width: "100%" }}>
          {error}
        </div>
      )}
    </form>
  );
}

export default function Home() {
  useEffect(() => {
    const nav = document.getElementById("nav");
    const onScroll = () =>
      nav?.classList.toggle("scrolled", window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
            <a className="txt" href="#trust">
              Trust &amp; safety
            </a>
            <a className="btn btn-primary" href="#waitlist">
              Join the waitlist
            </a>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow reveal d1">For owners, not platforms</p>
            <h1 className="reveal d2">
              Host familiar
              <br />
              guests <span className="it">direct.</span>
            </h1>
            <p className="sub reveal d3">
              Familiar Guest is the simplest way to rent to the people who
              already love your place. Keep the relationship, skip the
              15-20% rental platform fees, and let us handle the trust. <strong>Your first month is commission-free.</strong>
            </p>
            <WaitlistForm />
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
            ~8% all-in, vs Airbnb&rsquo;s 15.5%
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

      {/* SHIFT */}
      <section className="block">
        <div className="wrap">
          <div className="shift">
            <h2>You found these guests. Why keep paying to rebook them?</h2>
            <p>
              Your repeat families already know your place. When they book again
              through a big platform, you lose a cut of every stay — and you
              never really own the relationship. Familiar Guest hands it back to
              you, with the safety guests expect built right in.
            </p>
          </div>
        </div>
      </section>

      {/* HOW */}
      <section className="block" id="how" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">Effortless setup</p>
            <h2>Three things to start. We handle the rest.</h2>
            <p>
              To go live you bring just your listing details, a few facts about
              you, and a Stripe account to get paid. No website to build, no
              spreadsheets, nothing to write from scratch.
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
            That&rsquo;s it — share your booking link and the page, payment,
            rental agreement, and house guide all run themselves.
          </p>

          <div className="setup-panel">
            <div className="setup-half left">
              <p className="eyebrow">Your photos, your way</p>
              <h3>The photos you already have are enough.</h3>
              <div className="method-chips">
                <div className="chip">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 18a4 4 0 01-1-7.9 5 5 0 019.6-1.6A4.5 4.5 0 0117 18z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 12v5M9.5 14l2.5-2.5L14.5 14"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>{" "}
                  Connect Google Photos, iCloud, or Drive
                </div>
                <div className="chip">
                  <svg viewBox="0 0 24 24" fill="none">
                    <rect
                      x="6"
                      y="2"
                      width="12"
                      height="20"
                      rx="3"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path d="M10 18h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>{" "}
                  Upload straight from your phone
                </div>
                <div className="chip">
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 16V4m0 0L8 8m4-4l4 4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                    />
                  </svg>{" "}
                  Drag &amp; drop from your computer
                </div>
              </div>
              <p className="setup-note">
                You&rsquo;re always in control of what you share — we only ever
                use the photos you give us.
              </p>
            </div>
            <div className="setup-half shots">
              <p className="eyebrow">Suggested shots</p>
              <h3>Not sure which photos to add?</h3>
              <ul className="shot-list">
                <li>
                  <Check /> A bright photo of the front of the home
                </li>
                <li>
                  <Check /> The main living area and the kitchen
                </li>
                <li>
                  <Check /> Each bedroom and each bathroom
                </li>
                <li>
                  <Check /> Your standout feature — the view, pool, deck, or
                  fireplace
                </li>
                <li>
                  <Check /> A welcoming detail — a made bed or fresh towels
                </li>
              </ul>
              <p className="setup-note">
                Shoot in daylight, tidy up first, and hold your phone sideways.
                Eight to twelve photos is plenty.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="block" id="features" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="sec-head">
            <p className="eyebrow">What you get</p>
            <h2>Everything to run direct, nothing you don&rsquo;t.</h2>
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
                <h3>Direct bookings, full control</h3>
                <p>
                  Your price, your guests, your relationship — no algorithm in
                  the middle. Fees a fraction of Airbnb&rsquo;s mean more for
                  you and a better deal for them.
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
                <h3>One-click rebook</h3>
                <p>
                  &ldquo;Same week next year?&rdquo; Returning guests confirm in
                  seconds. Repeat bookings, on autopilot.
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
                  Funds held safely until check-in. Damage deposits release on
                  their own. Guests pay with confidence.
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
                  Optional guest screening and damage protection — open to the
                  public with big-platform peace of mind.
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
                  Income tracked, lodging taxes handled, year-end documents
                  ready for your accountant — across every property. No other
                  platform does this.
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
                  Automatic text, WhatsApp, and email — including GPS directions
                  straight to your door. Guests arrive informed, you stay
                  hands-off.
                </p>
              </div>
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
              <a href="#waitlist" className="btn btn-ghost">
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
              <a href="#waitlist" className="btn btn-ghost">
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
              <a href="#waitlist" className="btn btn-primary">
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
              <a href="#waitlist" className="btn btn-ghost">
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
              Booking direct, as safe as booking big.
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
                    Your guest&rsquo;s payment is held safely and only released
                    to you after check-in — so booking direct never feels risky.
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
                    Every owner passes identity verification before a single
                    booking. Guests always know the listing is real.
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
            <div className="big">100%</div>
            <div className="lbl">
              of the rate stays yours — minus a fee about half of Airbnb&rsquo;s
            </div>
            <hr />
            <div className="vs">
              <div>
                <div className="num us">~8%</div>
                <div className="t">Familiar Guest</div>
              </div>
              <div>
                <div className="num them">15.5%</div>
                <div className="t">Airbnb</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="block" id="waitlist" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="cta">
            <h2>Keep the guests you&rsquo;ve earned.</h2>
            <p>
              Join the waitlist to host your repeat guests direct when we open —
              your first month is commission-free, and founding owners lock Host
              at $19/mo for life.
            </p>
            <WaitlistForm buttonStyle={{ background: "var(--forest)" }} />
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
                  <svg viewBox="0 0 24 24" fill="none">
                    <path
                      d="M3 11.5 12 4l9 7.5"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5 10v9h14v-9"
                      stroke="#fff"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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
