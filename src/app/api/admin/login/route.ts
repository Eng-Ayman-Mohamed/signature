import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';
import { Prisma } from '@prisma/client';

const SECRET_KEY = process.env.JWT_SECRET || 'your-secret-key-min-32-chars-long';

// POST - Admin login
export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email - try with role field first, fallback without
    let user: any;
    try {
      user = await db.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          password: true,
          avatarUrl: true,
          role: true,
          isActive: true,
        },
      });
    } catch (e) {
      // Role field doesn't exist - try without it
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        user = await db.user.findUnique({
          where: { email },
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            password: true,
            avatarUrl: true,
            isActive: true,
          },
        });
        // Add role manually for legacy users (first user is admin)
        if (user) {
          const userCount = await db.user.count();
          user.role = userCount === 1 ? 'ADMIN' : 'USER';
        }
      } else {
        throw e;
      }
    }

    if (!user || !user.password) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated' },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    try {
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });
    } catch (e) {
      // Ignore if this fails
    }

    // Log the action
    try {
      await db.auditLog.create({
        data: {
          userId: user.id,
          action: 'ADMIN_LOGIN',
          entityType: 'User',
          entityId: user.id,
        },
      });
    } catch (e) {
      // Ignore if audit log fails
    }

    // Generate JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.role,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d')
      .sign(new TextEncoder().encode(SECRET_KEY));

    // Create response with user data
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        role: user.role,
        isActive: user.isActive,
      },
    });

    // Set cookie
    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown') },
      { status: 500 }
    );
  }
}
