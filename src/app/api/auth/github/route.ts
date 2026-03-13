import { NextRequest, NextResponse } from 'next/server';

// GET - Check if OAuth is available (returns JSON)
export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;

  // Check if OAuth is configured
  if (!clientId || !clientSecret) {
    return NextResponse.json({ 
      demoMode: true,
      message: 'GitHub OAuth is not configured.'
    });
  }

  // OAuth is configured - return success
  return NextResponse.json({ 
    demoMode: false,
    message: 'GitHub OAuth is configured.'
  });
}

// POST - Initiate OAuth flow
export async function POST(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  
  // Use APP_URL environment variable for the public URL
  // This is required when behind a proxy/gateway
  const appUrl = process.env.APP_URL;

  // Check if OAuth is configured
  if (!clientId || !clientSecret) {
    return NextResponse.json({ 
      error: 'OAuth not configured',
      message: 'GitHub OAuth is not configured.',
      demoMode: true
    }, { status: 500 });
  }

  // Generate a random state for CSRF protection
  const state = crypto.randomUUID();
  
  // Determine the origin - MUST use APP_URL if available
  // This fixes the redirect_uri mismatch issue when behind a proxy
  let origin: string;
  
  if (appUrl) {
    // Use the configured public URL (most reliable)
    origin = appUrl;
  } else {
    // Fallback: try to determine from headers
    const host = request.headers.get('x-forwarded-host') || request.headers.get('host') || 'localhost:3000';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    origin = `${proto}://${host}`;
  }
  
  // Build redirect URI
  const callbackPath = '/api/auth/github/callback';
  const redirectUri = `${origin}${callbackPath}`;
  
  // Build GitHub OAuth URL
  const githubAuthUrl = new URL('https://github.com/login/oauth/authorize');
  githubAuthUrl.searchParams.set('client_id', clientId);
  githubAuthUrl.searchParams.set('scope', 'read:user user:email');
  githubAuthUrl.searchParams.set('state', state);
  githubAuthUrl.searchParams.set('redirect_uri', redirectUri);

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
    redirectUrl: githubAuthUrl.toString(),
    state,
    redirectUri,
    origin
  });
  
  // Set state cookie for verification (expires in 10 minutes)
  response.cookies.set('github_oauth_state', state, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  // Store redirect URL, callback URI, and origin for after auth
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

  // Store the origin for proper redirect after callback
  response.cookies.set('auth_origin', origin, {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });

  return response;
}
