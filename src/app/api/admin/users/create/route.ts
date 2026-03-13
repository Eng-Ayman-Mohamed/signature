import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

// POST - Create a new user (admin only)
export async function POST(request: NextRequest) {
  try {
    const { name, email, password, role } = await request.json();

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create username from email
    let username = email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');

    // Check if username is taken
    const existingUsername = await db.user.findUnique({
      where: { username },
    });

    if (existingUsername) {
      username = `${username}_${Date.now().toString(36)}`;
    }

    // Check if role field exists
    let hasRoleField = true;
    try {
      await db.user.findFirst({ where: { role: 'USER' }, select: { id: true } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        hasRoleField = false;
      }
    }

    // Build user data
    const userData: Record<string, unknown> = {
      name: name || username,
      email,
      username,
      password: hashedPassword,
      isActive: true,
    };

    // Only add role if field exists
    if (hasRoleField) {
      userData.role = role === 'ADMIN' ? 'ADMIN' : 'USER';
    }

    // Create user
    const user = await db.user.create({
      data: userData,
    });

    // Create default portfolio for new user
    try {
      await db.portfolio.create({
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
      });
    } catch (e) {
      // Portfolio creation failed, but user was created
      console.error('Failed to create portfolio for user:', e);
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        role: hasRoleField ? (role === 'ADMIN' ? 'ADMIN' : 'USER') : 'USER',
      },
    });
  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { error: 'Failed to create user: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
