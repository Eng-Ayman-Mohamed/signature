'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, Twitter, Globe, MapPin, Sparkles, Palette, Brush } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { Portfolio } from '@/store/portfolio-store';
import type { User } from '@/store/auth-store';

interface CreativePersonalityProps {
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

export function CreativePersonality({ portfolio, user, isMobilePreview }: CreativePersonalityProps) {
  const { content, projects, experiences, educations, skills, accentColor, layoutOrder, reduceMotion: portfolioReduceMotion } = portfolio;
  const { resolvedTheme } = useTheme();
  const systemReduceMotion = useReducedMotion();
  
  // Respect both portfolio setting and system preference
  const reduceMotion = portfolioReduceMotion || systemReduceMotion;

  const visibleProjects = projects.filter(p => p.isVisible);
  const visibleExperiences = experiences.filter(e => e.isVisible);
  const visibleEducations = educations.filter(e => e.isVisible);
  const visibleSkills = skills.filter(s => s.isVisible);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, rotate: -3 },
    visible: { 
      opacity: 1, 
      y: 0, 
      rotate: 0,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  // Parse layout order
  const orderedSections = useMemo(() => {
    const order = layoutOrder?.split(',').filter(Boolean) as SectionId[] || [];
    const defaultOrder: SectionId[] = ['about', 'experience', 'education', 'projects', 'skills', 'contact'];
    const allSections = new Set([...order, ...defaultOrder]);
    return Array.from(allSections);
  }, [layoutOrder]);

  // Render About Section (Hero)
  const renderAboutSection = () => (
    <header key="about" className="pt-16 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col md:flex-row items-center gap-8 md:gap-12"
        >
          {/* Avatar with creative border - hidden on mobile */}
          <motion.div 
            key={`avatar-${accentColor}`}
            variants={itemVariants}
            className={`relative ${isMobilePreview ? 'hidden' : 'hidden sm:block'}`}
          >
            <div 
              className="absolute inset-0 rounded-full blur-xl opacity-50"
              style={{ backgroundColor: accentColor }}
            />
            <div 
              className="relative w-32 h-32 md:w-40 md:h-40 rounded-full p-1"
              style={{ 
                background: `linear-gradient(135deg, ${accentColor}, #8b5cf6, #ec4899)`,
              }}
            >
              <div className="w-full h-full rounded-full bg-white dark:bg-slate-900 flex items-center justify-center text-4xl md:text-5xl font-bold overflow-hidden">
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'C'
                )}
              </div>
            </div>
            <motion.div
              key={`sparkle-${accentColor}`}
              className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center"
              style={{ backgroundColor: accentColor }}
              initial={{ rotate: 0 }}
              animate={reduceMotion ? {} : { rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
            >
              <Sparkles className="w-5 h-5 text-white" />
            </motion.div>
          </motion.div>

          {/* Info */}
          <motion.div 
            variants={itemVariants}
            className="flex-1 text-center md:text-left"
          >
            <motion.h1 
              key={`title-${accentColor}`}
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
              style={{ 
                background: `linear-gradient(135deg, #1e293b 0%, ${accentColor} 50%, #8b5cf6 100%)`,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              {user?.name || 'Creative Designer'}
            </motion.h1>
            
            <p className="text-xl text-slate-500 dark:text-slate-400 mb-4">
              {content?.jobTitle || user?.company || 'Crafting digital experiences that inspire'}
            </p>

            {(user?.location || user?.blog) && (
              <div className="flex items-center gap-4 justify-center md:justify-start text-sm text-slate-400 dark:text-slate-500 mb-6">
                {user?.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" style={{ color: accentColor }} />
                    {user.location}
                  </span>
                )}
                {user?.blog && (
                  <a 
                    href={user.blog} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    <Globe className="w-4 h-4" style={{ color: accentColor }} />
                    Website
                  </a>
                )}
              </div>
            )}

            {content?.aboutText && (
              <p className="text-slate-600 dark:text-slate-300 text-lg leading-relaxed mb-6 max-w-xl">
                {content.aboutText}
              </p>
            )}

            {/* Social Links */}
            <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
              {content?.githubUrl && (
                <a
                  href={content.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
              {content?.linkedinUrl && (
                <a
                  href={content.linkedinUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {content?.twitterUrl && (
                <a
                  href={content.twitterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
              {content?.contactEmail && (
                <a
                  href={`mailto:${content.contactEmail}`}
                  className="px-6 py-3 rounded-full text-white font-medium transition-all hover:scale-105"
                  style={{ backgroundColor: accentColor }}
                >
                  <Mail className="w-4 h-4 inline mr-2" />
                  Let's Talk
                </a>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </header>
  );

  // Render Contact Section
  const renderContactSection = () => (
    <section key="contact" className="py-8 md:py-16 px-4 md:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-6 md:mb-12">
            <div 
              className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0"
              style={{ backgroundColor: `${accentColor}15` }}
            >
              <Mail className="w-4 h-4 md:w-6 md:h-6" style={{ color: accentColor }} />
            </div>
            <h2 className="text-xl md:text-3xl font-bold">Contact</h2>
          </div>

          <div className="flex flex-wrap gap-3">
            {content?.contactEmail && (
              <a
                href={`mailto:${content.contactEmail}`}
                className="px-5 py-3 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all"
                style={{ borderLeftWidth: '3px', borderLeftColor: accentColor }}
              >
                <Mail className="w-5 h-5 inline mr-2" style={{ color: accentColor }} />
                Email
              </a>
            )}
            {content?.githubUrl && (
              <a
                href={content.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all"
                style={{ borderLeftWidth: '3px', borderLeftColor: accentColor }}
              >
                <Github className="w-5 h-5 inline mr-2" style={{ color: accentColor }} />
                GitHub
              </a>
            )}
            {content?.linkedinUrl && (
              <a
                href={content.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all"
                style={{ borderLeftWidth: '3px', borderLeftColor: accentColor }}
              >
                <Linkedin className="w-5 h-5 inline mr-2" style={{ color: accentColor }} />
                LinkedIn
              </a>
            )}
            {content?.twitterUrl && (
              <a
                href={content.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all"
                style={{ borderLeftWidth: '3px', borderLeftColor: accentColor }}
              >
                <Twitter className="w-5 h-5 inline mr-2" style={{ color: accentColor }} />
                Twitter
              </a>
            )}
            {content?.websiteUrl && (
              <a
                href={content.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-3 rounded-xl bg-white dark:bg-slate-900 shadow-md border border-slate-100 dark:border-slate-800 hover:shadow-lg transition-all"
                style={{ borderLeftWidth: '3px', borderLeftColor: accentColor }}
              >
                <Globe className="w-5 h-5 inline mr-2" style={{ color: accentColor }} />
                Website
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );

  // Render Experience Section
  const renderExperienceSection = () => {
    if (visibleExperiences.length === 0) return null;
    return (
      <section key="experience" className="py-8 md:py-16 px-4 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6 md:mb-12">
              <div 
                className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Palette className="w-4 h-4 md:w-6 md:h-6" style={{ color: accentColor }} />
              </div>
              <h2 className="text-xl md:text-3xl font-bold">Experience</h2>
            </div>

            <div className={`grid gap-3 md:gap-6 ${isMobilePreview ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {visibleExperiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20, rotate: index % 2 === 0 ? -2 : 2 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, rotate: index % 2 === 0 ? 1 : -1 }}
                  className="p-3 md:p-6 bg-white dark:bg-slate-900 rounded-lg md:rounded-2xl shadow-md md:shadow-lg border border-slate-100 dark:border-slate-800 min-w-0"
                  style={{ borderLeftWidth: '3px', borderLeftColor: accentColor }}
                >
                  <div className="flex flex-col gap-1 md:gap-0 md:flex-row md:items-start md:justify-between md:mb-3">
                    <div className="min-w-0">
                      <h3 className="text-sm md:text-lg font-semibold truncate">{exp.role}</h3>
                      <p style={{ color: accentColor }} className="font-medium text-xs md:text-sm">
                        {exp.company}
                      </p>
                    </div>
                    <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 md:px-3 md:py-1 rounded-full whitespace-nowrap shrink-0 w-fit">
                      {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 md:mt-0">{exp.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  // Render Education Section
  const renderEducationSection = () => {
    if (visibleEducations.length === 0) return null;
    return (
      <section key="education" className="py-8 md:py-16 px-4 md:px-6 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6 md:mb-12">
              <div 
                className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Sparkles className="w-4 h-4 md:w-6 md:h-6" style={{ color: accentColor }} />
              </div>
              <h2 className="text-xl md:text-3xl font-bold">Education</h2>
            </div>

            <div className="space-y-4">
              {visibleEducations.map((edu, index) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 20, rotate: index % 2 === 0 ? -2 : 2 }}
                  whileInView={{ opacity: 1, y: 0, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5, rotate: index % 2 === 0 ? 1 : -1 }}
                  className="p-3 md:p-6 bg-white dark:bg-slate-900 rounded-lg md:rounded-2xl shadow-md md:shadow-lg border border-slate-100 dark:border-slate-800 min-w-0"
                  style={{ borderLeftWidth: '3px', borderLeftColor: accentColor }}
                >
                  <div className="flex flex-col gap-1 md:gap-0 md:flex-row md:items-start md:justify-between md:mb-3">
                    <div className="min-w-0">
                      <h3 className="text-sm md:text-lg font-semibold truncate">
                        {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                      </h3>
                      <p style={{ color: accentColor }} className="font-medium text-xs md:text-sm">
                        {edu.institution}
                      </p>
                    </div>
                    <span className="text-[10px] md:text-xs text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 md:px-3 md:py-1 rounded-full whitespace-nowrap shrink-0 w-fit">
                      {edu.startDate} - {edu.isCurrent ? 'Present' : edu.endDate}
                    </span>
                  </div>
                  {edu.description && (
                    <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 md:mt-0">{edu.description}</p>
                  )}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  // Render Projects Section
  const renderProjectsSection = () => {
    if (visibleProjects.length === 0) return null;
    return (
      <section key="projects" className="py-8 md:py-16 px-4 md:px-6 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-6 md:mb-12">
              <div 
                className="w-8 h-8 md:w-12 md:h-12 rounded-lg md:rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Brush className="w-4 h-4 md:w-6 md:h-6" style={{ color: accentColor }} />
              </div>
              <h2 className="text-xl md:text-3xl font-bold">Projects</h2>
            </div>

            <div className={`grid gap-3 md:gap-6 ${isMobilePreview ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {visibleProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group bg-white dark:bg-slate-900 rounded-lg md:rounded-2xl overflow-hidden shadow-md md:shadow-lg border border-slate-100 dark:border-slate-800 cursor-pointer min-w-0"
                  onClick={() => project.url && window.open(project.url, '_blank')}
                >
                  {/* Project Image */}
                  <div 
                    className="aspect-video relative overflow-hidden"
                  >
                    <img
                      src={project.imageUrl || 'https://placehold.co/400x225/png'}
                      alt={project.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x225/png';
                      }}
                    />
                    <div 
                      className="absolute inset-0 opacity-30 group-hover:opacity-50 transition-opacity"
                      style={{ 
                        background: `linear-gradient(135deg, ${accentColor}40, #8b5cf630)`,
                      }}
                    />
                  </div>
                  
                  <div className="p-2.5 md:p-5">
                    <div className="flex items-start justify-between gap-1 md:gap-2 mb-1 md:mb-2">
                      <h3 className="font-semibold text-xs md:text-base group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors truncate">
                        {project.title}
                      </h3>
                    </div>
                    {project.description && (
                      <p className="text-[10px] md:text-sm text-slate-500 dark:text-slate-400 mb-2 md:mb-3 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex items-center flex-wrap gap-1 md:gap-2 text-[10px] md:text-xs">
                      {project.githubLanguage && (
                        <span 
                          className="px-1.5 py-0.5 md:px-2 md:py-1 rounded-full"
                          style={{ backgroundColor: `${accentColor}15`, color: accentColor }}
                        >
                          {project.githubLanguage}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
    );
  };

  // Render Skills Section
  const renderSkillsSection = () => {
    if (visibleSkills.length === 0) return null;
    return (
      <section key="skills" className="py-12 md:py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-4 mb-8 md:mb-12">
              <div 
                className="w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${accentColor}15` }}
              >
                <Sparkles className="w-5 h-6 md:w-6 md:h-6" style={{ color: accentColor }} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold">Skills</h2>
            </div>

            <div className="flex flex-wrap gap-2 md:gap-3">
              {visibleSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ 
                    delay: index * 0.03,
                    type: 'spring',
                    stiffness: 200,
                  }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="px-4 md:px-5 py-2 md:py-2.5 rounded-full font-medium cursor-default text-sm"
                  style={{ 
                    backgroundColor: index % 3 === 0 ? `${accentColor}15` : 
                      index % 3 === 1 ? '#8b5cf615' : '#ec489915',
                    color: index % 3 === 0 ? accentColor : 
                      index % 3 === 1 ? '#8b5cf6' : '#ec4899',
                  }}
                >
                  {skill.name}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>
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
    <div className="min-h-full w-full bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden relative flex flex-col">

      {/* Decorative Elements - disabled when reduceMotion is true */}
      {!reduceMotion && (
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <motion.div
            key={`accent-blob-${accentColor}`}
            className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-30"
            style={{ backgroundColor: accentColor }}
            initial={{ scale: 1, rotate: 0 }}
            animate={{ 
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full blur-3xl opacity-20"
            style={{ backgroundColor: '#8b5cf6' }}
            animate={{ 
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
          />
          <motion.div
            className="absolute top-1/2 left:1/2 w-64 h-64 rounded-full blur-2xl opacity-10"
            style={{ backgroundColor: '#ec4899' }}
            animate={{ 
              x: ['-50%', '-30%', '-50%'],
              y: ['-50%', '-70%', '-50%'],
            }}
            transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
          />
        </div>
      )}

      {/* Main Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Render sections in order */}
        <div className="flex-1">
          {orderedSections.map((sectionId) => sectionRenderers[sectionId]?.())}
        </div>

        {/* Footer */}
        <footer className="py-8 md:py-12 px-6 border-t border-slate-200 dark:border-slate-800 mt-auto">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-slate-400 dark:text-slate-500 text-sm">
              © {new Date().getFullYear()} {user?.name || 'Creative Portfolio'}
              <span className="mx-2">•</span>
              <span style={{ color: accentColor }}>Made with love</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
