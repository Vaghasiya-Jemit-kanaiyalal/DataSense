import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Netlify edge functions configuration
  experimental: {
    // Use static exports for Netlify
    isrMemoryCacheSize: 52428800, // 50MB
  },
  // Enable image optimization for Netlify
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
