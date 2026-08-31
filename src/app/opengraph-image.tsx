import { ImageResponse } from "next/og";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

export const alt = "Meti - Professional Online Advisory";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

const geistData = await readFile(
  join(
    process.cwd(),
    "node_modules/.pnpm/next@16.3.0_@babel+core@7.29.7_@playwright+test@1.62.1_@types+node@20.19.43_react-dom@19.2.8_react@19.2.8__react@19.2.8/node_modules/next/dist/compiled/@vercel/og/Geist-Regular.ttf"
  )
);

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
          fontFamily: "Geist",
          color: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            padding: "60px 80px",
          }}
        >
          <div
            style={{
              width: 100,
              height: 100,
              borderRadius: 24,
              background: "linear-gradient(135deg, #ff6b35 0%, #e55a2b 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 32,
              fontSize: 48,
              fontWeight: 400,
              color: "white",
            }}
          >
            M
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 80,
              fontWeight: 400,
              marginBottom: 16,
              letterSpacing: "-0.03em",
            }}
          >
            <span style={{ color: "#ff6b35" }}>Meti</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 38,
              fontWeight: 400,
              marginBottom: 28,
            }}
          >
            Professional Online Advisory
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 22,
              color: "rgba(255,255,255,0.7)",
              maxWidth: 650,
              textAlign: "center",
            }}
          >
            Connect with expert advisors. Video calls, chat, and complete session management.
          </div>
          <div
            style={{
              width: 100,
              height: 4,
              borderRadius: 2,
              background: "linear-gradient(90deg, #ff6b35, #00d4aa)",
              marginTop: 36,
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Geist",
          data: geistData,
          style: "normal",
          weight: 400,
        },
      ],
    }
  );
}
