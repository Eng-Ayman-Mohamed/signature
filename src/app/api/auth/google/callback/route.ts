import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface GoogleUser {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

// Helper to create error redirect with provider info
function createErrorRedirect(error: string, request: NextRequest, storedOrigin?: string): URL {
  const appUrl = process.env.APP_URL;
  const redirectOrigin = appUrl || storedOrigin || new URL(request.url).origin;
  return new URL(`/?error=${error}&provider=google`, redirectOrigin);
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const storedOrigin = request.cookies.get('auth_origin')?.value;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(createErrorRedirect('oauth_not_configured', request, storedOrigin));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Check for error from Google
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  if (error) {
    console.error('Google OAuth error:', error, errorDescription);
    if (error === 'access_denied') {
      return NextResponse.redirect(createErrorRedirect('access_denied', request, storedOrigin));
    }
    return NextResponse.redirect(createErrorRedirect('auth_failed', request, storedOrigin));
  }

  // Verify state for CSRF protection
  const storedState = request.cookies.get('google_oauth_state')?.value;

  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(createErrorRedirect('invalid_auth', request, storedOrigin));
  }

  try {
    // Get the stored redirect URI
    const redirectUri = request.cookies.get('auth_redirect_uri')?.value;

    // Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri || '',
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error('Google token error:', tokenData.error, tokenData.error_description);
      if (tokenData.error === 'redirect_uri_mismatch') {
        return NextResponse.redirect(createErrorRedirect('redirect_uri_mismatch', request, storedOrigin));
      }
      return NextResponse.redirect(createErrorRedirect('token_error', request, storedOrigin));
    }

    const accessToken = tokenData.access_token;

    // Fetch user data from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    });

    if (!userResponse.ok) {
      console.error('Google user fetch error:', userResponse.status);
      return NextResponse.redirect(createErrorRedirect('user_fetch_error', request, storedOrigin));
    }

    const googleUser: GoogleUser = await userResponse.json();

    // Check if user exists with this Google ID
    let user = await db.user.findUnique({
      where: { googleId: googleUser.id },
      include: {
        portfolio: {
          include: {
            content: true,
            projects: true,
            experiences: true,
            educations: true,
            skills: true,
          },
        },
      },
    });

    // If not found by Google ID, check by email
    if (!user) {
      user = await db.user.findUnique({
        where: { email: googleUser.email },
        include: {
          portfolio: {
            include: {
              content: true,
              projects: true,
              experiences: true,
              educations: true,
              skills: true,
            },
          },
        },
      });

      // If user exists by email, link Google ID to existing account
      if (user) {
        user = await db.user.update({
          where: { id: user.id },
          data: {
            googleId: googleUser.id,
            avatarUrl: user.avatarUrl || googleUser.picture,
          },
          include: {
            portfolio: {
              include: {
                content: true,
                projects: true,
                experiences: true,
                educations: true,
                skills: true,
              },
            },
          },
        });
      }
    }

    if (!user) {
      // Create username from email or name
      let username = googleUser.email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');

      // Check if username is taken
      const existingUsername = await db.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        username = `${username}_${Date.now().toString(36)}`;
      }

      // Create new user
      user = await db.user.create({
        data: {
          email: googleUser.email,
          name: googleUser.name,
          username,
          googleId: googleUser.id,
          avatarUrl: googleUser.picture,
        },
        include: {
          portfolio: {
            include: {
              content: true,
              projects: true,
              experiences: true,
              educations: true,
              skills: true,
            },
          },
        },
      });

      // Create default portfolio
      const portfolio = await db.portfolio.create({
        data: {
          userId: user.id,
          personalityType: 'minimal',
          accentColor: '#10b981',
          layoutOrder: 'about,experience,projects,skills,contact',
          density: 'normal',
          content: {
            create: {
              aboutText: '',
              contactEmail: googleUser.email,
            },
          },
        },
        include: {
          content: true,
          projects: true,
          experiences: true,
          educations: true,
          skills: true,
        },
      });

      user = { ...user, portfolio } as typeof user;
    }

    // Create response with redirect - use stored origin for proper redirect
    const redirectPath = request.cookies.get('auth_redirect')?.value || '/';

    // Use APP_URL or stored origin, fallback to request.url
    const appUrl = process.env.APP_URL;
    const redirectOrigin = appUrl || storedOrigin || new URL(request.url).origin;
    const finalRedirectUrl = new URL(redirectPath, redirectOrigin);

    const response = NextResponse.redirect(finalRedirectUrl);

    // Clear OAuth cookies
    response.cookies.delete('google_oauth_state');
    response.cookies.delete('auth_redirect');
    response.cookies.delete('auth_redirect_uri');
    response.cookies.delete('auth_origin');

    // Set auth token cookie (secure, httpOnly)
    const authToken = Buffer.from(JSON.stringify({
      userId: user.id,
      googleId: user.googleId,
      exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
    })).toString('base64');

    response.cookies.set('auth_token', authToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Also set user data in a non-httpOnly cookie for client access
    const userData = {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      googleId: user.googleId,
      avatarUrl: user.avatarUrl,
      bio: user.bio,
      location: user.location,
      company: user.company,
      blog: user.blog,
    };

    response.cookies.set('user_data', JSON.stringify(userData), {
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    // Set portfolio in cookie as well for immediate access
    if (user.portfolio) {
      response.cookies.set('portfolio_data', JSON.stringify(user.portfolio), {
        httpOnly: false,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
    }

    return response;
  } catch (error) {
    console.error('Google OAuth callback error:', error);
    const storedOrigin = request.cookies.get('auth_origin')?.value;
    return NextResponse.redirect(createErrorRedirect('auth_failed', request, storedOrigin));
  }
}
