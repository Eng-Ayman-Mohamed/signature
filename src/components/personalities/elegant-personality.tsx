'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, Twitter, Globe, MapPin, Heart, Feather, Gem } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { Portfolio } from '@/store/portfolio-store';
import type { User } from '@/store/auth-store';

interface ElegantPersonalityProps {
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

export function ElegantPersonality({ portfolio, user, isMobilePreview }: ElegantPersonalityProps) {
  const { content, projects, experiences, educations, skills, accentColor, density, layoutOrder, reduceMotion: portfolioReduceMotion } = portfolio;
  const { resolvedTheme } = useTheme();
  const systemReduceMotion = useReducedMotion();
  
  // Respect both portfolio setting and system preference
  const reduceMotion = portfolioReduceMotion || systemReduceMotion;

  // Density classes for spacing
  const densityClasses = {
    compact: 'py-8 md:py-12',
    normal: 'py-12 md:py-20',
    spacious: 'py-16 md:py-24',
  };

  const sectionSpacing = {
    compact: 'mb-6',
    normal: 'mb-10',
    spacious: 'mb-14',
  };

  // Animation variants - respect reduceMotion
  const fadeInUp = reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.5 },
      };

  const visibleProjects = projects.filter(p => p.isVisible);
  const visibleExperiences = experiences.filter(e => e.isVisible);
  const visibleEducations = educations.filter(e => e.isVisible);
  const visibleSkills = skills.filter(s => s.isVisible);

  // Soft pastel colors
  const pastelAccent = `${accentColor}60`;

  // Parse layout order
  const orderedSections = useMemo(() => {
    const order = layoutOrder?.split(',').filter(Boolean) as SectionId[] || [];
    const defaultOrder: SectionId[] = ['about', 'experience', 'education', 'projects', 'skills', 'contact'];
    const allSections = new Set([...order, ...defaultOrder]);
    return Array.from(allSections);
  }, [layoutOrder]);

  // Render About Section (Hero)
  const renderAboutSection = () => (
    <header key="about" className={`${densityClasses[density]} px-6 text-center`}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={reduceMotion ? {} : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { duration: 0.8 }}
        >
          {/* Decorative element */}
          <motion.div 
            className="flex items-center justify-center gap-4 mb-6 md:mb-8"
            initial={reduceMotion ? {} : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={reduceMotion ? { duration: 0 } : { delay: 0.3 }}
          >
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: pastelAccent }} />
            <Gem className="w-4 h-4 md:w-5 md:h-5" style={{ color: accentColor }} />
            <div className="w-12 md:w-16 h-px" style={{ backgroundColor: pastelAccent }} />
          </motion.div>

          {/* Name */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-normal mb-4 md:mb-6 tracking-wide text-slate-800 dark:text-slate-100">
            {user?.name || 'Elegant Designer'}
          </h1>

          {/* Tagline */}
          <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 mb-6 md:mb-8 italic">
            {content?.jobTitle || user?.company || 'Creating meaningful experiences through thoughtful design'}
          </p>

          {/* Bio */}
          {content?.aboutText && (
            <p className="text-base md:text-lg text-slate-600 dark:text-slate-300 leading-relaxed max-w-2xl mx-auto mb-8 md:mb-10">
              {content.aboutText}
            </p>
          )}

          {/* Location */}
          {user?.location && (
            <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-500 text-sm mb-8">
              <MapPin className="w-4 h-4" />
              {user.location}
            </div>
          )}

          {/* Social Links */}
          <div className="flex items-center justify-center gap-4">
            {content?.githubUrl && (
              <a
                href={content.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <Github className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </a>
            )}
            {content?.linkedinUrl && (
              <a
                href={content.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <Linkedin className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </a>
            )}
            {content?.twitterUrl && (
              <a
                href={content.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <Twitter className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </a>
            )}
            {content?.websiteUrl && (
              <a
                href={content.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-full border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <Globe className="w-5 h-5 text-slate-500 dark:text-slate-400" />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  );

  // Render Contact Section
  const renderContactSection = () => (
    <section key="contact" className={`${densityClasses[density]} px-6`}>
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <h2 className="text-xl md:text-2xl mb-8 md:mb-12 tracking-wide">
            <span className="text-slate-400 dark:text-slate-500">Contact</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-4">
            {content?.contactEmail && (
              <a
                href={`mailto:${content.contactEmail}`}
                className="px-5 py-2 rounded-full text-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                style={{ borderColor: accentColor, color: accentColor }}
              >
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </a>
            )}
            {content?.githubUrl && (
              <a
                href={content.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-full text-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <Github className="w-4 h-4 inline mr-2" />
                GitHub
              </a>
            )}
            {content?.linkedinUrl && (
              <a
                href={content.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-full text-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <Linkedin className="w-4 h-4 inline mr-2" />
                LinkedIn
              </a>
            )}
            {content?.twitterUrl && (
              <a
                href={content.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-full text-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <Twitter className="w-4 h-4 inline mr-2" />
                Twitter
              </a>
            )}
            {content?.websiteUrl && (
              <a
                href={content.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2 rounded-full text-sm border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <Globe className="w-4 h-4 inline mr-2" />
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
      <section key="experience" className={`${densityClasses[density]} px-6`}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl md:text-2xl text-center mb-8 md:mb-12 tracking-wide">
              <span className="text-slate-400 dark:text-slate-500">Experience</span>
            </h2>

            <div className="space-y-6 md:space-y-8">
              {visibleExperiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-6 md:pl-8 pb-6 md:pb-8 border-l-2 min-w-0"
                  style={{ borderColor: pastelAccent }}
                >
                  {/* Dot */}
                  <div 
                    className="absolute left-0 top-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full -translate-x-[5px] md:-translate-x-[7px]"
                    style={{ backgroundColor: accentColor }}
                  />
                  
                  <div className="mb-2">
                    <h3 className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200 truncate">{exp.role}</h3>
                    <p style={{ color: accentColor }} className="text-sm">
                      {exp.company}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic mb-3 block">
                    {exp.startDate} — {exp.isCurrent ? 'Present' : exp.endDate}
                  </span>
                  {exp.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">{exp.description}</p>
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
      <section key="education" className={`${densityClasses[density]} px-6 bg-white/30 dark:bg-slate-900/30`}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl md:text-2xl text-center mb-8 md:mb-12 tracking-wide">
              <span className="text-slate-400 dark:text-slate-500">Education</span>
            </h2>

            <div className="space-y-6 md:space-y-8">
              {visibleEducations.map((edu, index) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="relative pl-6 md:pl-8 pb-6 md:pb-8 border-l-2 min-w-0"
                  style={{ borderColor: pastelAccent }}
                >
                  {/* Dot */}
                  <div 
                    className="absolute left-0 top-0 w-2.5 h-2.5 md:w-3 md:h-3 rounded-full -translate-x-[5px] md:-translate-x-[7px]"
                    style={{ backgroundColor: accentColor }}
                  />
                  
                  <div className="mb-2">
                    <h3 className="text-lg md:text-xl font-medium text-slate-800 dark:text-slate-200 truncate">
                      {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                    </h3>
                    <p style={{ color: accentColor }} className="text-sm">
                      {edu.institution}
                    </p>
                  </div>
                  <span className="text-xs text-slate-400 dark:text-slate-500 italic mb-3 block">
                    {edu.startDate} — {edu.isCurrent ? 'Present' : edu.endDate}
                  </span>
                  {edu.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2">{edu.description}</p>
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
      <section key="projects" className={`${densityClasses[density]} px-6 bg-white/30 dark:bg-slate-900/30`}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-xl md:text-2xl text-center mb-8 md:mb-12 tracking-wide">
              <span className="text-slate-400 dark:text-slate-500">Selected Work</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
              {visibleProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="group cursor-pointer min-w-0"
                  onClick={() => project.url && window.open(project.url, '_blank')}
                >
                  {/* Project Card */}
                  <div className="aspect-video rounded-lg overflow-hidden mb-4 bg-slate-100 dark:bg-slate-800 relative">
                    <img
                      src={project.imageUrl || 'https://placehold.co/400x225/png'}
                      alt={project.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://placehold.co/400x225/png';
                      }}
                    />
                    <div 
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity"
                      style={{ backgroundColor: accentColor }}
                    />
                  </div>
                  
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-medium text-slate-800 dark:text-slate-200 group-hover:text-slate-600 dark:group-hover:text-slate-400 transition-colors truncate">
                        {project.title}
                      </h3>
                      {project.description && (
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{project.description}</p>
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
      <section key="skills" className={`${densityClasses[density]} px-6`}>
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center"
          >
            <h2 className="text-xl md:text-2xl mb-8 md:mb-12 tracking-wide">
              <span className="text-slate-400 dark:text-slate-500">Expertise</span>
            </h2>

            <div className="flex flex-wrap justify-center gap-2 md:gap-3">
              {visibleSkills.map((skill, index) => (
                <motion.span
                  key={skill.id}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.03 }}
                  className="px-4 md:px-5 py-1.5 md:py-2 rounded-full text-sm text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
                >
                  {skill.name}
                </motion.span>
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
    <div 
      className="min-h-full w-full text-slate-800 dark:text-slate-200 relative flex flex-col"
      style={{ 
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      {/* Background - using CSS variables for theme switching */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#fefefe] via-[#f8f6f4] to-[#f5f2ef] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 -z-10" />
      

      {/* Subtle pattern overlay */}
      <div 
        className="fixed inset-0 pointer-events-none opacity-30"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${accentColor}15 1px, transparent 0)`,
          backgroundSize: '40px 40px',
        }}
      />

      {/* Main Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Navigation - Sticky */}
        <nav className="sticky top-0 z-40 py-4 px-4 border-b border-slate-200/50 dark:border-slate-800/50 bg-gradient-to-b from-white via-white to-transparent dark:from-slate-950 dark:via-slate-950 dark:to-transparent backdrop-blur-sm">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {/* Avatar */}
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden shrink-0 ring-2"
                style={{ borderColor: accentColor }}
              >
                {user?.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user?.name || 'Profile'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-sm font-semibold" style={{ color: accentColor }}>
                    {user?.name?.[0] || 'E'}
                  </span>
                )}
              </div>
              <span className="text-sm md:text-lg tracking-wide text-slate-800 dark:text-slate-100 truncate">{user?.name || 'Portfolio'}</span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              {/* GitHub - icon only on mobile */}
              {content?.githubUrl && (
                <a 
                  href={content.githubUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="GitHub"
                >
                  <Github className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </a>
              )}
              {/* LinkedIn - icon only on mobile */}
              {content?.linkedinUrl && (
                <a 
                  href={content.linkedinUrl} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-5 h-5 text-slate-500 dark:text-slate-400" />
                </a>
              )}
              {/* Contact */}
              {content?.contactEmail && (
                <a
                  href={`mailto:${content.contactEmail}`}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm transition-colors text-white"
                  style={{ backgroundColor: accentColor }}
                >
                  <Mail className="w-4 h-4" />
                  <span className="hidden sm:inline">Contact</span>
                </a>
              )}
            </div>
          </div>
        </nav>

        {/* Render sections in order */}
        <div className="flex-1">
          {orderedSections.map((sectionId) => sectionRenderers[sectionId]?.())}
        </div>

        {/* Footer */}
        <footer className="py-10 md:py-16 px-4 border-t border-slate-200/50 dark:border-slate-800/50 mt-auto">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div 
              className="flex items-center justify-center gap-4 mb-6"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <div className="w-10 md:w-12 h-px" style={{ backgroundColor: pastelAccent }} />
              <Heart className="w-4 h-4" style={{ color: accentColor }} />
              <div className="w-10 md:w-12 h-px" style={{ backgroundColor: pastelAccent }} />
            </motion.div>
            <p className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">
              <span style={{ color: accentColor }}>Crafted with care</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
