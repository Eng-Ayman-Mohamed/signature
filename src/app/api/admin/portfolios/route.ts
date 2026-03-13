import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - List all portfolios with pagination
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const personality = searchParams.get('personality') || '';
    const published = searchParams.get('published') || '';

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};

    if (search) {
      where.OR = [
        { user: { email: { contains: search } } },
        { user: { name: { contains: search } } },
        { user: { username: { contains: search } } },
      ];
    }

    if (personality) {
      where.personalityType = personality;
    }

    if (published === 'true') {
      where.isPublished = true;
    } else if (published === 'false') {
      where.isPublished = false;
    }

    const [portfoliosRaw, total] = await Promise.all([
      db.portfolio.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          personalityType: true,
          accentColor: true,
          isPublished: true,
          density: true,
          reduceMotion: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              username: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: {
              projects: true,
              experiences: true,
              skills: true,
            },
          },
        },
      }),
      db.portfolio.count({ where }),
    ]);

    const portfolios = portfoliosRaw.map((p) => ({
      id: p.id,
      personalityType: p.personalityType,
      accentColor: p.accentColor,
      isPublished: p.isPublished,
      density: p.density,
      reduceMotion: p.reduceMotion,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
      user: p.user,
      projectCount: p._count.projects,
      experienceCount: p._count.experiences,
      skillCount: p._count.skills,
    }));

    return NextResponse.json({
      portfolios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching portfolios:', error);
    return NextResponse.json(
      { error: 'Failed to fetch portfolios: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
