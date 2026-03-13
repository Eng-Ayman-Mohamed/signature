import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PUT - Update content
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolioId, ...content } = body;

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }

    // Check if content exists
    const existingContent = await db.content.findUnique({
      where: { portfolioId },
    });

    let updatedContent;
    if (existingContent) {
      updatedContent = await db.content.update({
        where: { portfolioId },
        data: content,
      });
    } else {
      updatedContent = await db.content.create({
        data: {
          portfolioId,
          ...content,
        },
      });
    }

    return NextResponse.json({ content: updatedContent });
  } catch (error) {
    console.error('Update content error:', error);
    return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
  }
}
