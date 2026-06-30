import type { Metadata } from "next";
import "./globals.css";

const TITLE = "Familiar Guest — Host familiar guests direct";
const DESCRIPTION =
  "Familiar Guest lets vacation-rental owners take bookings directly from guests they already know — keeping the guest relationship, avoiding the 15–20% platform fees, with escrow, verification, and payments handled. First month commission-free.";

// Link-preview (SMS / iMessage / WhatsApp) headline + second line. Kept short
// and separate from the SEO title/description above.
const OG_TITLE = "Rent to Trusted Guests";
const OG_DESCRIPTION = "Rent from Trusted Owners";

export const metadata: Metadata = {
  metadataBase: new URL("https://famguest.com"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: "https://famguest.com",
    siteName: "Familiar Guest",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
