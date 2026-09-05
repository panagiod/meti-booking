/**
 * Regenerates favicons and static og-image.png from studio branding assets.
 * Run: pnpm exec tsx scripts/generate-brand-assets.ts
 */
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

const root = join(__dirname, "..");
const iconSvg = readFileSync(join(root, "public/icon.svg"));
const wordmarkSvg = readFileSync(join(root, "public/logo-wordmark.svg"));
writeFileSync(join(root, "public/logo.svg"), iconSvg);

function pngToIco(png: Buffer, size: number): Buffer {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(1, 4);

  const entry = Buffer.alloc(16);
  entry.writeUInt8(size >= 256 ? 0 : size, 0);
  entry.writeUInt8(size >= 256 ? 0 : size, 1);
  entry.writeUInt16LE(1, 4);
  entry.writeUInt16LE(32, 6);
  entry.writeUInt32LE(png.length, 8);
  entry.writeUInt32LE(22, 12);

  return Buffer.concat([header, entry, png]);
}

async function main() {
  const sizes: Array<[string, number]> = [
    ["public/favicon-16x16.png", 16],
    ["public/favicon-32x32.png", 32],
    ["public/icon-48.png", 48],
    ["public/icon-96.png", 96],
    ["public/apple-touch-icon.png", 180],
    ["public/icon-192.png", 192],
    ["public/icon-512.png", 512],
    ["src/app/icon.png", 96],
    ["src/app/apple-icon.png", 180],
  ];

  for (const [file, size] of sizes) {
    await sharp(iconSvg).resize(size, size).png().toFile(join(root, file));
    console.log(`✓ ${file}`);
  }

  const faviconPng = await sharp(iconSvg).resize(48, 48).png().toBuffer();
  writeFileSync(join(root, "src/app/favicon.ico"), pngToIco(faviconPng, 48));
  console.log("✓ src/app/favicon.ico");

  await sharp(wordmarkSvg)
    .flatten({ background: "#fdfcfa" })
    .png()
    .toFile(join(root, "public/logo-wordmark.png"));
  console.log("✓ public/logo-wordmark.png");

  // Static OG fallback — composite hero + dark overlay + title band
  const hero = sharp(join(root, "public/images/hero.jpg")).resize(1200, 630, {
    fit: "cover",
    position: "centre",
  });

  const overlay = Buffer.from(`
    <svg width="1200" height="630" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="g" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#121110" stop-opacity="0.92"/>
          <stop offset="45%" stop-color="#121110" stop-opacity="0.7"/>
          <stop offset="100%" stop-color="#121110" stop-opacity="0.2"/>
        </linearGradient>
      </defs>
      <rect width="1200" height="630" fill="url(#g)"/>
      <text x="80" y="120" fill="rgba(253,252,250,0.72)" font-family="Georgia, serif" font-size="16" letter-spacing="6">REFORMER PILATES</text>
      <text x="80" y="230" fill="#fdfcfa" font-family="Georgia, serif" font-size="88" font-weight="500">MeTi Pilates</text>
      <text x="80" y="300" fill="rgba(253,252,250,0.9)" font-family="Georgia, serif" font-size="32">Book your session online</text>
      <text x="80" y="360" fill="rgba(253,252,250,0.65)" font-family="Georgia, serif" font-size="18">Tue, Thu, Sat · 2pm–5pm</text>
    </svg>
  `);

  await hero
    .composite([{ input: overlay, top: 0, left: 0 }])
    .png()
    .toFile(join(root, "public/og-image.png"));

  console.log("✓ public/og-image.png");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
