import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

interface GitHubUser {
  id: number;
  login: string;
  name: string | null;
  email: string | null;
  avatar_url: string;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
}

interface GitHubEmail {
  email: string;
  primary: boolean;
  verified: boolean;
  visibility: string | null;
}

// Helper to create error redirect with provider info
function createErrorRedirect(error: string, request: NextRequest, storedOrigin?: string): URL {
  const appUrl = process.env.APP_URL;
  const redirectOrigin = appUrl || storedOrigin || new URL(request.url).origin;
  return new URL(`/?error=${error}&provider=github`, redirectOrigin);
}

export async function GET(request: NextRequest) {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const clientSecret = process.env.GITHUB_CLIENT_SECRET;
  const storedOrigin = request.cookies.get('auth_origin')?.value;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(createErrorRedirect('oauth_not_configured', request, storedOrigin));
  }

  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');

  // Check for access_denied error from GitHub
  const error = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');
  
  if (error) {
    console.error('GitHub OAuth error:', error, errorDescription);
    if (error === 'access_denied') {
      return NextResponse.redirect(createErrorRedirect('access_denied', request, storedOrigin));
    }
    return NextResponse.redirect(createErrorRedirect('auth_failed', request, storedOrigin));
  }

  // Verify state for CSRF protection
  const storedState = request.cookies.get('github_oauth_state')?.value;
  
  if (!code || !state || state !== storedState) {
    return NextResponse.redirect(createErrorRedirect('invalid_auth', request, storedOrigin));
  }

  try {
    // Get the stored redirect URI
    const redirectUri = request.cookies.get('auth_redirect_uri')?.value;

    // Exchange code for access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    const tokenData = await tokenResponse.json();
    
    if (tokenData.error) {
      console.error('GitHub token error:', tokenData.error, tokenData.error_description);
      if (tokenData.error === 'redirect_uri_mismatch') {
        return NextResponse.redirect(createErrorRedirect('redirect_uri_mismatch', request, storedOrigin));
      }
      return NextResponse.redirect(createErrorRedirect('token_error', request, storedOrigin));
    }

    const accessToken = tokenData.access_token;

    // Fetch user data from GitHub
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Generator',
      },
    });

    if (!userResponse.ok) {
      console.error('GitHub user fetch error:', userResponse.status);
      return NextResponse.redirect(createErrorRedirect('user_fetch_error', request, storedOrigin));
    }

    const githubUser: GitHubUser = await userResponse.json();

    // Fetch user emails (in case primary email is not public)
    const emailsResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Portfolio-Generator',
      },
    });

    let primaryEmail = githubUser.email;
    
    if (emailsResponse.ok) {
      const emails: GitHubEmail[] = await emailsResponse.json();
      const primary = emails.find(e => e.primary && e.verified);
      if (primary) {
        primaryEmail = primary.email;
      } else {
        // Use first verified email if no primary
        const verified = emails.find(e => e.verified);
        if (verified) {
          primaryEmail = verified.email;
        }
      }
    }

    if (!primaryEmail) {
      primaryEmail = `${githubUser.id}+${githubUser.login}@users.noreply.github.com`;
    }

    // Check if user exists with this GitHub ID
    let user = await db.user.findUnique({
      where: { githubId: githubUser.id.toString() },
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

    if (!user) {
      // Check if username is taken
      let username = githubUser.login;
      const existingUsername = await db.user.findUnique({
        where: { username: githubUser.login },
      });

      if (existingUsername) {
        username = `${githubUser.login}_${Date.now().toString(36)}`;
      }

      // Create new user
      user = await db.user.create({
        data: {
          email: primaryEmail,
          name: githubUser.name || githubUser.login,
          username,
          githubId: githubUser.id.toString(),
          githubLogin: githubUser.login,
          avatarUrl: githubUser.avatar_url,
          bio: githubUser.bio,
          location: githubUser.location,
          company: githubUser.company,
          blog: githubUser.blog,
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
              aboutText: githubUser.bio || '',
              contactEmail: primaryEmail,
              githubUrl: `https://github.com/${githubUser.login}`,
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
    const storedOrigin = request.cookies.get('auth_origin')?.value;
    
    // Use APP_URL or stored origin, fallback to request.url
    const appUrl = process.env.APP_URL;
    const redirectOrigin = appUrl || storedOrigin || new URL(request.url).origin;
    const finalRedirectUrl = new URL(redirectPath, redirectOrigin);
    
    const response = NextResponse.redirect(finalRedirectUrl);

    // Clear OAuth cookies
    response.cookies.delete('github_oauth_state');
    response.cookies.delete('auth_redirect');
    response.cookies.delete('auth_redirect_uri');
    response.cookies.delete('auth_origin');

    // Set auth token cookie (secure, httpOnly)
    const authToken = Buffer.from(JSON.stringify({
      userId: user.id,
      githubId: user.githubId,
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
      githubId: user.githubId,
      githubLogin: user.githubLogin,
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
    console.error('GitHub OAuth callback error:', error);
    const storedOrigin = request.cookies.get('auth_origin')?.value;
    return NextResponse.redirect(createErrorRedirect('auth_failed', request, storedOrigin));
  }
}
