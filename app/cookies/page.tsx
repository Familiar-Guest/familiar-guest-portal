import type { Metadata } from "next";
import { LegalShell } from "../legal/_components/LegalShell";

export const metadata: Metadata = {
  title: "Cookie Policy — Familiar Guest",
  robots: { index: false, follow: false },
};

export default function CookiesPage() {
  return (
    <LegalShell title="Cookie Policy" updated="June 13, 2026 (draft)">
      <h2 id="what-are-cookies">1. What are cookies</h2>
      <p>
        Cookies are small text files placed on your device when you visit a
        website. We use cookies and similar technologies (such as
        <code>localStorage</code>) for the purposes described below. This
        policy should be read together with our{" "}
        <a href="/privacy">Privacy Policy</a>.
      </p>

      <h2 id="categories">2. Categories of cookies we use</h2>

      <h3>2.1 Strictly necessary (always on)</h3>
      <p>
        These cookies are required for the Service to function and cannot be
        switched off. They do not require consent.
      </p>
      <table>
        <thead>
          <tr><th>Cookie</th><th>Purpose</th><th>Duration</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>sb-access-token</code> / <code>sb-refresh-token</code></td>
            <td>Supabase authentication session for Owners and caretakers</td>
            <td>Session / up to 1 year</td>
          </tr>
          <tr>
            <td><code>fg_consent</code></td>
            <td>Stores your cookie-consent choices (analytics / marketing)</td>
            <td>1 year</td>
          </tr>
        </tbody>
      </table>

      <h3>2.2 First-party analytics</h3>
      <p>
        These cookies support our first-party browse-event capture, which
        records page views and clicks (by Owners, Guests, and site visitors)
        into our own database for product analytics and reporting. No data is
        shared with third-party advertising networks through these cookies.
        Depending on your jurisdiction, these may run on a legitimate-interest
        basis, but we offer a control for them in the cookie banner for
        transparency.
      </p>
      <table>
        <thead>
          <tr><th>Cookie</th><th>Purpose</th><th>Duration</th></tr>
        </thead>
        <tbody>
          <tr>
            <td><code>fg_aid</code></td>
            <td>Anonymous identifier used to group page-view and click events from the same browser over time</td>
            <td>1 year</td>
          </tr>
          <tr>
            <td><code>fg_sid</code></td>
            <td>Session identifier used to group events from the same visit</td>
            <td>Session (~30 min idle)</td>
          </tr>
        </tbody>
      </table>

      <h3>2.3 Marketing &amp; advertising (consent required)</h3>
      <p>
        These cookies are set by third parties and used to measure the
        effectiveness of our marketing and, where applicable, to show
        relevant ads. They are only loaded if you opt in via the cookie
        banner. If you do not opt in, we may still measure conversions (such
        as a completed booking) on a cookieless, server-side basis (e.g.,
        Meta Conversions API or Google&rsquo;s Measurement Protocol) without
        placing these cookies.
      </p>
      <table>
        <thead>
          <tr><th>Provider</th><th>Cookie(s)</th><th>Purpose</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Google Analytics / Ads</td>
            <td><code>_ga</code>, <code>_gid</code>, <code>_gcl_*</code></td>
            <td>Site analytics and ad-conversion measurement</td>
          </tr>
          <tr>
            <td>Meta (planned, not yet active)</td>
            <td><code>_fbp</code>, <code>_fbc</code></td>
            <td>Ad-conversion measurement for Meta campaigns</td>
          </tr>
        </tbody>
      </table>

      <h3>2.4 Bot protection</h3>
      <p>
        We use bot-detection and rate-limiting technology (via our hosting
        provider, Vercel, and Cloudflare Turnstile on certain forms) to
        protect the Service from automated abuse. These may set their own
        short-lived cookies or tokens as part of verifying that a request
        comes from a human; they are treated as strictly necessary for
        security purposes.
      </p>

      <h2 id="managing-cookies">3. Managing your cookie choices</h2>
      <p>
        When you first visit famguest.com, a cookie banner lets you choose
        whether to allow analytics and/or marketing cookies. You can change
        your choice at any time using the &ldquo;Cookie preferences&rdquo;
        link in the site footer. You can also block or delete cookies through
        your browser settings, though doing so may affect how the Service
        functions.
      </p>

      <h2 id="changes">4. Changes to this policy</h2>
      <p>
        We may update this Cookie Policy as our use of cookies changes
        (for example, when Meta Pixel becomes active). Material changes will
        be reflected in the &ldquo;Last updated&rdquo; date above.
      </p>

      <h2 id="contact">5. Contact</h2>
      <p>
        Questions about this Cookie Policy can be sent to{" "}
        <a href="mailto:info@famguest.com">info@famguest.com</a>.
      </p>
    </LegalShell>
  );
}
