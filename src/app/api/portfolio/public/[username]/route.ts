import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ username: string }> }
) {
  try {
    const { username } = await params;

    // Find user by username
    const user = await db.user.findUnique({
      where: { username },
      include: {
        portfolio: {
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
        },
      },
    });

    if (!user || !user.portfolio) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Check if portfolio is published
    if (!user.portfolio.isPublished) {
      return NextResponse.json(
        { error: 'Portfolio not found' },
        { status: 404 }
      );
    }

    // Return public portfolio data
    return NextResponse.json({
      user: {
        name: user.name,
        username: user.username,
        avatarUrl: user.avatarUrl,
        bio: user.bio,
        location: user.location,
        company: user.company,
        blog: user.blog,
      },
      portfolio: {
        personalityType: user.portfolio.personalityType,
        accentColor: user.portfolio.accentColor,
        layoutOrder: user.portfolio.layoutOrder,
        density: user.portfolio.density,
        reduceMotion: user.portfolio.reduceMotion,
        content: user.portfolio.content ? {
          jobTitle: user.portfolio.content.jobTitle,
          aboutText: user.portfolio.content.aboutText,
          resumeUrl: user.portfolio.content.resumeUrl,
          contactEmail: user.portfolio.content.contactEmail,
          linkedinUrl: user.portfolio.content.linkedinUrl,
          githubUrl: user.portfolio.content.githubUrl,
          twitterUrl: user.portfolio.content.twitterUrl,
          websiteUrl: user.portfolio.content.websiteUrl,
        } : null,
        projects: user.portfolio.projects.filter(p => p.isVisible),
        experiences: user.portfolio.experiences.filter(e => e.isVisible),
        educations: user.portfolio.educations.filter(e => e.isVisible),
        skills: user.portfolio.skills.filter(s => s.isVisible),
      },
    });
  } catch (error) {
    console.error('Error fetching public portfolio:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
