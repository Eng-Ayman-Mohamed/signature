import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET - Fetch projects
export async function GET(request: NextRequest) {
  try {
    const portfolioId = request.nextUrl.searchParams.get('portfolioId');

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }

    const projects = await db.project.findMany({
      where: { portfolioId },
      orderBy: { displayOrder: 'asc' },
    });

    return NextResponse.json({ projects });
  } catch (error) {
    console.error('Get projects error:', error);
    return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 });
  }
}

// POST - Create project
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { portfolioId, title, description, longDescription, url, imageUrl, isGithubImport, githubStars, githubForks, githubLanguage, githubUrl, displayOrder, isVisible } = body;

    if (!portfolioId || !title) {
      return NextResponse.json({ error: 'Portfolio ID and title are required' }, { status: 400 });
    }

    const project = await db.project.create({
      data: {
        portfolioId,
        title,
        description: description || null,
        longDescription: longDescription || null,
        url: url || null,
        imageUrl: imageUrl || null,
        isGithubImport: isGithubImport || false,
        githubStars: githubStars || null,
        githubForks: githubForks || null,
        githubLanguage: githubLanguage || null,
        githubUrl: githubUrl || null,
        displayOrder: displayOrder || 0,
        isVisible: isVisible !== undefined ? isVisible : true,
      },
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Create project error:', error);
    return NextResponse.json({ error: 'Failed to create project' }, { status: 500 });
  }
}

// PUT - Update project
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    const project = await db.project.update({
      where: { id },
      data,
    });

    return NextResponse.json({ project });
  } catch (error) {
    console.error('Update project error:', error);
    return NextResponse.json({ error: 'Failed to update project' }, { status: 500 });
  }
}

// DELETE - Delete project
export async function DELETE(request: NextRequest) {
  try {
    const id = request.nextUrl.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });
    }

    await db.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete project error:', error);
    return NextResponse.json({ error: 'Failed to delete project' }, { status: 500 });
  }
}
