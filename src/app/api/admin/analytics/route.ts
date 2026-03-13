import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';

// GET - Get analytics data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30'; // days

    const daysAgo = parseInt(range);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysAgo);
    startDate.setHours(0, 0, 0, 0);

    // Check if role field exists
    let hasRoleField = true;
    try {
      await db.user.findFirst({ where: { role: 'USER' }, select: { id: true } });
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError) {
        hasRoleField = false;
      }
    }

    // Get basic counts
    const [
      totalUsers,
      totalPortfolios,
      publishedPortfolios,
      newUsersThisPeriod,
      newPortfoliosThisPeriod,
      recentUsers,
      recentPortfoliosRaw,
    ] = await Promise.all([
      db.user.count(),
      db.portfolio.count(),
      db.portfolio.count({ where: { isPublished: true } }),
      db.user.count({
        where: { createdAt: { gte: startDate } },
      }),
      db.portfolio.count({
        where: { createdAt: { gte: startDate } },
      }),
      db.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
          createdAt: true,
        },
      }),
      db.portfolio.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          personalityType: true,
          accentColor: true,
          isPublished: true,
          createdAt: true,
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              avatarUrl: true,
            },
          },
          _count: {
            select: { projects: true, experiences: true, skills: true },
          },
        },
      }),
    ]);

    // Get active users today (try with lastLoginAt, fallback to totalUsers)
    let activeUsersToday = 0;
    try {
      activeUsersToday = await db.user.count({
        where: {
          lastLoginAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      });
    } catch (e) {
      // lastLoginAt field might not exist
      activeUsersToday = totalUsers; // Fallback
    }

    // Format recent portfolios
    const recentPortfolios = recentPortfoliosRaw.map((p) => ({
      id: p.id,
      personalityType: p.personalityType,
      accentColor: p.accentColor,
      isPublished: p.isPublished,
      createdAt: p.createdAt,
      user: p.user,
      projectCount: p._count.projects,
      experienceCount: p._count.experiences,
      skillCount: p._count.skills,
    }));

    // Get personality type distribution
    const personalityDistribution = await db.portfolio.groupBy({
      by: ['personalityType'],
      _count: { id: true },
    });

    // Get content stats
    const [totalProjects, totalExperiences, totalSkills, totalEducations] = await Promise.all([
      db.project.count(),
      db.experience.count(),
      db.skill.count(),
      db.education.count(),
    ]);

    // Calculate averages
    const avgProjectsPerPortfolio = totalPortfolios > 0
      ? (totalProjects / totalPortfolios).toFixed(1)
      : '0';
    const avgSkillsPerPortfolio = totalPortfolios > 0
      ? (totalSkills / totalPortfolios).toFixed(1)
      : '0';

    // Get user growth data (using Prisma instead of raw queries for cross-db compatibility)
    const allUsers = await db.user.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    });

    const allPortfolios = await db.portfolio.findMany({
      where: { createdAt: { gte: startDate } },
      select: { createdAt: true },
    });

    // Group by date in JavaScript
    const userGrowthMap = new Map<string, number>();
    const portfolioGrowthMap = new Map<string, number>();

    allUsers.forEach((user) => {
      const date = user.createdAt.toISOString().split('T')[0];
      userGrowthMap.set(date, (userGrowthMap.get(date) || 0) + 1);
    });

    allPortfolios.forEach((portfolio) => {
      const date = portfolio.createdAt.toISOString().split('T')[0];
      portfolioGrowthMap.set(date, (portfolioGrowthMap.get(date) || 0) + 1);
    });

    const userGrowth = Array.from(userGrowthMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));

    const portfolioGrowth = Array.from(portfolioGrowthMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json({
      overview: {
        totalUsers,
        totalPortfolios,
        publishedPortfolios,
        unpublishedPortfolios: totalPortfolios - publishedPortfolios,
        activeUsersToday,
        newUsersThisPeriod,
        newPortfoliosThisPeriod,
        avgProjectsPerPortfolio,
        avgSkillsPerPortfolio,
      },
      contentStats: {
        totalProjects,
        totalExperiences,
        totalSkills,
        totalEducations,
      },
      personalityDistribution: personalityDistribution.map((p) => ({
        type: p.personalityType,
        count: p._count.id,
      })),
      recentUsers,
      recentPortfolios,
      growth: {
        users: userGrowth,
        portfolios: portfolioGrowth,
      },
      period: {
        days: daysAgo,
        startDate: startDate.toISOString(),
        endDate: new Date().toISOString(),
      },
      schemaUpToDate: hasRoleField,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
