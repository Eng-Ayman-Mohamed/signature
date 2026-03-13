import { NextResponse } from 'next/server';

// Debug endpoint to check environment variables (remove in production)
export async function GET() {
  const envStatus = {
    ADMIN_SETUP_KEY: process.env.ADMIN_SETUP_KEY ? 'SET' : 'NOT SET',
    DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID ? 'SET' : 'NOT SET',
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET',
    NODE_ENV: process.env.NODE_ENV,
    // Don't expose actual values, just whether they're set
  };

  return NextResponse.json({
    message: 'Environment variable status',
    env: envStatus,
    timestamp: new Date().toISOString(),
  });
}
