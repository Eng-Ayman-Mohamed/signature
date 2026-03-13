import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET user by ID
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Return all user fields for proper sync
    return NextResponse.json({
      user: {
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
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json({ error: 'Failed to get user' }, { status: 500 });
  }
}

// PUT - Update user profile including avatarUrl
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, location, company, avatarUrl } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const updateData: {
      name?: string | null;
      location?: string | null;
      company?: string | null;
      avatarUrl?: string | null;
    } = {};

    if (name !== undefined) updateData.name = name;
    if (location !== undefined) updateData.location = location;
    if (company !== undefined) updateData.company = company;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Return all user fields for proper sync
    return NextResponse.json({
      user: {
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
      }
    });
  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}
