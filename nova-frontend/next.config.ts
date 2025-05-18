import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,  // Skip TypeScript checks during production builds
  },
  // Add other config options here as needed
};

export default nextConfig;
