import { ImageResponse } from "next/og";
import { join } from "node:path";
import { readFile } from "node:fs/promises";

export const alt = "MeTi Pilates — Book Reformer Sessions Online";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  const heroData = await readFile(
    join(process.cwd(), "public/images/hero.jpg")
  );
  const heroSrc = `data:image/jpeg;base64,${heroData.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "#121110",
        }}
      >
        <img
          src={heroSrc}
          alt=""
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            objectPosition: "center 30%",
          }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background:
              "linear-gradient(105deg, rgba(18,17,16,0.92) 0%, rgba(18,17,16,0.72) 42%, rgba(18,17,16,0.25) 100%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px 80px",
            position: "relative",
            zIndex: 1,
            color: "#fdfcfa",
            maxWidth: "720px",
          }}
        >
          <div
            style={{
              fontSize: 16,
              letterSpacing: "0.22em",
              textTransform: "uppercase",
              color: "rgba(253,252,250,0.72)",
              marginBottom: 20,
            }}
          >
            Reformer pilates
          </div>
          <div
            style={{
              fontSize: 88,
              fontWeight: 500,
              lineHeight: 1.02,
              letterSpacing: "-0.03em",
              fontFamily: "Georgia, serif",
            }}
          >
            MeTi Pilates
          </div>
          <div
            style={{
              fontSize: 32,
              marginTop: 24,
              color: "rgba(253,252,250,0.9)",
              lineHeight: 1.35,
            }}
          >
            Book your session online
          </div>
          <div
            style={{
              display: "flex",
              marginTop: 36,
              fontSize: 18,
              color: "rgba(253,252,250,0.65)",
            }}
          >
            Tue, Thu, Sat · 2pm–5pm
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
