import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { join } from "path";

// Browser-tab / bookmark favicon: the key+heart mark centered on a transparent
// square so it reads well in both light and dark tab bars.
export const runtime = "nodejs";
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
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
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logoSrc} width={30} height={60} style={{ objectFit: "contain" }} alt="" />
      </div>
    ),
    { ...size }
  );
}
