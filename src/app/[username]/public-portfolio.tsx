'use client';

import { MinimalPersonality } from '@/components/personalities/minimal-personality';
import { DeveloperPersonality } from '@/components/personalities/developer-personality';
import { FuturisticPersonality } from '@/components/personalities/futuristic-personality';
import { CreativePersonality } from '@/components/personalities/creative-personality';
import { ElegantPersonality } from '@/components/personalities/elegant-personality';

import type { Portfolio } from '@/store/portfolio-store';
import type { User } from '@/store/auth-store';

interface PublicPortfolioProps {
  data: {
    user: {
      name: string | null;
      username: string | null;
      avatarUrl: string | null;
      bio: string | null;
      location: string | null;
      company: string | null;
      blog: string | null;
    };
    portfolio: {
      personalityType: string;
      accentColor: string;
      layoutOrder: string;
      density: string;
      reduceMotion: boolean;
      content: {
        jobTitle: string | null;
        aboutText: string | null;
        resumeUrl: string | null;
        contactEmail: string | null;
        linkedinUrl: string | null;
        githubUrl: string | null;
        twitterUrl: string | null;
        websiteUrl: string | null;
      } | null;
      projects: Array<{
        id: string;
        title: string;
        description: string | null;
        url: string | null;
        imageUrl: string | null;
        githubStars: number | null;
        githubForks: number | null;
        githubLanguage: string | null;
        isVisible: boolean;
      }>;
      experiences: Array<{
        id: string;
        company: string;
        role: string;
        location: string | null;
        startDate: string;
        endDate: string | null;
        isCurrent: boolean;
        description: string | null;
        isVisible: boolean;
      }>;
      educations: Array<{
        id: string;
        institution: string;
        degree: string;
        field: string | null;
        location: string | null;
        startDate: string;
        endDate: string | null;
        isCurrent: boolean;
        description: string | null;
        isVisible: boolean;
      }>;
      skills: Array<{
        id: string;
        name: string;
        category: string;
        proficiency: number;
        isVisible: boolean;
      }>;
    };
  };
}

export function PublicPortfolio({ data }: PublicPortfolioProps) {
  // Create portfolio object
  const portfolio: Portfolio = {
    id: '',
    userId: '',
    personalityType: data.portfolio.personalityType as Portfolio['personalityType'],
    accentColor: data.portfolio.accentColor,
    layoutOrder: data.portfolio.layoutOrder,
    isPublished: true,
    density: data.portfolio.density as Portfolio['density'],
    reduceMotion: data.portfolio.reduceMotion,
    content: data.portfolio.content ? {
      id: '',
      portfolioId: '',
      jobTitle: data.portfolio.content.jobTitle,
      aboutText: data.portfolio.content.aboutText,
      resumeUrl: data.portfolio.content.resumeUrl,
      contactEmail: data.portfolio.content.contactEmail,
      linkedinUrl: data.portfolio.content.linkedinUrl,
      githubUrl: data.portfolio.content.githubUrl,
      twitterUrl: data.portfolio.content.twitterUrl,
      websiteUrl: data.portfolio.content.websiteUrl,
    } : null,
    projects: data.portfolio.projects.filter(p => p.isVisible).map(p => ({
      id: p.id,
      portfolioId: '',
      title: p.title,
      description: p.description,
      longDescription: null,
      url: p.url,
      imageUrl: p.imageUrl,
      isGithubImport: false,
      githubStars: p.githubStars,
      githubForks: p.githubForks,
      githubLanguage: p.githubLanguage,
      githubUrl: null,
      displayOrder: 0,
      isVisible: p.isVisible,
    })),
    experiences: data.portfolio.experiences.filter(e => e.isVisible).map(e => ({
      id: e.id,
      portfolioId: '',
      company: e.company,
      role: e.role,
      location: e.location,
      startDate: e.startDate,
      endDate: e.endDate,
      isCurrent: e.isCurrent,
      description: e.description,
      displayOrder: 0,
      isVisible: e.isVisible,
    })),
    educations: data.portfolio.educations.filter(ed => ed.isVisible).map(ed => ({
      id: ed.id,
      portfolioId: '',
      institution: ed.institution,
      degree: ed.degree,
      field: ed.field,
      location: ed.location,
      startDate: ed.startDate,
      endDate: ed.endDate,
      isCurrent: ed.isCurrent,
      description: ed.description,
      displayOrder: 0,
      isVisible: ed.isVisible,
    })),
    skills: data.portfolio.skills.filter(s => s.isVisible).map(s => ({
      id: s.id,
      portfolioId: '',
      name: s.name,
      category: s.category as 'technical' | 'soft' | 'tools',
      proficiency: s.proficiency,
      displayOrder: 0,
      isVisible: s.isVisible,
    })),
  };

  // Create user object
  const user: User = {
    id: '',
    email: '',
    name: data.user.name,
    username: data.user.username,
    githubId: null,
    githubLogin: null,
    avatarUrl: data.user.avatarUrl,
    bio: data.user.bio,
    location: data.user.location,
    company: data.user.company,
    blog: data.user.blog,
  };

  // Render the appropriate personality
  const renderPersonality = () => {
    const props = { portfolio, user, isMobilePreview: false };

    switch (portfolio.personalityType) {
      case 'developer':
        return <DeveloperPersonality {...props} />;
      case 'futuristic':
        return <FuturisticPersonality {...props} />;
      case 'creative':
        return <CreativePersonality {...props} />;
      case 'elegant':
        return <ElegantPersonality {...props} />;

      case 'minimal':
      default:
        return <MinimalPersonality {...props} />;
    }
  };

  return (
    <div className="min-h-screen">
      {renderPersonality()}
    </div>
  );
}
