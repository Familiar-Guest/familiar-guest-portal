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
      onSubmit={(e) => {
        e.preventDefault();
        setJoined(true);
      }}
    >
      <input type="email" placeholder="you@email.com" aria-label="Email" required />
      <button className="btn btn-primary" type="submit" style={buttonStyle}>
        Join the waitlist
      </button>
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
          <button className="menu-toggle" aria-label="Menu">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="#2A241E"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* HERO */}
      <header className="hero">
        <div className="wrap hero-grid">
          <div>
            <p className="eyebrow reveal d1">For owners, not platforms</p>
            <h1 className="reveal d2">
              Take your favorite
              <br />
              guests <span className="it">direct.</span>
            </h1>
            <p className="sub reveal d3">
              Familiar Guest is the simplest way to rent to the people who
              already love your place. Keep the relationship, skip the 15%, and
              let us handle the trust.
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
              No commitment · Bring your photos in a tap, we write your listing
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
            <h2>Live in an afternoon, not a weekend.</h2>
            <p>
              No website to build, no spreadsheets, nothing to write from
              scratch. Bring the photos you already have and we&rsquo;ll handle
              the rest.
            </p>
          </div>
          <div className="steps">
            <div className="step">
              <div className="n"></div>
              <h3>Bring your photos</h3>
              <p>
                Connect Google Photos, iCloud, or Drive, or upload from your
                phone in a tap. The photos you already have are all you need.
              </p>
            </div>
            <div className="step">
              <div className="n"></div>
              <h3>We write your listing</h3>
              <p>
                Paste your own description or answer a few quick questions, and
                we draft a polished listing for you to tweak.
              </p>
            </div>
            <div className="step">
              <div className="n"></div>
              <h3>Sync &amp; verify</h3>
              <p>
                Connect your calendar so dates stay current, and clear a quick
                identity check — most owners do it in minutes.
              </p>
            </div>
            <div className="step">
              <div className="n"></div>
              <h3>Share your link</h3>
              <p>
                Send guests a beautiful booking page. Payment, agreement, and
                house guide are all automatic.
              </p>
            </div>
          </div>

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
                    d="M4 19V5a2 2 0 012-2h11l3 3v13a2 2 0 01-2 2H6a2 2 0 01-2-2z"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M8 8h7M8 12h7M8 16h4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <div>
                <h3>Your guest book</h3>
                <p>
                  A private record of every guest who&rsquo;s ever stayed —
                  notes, history, preferences. Yours, never shared with a
                  platform.
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
                  &ldquo;Book the same week next year?&rdquo; Your returning
                  guests confirm in seconds — the heart of a direct business.
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
                  Collect deposits and balances securely. Funds are held until
                  check-in, and damage deposits release automatically.
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
                  Optional guest screening and damage protection let you open to
                  the public with the confidence of a big platform.
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
            <h2>Pay only when it makes sense for you.</h2>
          </div>
          <div className="price-grid">
            <div className="plan">
              <h3>Pay-as-you-go</h3>
              <div className="amt">
                5%<span> + card fees</span>
              </div>
              <p className="pdesc">Earn as you book. No monthly fee, cancel anytime.</p>
              <ul>
                <li>
                  <Check /> 5% per paid booking
                </li>
                <li>
                  <Check /> $5 flat per free booking
                </li>
                <li>
                  <Check /> No commitment
                </li>
              </ul>
              <a href="#waitlist" className="btn btn-ghost">
                Get started
              </a>
            </div>
            <div className="plan feature">
              <span className="tag">Most popular</span>
              <h3>Solo</h3>
              <div className="amt">
                $29<span>/mo</span>
              </div>
              <p className="pdesc">One property, unlimited bookings, no commission.</p>
              <ul>
                <li>
                  <Check /> Unlimited paid &amp; free bookings
                </li>
                <li>
                  <Check /> Full guest book &amp; messaging
                </li>
                <li>
                  <Check /> No per-booking commission
                </li>
              </ul>
              <a href="#waitlist" className="btn btn-primary">
                Get started
              </a>
            </div>
            <div className="plan">
              <h3>Pro</h3>
              <div className="amt">
                $59<span>/mo</span>
              </div>
              <p className="pdesc">For owners with a small portfolio.</p>
              <ul>
                <li>
                  <Check /> Everything in Solo
                </li>
                <li>
                  <Check /> Up to 5 properties
                </li>
                <li>
                  <Check /> Consolidated income reports
                </li>
              </ul>
              <a href="#waitlist" className="btn btn-ghost">
                Get started
              </a>
            </div>
          </div>
          <p className="price-note">
            Every owner is identity-verified. Card processing is always passed
            through at cost.
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
              Join the waitlist and be first to take your repeat guests direct
              when we open.
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
                <a href="#">Contact</a>
                <a href="#">Help</a>
              </div>
            </div>
          </div>
          <div className="foot-bottom">
            <span>© 2026 Familiar Guest</span>
            <span className="badge-mock">Concept mockup — not a live site</span>
          </div>
        </div>
      </footer>
    </>
  );
}
