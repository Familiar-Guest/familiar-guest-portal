import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

// Branded link-preview card shown when famguest.com is shared via SMS/iMessage,
// WhatsApp, Slack, etc. 1200×630 is the standard "large card" size — using a
// designed card (rather than letting scrapers grab a random page image) is what
// makes the preview look intentional and on-brand.
export const runtime = "nodejs";
export const alt =
  "Familiar Guest — rent direct to the guests who already love your place";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Brand tokens (Tidewater).
const CREAM = "#F6F1E8";
const TEAL = "#0F4D45";
const INK = "#16302B";
const MUTED = "#4F605A";
const CORAL = "#D9663F";
const LINE = "#E0D6C5";

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
          background: CREAM,
          padding: "72px 80px",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt=""
          width={150}
          height={300}
          style={{ marginRight: 64, objectFit: "contain" }}
        />
        <div style={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <div
            style={{
              fontSize: 40,
              fontWeight: 700,
              color: TEAL,
              marginBottom: 24,
            }}
          >
            Familiar Guest
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 60,
              fontWeight: 700,
              lineHeight: 1.14,
            }}
          >
            <div style={{ color: INK }}>Rent to trusted guests</div>
            <div style={{ color: TEAL }}>Rent from trusted owners</div>
          </div>
          <div
            style={{
              fontSize: 28,
              color: MUTED,
              marginTop: 28,
              lineHeight: 1.4,
            }}
          >
            Skip the high platform fees.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              marginTop: 40,
              paddingTop: 28,
              borderTop: `1px solid ${LINE}`,
            }}
          >
            <div style={{ fontSize: 26, fontWeight: 600, color: CORAL }}>
              famguest.com
            </div>
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
