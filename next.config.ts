import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Allow cross-origin requests from preview iframe
  experimental: {
    allowedDevOrigins: [
      "preview-chat-bb862232-c52f-4881-ad2a-c35b2a72a7aa.space.z.ai",
      ".space.z.ai",
    ],
  },
};

export default nextConfig;
