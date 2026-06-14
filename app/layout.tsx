import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Familiar Guest — Host familiar guests direct",
  description:
    "Familiar Guest is the simplest way to rent to the people who already love your place. Keep the relationship, skip the 15-20% rental platform fees, and let us handle the trust. Your first month is commission-free.",
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
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;1,9..144,500&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
