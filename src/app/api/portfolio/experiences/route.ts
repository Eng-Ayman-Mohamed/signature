import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch experiences
export async function GET(request: NextRequest) {
  try {
    const portfolioId = request.nextUrl.searchParams.get('portfolioId');

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }

    const experiences = await db.experience.findMany({
      where: { portfolioId },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ experiences });
  } catch (error) {
    console.error('Get experiences error:', error);
    return NextResponse.json({ error: 'Failed to fetch experiences' }, { status: 500 });
  }
}

// POST - Create experience
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolioId, company, role, location, startDate, endDate, isCurrent, description, displayOrder, isVisible } = body;

    if (!portfolioId || !company || !role || !startDate) {
      return NextResponse.json({ error: 'Portfolio ID, company, role, and start date are required' }, { status: 400 });
    }

    const experience = await db.experience.create({
      data: {
        portfolioId,
        company,
        role,
        location: location || null,
        startDate,
        endDate: endDate || null,
        isCurrent: isCurrent || false,
        description: description || null,
        displayOrder: displayOrder || 0,
        isVisible: isVisible !== undefined ? isVisible : true,
      },
    });

    return NextResponse.json({ experience });
  } catch (error) {
    console.error('Create experience error:', error);
    return NextResponse.json({ error: 'Failed to create experience' }, { status: 500 });
  }
}

// PUT - Update experience
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    const experience = await db.experience.update({
      where: { id },
      data,
    });

    return NextResponse.json({ experience });
  } catch (error) {
    console.error('Update experience error:', error);
    return NextResponse.json({ error: 'Failed to update experience' }, { status: 500 });
  }
}

// DELETE - Delete experience
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Experience ID is required' }, { status: 400 });
    }

    await db.experience.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete experience error:', error);
    return NextResponse.json({ error: 'Failed to delete experience' }, { status: 500 });
  }
}
