import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Permite aislar el build de pruebas (Playwright) del dev server local
  distDir: process.env.NEXT_DIST_DIR || ".next",
  output: "standalone",
};

export default nextConfig;
