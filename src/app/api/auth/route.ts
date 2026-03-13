import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';

const SALT_ROUNDS = 10;

// POST - Signup or Login with email/password
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, action } = body;

    // action can be 'signup' or 'login'
    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (action === 'signup') {
      // SIGNUP FLOW
      if (existingUser) {
        return NextResponse.json({ 
          error: 'An account with this email already exists. Please login instead.' 
        }, { status: 400 });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

      // Create username from email
      let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
      
      // Check if username is taken
      const existingUsername = await db.user.findUnique({
        where: { username },
      });

      if (existingUsername) {
        username = `${username}_${Date.now().toString(36)}`;
      }

      // Create new user with password
      const user = await db.user.create({
        data: {
          email,
          name: name || username,
          username,
          password: hashedPassword,
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

      // Create default portfolio for new user
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
              contactEmail: email,
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

      const userWithPortfolio = { ...user, portfolio };

      // Create response with cookies
      const response = NextResponse.json({ 
        user: userWithPortfolio, 
        isNewUser: true,
        message: 'Account created successfully!' 
      });

      // Set auth cookies
      setAuthCookies(response, user);

      return response;

    } else {
      // LOGIN FLOW
      if (!existingUser) {
        return NextResponse.json({ 
          error: 'No account found with this email. Please sign up first.' 
        }, { status: 400 });
      }

      // Check if user has a password (might have signed up via OAuth)
      if (!existingUser.password) {
        return NextResponse.json({ 
          error: 'This account was created with social login. Please use GitHub or Google to sign in.',
          useOAuth: true 
        }, { status: 400 });
      }

      // Verify password
      const passwordMatch = await bcrypt.compare(password, existingUser.password);

      if (!passwordMatch) {
        return NextResponse.json({ 
          error: 'Incorrect password. Please try again.' 
        }, { status: 401 });
      }

      // Get user with portfolio
      const user = await db.user.findUnique({
        where: { email },
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

      // Create response with cookies
      const response = NextResponse.json({ 
        user, 
        message: 'Welcome back!' 
      });

      // Set auth cookies
      setAuthCookies(response, user!);

      return response;
    }
  } catch (error) {
    console.error('Auth error:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    const isDbError = errorMessage.includes('Prisma') || errorMessage.includes('database') || errorMessage.includes('connection');
    
    return NextResponse.json({ 
      error: isDbError ? 'Database connection error. Please try again.' : errorMessage 
    }, { status: 500 });
  }
}

// Helper function to set auth cookies
function setAuthCookies(response: NextResponse, user: any) {
  // Set auth token cookie (secure, httpOnly) - this is all we need
  // User data will be fetched from API when needed
  const authToken = Buffer.from(JSON.stringify({
    userId: user.id,
    exp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
  })).toString('base64');

  response.cookies.set('auth_token', authToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });

  // Don't store user data in cookies - too large
  // Client will fetch user data from API after login
}

// GET - Check if email exists
export async function GET(request: NextRequest) {
  try {
    const email = request.nextUrl.searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        githubId: true,
        googleId: true,
      },
    });

    if (!user) {
      return NextResponse.json({ exists: false });
    }

    // Return info about what auth methods are available for this email
    return NextResponse.json({ 
      exists: true,
      hasPassword: !!user.password,
      hasGithub: !!user.githubId,
      hasGoogle: !!user.googleId,
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Failed to check user' }, { status: 500 });
  }
}
