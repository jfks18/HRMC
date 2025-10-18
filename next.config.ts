import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'https://active-upward-sunbeam.ngrok-free.app'
  ],
  // Disable ESLint during build to prevent build failures from lint rules
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
