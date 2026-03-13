import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch skills
export async function GET(request: NextRequest) {
  try {
    const portfolioId = request.nextUrl.searchParams.get('portfolioId');

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }

    const skills = await db.skill.findMany({
      where: { portfolioId },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ skills });
  } catch (error) {
    console.error('Get skills error:', error);
    return NextResponse.json({ error: 'Failed to fetch skills' }, { status: 500 });
  }
}

// POST - Create skill
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolioId, name, category, proficiency, displayOrder, isVisible } = body;

    if (!portfolioId || !name) {
      return NextResponse.json({ error: 'Portfolio ID and name are required' }, { status: 400 });
    }

    const skill = await db.skill.create({
      data: {
        portfolioId,
        name,
        category: category || 'technical',
        proficiency: proficiency || 3,
        displayOrder: displayOrder || 0,
        isVisible: isVisible !== undefined ? isVisible : true,
      },
    });

    return NextResponse.json({ skill });
  } catch (error) {
    console.error('Create skill error:', error);
    return NextResponse.json({ error: 'Failed to create skill' }, { status: 500 });
  }
}

// PUT - Update skill
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    const skill = await db.skill.update({
      where: { id },
      data,
    });

    return NextResponse.json({ skill });
  } catch (error) {
    console.error('Update skill error:', error);
    return NextResponse.json({ error: 'Failed to update skill' }, { status: 500 });
  }
}

// DELETE - Delete skill
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Skill ID is required' }, { status: 400 });
    }

    await db.skill.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete skill error:', error);
    return NextResponse.json({ error: 'Failed to delete skill' }, { status: 500 });
  }
}
