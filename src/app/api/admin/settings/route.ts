import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// Default settings to return if table doesn't exist
const defaultSettings = {
  id: 'default',
  siteName: 'Portfolio Generator',
  siteDescription: 'Create beautiful portfolio websites in minutes',
  maintenanceMode: false,
  maintenanceMessage: null,
  allowRegistration: true,
  defaultAccentColor: '#10b981',
  maxPortfoliosPerUser: 1,
};

// Check if SystemSettings table exists
async function checkSystemSettingsExists(): Promise<boolean> {
  try {
    await db.systemSettings.findFirst();
    return true;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      return false;
    }
    throw e;
  }
}

// GET - Get system settings
export async function GET() {
  try {
    const tableExists = await checkSystemSettingsExists();

    if (!tableExists) {
      return NextResponse.json({
        settings: defaultSettings,
        warning: 'SystemSettings table does not exist. Run database migration.',
      });
    }

    let settings = await db.systemSettings.findFirst();

    // Create default settings if none exist
    if (!settings) {
      settings = await db.systemSettings.create({
        data: {
          siteName: 'Portfolio Generator',
          siteDescription: 'Create beautiful portfolio websites in minutes',
          maintenanceMode: false,
          allowRegistration: true,
          defaultAccentColor: '#10b981',
          maxPortfoliosPerUser: 1,
        },
      });
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings', settings: defaultSettings },
      { status: 200 } // Return 200 with default settings so UI still works
    );
  }
}

// PATCH - Update system settings
export async function PATCH(request: NextRequest) {
  try {
    const tableExists = await checkSystemSettingsExists();

    if (!tableExists) {
      return NextResponse.json(
        { error: 'SystemSettings table does not exist. Run database migration to enable settings.' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const {
      siteName,
      siteDescription,
      maintenanceMode,
      maintenanceMessage,
      allowRegistration,
      defaultAccentColor,
      maxPortfoliosPerUser,
    } = body;

    // Get existing settings or create new
    let settings = await db.systemSettings.findFirst();

    const updateData: Record<string, unknown> = {};
    if (siteName !== undefined) updateData.siteName = siteName;
    if (siteDescription !== undefined) updateData.siteDescription = siteDescription;
    if (maintenanceMode !== undefined) updateData.maintenanceMode = maintenanceMode;
    if (maintenanceMessage !== undefined) updateData.maintenanceMessage = maintenanceMessage;
    if (allowRegistration !== undefined) updateData.allowRegistration = allowRegistration;
    if (defaultAccentColor !== undefined) updateData.defaultAccentColor = defaultAccentColor;
    if (maxPortfoliosPerUser !== undefined) updateData.maxPortfoliosPerUser = maxPortfoliosPerUser;

    if (settings) {
      settings = await db.systemSettings.update({
        where: { id: settings.id },
        data: updateData,
      });
    } else {
      settings = await db.systemSettings.create({
        data: {
          siteName: siteName || 'Portfolio Generator',
          siteDescription,
          maintenanceMode: maintenanceMode || false,
          maintenanceMessage,
          allowRegistration: allowRegistration ?? true,
          defaultAccentColor: defaultAccentColor || '#10b981',
          maxPortfoliosPerUser: maxPortfoliosPerUser || 1,
        },
      });
    }

    // Log the action (try, but don't fail if AuditLog doesn't exist)
    try {
      await db.auditLog.create({
        data: {
          action: 'SETTINGS_UPDATED',
          entityType: 'SystemSettings',
          entityId: settings.id,
          details: JSON.stringify(updateData),
        },
      });
    } catch (e) {
      // AuditLog table might not exist, ignore
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error('Error updating settings:', error);
    return NextResponse.json(
      { error: 'Failed to update settings: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
