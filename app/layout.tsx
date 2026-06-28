import type { Metadata } from "next";
import "./globals.css";

const TITLE = "Familiar Guest — Host familiar guests direct";
const DESCRIPTION =
  "Familiar Guest is the simplest way to rent to the people who already love your place. Keep the relationship, skip the 15-20% rental platform fees, and let us handle the trust. Your first month is commission-free.";

export const metadata: Metadata = {
  metadataBase: new URL("https://famguest.com"),
  title: TITLE,
  description: DESCRIPTION,
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: "https://famguest.com",
    siteName: "Familiar Guest",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
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
