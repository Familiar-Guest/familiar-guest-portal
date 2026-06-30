import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

// Branded link-preview card shown when famguest.com is shared via SMS/iMessage,
// WhatsApp, Slack, etc. 1200×630 is the standard "large card" size — using a
// designed card (rather than letting scrapers grab a random page image) is what
// makes the preview look intentional and on-brand.
export const runtime = "nodejs";
export const alt = "Rent to Trusted Guests · Rent from Trusted Owners";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens (Tidewater).
const CREAM = "#F6F1E8";
const TEAL = "#0F4D45";
const INK = "#16302B";

export default function OpengraphImage() {
  const logo = readFileSync(join(process.cwd(), "public", "key-logo.png"));
  const logoSrc = `data:image/png;base64,${logo.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: CREAM,
          padding: "72px 80px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt=""
          width={210}
          height={420}
          style={{ marginRight: 72, objectFit: "contain" }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.16,
          }}
        >
          <div style={{ color: INK }}>Rent to Trusted Guests</div>
          <div style={{ color: TEAL }}>Rent from Trusted Owners</div>
        </div>
      </div>
    ),
    { ...size }
  );
}
