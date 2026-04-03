import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large PDF uploads (up to 50 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
  // Suppress the pdf-parse canvas peer-dep warning (Turbopack compatible)
  turbopack: {
    resolveAlias: {
      canvas: "./empty-module.ts",
    },
  },
};

export default nextConfig;
