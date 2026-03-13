import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, isPublished } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find the user's portfolio
    const portfolio = await db.portfolio.findUnique({
      where: { userId },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Update publish status
    const updatedPortfolio = await db.portfolio.update({
      where: { userId },
      data: { isPublished },
    });

    return NextResponse.json({ portfolio: updatedPortfolio });
  } catch (error) {
    console.error('Error updating publish status:', error);
    return NextResponse.json(
      { error: 'Failed to update publish status' },
      { status: 500 }
    );
  }
}
