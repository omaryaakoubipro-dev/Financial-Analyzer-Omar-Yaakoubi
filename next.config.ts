import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow large PDF uploads (up to 50 MB)
  experimental: {
    serverActions: {
      bodySizeLimit: "50mb",
    },
  },
};

export default nextConfig;
