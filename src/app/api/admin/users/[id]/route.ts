import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET - Get single user details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if role field exists
    let hasRoleField = true;
    try {
      await db.user.findFirst({ where: { role: 'USER' }, select: { id: true } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        hasRoleField = false;
      }
    }

    const selectFields: Record<string, unknown> = {
      id: true,
      email: true,
      name: true,
      username: true,
      avatarUrl: true,
      bio: true,
      location: true,
      company: true,
      blog: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      portfolio: {
        select: {
          id: true,
          personalityType: true,
          accentColor: true,
          isPublished: true,
          createdAt: true,
          projects: { select: { id: true, title: true } },
          experiences: { select: { id: true, company: true, role: true } },
          educations: { select: { id: true, institution: true, degree: true } },
          skills: { select: { id: true, name: true } },
        },
      },
    };

    if (hasRoleField) {
      selectFields.role = true;
      selectFields.lastLoginAt = true;
    }

    const userRaw = await db.user.findUnique({
      where: { id },
      select: selectFields,
    });

    if (!userRaw) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = {
      ...userRaw,
      role: (userRaw as Record<string, unknown>).role || 'USER',
      lastLoginAt: (userRaw as Record<string, unknown>).lastLoginAt || null,
    };

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH - Update user (role, status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { role, isActive, name, username, email } = body;

    // Check if role field exists
    let hasRoleField = true;
    try {
      await db.user.findFirst({ where: { role: 'USER' }, select: { id: true } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        hasRoleField = false;
      }
    }

    const updateData: Record<string, unknown> = {};
    if (role !== undefined && hasRoleField) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (name !== undefined) updateData.name = name;
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;

    const selectFields: Record<string, unknown> = {
      id: true,
      email: true,
      name: true,
      username: true,
      isActive: true,
    };

    if (hasRoleField) {
      selectFields.role = true;
    }

    const userRaw = await db.user.update({
      where: { id },
      data: updateData,
      select: selectFields,
    });

    const user = {
      ...userRaw,
      role: (userRaw as Record<string, unknown>).role || 'USER',
    };

    // Log the action (try, but don't fail if AuditLog doesn't exist)
    try {
      await db.auditLog.create({
        data: {
          userId: id,
          action: 'USER_UPDATED',
          entityType: 'User',
          entityId: id,
          details: JSON.stringify(updateData),
        },
      });
    } catch (e) {
      // AuditLog table might not exist, ignore
    }

    return NextResponse.json({ user });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// DELETE - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check if user exists
    const user = await db.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Delete user (cascade will delete portfolio)
    await db.user.delete({ where: { id } });

    // Log the action (try, but don't fail if AuditLog doesn't exist)
    try {
      await db.auditLog.create({
        data: {
          action: 'USER_DELETED',
          entityType: 'User',
          entityId: id,
          details: JSON.stringify({ email: user.email, name: user.name }),
        },
      });
    } catch (e) {
      // AuditLog table might not exist, ignore
    }

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Failed to delete user: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
