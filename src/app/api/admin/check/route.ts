import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET - Check if any admin exists (for setup UI)
export async function GET() {
  try {
    let adminCount = 0;
    let hasRoleField = true;

    try {
      adminCount = await db.user.count({
        where: { role: 'ADMIN' },
      });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        hasRoleField = false;
        // Role field doesn't exist - count all users
        // First user will be considered admin in legacy mode
        const totalUsers = await db.user.count();
        adminCount = totalUsers > 0 ? 1 : 0; // Assume first user is admin
      } else {
        throw e;
      }
    }

    return NextResponse.json({
      hasAdmin: adminCount > 0,
      adminCount,
      schemaUpToDate: hasRoleField,
      warning: hasRoleField ? undefined : 'Database schema needs migration. Role field is missing.',
    });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json(
      { error: 'Failed to check admin status: ' + (error instanceof Error ? error.message : 'Unknown') },
      { status: 500 }
    );
  }
}
