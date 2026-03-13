import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch portfolio by user ID (create if doesn't exist)
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    let portfolio = await db.portfolio.findUnique({
      where: { userId },
      include: {
        content: true,
        projects: {
          orderBy: { displayOrder: 'asc' },
        },
        experiences: {
          orderBy: { displayOrder: 'asc' },
        },
        educations: {
          orderBy: { displayOrder: 'asc' },
        },
        skills: {
          orderBy: { displayOrder: 'asc' },
        },
      },
    });

    // If portfolio doesn't exist, create one (for existing users)
    if (!portfolio) {
      const user = await db.user.findUnique({ where: { id: userId } });
      
      if (!user) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      portfolio = await db.portfolio.create({
        data: {
          userId: user.id,
          personalityType: 'minimal',
          accentColor: '#10b981',
          layoutOrder: 'about,experience,projects,skills,contact',
          density: 'normal',
          content: {
            create: {
              aboutText: user.bio || '',
              contactEmail: user.email,
              githubUrl: user.githubLogin ? `https://github.com/${user.githubLogin}` : null,
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
    }

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error('Get portfolio error:', error);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }
}

// PUT - Update portfolio settings (create if doesn't exist)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, personalityType, accentColor, layoutOrder, density, reduceMotion, isPublished } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Verify user exists
    const user = await db.user.findUnique({ where: { id: userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Use upsert to create or update the portfolio
    const portfolio = await db.portfolio.upsert({
      where: { userId },
      create: {
        userId,
        personalityType: personalityType || 'minimal',
        accentColor: accentColor || '#10b981',
        layoutOrder: layoutOrder || 'about,experience,projects,skills,contact',
        density: density || 'normal',
        reduceMotion: reduceMotion || false,
        isPublished: isPublished || false,
        content: {
          create: {
            aboutText: user.bio || '',
            contactEmail: user.email,
            githubUrl: user.githubLogin ? `https://github.com/${user.githubLogin}` : null,
          },
        },
      },
      update: {
        ...(personalityType !== undefined && { personalityType }),
        ...(accentColor !== undefined && { accentColor }),
        ...(layoutOrder !== undefined && { layoutOrder }),
        ...(density !== undefined && { density }),
        ...(reduceMotion !== undefined && { reduceMotion }),
        ...(isPublished !== undefined && { isPublished }),
      },
    });

    return NextResponse.json({ portfolio });
  } catch (error) {
    console.error('Update portfolio error:', error);
    return NextResponse.json({ error: 'Failed to update portfolio' }, { status: 500 });
  }
}
