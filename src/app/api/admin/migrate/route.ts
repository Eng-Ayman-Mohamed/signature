import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST - Run database migration to add missing columns
// This is for Vercel deployments where the schema might be out of sync
export async function POST(request: NextRequest) {
  try {
    const { setupKey } = await request.json();

    // Require setup key for security
    const validSetupKey = process.env.ADMIN_SETUP_KEY;
    if (!validSetupKey || setupKey !== validSetupKey) {
      return NextResponse.json(
        { error: 'Invalid setup key. Migration requires admin privileges.' },
        { status: 403 }
      );
    }

    const results: string[] = [];

    // Try to add role column if it doesn't exist (PostgreSQL)
    try {
      await db.$executeRaw`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "role" TEXT NOT NULL DEFAULT 'USER'
      `;
      results.push('Added role column to User table');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
        results.push('role column already exists');
      } else {
        results.push(`role column: ${e.message}`);
      }
    }

    // Try to add isActive column if it doesn't exist
    try {
      await db.$executeRaw`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true
      `;
      results.push('Added isActive column to User table');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
        results.push('isActive column already exists');
      } else {
        results.push(`isActive column: ${e.message}`);
      }
    }

    // Try to add lastLoginAt column if it doesn't exist
    try {
      await db.$executeRaw`
        ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "lastLoginAt" TIMESTAMP(3)
      `;
      results.push('Added lastLoginAt column to User table');
    } catch (e: any) {
      if (e.message?.includes('already exists') || e.message?.includes('duplicate')) {
        results.push('lastLoginAt column already exists');
      } else {
        results.push(`lastLoginAt column: ${e.message}`);
      }
    }

    // Try to create AuditLog table if it doesn't exist
    try {
      await db.$executeRaw`
        CREATE TABLE IF NOT EXISTS "AuditLog" (
          "id" TEXT NOT NULL,
          "userId" TEXT,
          "action" TEXT NOT NULL,
          "entityType" TEXT NOT NULL,
          "entityId" TEXT,
          "details" TEXT,
          "ipAddress" TEXT,
          "userAgent" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
        )
      `;
      results.push('Created AuditLog table');
    } catch (e: any) {
      results.push(`AuditLog table: ${e.message}`);
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results,
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: 'Migration failed: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
