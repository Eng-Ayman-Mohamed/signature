'use client';

import { useMemo, useSyncExternalStore } from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, Twitter, Globe, FileText, MapPin, Calendar, ExternalLink, Star, GitFork, Terminal, ChevronRight, Image } from 'lucide-react';
import { useTheme } from 'next-themes';
import type { Portfolio } from '@/store/portfolio-store';
import type { User } from '@/store/auth-store';

interface DeveloperPersonalityProps {
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

export function DeveloperPersonality({ portfolio, user, isMobilePreview }: DeveloperPersonalityProps) {
  const { content, projects, experiences, educations, skills, accentColor, density, layoutOrder, reduceMotion: portfolioReduceMotion } = portfolio;
  const { resolvedTheme } = useTheme();
  const systemReduceMotion = useReducedMotion();
  
  // Respect both portfolio setting and system preference
  const reduceMotion = portfolioReduceMotion || systemReduceMotion;
  
  const densityClasses = {
    compact: 'py-4 px-4 gap-4',
    normal: 'py-8 px-6 gap-6',
    spacious: 'py-12 px-8 gap-8',
  };

  const sectionSpacing = {
    compact: 'mb-6',
    normal: 'mb-10',
    spacious: 'mb-14',
  };

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

  // Render About Section (Hero)
  const renderAboutSection = () => (
    <motion.header key="about" {...fadeInUp} className="border-b border-slate-200 dark:border-slate-800">
      <div className={`max-w-6xl mx-auto ${densityClasses.normal}`}>
        <div className="mb-6">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400 text-sm mb-2">
            <Terminal className="w-4 h-4" />
            <span>intro.sh</span>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-emerald-500">$</span>
              <span className="text-slate-700 dark:text-slate-300">cat about.md</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-blue-500">const</span>
                <span className="text-yellow-600">name</span>
                <span className="text-slate-500 dark:text-slate-400">=</span>
                <span className="text-emerald-600">"{user?.name || 'Developer'}"</span>
                <span className="text-slate-500 dark:text-slate-400">;</span>
              </div>
              {user?.location && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">const</span>
                  <span className="text-yellow-600">location</span>
                  <span className="text-slate-500 dark:text-slate-400">=</span>
                  <span className="text-emerald-600">"{user.location}"</span>
                  <span className="text-slate-500 dark:text-slate-400">;</span>
                </div>
              )}
              {user?.company && (
                <div className="flex items-center gap-2">
                  <span className="text-blue-500">const</span>
                  <span className="text-yellow-600">company</span>
                  <span className="text-slate-500 dark:text-slate-400">=</span>
                  <span className="text-emerald-600">"{user.company}"</span>
                  <span className="text-slate-500 dark:text-slate-400">;</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {content?.aboutText && (
          <div className="bg-white dark:bg-slate-800/30 rounded-lg p-4 border border-slate-200 dark:border-slate-700/50 shadow-sm mb-6">
            <div className="text-slate-600 dark:text-slate-400 text-sm mb-2">
              <span className="text-emerald-500">$</span> echo $BIO
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {content.aboutText}
            </p>
          </div>
        )}
      </div>
    </motion.header>
  );

  // Render Contact Section
  const renderContactSection = () => (
    <motion.section
      key="contact"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={sectionSpacing[density]}
    >
      <div className={`max-w-6xl mx-auto ${densityClasses.normal}`}>
        <div className="flex items-center gap-2 mb-4">
          <ChevronRight className="w-5 h-5" style={{ color: accentColor }} />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">contact.json</h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {content?.contactEmail && (
            <a
              href={`mailto:${content.contactEmail}`}
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <Mail className="w-4 h-4 text-emerald-500" />
              email
            </a>
          )}
          {content?.githubUrl && (
            <a
              href={content.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <Github className="w-4 h-4 text-emerald-500" />
              github
            </a>
          )}
          {content?.linkedinUrl && (
            <a
              href={content.linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <Linkedin className="w-4 h-4 text-emerald-500" />
              linkedin
            </a>
          )}
          {content?.twitterUrl && (
            <a
              href={content.twitterUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <Twitter className="w-4 h-4 text-emerald-500" />
              twitter
            </a>
          )}
          {content?.websiteUrl && (
            <a
              href={content.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <Globe className="w-4 h-4 text-emerald-500" />
              website
            </a>
          )}
          {content?.resumeUrl && (
            <a
              href={content.resumeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded text-sm text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <FileText className="w-4 h-4 text-emerald-500" />
              resume
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
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={sectionSpacing[density]}
      >
        <div className={`max-w-6xl mx-auto ${densityClasses.normal}`}>
          <div className="flex items-center gap-2 mb-4">
            <ChevronRight className="w-5 h-5" style={{ color: accentColor }} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">experience.log</h2>
          </div>
          <div className="space-y-4">
            {visibleExperiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                className="bg-white dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-emerald-600">{exp.role}</span>
                    <span className="text-slate-500 dark:text-slate-400"> @ </span>
                    <span className="text-yellow-600">{exp.company}</span>
                  </div>
                  <span className="text-xs text-slate-500 whitespace-nowrap">
                    {exp.startDate} → {exp.isCurrent ? 'now' : exp.endDate}
                  </span>
                </div>
                {exp.location && (
                  <div className="text-xs text-slate-500 mb-2">
                    <MapPin className="w-3 h-3 inline mr-1" />
                    {exp.location}
                  </div>
                )}
                {exp.description && (
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-2 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                    {exp.description}
                  </p>
                )}
              </motion.div>
            ))}
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
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className={sectionSpacing[density]}
      >
        <div className={`max-w-6xl mx-auto ${densityClasses.normal}`}>
          <div className="flex items-center gap-2 mb-4">
            <ChevronRight className="w-5 h-5" style={{ color: accentColor }} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">education.json</h2>
          </div>
          <div className="space-y-4">
            {visibleEducations.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="bg-white dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm"
              >
                <div className="text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{'{'}</span>
                </div>
                <div className="pl-4 space-y-1 text-sm">
                  <div>
                    <span className="text-blue-500">"degree"</span>
                    <span className="text-slate-500 dark:text-slate-400">: </span>
                    <span className="text-emerald-600">"{edu.degree}"</span>
                  </div>
                  {edu.field && (
                    <div>
                      <span className="text-blue-500">"field"</span>
                      <span className="text-slate-500 dark:text-slate-400">: </span>
                      <span className="text-emerald-600">"{edu.field}"</span>
                    </div>
                  )}
                  <div>
                    <span className="text-blue-500">"institution"</span>
                    <span className="text-slate-500 dark:text-slate-400">: </span>
                    <span className="text-emerald-600">"{edu.institution}"</span>
                  </div>
                  <div>
                    <span className="text-blue-500">"period"</span>
                    <span className="text-slate-500 dark:text-slate-400">: </span>
                    <span className="text-emerald-600">"{edu.startDate} - {edu.isCurrent ? 'Present' : edu.endDate}"</span>
                  </div>
                  {edu.description && (
                    <div>
                      <span className="text-blue-500">"notes"</span>
                      <span className="text-slate-500 dark:text-slate-400">: </span>
                      <span className="text-slate-500 dark:text-slate-400">"{edu.description}"</span>
                    </div>
                  )}
                </div>
                <div className="text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{'}'}</span>
                </div>
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
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={sectionSpacing[density]}
      >
        <div className={`max-w-6xl mx-auto ${densityClasses.normal}`}>
          <div className="flex items-center gap-2 mb-4">
            <ChevronRight className="w-5 h-5" style={{ color: accentColor }} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">projects/</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visibleProjects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.05 }}
                className="bg-white dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:border-slate-300 dark:hover:border-slate-600 transition-colors group cursor-pointer min-w-0 overflow-hidden"
                onClick={() => project.url && window.open(project.url, '_blank')}
              >
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
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
                  <div className="absolute bottom-2 left-3 right-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-slate-400 text-xs shrink-0 hidden sm:inline">~/projects/</span>
                      <span className="text-emerald-400 font-medium truncate text-sm">{project.title}</span>
                    </div>
                  </div>
                </div>
                
                <div className="p-4">
                  {project.description && (
                    <p className="text-sm text-slate-600 dark:text-slate-400 mb-3 line-clamp-2"># {project.description}</p>
                  )}
                  <div className="flex items-center flex-wrap gap-2 text-xs text-slate-500">
                    {project.githubLanguage && (
                      <span
                        className="px-2 py-0.5 rounded"
                        style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                      >
                        {project.githubLanguage}
                      </span>
                    )}
                    {project.githubStars !== null && project.githubStars > 0 && (
                      <span className="flex items-center gap-0.5">
                        <Star className="w-3 h-3" />
                        {project.githubStars}
                      </span>
                    )}
                    {project.githubForks !== null && project.githubForks > 0 && (
                      <span className="flex items-center gap-0.5">
                        <GitFork className="w-3 h-3" />
                        {project.githubForks}
                      </span>
                    )}
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
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className={sectionSpacing[density]}
      >
        <div className={`max-w-6xl mx-auto ${densityClasses.normal}`}>
          <div className="flex items-center gap-2 mb-4">
            <ChevronRight className="w-5 h-5" style={{ color: accentColor }} />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">skills.yaml</h2>
          </div>
          <div className="bg-white dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-700 shadow-sm">
            <div className="space-y-4">
              {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                <div key={category}>
                  <div className="text-sm text-slate-500 dark:text-slate-600 mb-2">
                    <span className="text-blue-500">{category}</span>:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {categorySkills.map((skill) => (
                      <span
                        key={skill.id}
                        className="px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-700/50 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600"
                      >
                        {skill.name}
                        <span className="ml-1 text-yellow-500">
                          {'★'.repeat(Math.min(skill.proficiency, 5))}
                        </span>
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
    <div className="min-h-full w-full bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-mono relative flex flex-col">

      {/* Terminal Header - Sticky */}
      <div className="sticky top-0 z-40 bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
            </div>
            <span className="ml-3 text-sm text-slate-600 dark:text-slate-400 truncate">
              {user?.name?.toLowerCase().replace(/\s+/g, '-') || 'user'}@portfolio ~ %
            </span>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            {content?.githubUrl && (
              <a
                href={content.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-300 dark:bg-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-400 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white transition-all"
                title="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
            )}
            {content?.contactEmail && (
              <a
                href={`mailto:${content.contactEmail}`}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90"
                style={{ backgroundColor: accentColor }}
              >
                <Mail className="w-4 h-4" />
                <span className="hidden sm:inline">Contact</span>
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Render sections in order */}
      <div className="flex-1">
        {orderedSections.map((sectionId) => sectionRenderers[sectionId]?.())}
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 mt-auto">
        <div className="max-w-6xl mx-auto py-6 px-6">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
            <span className="text-emerald-500">$</span>
            <span>echo "Built with Portfolio Generator"</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
