import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolates the Playwright test build from the local dev server
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "standalone",
};

export default nextConfig;
