import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET - List all users with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';
    const status = searchParams.get('status') || '';

    const skip = (page - 1) * limit;

    // Check if role field exists
    let hasRoleField = true;
    try {
      await db.user.findFirst({ where: { role: 'USER' }, select: { id: true } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        hasRoleField = false;
      }
    }

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
        { username: { contains: search } },
      ];
    }

    // Only filter by role if field exists
    if (role && hasRoleField) {
      where.role = role;
    }

    if (status === 'active') {
      where.isActive = true;
    } else if (status === 'inactive') {
      where.isActive = false;
    }

    // Build select based on available fields
    const selectFields: Record<string, unknown> = {
      id: true,
      email: true,
      name: true,
      username: true,
      avatarUrl: true,
      isActive: true,
      createdAt: true,
      portfolio: {
        select: {
          id: true,
          isPublished: true,
          personalityType: true,
        },
      },
    };

    // Add role and lastLoginAt if available
    if (hasRoleField) {
      selectFields.role = true;
      selectFields.lastLoginAt = true;
    }

    const [usersRaw, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: selectFields,
      }),
      db.user.count({ where }),
    ]);

    // Add default role if field doesn't exist
    const users = usersRaw.map((user: Record<string, unknown>) => ({
      ...user,
      role: user.role || 'USER',
      lastLoginAt: user.lastLoginAt || null,
    }));

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      schemaUpToDate: hasRoleField,
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
