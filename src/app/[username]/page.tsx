import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { PublicPortfolio } from './public-portfolio';

interface PageProps {
  params: Promise<{ username: string }>;
}

export async function generateMetadata({ params }: PageProps) {
  const { username } = await params;
  
  const user = await db.user.findUnique({
    where: { username },
    include: {
      portfolio: {
        include: { content: true },
      },
    },
  });

  if (!user || !user.portfolio || !user.portfolio.isPublished) {
    return {
      title: 'Portfolio Not Found',
    };
  }

  return {
    title: `${user.name || user.username}'s Portfolio`,
    description: user.portfolio.content?.aboutText || `${user.name}'s professional portfolio`,
  };
}

export default async function PortfolioPage({ params }: PageProps) {
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

  if (!user || !user.portfolio || !user.portfolio.isPublished) {
    notFound();
  }

  // Prepare the data for the client component
  const portfolioData = {
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
      projects: user.portfolio.projects.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        url: p.url,
        imageUrl: p.imageUrl,
        githubStars: p.githubStars,
        githubForks: p.githubForks,
        githubLanguage: p.githubLanguage,
        isVisible: p.isVisible,
      })),
      experiences: user.portfolio.experiences.map(e => ({
        id: e.id,
        company: e.company,
        role: e.role,
        location: e.location,
        startDate: e.startDate,
        endDate: e.endDate,
        isCurrent: e.isCurrent,
        description: e.description,
        isVisible: e.isVisible,
      })),
      educations: user.portfolio.educations.map(ed => ({
        id: ed.id,
        institution: ed.institution,
        degree: ed.degree,
        field: ed.field,
        location: ed.location,
        startDate: ed.startDate,
        endDate: ed.endDate,
        isCurrent: ed.isCurrent,
        description: ed.description,
        isVisible: ed.isVisible,
      })),
      skills: user.portfolio.skills.map(s => ({
        id: s.id,
        name: s.name,
        category: s.category,
        proficiency: s.proficiency,
        isVisible: s.isVisible,
      })),
    },
  };

  return <PublicPortfolio data={portfolioData} />;
}
