import type { Metadata } from "next";
import { LegalShell } from "../legal/_components/LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — Familiar Guest",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <LegalShell title="Privacy Policy" updated="June 13, 2026 (draft)">
      <div className="legal-toc">
        <h2>Contents</h2>
        <ol>
          <li>Scope of this policy</li>
          <li>Information we collect</li>
          <li>How we use information</li>
          <li>Cookies &amp; similar technologies</li>
          <li>How we share information</li>
          <li>International data transfers</li>
          <li>Data retention</li>
          <li>Your privacy rights</li>
          <li>Security</li>
          <li>Children&rsquo;s privacy</li>
          <li>Changes to this policy</li>
          <li>Contact &amp; aviso de privacidad</li>
        </ol>
      </div>

      <h2 id="scope">1. Scope of this policy</h2>
      <p>
        This Privacy Policy describes how Familiar Guest (&ldquo;we,&rdquo;
        &ldquo;us&rdquo;) collects, uses, shares, and protects information
        about visitors to famguest.com, property owners
        (&ldquo;Owners&rdquo;), guests (&ldquo;Guests&rdquo;), and caretakers
        who use the Familiar Guest platform (together,
        &ldquo;you&rdquo;).
      </p>
      <p>
        This policy is written to address requirements under multiple
        privacy frameworks relevant to our Users, including the EU/UK General
        Data Protection Regulation (&ldquo;GDPR&rdquo;), the California
        Consumer Privacy Act as amended by the California Privacy Rights Act
        (&ldquo;CCPA/CPRA&rdquo;), Canada&rsquo;s Personal Information
        Protection and Electronic Documents Act (&ldquo;PIPEDA&rdquo;), and
        Mexico&rsquo;s Ley Federal de Protección de Datos Personales en
        Posesión de los Particulares (&ldquo;LFPDPPP&rdquo;). A
        Spanish-language <em>aviso de privacidad</em> summary is provided in
        Section 12.
      </p>

      <h2 id="information-we-collect">2. Information we collect</h2>
      <h3>2.1 Information you provide</h3>
      <table>
        <thead>
          <tr><th>Category</th><th>Examples</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Account &amp; profile</td>
            <td>Name, email, phone number, country, language preference, payout currency preference</td>
          </tr>
          <tr>
            <td>Identity verification</td>
            <td>
              Collected directly by our payment processor (Stripe) for Owner
              KYC &mdash; legal name, date of birth, address, last 4 digits
              of SSN/government ID where required, and bank account details.{" "}
              <strong>Familiar Guest does not receive or store full
              government ID numbers, ID documents, or full bank account
              numbers</strong> &mdash; these are held by Stripe.
            </td>
          </tr>
          <tr>
            <td>Property &amp; ownership documents</td>
            <td>Listing details, photos, GPS coordinates (required for Mexico properties), and &mdash; for public listings &mdash; an ownership document (e.g., tax statement, deed, utility bill, insurance declaration, fideicomiso, or Mexican corporate documents)</td>
          </tr>
          <tr>
            <td>Booking &amp; guest information</td>
            <td>Guest name, contact details, stay dates, party size, special requests, messages with the Owner, signed rental agreements</td>
          </tr>
          <tr>
            <td>Payment information</td>
            <td>Processed by Stripe; Familiar Guest receives transaction metadata (amounts, dates, status) but not full card numbers</td>
          </tr>
          <tr>
            <td>Guest screening (optional)</td>
            <td>Where an Owner or Guest opts into screening, identity and risk-assessment information collected by our screening partner (currently Truvi) under its own privacy practices</td>
          </tr>
          <tr>
            <td>Communications</td>
            <td>Messages sent through the platform, support requests, and survey responses</td>
          </tr>
        </tbody>
      </table>

      <h3>2.2 Information collected automatically</h3>
      <table>
        <thead>
          <tr><th>Category</th><th>Examples</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>Device &amp; usage data</td>
            <td>IP address (used to derive approximate location/country), browser and device type, pages viewed, links clicked, referring/exit pages, and timestamps</td>
          </tr>
          <tr>
            <td>First-party analytics identifiers</td>
            <td>An anonymous device/browser identifier and a session identifier, stored in first-party cookies, used to group page-view and click events (see Section 4)</td>
          </tr>
          <tr>
            <td>Bot &amp; security signals</td>
            <td>Signals used to distinguish human visitors from automated traffic, and to detect abuse</td>
          </tr>
        </tbody>
      </table>

      <h2 id="how-we-use">3. How we use information</h2>
      <ul>
        <li>To provide, operate, and maintain the Service, including creating booking pages, processing payments, generating rental agreements, and sending automated messages (booking confirmations, check-in instructions, reminders);</li>
        <li>To verify Owner identity and, where applicable, property ownership, as a condition of using payment and public-listing features;</li>
        <li>To provide guest screening and damage-protection add-ons where selected;</li>
        <li>To calculate, itemize, and where applicable collect or remit lodging taxes and host-level withholding, and to provide Owners with income and tax-related reports and exports;</li>
        <li>To communicate with you about the Service, including service updates, security alerts, and support;</li>
        <li>To detect, prevent, and respond to fraud, abuse, security incidents, and violations of our Terms;</li>
        <li>To understand how the Service is used (via first-party analytics) in order to improve it, including by Familiar Guest&rsquo;s own team using SQL-based reporting tools;</li>
        <li>Where you have consented, to measure the effectiveness of our marketing (e.g., via Google Analytics/Ads and, where enabled, Meta) and to show relevant advertising; and</li>
        <li>To comply with legal obligations, including tax, accounting, and recordkeeping requirements.</li>
      </ul>
      <p>
        <strong>Legal bases (GDPR/UK GDPR):</strong> we process personal data
        on the bases of contract performance (providing the Service you
        request), legitimate interests (e.g., security, fraud prevention,
        and core product analytics), consent (e.g., marketing cookies/pixels
        and, where required, analytics cookies &mdash; see Section 4), and
        legal obligation (e.g., tax recordkeeping).
      </p>

      <h2 id="cookies">4. Cookies &amp; similar technologies</h2>
      <p>
        We use first-party cookies to operate the Service (e.g., to keep you
        signed in) and to capture anonymous browsing analytics (page views
        and clicks) to a database that Familiar Guest&rsquo;s team can query
        directly. Where you consent, we also enable Google Analytics/Ads and
        (in the future) Meta Pixel for marketing measurement. A cookie banner
        lets you choose your preferences for analytics and marketing cookies
        on first visit, and you can change your choice at any time. See our{" "}
        <a href="/cookies">Cookie Policy</a> for the full list of cookies and
        categories.
      </p>

      <h2 id="how-we-share">5. How we share information</h2>
      <p>
        We do not sell personal information. We share information with the
        following categories of recipients as necessary to provide the
        Service:
      </p>
      <table>
        <thead>
          <tr><th>Recipient</th><th>Purpose</th></tr>
        </thead>
        <tbody>
          <tr><td>Stripe (payment processing &amp; identity verification)</td><td>Process payments, payouts, and Owner KYC</td></tr>
          <tr><td>Supabase (database &amp; authentication hosting)</td><td>Store account, listing, booking, and analytics data</td></tr>
          <tr><td>Vercel (application hosting)</td><td>Host and serve the Service, including security/bot-protection features</td></tr>
          <tr><td>Resend (transactional email)</td><td>Send booking confirmations, sign-in links, and other transactional emails</td></tr>
          <tr><td>Twilio (SMS/WhatsApp messaging)</td><td>Send opted-in text/WhatsApp reminders and check-in messages</td></tr>
          <tr><td>DocuSeal (e-signature)</td><td>Generate and store signed rental agreements</td></tr>
          <tr><td>Truvi (guest screening, optional)</td><td>Identity and risk screening for bookings where this add-on is used</td></tr>
          <tr><td>Anthropic (AI features)</td><td>Generate AI-assisted listing descriptions and translations from Owner-provided text</td></tr>
          <tr><td>Google (Analytics/Ads), Meta (planned)</td><td>Marketing measurement, where you have consented</td></tr>
          <tr><td>The other party to a booking</td><td>An Owner and Guest necessarily share certain information with each other (e.g., name, contact info, stay details) to complete a booking</td></tr>
          <tr><td>Caretakers</td><td>Where an Owner grants scoped caretaker access, limited information (e.g., check-in schedules, house manual) is shared with that caretaker</td></tr>
          <tr><td>Legal &amp; safety</td><td>Where required to comply with law, enforce our Terms, or protect the rights, property, or safety of Familiar Guest, our Users, or others</td></tr>
          <tr><td>Business transfers</td><td>In connection with a merger, acquisition, financing, or sale of assets, subject to confidentiality obligations</td></tr>
        </tbody>
      </table>
      <p>
        <em>[Note for counsel: maintain a current subprocessor list and
        execute Data Processing Addendums with each subprocessor above as
        part of our GDPR/LFPDPPP compliance program.]</em>
      </p>

      <h2 id="international-transfers">6. International data transfers</h2>
      <p>
        Familiar Guest serves Owners and Guests in the United States, Canada,
        Mexico, and other countries, and uses service providers located in
        the United States. Where personal data is transferred from the
        EU/UK, Mexico, or Canada to the United States or another country, we
        rely on appropriate safeguards required by applicable law (such as
        standard contractual clauses), to the extent applicable.
      </p>

      <h2 id="retention">7. Data retention</h2>
      <p>
        We retain personal data for as long as needed to provide the
        Service, comply with legal obligations (including tax and accounting
        recordkeeping, which may require retaining booking and payment
        records for several years), resolve disputes, and enforce our
        agreements. Signed rental agreements are retained permanently for
        both parties&rsquo; records unless deletion is requested and
        permitted by law. Analytics events are retained for an initial
        operational period and may be aggregated or deleted thereafter.
      </p>

      <h2 id="your-rights">8. Your privacy rights</h2>
      <h3>8.1 EU/UK (GDPR)</h3>
      <p>
        If you are located in the EU or UK, you have the right to access,
        correct, delete, restrict, or object to our processing of your
        personal data, and the right to data portability. You also have the
        right to withdraw consent (e.g., for marketing cookies) at any time
        and to lodge a complaint with your local data protection authority.
      </p>
      <h3>8.2 California (CCPA/CPRA)</h3>
      <p>
        If you are a California resident, you have the right to know what
        personal information we collect, to request deletion, to correct
        inaccurate information, and to opt out of the &ldquo;sale&rdquo; or
        &ldquo;sharing&rdquo; of personal information (Familiar Guest does
        not sell personal information; where consented marketing pixels are
        enabled, this may constitute &ldquo;sharing&rdquo; for cross-context
        behavioral advertising under CPRA, which you can opt out of via the
        cookie banner).
      </p>
      <h3>8.3 Canada (PIPEDA)</h3>
      <p>
        If you are located in Canada, you have the right to access your
        personal information, request corrections, and withdraw consent for
        certain uses, subject to legal and contractual restrictions.
      </p>
      <h3>8.4 Mexico (LFPDPPP)</h3>
      <p>
        If you are located in Mexico, you have ARCO rights &mdash; to
        Access, Rectify, Cancel, and Object (<em>Acceso, Rectificación,
        Cancelación y Oposición</em>) to the processing of your personal
        data. See Section 12 for our aviso de privacidad summary and contact
        information for exercising these rights.
      </p>
      <h3>8.5 How to exercise your rights</h3>
      <p>
        You can exercise these rights by contacting{" "}
        <a href="mailto:info@famguest.com">info@famguest.com</a>. We may need
        to verify your identity before fulfilling certain requests.
      </p>

      <h2 id="security">9. Security</h2>
      <p>
        We use technical and organizational measures designed to protect
        personal data, including encryption in transit, access controls,
        row-level security on our database, and the use of payment-processor
        hosted components so that sensitive identity and payment data does
        not pass through or get stored on our servers. No system is
        completely secure, and we cannot guarantee absolute security.
      </p>

      <h2 id="children">10. Children&rsquo;s privacy</h2>
      <p>
        The Service is not directed to children under 16, and we do not
        knowingly collect personal information from children under 16. If
        you believe a child has provided us with personal information,
        please contact us so we can delete it.
      </p>

      <h2 id="changes">11. Changes to this policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material
        changes will be notified as described in our Terms of Service.
      </p>

      <h2 id="contact-aviso">12. Contact &amp; aviso de privacidad</h2>
      <p>
        For privacy questions or to exercise your rights, contact{" "}
        <a href="mailto:info@famguest.com">info@famguest.com</a>.
      </p>
      <h3>Aviso de privacidad (resumen)</h3>
      <p>
        Familiar Guest recaba y trata datos personales de propietarios,
        huéspedes y cuidadores (nombre, contacto, datos de la propiedad,
        información de reservas y, a través de nuestro procesador de pagos,
        datos de verificación de identidad y pago) con el fin de operar la
        plataforma, procesar pagos y reservas, generar contratos de
        arrendamiento, calcular y, en su caso, retener y enterar impuestos de
        hospedaje aplicables, y mejorar el servicio. Usted tiene derecho a
        Acceder, Rectificar, Cancelar u Oponerse (derechos ARCO) al
        tratamiento de sus datos personales, escribiendo a{" "}
        <a href="mailto:info@famguest.com">info@famguest.com</a>.
      </p>
      <p>
        <em>[Note for counsel: this Spanish summary requires review by
        Mexican counsel for completeness under LFPDPPP, including whether a
        full standalone aviso de privacidad (integral) is required versus
        this simplified version.]</em>
      </p>
    </LegalShell>
  );
}
