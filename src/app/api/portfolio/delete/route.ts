import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Find the user
    const user = await db.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Delete the user (cascade will delete portfolio and all related data)
    await db.user.delete({
      where: { id: userId },
    });

    // Create response and clear auth cookies
    const response = NextResponse.json({ success: true, message: 'Account deleted successfully' });
    
    // Clear all auth cookies
    response.cookies.delete('auth_token');
    response.cookies.delete('user_data');
    response.cookies.delete('portfolio_data');

    return response;
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    );
  }
}
