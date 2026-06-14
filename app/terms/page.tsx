import type { Metadata } from "next";
import { LegalShell } from "../legal/_components/LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service — Familiar Guest",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <LegalShell title="Terms of Service" updated="June 13, 2026 (draft)">
      <div className="legal-toc">
        <h2>Contents</h2>
        <ol>
          <li>Who we are &amp; what this agreement covers</li>
          <li>Eligibility &amp; accounts</li>
          <li>The Familiar Guest service</li>
          <li>Owner terms</li>
          <li>Guest terms</li>
          <li>Bookings, payments &amp; Stripe</li>
          <li>Escrow, damage deposits &amp; payouts</li>
          <li>Fees, plans &amp; billing</li>
          <li>Cancellations, refunds &amp; disputes between owner and guest</li>
          <li>Rental agreements &amp; e-signatures</li>
          <li>Taxes</li>
          <li>Guest screening &amp; trust features</li>
          <li>Prohibited conduct</li>
          <li>Content &amp; intellectual property</li>
          <li>Disclaimers</li>
          <li>Limitation of liability</li>
          <li>Indemnification</li>
          <li>Term, suspension &amp; termination</li>
          <li>Governing law &amp; dispute resolution</li>
          <li>Changes to these terms</li>
          <li>Contact</li>
        </ol>
      </div>

      <h2 id="who-we-are">1. Who we are &amp; what this agreement covers</h2>
      <p>
        Familiar Guest (&ldquo;Familiar Guest,&rdquo; &ldquo;FG,&rdquo;
        &ldquo;we,&rdquo; &ldquo;us&rdquo;) operates famguest.com and related
        applications (the &ldquo;Service&rdquo;), a platform that helps
        individual vacation-property owners (&ldquo;Owners&rdquo;) manage
        direct bookings with their own guests (&ldquo;Guests&rdquo;),
        including booking pages, messaging, digital rental agreements,
        payment processing, escrow-style payment holds, and related tools.
      </p>
      <p>
        These Terms of Service (&ldquo;Terms&rdquo;) govern access to and use
        of the Service by Owners and Guests (each a &ldquo;User,&rdquo;
        together &ldquo;Users&rdquo;). By creating an account, accessing a
        booking link, or otherwise using the Service, you agree to these
        Terms. If you do not agree, do not use the Service.
      </p>
      <p>
        <strong>Familiar Guest is not a property manager, a real-estate
        broker, an insurer, or a tax advisor.</strong> We provide software,
        payment-facilitation, and related tools that Owners use to manage
        their own rental relationships. Familiar Guest is not a party to the
        rental agreement between an Owner and a Guest, except as expressly
        described below regarding payment processing.
      </p>
      <p>
        <strong>Familiar Guest is not a marketplace or discovery
        platform.</strong> Listings are shared by Owners directly with their
        own guests via private booking links, and (where an Owner enables
        Public Mode) may be made available for booking by members of the
        public who hold the link, subject to the verification and trust
        features described below.
      </p>

      <h2 id="eligibility">2. Eligibility &amp; accounts</h2>
      <ul>
        <li>
          You must be at least 18 years old and able to form a binding
          contract to use the Service.
        </li>
        <li>
          Owners must complete identity verification through our payment
          processor (currently Stripe) before listing a property, sending a
          booking link, or receiving any payout (&ldquo;Gate 1&rdquo;).
          Owners who do not pass identity verification cannot use the
          Service to collect payments.
        </li>
        <li>
          Owners who wish to accept bookings from members of the public
          (rather than only guests they invite directly) must additionally
          complete property-ownership verification for that property
          (&ldquo;Gate 2&rdquo;).
        </li>
        <li>
          Guests are not required to create an account to view a booking
          page or complete a booking.
        </li>
        <li>
          You are responsible for maintaining the confidentiality of your
          login credentials and for all activity under your account.
        </li>
        <li>
          You must provide accurate, current information and promptly update
          it if it changes.
        </li>
      </ul>

      <h2 id="the-service">3. The Familiar Guest service</h2>
      <p>The Service includes, depending on the Owner&rsquo;s plan and configuration:</p>
      <ul>
        <li>Tools to create and manage property listings, photos, pricing, and availability;</li>
        <li>Calendar synchronization with other platforms via iCal (.ics) feeds provided or imported by the Owner;</li>
        <li>A branded, private booking page that Owners share with their Guests;</li>
        <li>Digital rental agreements generated for each booking and signed electronically by the Guest;</li>
        <li>Payment processing for bookings, including escrow-style payment holds and damage-deposit handling;</li>
        <li>Automated messaging to Guests (email, and where enabled, SMS/WhatsApp) such as confirmations, check-in instructions, and reminders;</li>
        <li>A digital house manual accessible to Guests via a private link;</li>
        <li>A private guest directory and related relationship-management tools for Owners;</li>
        <li>Rental-income accounting, lodging-tax line items, and related reporting and export tools (see Section 11, Taxes); and</li>
        <li>Optional add-ons such as guest identity screening and damage-protection coverage, provided by third-party partners.</li>
      </ul>
      <p>
        We may add, modify, or remove features at any time. We will provide
        reasonable notice of material changes that adversely affect Owners or
        Guests.
      </p>

      <h2 id="owner-terms">4. Owner terms</h2>
      <h3>4.1 Listings and content</h3>
      <p>
        Owners are solely responsible for the accuracy of their listings,
        including descriptions, photos, pricing, availability, house rules,
        and policies. Owners represent that they have the legal right to
        rent the property described, and that all content they upload
        (including photos) is either owned by them, licensed to them, or
        used with the permission of the rights holder.
      </p>
      <p>
        <strong>Owners may not upload content scraped, copied, or otherwise
        obtained from another platform&rsquo;s listings (including Airbnb,
        VRBO, or Booking.com) in violation of that platform&rsquo;s terms of
        service.</strong> Owner-authored text, Owner-owned photos, and
        photos imported from the Owner&rsquo;s own cloud storage (e.g.,
        Google Photos, iCloud, Drive, Dropbox) via an authorized connection
        are permitted.
      </p>
      <h3>4.2 Compliance with local law</h3>
      <p>
        Owners are solely responsible for complying with all laws applicable
        to their rental activity, including but not limited to short-term
        rental permits and registration, zoning and HOA restrictions, health
        and safety codes, accessibility requirements, lodging/occupancy tax
        obligations not handled by the Service, fair housing and
        anti-discrimination laws, and immigration/visa rules applicable to
        their Guests where relevant. Familiar Guest provides tools to assist
        with certain tax calculations and reporting (Section 11) but does
        not verify or guarantee Owner compliance with these obligations.
      </p>
      <h3>4.3 Calendar accuracy</h3>
      <p>
        Calendar synchronization via iCal is a one-way, periodic feed in
        each direction, not a real-time system. Owners acknowledge that a
        window of several hours may exist during which a property could be
        booked on more than one platform (&ldquo;double-booking&rdquo;), and
        that Familiar Guest is not responsible for double-bookings arising
        from the inherent limitations of iCal synchronization or from an
        Owner&rsquo;s failure to configure calendar feeds correctly.
      </p>
      <h3>4.4 Caretakers</h3>
      <p>
        Owners may grant limited, scoped access to designated caretakers or
        cleaners (e.g., to view check-in schedules and house-manual
        information) without granting access to payment information or the
        full guest directory. Owners are responsible for the actions of
        caretakers they authorize.
      </p>

      <h2 id="guest-terms">5. Guest terms</h2>
      <ul>
        <li>
          Guests agree to provide accurate information when completing a
          booking, including legal name and contact details matching the
          person who will stay at the property.
        </li>
        <li>
          Guests are responsible for reviewing the listing details, house
          rules, cancellation policy, and rental agreement before completing
          a booking, and for complying with the rental agreement and house
          rules during their stay.
        </li>
        <li>
          The rental relationship &mdash; including the obligations to
          provide and to occupy the property as described &mdash; is between
          the Guest and the Owner. Familiar Guest facilitates communication,
          documentation, and payment for that relationship but is not the
          landlord, host, or property manager.
        </li>
        <li>
          Where an Owner enables Public Mode and the property has been
          verified (Section 12), certain trust features (escrow-style
          payment holds, a Verified Owner indicator, and optional screening)
          apply as described in the listing and at checkout.
        </li>
      </ul>

      <h2 id="payments">6. Bookings, payments &amp; Stripe</h2>
      <p>
        Familiar Guest uses Stripe, Inc. and its affiliates
        (&ldquo;Stripe&rdquo;) to process payments. By using payment features
        of the Service, you agree to Stripe&rsquo;s terms of service and
        privacy policy in addition to these Terms. Identity verification
        (&ldquo;KYC&rdquo;) for Owners is performed by Stripe; Familiar Guest
        does not collect or store government identification documents or
        Social Security numbers.
      </p>
      <p>
        <strong>Familiar Guest acts as the merchant of record for bookings
        processed through the Service.</strong> Guest payments are processed
        by Stripe and, where applicable, briefly pass through Familiar
        Guest&rsquo;s Stripe platform account before being made available to
        the Owner as a payout, net of applicable fees. Familiar Guest does
        not take custody of funds outside of this payment-processing
        arrangement and is not a money-transmitter, bank, or escrow agent in
        the regulated sense of those terms.
      </p>
      <p>
        Prices shown to Guests include the rental amount and any fees set by
        the Owner (such as cleaning fees, extra-guest fees, and applicable
        lodging taxes), plus payment-processing and, for cross-border
        payments, currency-conversion costs, each shown as a separate line
        item before the Guest completes payment.
      </p>

      <h2 id="escrow">7. Escrow-style payment holds, damage deposits &amp; payouts</h2>
      <p>
        For bookings where Familiar Guest holds Guest payment until check-in
        (described in marketing and booking materials as
        &ldquo;escrow&rdquo;), the funds are held via a delayed payout
        arrangement within Stripe, not in a separate trust account or by a
        licensed escrow company. This arrangement is intended to give Guests
        confidence that funds will not be released to the Owner before
        check-in (absent the Owner&rsquo;s instruction to release sooner) and
        to give Owners confidence that funds have been collected before the
        stay.
      </p>
      <p>
        Where a damage deposit is collected, it is held separately from the
        rental payment and released according to the timeline and process
        described in the booking&rsquo;s rental agreement, typically
        following an inspection window after checkout. Familiar Guest does
        not adjudicate damage disputes between Owner and Guest beyond
        facilitating the release or, where the parties agree or the Owner
        provides supporting documentation consistent with the rental
        agreement, a partial or full claim against the deposit.
      </p>
      <p>
        Payouts to Owners are made to the bank account connected through
        Stripe, in the currency and to the destination selected by the Owner,
        net of applicable fees. Payout timing may be affected by Stripe risk
        controls, reserves, or holds, which Familiar Guest does not control
        and is not liable for.
      </p>

      <h2 id="fees">8. Fees, plans &amp; billing</h2>
      <p>
        Familiar Guest offers multiple plans (including a pay-as-you-go
        commission plan and flat monthly/annual subscription plans), each
        with different combinations of commission, subscription fees,
        included bookings, and feature sets, as described on our pricing
        page. Plan details, including current pricing, are available at{" "}
        <a href="/pricing">/pricing</a> and may change with notice.
      </p>
      <ul>
        <li>
          <strong>Payment-processing and currency-conversion fees are passed
          through to the Owner at cost</strong> on every plan, in addition to
          any commission or subscription fee.
        </li>
        <li>
          Subscription fees are billed in advance on a recurring basis (monthly
          or annual, as selected) and are non-refundable except as required
          by law or expressly stated in a current promotional offer.
        </li>
        <li>
          Where an Owner marks a booking as a &ldquo;free booking&rdquo;
          (e.g., for friends or family), Familiar Guest may charge the
          Owner&rsquo;s card on file a flat fee per such booking, as described
          on the pricing page. If that charge fails, the free booking will not
          be created and the Owner will be notified.
        </li>
        <li>
          Optional add-ons (such as guest screening or protected-booking
          coverage) are billed per booking at the rates shown at checkout.
        </li>
      </ul>

      <h2 id="cancellations">9. Cancellations, refunds &amp; disputes between Owner and Guest</h2>
      <p>
        Each Owner sets their own cancellation policy, which is displayed to
        the Guest before booking and incorporated into the rental agreement.
        Familiar Guest processes refunds according to the applicable
        cancellation policy and the timing of the cancellation, but{" "}
        <strong>the cancellation policy itself is set by the Owner, not
        Familiar Guest.</strong>
      </p>
      <p>
        Disputes regarding the condition of the property, the conduct of the
        Guest or Owner during a stay, or the application of house rules are
        primarily between the Owner and the Guest under the rental
        agreement. Familiar Guest may, at its discretion, assist by providing
        relevant records (messages, agreements, payment records) but is not
        obligated to act as an arbiter and does not guarantee any particular
        outcome.
      </p>
      <p>
        Where a Guest has purchased optional damage-protection coverage
        through a third-party partner, claims under that coverage are subject
        to the partner&rsquo;s terms and process.
      </p>

      <h2 id="agreements">10. Rental agreements &amp; e-signatures</h2>
      <p>
        For each booking, the Service generates a rental agreement reflecting
        the listing&rsquo;s policies (cancellation policy, house rules,
        check-in/out times, fees, and deposit terms) and the specific
        booking&rsquo;s dates and price. The Guest must review and
        electronically sign this agreement before payment is finalized.
      </p>
      <p>
        Electronic signatures are processed through our e-signature partner
        (currently DocuSeal). For properties located in the United States,
        electronic signatures are intended to be valid under the U.S.
        Electronic Signatures in Global and National Commerce Act (ESIGN) and
        applicable state UETA statutes. For properties located in Mexico,
        electronic signatures are intended to be valid under the
        Código de Comercio provisions governing electronic commerce and data
        messages, with additional conservation measures (e.g., NOM-151) used
        where stronger evidentiary weight is desired. The governing law for a
        given rental agreement is keyed to the country in which the property
        is located, as stated in the agreement itself.
      </p>
      <p>
        Signed agreements are retained and made available to both parties
        for their records.
      </p>

      <h2 id="taxes">11. Taxes</h2>
      <p>
        <strong>Familiar Guest does not provide tax advice.</strong> Where
        enabled for a listing&rsquo;s jurisdiction, the Service calculates
        and itemizes applicable lodging/occupancy taxes (for example, U.S.
        transient occupancy taxes or Mexican IVA/ISH) as part of the booking
        price, and, where Familiar Guest is acting as the platform of record
        for a jurisdiction that requires it, may collect and remit such
        taxes, or withhold and remit applicable host-level taxes (for
        example, Mexican ISR/IVA withholding on payments to hosts), on the
        Owner&rsquo;s behalf as required by applicable law.
      </p>
      <p>
        The Service may also provide Owners with income summaries, tax-line
        item breakdowns, and export documents (such as data formatted to
        assist with U.S. Schedule E reporting or Mexican filings) intended to
        help the Owner and the Owner&rsquo;s own tax professional prepare
        required filings. <strong>These materials are informational only.</strong>{" "}
        Owners are solely responsible for determining their own tax
        obligations, for the accuracy of information provided to Familiar
        Guest for tax-calculation purposes, and for filing any required
        returns, and should consult their own qualified tax advisor regarding
        their specific situation, including cross-border obligations.
      </p>

      <h2 id="screening">12. Guest screening &amp; trust features</h2>
      <p>
        Familiar Guest offers optional identity-verification, fraud
        screening, and damage-protection add-ons through third-party partners
        (currently Truvi). Where an Owner or Guest opts into these add-ons,
        the partner&rsquo;s own terms and privacy practices apply to the
        information collected for that purpose, in addition to these Terms
        and our Privacy Policy.
      </p>
      <p>
        A &ldquo;Verified Owner&rdquo; indicator reflects that the Owner has
        completed identity verification (Gate 1) and, for the specific
        property, submitted a property-ownership document that has passed
        manual review (Gate 2). It is not a guarantee of the condition,
        legality, or suitability of the property, and Familiar Guest&rsquo;s
        review of ownership documents is not a substitute for independent
        legal or title verification.
      </p>

      <h2 id="prohibited">13. Prohibited conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the Service for any unlawful purpose or in violation of any applicable law or regulation;</li>
        <li>Provide false, misleading, or fraudulent information, including false identity, ownership, or payment information;</li>
        <li>Attempt to circumvent identity verification, ownership verification, or guest screening;</li>
        <li>Use the Service to discriminate against Guests or applicants on any basis prohibited by applicable fair housing or anti-discrimination law;</li>
        <li>Scrape, harvest, or extract data from the Service or from third-party platforms in violation of those platforms&rsquo; terms (including Airbnb, VRBO, or Booking.com);</li>
        <li>Interfere with or disrupt the integrity or performance of the Service, including through bots, scrapers, or automated abuse not permitted under our published agent-access policies;</li>
        <li>Use the Service to send unsolicited communications;</li>
        <li>Reverse-engineer, decompile, or attempt to extract source code from the Service except as permitted by law; or</li>
        <li>Use another person&rsquo;s account without permission.</li>
      </ul>

      <h2 id="content-ip">14. Content &amp; intellectual property</h2>
      <p>
        Familiar Guest owns the Service, including its software, design, and
        the &ldquo;Familiar Guest&rdquo; name and logo. Owners and Guests
        retain ownership of content they submit (such as listing photos,
        descriptions, and messages) but grant Familiar Guest a worldwide,
        non-exclusive, royalty-free license to host, display, reproduce, and
        adapt that content as necessary to provide the Service (for example,
        displaying listing photos on the Owner&rsquo;s booking page, or using
        an Owner&rsquo;s description text as input to generate an AI-assisted
        listing description that the Owner then reviews and edits).
      </p>

      <h2 id="disclaimers">15. Disclaimers</h2>
      <p>
        THE SERVICE IS PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS
        AVAILABLE,&rdquo; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS,
        IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY,
        FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT.
        FAMILIAR GUEST DOES NOT WARRANT THAT THE SERVICE WILL BE
        UNINTERRUPTED, ERROR-FREE, OR SECURE, OR THAT ANY LISTING,
        VERIFICATION, SCREENING RESULT, TAX CALCULATION, OR TRANSLATION
        PROVIDED THROUGH THE SERVICE WILL BE ACCURATE OR COMPLETE.
      </p>
      <p>
        FAMILIAR GUEST IS NOT RESPONSIBLE FOR THE CONDUCT OF ANY OWNER OR
        GUEST, THE CONDITION OF ANY PROPERTY, OR THE ACCURACY OF ANY LISTING.
        ANY DISPUTE REGARDING A STAY IS BETWEEN THE OWNER AND THE GUEST.
      </p>

      <h2 id="liability">16. Limitation of liability</h2>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, FAMILIAR GUEST AND ITS
        OFFICERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT,
        INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS
        OF PROFITS, REVENUE, DATA, OR GOODWILL, ARISING FROM OR RELATING TO
        THE SERVICE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.
      </p>
      <p>
        TO THE MAXIMUM EXTENT PERMITTED BY LAW, FAMILIAR GUEST&rsquo;S TOTAL
        LIABILITY FOR ANY CLAIM ARISING FROM OR RELATING TO THE SERVICE WILL
        NOT EXCEED THE GREATER OF (A) THE FEES PAID BY THE RELEVANT USER TO
        FAMILIAR GUEST IN THE TWELVE (12) MONTHS PRECEDING THE EVENT GIVING
        RISE TO THE CLAIM, OR (B) ONE HUNDRED U.S. DOLLARS (USD $100).
      </p>
      <p>
        <em>[Note for counsel: limitation amounts, and the treatment of
        amounts that pass through Familiar Guest as merchant of record (i.e.,
        whether they should be excluded from any liability cap), require
        review &mdash; particularly for Mexico-located properties under
        PROFECO consumer-protection rules, which may limit the
        enforceability of certain disclaimers against consumers.]</em>
      </p>

      <h2 id="indemnification">17. Indemnification</h2>
      <p>
        You agree to indemnify, defend, and hold harmless Familiar Guest and
        its officers, employees, and agents from and against any claims,
        damages, liabilities, and expenses (including reasonable
        attorneys&rsquo; fees) arising from: (a) your use of the Service; (b)
        your violation of these Terms or applicable law; (c) your content or
        listings; or (d) any dispute between you and another User, including
        any dispute relating to a stay.
      </p>

      <h2 id="term">18. Term, suspension &amp; termination</h2>
      <p>
        You may stop using the Service at any time. We may suspend or
        terminate access to the Service for any User who violates these
        Terms, poses a risk to other Users or to Familiar Guest, or as
        required by our payment processor or applicable law. Provisions that
        by their nature should survive termination (including Sections 11,
        14&ndash;17, and 19) will survive.
      </p>

      <h2 id="governing-law">19. Governing law &amp; dispute resolution</h2>
      <p>
        <em>[Placeholder &mdash; governing law and dispute-resolution
        provisions (including any arbitration clause, class-action waiver,
        and venue) require determination by counsel, and may need to differ
        for U.S.-located properties versus Mexico-located properties given
        PROFECO consumer-protection requirements for Mexican consumers.
        Rental-agreement-specific governing law (Section 10) is separate
        from the governing law of these platform Terms.]</em>
      </p>

      <h2 id="changes">20. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. If we make material
        changes, we will provide notice (for example, by email or an
        in-product notice) before the changes take effect. Continued use of
        the Service after changes take effect constitutes acceptance of the
        revised Terms.
      </p>

      <h2 id="contact">21. Contact</h2>
      <p>
        Questions about these Terms can be sent to{" "}
        <a href="mailto:info@famguest.com">info@famguest.com</a>.
      </p>
    </LegalShell>
  );
}
