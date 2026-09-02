#!/usr/bin/env tsx
/**
 * Point studio CMS at bundled hero/reformer images (after image file updates).
 * Usage: pnpm exec tsx scripts/sync-bundled-images.ts
 */
import { config } from "dotenv";
import { resolve } from "path";
import { siteConfig } from "../src/lib/site-config";
import { buildDefaultStudioContent, normalizeStudioContent } from "../src/lib/studio-content";

config({ path: resolve(__dirname, "../.env") });

async function main() {
  const { prisma } = await import("../src/lib/prisma");
  const defaults = buildDefaultStudioContent();
  const row = await prisma.studioContent.findUnique({ where: { id: "default" } });

  if (!row) {
    console.log("No studio_content row — seed will set images on first run.");
    await prisma.$disconnect();
    return;
  }

  const current = normalizeStudioContent(row.data);
  const next = {
    ...current,
    heroImage: siteConfig.images.hero,
    reformerImage: siteConfig.images.reformer,
  };

  await prisma.studioContent.update({
    where: { id: "default" },
    data: { data: next },
  });

  console.log("Updated studio images:");
  console.log(`  hero: ${next.heroImage}`);
  console.log(`  reformer: ${next.reformerImage}`);
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
