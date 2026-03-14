import type { NextConfig } from "next";

// Force PostgreSQL URL - system env has SQLite that we need to override
const DATABASE_URL = process.env.DATABASE_URL?.startsWith('postgresql') 
  ? process.env.DATABASE_URL 
  : "postgresql://neondb_owner:npg_NAW7iEwzPsq0@ep-winter-heart-a1u1ob4p-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

const DIRECT_DATABASE_URL = process.env.DIRECT_DATABASE_URL?.startsWith('postgresql')
  ? process.env.DIRECT_DATABASE_URL
  : "postgresql://neondb_owner:npg_NAW7iEwzPsq0@ep-winter-heart-a1u1ob4p.ap-southeast-1.aws.neon.tech/neondb?sslmode=require";

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
  env: {
    DATABASE_URL,
    DIRECT_DATABASE_URL,
  },
};

export default nextConfig;
