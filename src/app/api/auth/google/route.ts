import { NextRequest, NextResponse } from 'next/server';

// GET - Check if Google OAuth is available (returns JSON)
export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  // Check if OAuth is configured
  if (!clientId || !clientSecret) {
    return NextResponse.json({
      available: false,
      message: 'Google OAuth is not configured.'
    });
  }

  // OAuth is configured - return success
  return NextResponse.json({
    available: true,
    message: 'Google OAuth is configured.'
  });
}

// POST - Initiate OAuth flow
export async function POST(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  // Use APP_URL environment variable for the public URL
  const appUrl = process.env.APP_URL;

  // Check if OAuth is configured
  if (!clientId || !clientSecret) {
    return NextResponse.json({
      error: 'OAuth not configured',
      message: 'Google OAuth is not configured.',
    }, { status: 500 });
  }

  // Generate a random state for CSRF protection
  const state = crypto.randomUUID();

  // Determine the origin - MUST use APP_URL if available
  let origin: string;

  if (appUrl) {
    origin = appUrl;
  } else {
    // Fallback: try to determine from headers
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    origin = `${proto}://${host}`;
  }

  // Build redirect URI
  const callbackPath = '/api/auth/google/callback';
  const redirectUri = `${origin}${callbackPath}`;

  // Build Google OAuth URL
  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.set('client_id', clientId);
  googleAuthUrl.searchParams.set('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.set('response_type', 'code');
  googleAuthUrl.searchParams.set('scope', 'email profile');
  googleAuthUrl.searchParams.set('state', state);
  googleAuthUrl.searchParams.set('access_type', 'offline');
  googleAuthUrl.searchParams.set('prompt', 'consent');

  // Get redirect URL from body or default to home
  let redirectUrl = '/';
  try {
    const body = await request.json();
    redirectUrl = body.redirect || '/';
  } catch {
    // No body, use default
  }

  // Create response with redirect URL
  const response = NextResponse.json({
    redirectUrl: googleAuthUrl.toString(),
    state,
    redirectUri,
    origin
  });

  // Set state cookie for verification (expires in 10 minutes)
  response.cookies.set('google_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  // Store redirect URL and origin for after auth
  response.cookies.set('auth_redirect', redirectUrl, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  response.cookies.set('auth_redirect_uri', redirectUri, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  response.cookies.set('auth_origin', origin, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return response;
}
