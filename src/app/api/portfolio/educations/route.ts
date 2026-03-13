import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch educations
export async function GET(request: NextRequest) {
  try {
    const portfolioId = request.nextUrl.searchParams.get('portfolioId');

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }

    const educations = await db.education.findMany({
      where: { portfolioId },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ educations });
  } catch (error) {
    console.error('Get educations error:', error);
    return NextResponse.json({ error: 'Failed to fetch educations' }, { status: 500 });
  }
}

// POST - Create education
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolioId, institution, degree, field, location, startDate, endDate, isCurrent, description, displayOrder, isVisible } = body;

    if (!portfolioId || !institution || !degree || !startDate) {
      return NextResponse.json({ error: 'Portfolio ID, institution, degree, and start date are required' }, { status: 400 });
    }

    const education = await db.education.create({
      data: {
        portfolioId,
        institution,
        degree,
        field: field || null,
        location: location || null,
        startDate,
        endDate: endDate || null,
        isCurrent: isCurrent || false,
        description: description || null,
        displayOrder: displayOrder || 0,
        isVisible: isVisible !== undefined ? isVisible : true,
      },
    });

    return NextResponse.json({ education });
  } catch (error) {
    console.error('Create education error:', error);
    return NextResponse.json({ error: 'Failed to create education' }, { status: 500 });
  }
}

// PUT - Update education
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Education ID is required' }, { status: 400 });
    }

    const education = await db.education.update({
      where: { id },
      data,
    });

    return NextResponse.json({ education });
  } catch (error) {
    console.error('Update education error:', error);
    return NextResponse.json({ error: 'Failed to update education' }, { status: 500 });
  }
}

// DELETE - Delete education
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Education ID is required' }, { status: 400 });
    }

    await db.education.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete education error:', error);
    return NextResponse.json({ error: 'Failed to delete education' }, { status: 500 });
  }
}
