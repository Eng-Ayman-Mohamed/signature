'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, Twitter, Globe, FileText, MapPin, Building, Calendar, Star, GitFork, ArrowUpRight, Briefcase, GraduationCap, Code, Send, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { Portfolio } from '@/store/portfolio-store';
import type { User } from '@/store/auth-store';

interface MinimalPersonalityProps {
  portfolio: Portfolio;
  user: User | null;
  isMobilePreview?: boolean;
}

type SectionId = 'about' | 'experience' | 'education' | 'projects' | 'skills' | 'contact';

// Custom hook for reduced motion preference
function useReducedMotion() {
  return useSyncExternalStore(
    (callback) => {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      mediaQuery.addEventListener('change', callback);
      return () => mediaQuery.removeEventListener('change', callback);
    },
    () => window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    () => false // Server-side default
  );
}

// Section Header Component - defined OUTSIDE main component to prevent Fast Refresh issues
function SectionHeader({ icon: Icon, title, accentColor }: { icon: React.ElementType; title: string; accentColor: string }) {
  return (
    <div className="flex items-center gap-3 mb-6 md:mb-8">
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${accentColor}10` }}
      >
        <Icon className="w-5 h-5" style={{ color: accentColor }} />
      </div>
      <h2 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
        {title}
      </h2>
    </div>
  );
}

export function MinimalPersonality({ portfolio, user, isMobilePreview }: MinimalPersonalityProps) {
  const { content, projects, experiences, educations, skills, accentColor, density, layoutOrder, reduceMotion: portfolioReduceMotion } = portfolio;
  const { resolvedTheme } = useTheme();
  const systemReduceMotion = useReducedMotion();
  
  // Respect both portfolio setting and system preference
  const reduceMotion = portfolioReduceMotion || systemReduceMotion;

  const densityClasses = {
    compact: 'py-4 gap-4',
    normal: 'py-6 gap-4',
    spacious: 'py-8 gap-6',
  };

  const sectionSpacing = {
    compact: 'mb-8',
    normal: 'mb-16',
    spacious: 'mb-20',
  };

  const visibleProjects = projects.filter(p => p.isVisible);
  const visibleExperiences = experiences.filter(e => e.isVisible);
  const visibleEducations = educations.filter(e => e.isVisible);
  const visibleSkills = skills.filter(s => s.isVisible);

  // Group skills by category
  const groupedSkills = visibleSkills.reduce((acc, skill) => {
    const category = skill.category || 'technical';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, typeof visibleSkills>);

  // Parse layout order
  const orderedSections = useMemo(() => {
    const order = layoutOrder?.split(',').filter(Boolean) as SectionId[] || [];
    const defaultOrder: SectionId[] = ['about', 'experience', 'education', 'projects', 'skills', 'contact'];
    const allSections = new Set([...order, ...defaultOrder]);
    return Array.from(allSections);
  }, [layoutOrder]);

  // Animation variants - respect reduceMotion
  const fadeInUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 }
      };

  // Render About Section (Hero)
  const renderAboutSection = () => (
    <motion.header 
      key="about" 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="pt-12 md:pt-20 pb-8 md:pb-12"
    >
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start gap-8 md:gap-12">
          {/* Avatar */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className={`shrink-0 ${isMobilePreview ? 'hidden' : 'hidden md:block'}`}
          >
            <div 
              className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden shadow-lg ring-4 ring-white dark:ring-slate-800"
              style={{ boxShadow: `0 8px 32px ${accentColor}20` }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center text-4xl font-bold text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  {user?.name?.[0] || 'U'}
                </div>
              )}
            </div>
          </motion.div>

          {/* Info */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.4 }}
            className="flex-1 min-w-0"
          >
            {/* Status Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span 
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
                Available for work
              </span>
            </div>

            {/* Name */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-900 dark:text-white tracking-tight">
              {user?.name || 'Your Name'}
            </h1>

            {/* Title/Role */}
            <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mt-2 font-light">
              {content?.jobTitle || user?.company || 'Software Developer'}
            </p>

            {/* Location & Company */}
            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm text-slate-500 dark:text-slate-400">
              {user?.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4" style={{ color: accentColor }} />
                  {user.location}
                </span>
              )}
              {user?.company && (
                <span className="flex items-center gap-1.5">
                  <Building className="w-4 h-4" style={{ color: accentColor }} />
                  {user.company}
                </span>
              )}
            </div>

            {/* Bio */}
            {content?.aboutText && (
              <p className="mt-6 text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl text-base md:text-lg">
                {content.aboutText}
              </p>
            )}

            {/* Quick Links */}
            <div className="flex flex-wrap items-center gap-3 mt-6">
              {content?.contactEmail && (
                <a
                  href={`mailto:${content.contactEmail}`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-white font-medium text-sm transition-all hover:opacity-90 hover:shadow-lg"
                  style={{ backgroundColor: accentColor }}
                >
                  <Send className="w-4 h-4" />
                  Contact Me
                </a>
              )}
              {content?.githubUrl && (
                <a
                  href={content.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Github className="w-4 h-4" />
                  GitHub
                </a>
              )}
              {content?.linkedinUrl && (
                <a
                  href={content.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Linkedin className="w-4 h-4" />
                  LinkedIn
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );

  // Section Header - now defined outside component
  // Render Contact Section
  const renderContactSection = () => (
    <motion.section 
      key="contact" 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={sectionSpacing[density]}
    >
      <div className="max-w-6xl mx-auto">
        <SectionHeader icon={Send} title="Get in Touch" accentColor={accentColor} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {content?.contactEmail && (
            <a
              href={`mailto:${content.contactEmail}`}
              className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 min-w-0"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${accentColor}10` }}
                >
                  <Mail className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">Email</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{content.contactEmail}</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0" />
            </a>
          )}
          {content?.linkedinUrl && (
            <a
              href={content.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 min-w-0"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${accentColor}10` }}
                >
                  <Linkedin className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">LinkedIn</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">Connect professionally</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0" />
            </a>
          )}
          {content?.githubUrl && (
            <a
              href={content.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 min-w-0"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${accentColor}10` }}
                >
                  <Github className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">GitHub</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">View my projects</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0" />
            </a>
          )}
          {content?.twitterUrl && (
            <a
              href={content.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 min-w-0"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${accentColor}10` }}
                >
                  <Twitter className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">Twitter</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">Follow for updates</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0" />
            </a>
          )}
          {content?.websiteUrl && (
            <a
              href={content.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 min-w-0"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${accentColor}10` }}
                >
                  <Globe className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900 dark:text-white">Website</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400 truncate">Visit my site</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors shrink-0" />
            </a>
          )}
          {content?.resumeUrl && (
            <a
              href={content.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-between p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            >
              <div className="flex items-center gap-4">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${accentColor}10` }}
                >
                  <FileText className="w-5 h-5" style={{ color: accentColor }} />
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Resume</p>
                  <p className="text-sm text-slate-500 dark:text-slate-400">Download my CV</p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            </a>
          )}
        </div>
      </div>
    </motion.section>
  );

  // Render Experience Section
  const renderExperienceSection = () => {
    if (visibleExperiences.length === 0) return null;
    return (
      <motion.section 
        key="experience" 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={sectionSpacing[density]}
      >
        <div className="max-w-6xl mx-auto">
          <SectionHeader icon={Briefcase} title="Experience" accentColor={accentColor} />
          
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-[19px] top-2 bottom-2 w-px bg-slate-200 dark:bg-slate-700" />
            
            <div className="space-y-6">
              {visibleExperiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1, duration: 0.4 }}
                  className="relative flex gap-4"
                >
                  {/* Timeline dot */}
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 z-10 ring-4 ring-white dark:ring-slate-950"
                    style={{ backgroundColor: index === 0 ? accentColor : `${accentColor}20` }}
                  >
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 min-w-0 pb-6">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                          {exp.role}
                        </h3>
                        <p className="text-base font-medium" style={{ color: accentColor }}>
                          {exp.company}
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs text-slate-600 dark:text-slate-400 whitespace-nowrap shrink-0">
                        <Calendar className="w-3 h-3" />
                        {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                      </span>
                    </div>
                    {exp.location && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {exp.location}
                      </p>
                    )}
                    {exp.description && (
                      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">{exp.description}</p>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.section>
    );
  };

  // Render Education Section
  const renderEducationSection = () => {
    if (visibleEducations.length === 0) return null;
    return (
      <motion.section 
        key="education" 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={sectionSpacing[density]}
      >
        <div className="max-w-6xl mx-auto">
          <SectionHeader icon={GraduationCap} title="Education" accentColor={accentColor} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {visibleEducations.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h3 className="font-semibold text-slate-900 dark:text-white">
                    {edu.degree}
                    {edu.field && <span className="font-normal text-slate-500 dark:text-slate-400"> in {edu.field}</span>}
                  </h3>
                </div>
                <p className="text-sm font-medium" style={{ color: accentColor }}>
                  {edu.institution}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {edu.startDate} — {edu.isCurrent ? 'Present' : edu.endDate}
                  </span>
                  {edu.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {edu.location}
                    </span>
                  )}
                </div>
                {edu.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-3">{edu.description}</p>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    );
  };

  // Render Projects Section
  const renderProjectsSection = () => {
    if (visibleProjects.length === 0) return null;
    return (
      <motion.section 
        key="projects" 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={sectionSpacing[density]}
      >
        <div className="max-w-6xl mx-auto">
          <SectionHeader icon={Code} title="Projects" accentColor={accentColor} />
          
          <div className={`grid gap-4 ${isMobilePreview ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
            {visibleProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.05, duration: 0.4 }}
                className="group cursor-pointer"
                onClick={() => project.url && window.open(project.url, '_blank')}
              >
                <div className="h-full rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 hover:shadow-lg transition-all overflow-hidden">
                  {/* Project Image */}
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={project.imageUrl || 'https://placehold.co/400x225/png'}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x225/png';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div className="p-5">
                    {/* Title */}
                    <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-colors mb-2">
                      {project.title}
                    </h3>
                    
                    {/* Description */}
                    {project.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{project.description}</p>
                    )}
                    
                    {/* Tags */}
                    <div className="flex items-center flex-wrap gap-2 mt-auto">
                      {project.githubLanguage && (
                        <span 
                          className="px-2.5 py-1 rounded-lg text-xs font-medium"
                          style={{ backgroundColor: `${accentColor}10`, color: accentColor }}
                        >
                          {project.githubLanguage}
                        </span>
                      )}
                      {project.githubStars !== null && project.githubStars > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Star className="w-3 h-3" />
                          {project.githubStars}
                        </span>
                      )}
                      {project.githubForks !== null && project.githubForks > 0 && (
                        <span className="inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <GitFork className="w-3 h-3" />
                          {project.githubForks}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>
    );
  };

  // Render Skills Section
  const renderSkillsSection = () => {
    if (visibleSkills.length === 0) return null;
    return (
      <motion.section 
        key="skills" 
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className={sectionSpacing[density]}
      >
        <div className="max-w-6xl mx-auto">
          <SectionHeader icon={Code} title="Skills" accentColor={accentColor} />
          
          <div className="space-y-6">
            {Object.entries(groupedSkills).map(([category, categorySkills]) => (
              <div key={category}>
                <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3 capitalize">
                  {category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {categorySkills.map((skill, index) => (
                    <motion.span
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.02, duration: 0.3 }}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-slate-50 dark:bg-slate-800/50 text-slate-700 dark:text-slate-300 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                      style={{ 
                        borderLeft: `3px solid ${accentColor}`,
                      }}
                    >
                      {skill.name}
                    </motion.span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.section>
    );
  };

  // Map section IDs to render functions
  const sectionRenderers: Record<SectionId, () => React.ReactNode> = {
    about: renderAboutSection,
    experience: renderExperienceSection,
    education: renderEducationSection,
    projects: renderProjectsSection,
    skills: renderSkillsSection,
    contact: renderContactSection,
  };

  return (
    <div className="min-h-full w-full bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 relative flex flex-col">
      {/* Subtle background pattern */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-[0.015] dark:opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${accentColor} 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />

      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl border-b border-slate-100 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <div 
              className="w-8 h-8 rounded-lg overflow-hidden shrink-0 ring-2 ring-white dark:ring-slate-800"
              style={{ boxShadow: `0 2px 8px ${accentColor}30` }}
            >
              {user?.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div 
                  className="w-full h-full flex items-center justify-center"
                  style={{ backgroundColor: accentColor }}
                >
                  <span className="text-white font-bold text-sm">
                    {user?.name?.[0] || 'P'}
                  </span>
                </div>
              )}
            </div>
            <span className="font-semibold text-slate-900 dark:text-white truncate">
              {user?.name || 'Portfolio'}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            {content?.githubUrl && (
              <a
                href={content.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {content?.contactEmail && (
              <a
                href={`mailto:${content.contactEmail}`}
                className="inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Contact</span>
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 px-4">
        <div className="max-w-6xl mx-auto">
          {orderedSections.map((sectionId) => sectionRenderers[sectionId]?.())}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-100 dark:border-slate-800 mt-auto px-4">
        <div className="max-w-6xl mx-auto py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div 
                className="w-8 h-8 rounded-lg overflow-hidden ring-2 ring-white dark:ring-slate-800"
                style={{ boxShadow: `0 2px 8px ${accentColor}20` }}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ backgroundColor: `${accentColor}10` }}
                  >
                    <span className="font-bold text-sm" style={{ color: accentColor }}>
                      {user?.name?.[0] || 'P'}
                    </span>
                  </div>
                )}
              </div>
              <span className="text-sm text-slate-500 dark:text-slate-400">
                © {new Date().getFullYear()} {user?.name || 'Portfolio'}
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {content?.githubUrl && (
                <a href={content.githubUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <Github className="w-5 h-5" />
                </a>
              )}
              {content?.linkedinUrl && (
                <a href={content.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {content?.twitterUrl && (
                <a href={content.twitterUrl} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Built with <span style={{ color: accentColor }}>Portfolio Generator</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
