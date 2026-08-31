import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Isolates the Playwright test build from the local dev server
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "standalone",
  images: {
    // Standalone/tunnel deploys often miss the image optimizer bundle — load directly.
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
