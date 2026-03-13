import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';

// POST - Create a new admin
export async function POST(request: NextRequest) {
  try {
    const { name, email, password, setupKey } = await request.json();

    // Get setup key from environment (may be undefined on Vercel)
    const validSetupKey = process.env.ADMIN_SETUP_KEY;

    // Check if role field exists in the schema (for backwards compatibility)
    let hasRoleField = true;
    try {
      await db.user.count({ where: { role: 'ADMIN' } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        hasRoleField = false;
        console.log('Role field not found in schema - using legacy mode');
      }
    }

    // Check if any admin exists
    let existingAdminCount = 0;
    if (hasRoleField) {
      existingAdminCount = await db.user.count({
        where: { role: 'ADMIN' },
      });
    }

    // If admins already exist, require setup key
    if (existingAdminCount > 0) {
      if (!setupKey) {
        return NextResponse.json(
          { error: 'Setup key required. Admin accounts already exist.' },
          { status: 403 }
        );
      }

      if (!validSetupKey) {
        return NextResponse.json(
          { error: 'ADMIN_SETUP_KEY not configured in environment. Please set it in your Vercel dashboard.' },
          { status: 500 }
        );
      }

      if (setupKey !== validSetupKey) {
        return NextResponse.json(
          { error: 'Invalid setup key.' },
          { status: 403 }
        );
      }
    } else {
      // No admin exists yet - first-time setup
      // Require setup key ONLY if env var is set
      if (validSetupKey && setupKey !== validSetupKey) {
        return NextResponse.json(
          { error: 'Invalid setup key. Enter the correct setup key to create the first admin.' },
          { status: 403 }
        );
      }
    }

    if (!email || !password || password.length < 6) {
      return NextResponse.json(
        { error: 'Valid email and password (min 6 chars) are required' },
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

    // Create admin user - use try/catch to handle both old and new schema
    let admin;
    try {
      // Try with role field (new schema)
      admin = await db.user.create({
        data: {
          name: name || 'Admin',
          email,
          username: email.split('@')[0],
          password: hashedPassword,
          role: 'ADMIN',
          isActive: true,
        },
      });
    } catch (createError) {
      console.log('Failed to create with role field, trying without:', createError);
      // Try without role field (old schema)
      try {
        admin = await db.user.create({
          data: {
            name: name || 'Admin',
            email,
            username: email.split('@')[0],
            password: hashedPassword,
            isActive: true,
          } as Prisma.UserCreateInput,
        });
      } catch (secondError) {
        // If still failing, throw the original error
        throw createError;
      }
    }

    return NextResponse.json({
      message: 'Admin created successfully',
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
        role: hasRoleField ? 'ADMIN' : 'USER (schema migration needed)',
      },
      warning: hasRoleField ? undefined : 'Database schema needs migration. Admin created but role field is missing. Please run database migration.',
    });
  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
