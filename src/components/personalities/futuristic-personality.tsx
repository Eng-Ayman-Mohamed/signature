'use client';

import { useState, useSyncExternalStore, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Mail, Linkedin, Github, Twitter, Globe, MapPin, Building, ExternalLink, Star, Zap, Code2, Terminal, Cpu, Network, Layers, Menu, X } from 'lucide-react';
import { useTheme } from 'next-themes';
import { AnimatedBackground } from '@/components/3d/animated-background';
import type { Portfolio } from '@/store/portfolio-store';
import type { User } from '@/store/auth-store';

interface FuturisticPersonalityProps {
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

// Custom hook for mounted state
function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  );
}

export function FuturisticPersonality({ portfolio, user, isMobilePreview }: FuturisticPersonalityProps) {
  const { content, projects, experiences, educations, skills, accentColor, layoutOrder, reduceMotion: portfolioReduceMotion } = portfolio;
  const mounted = useMounted();
  const [activeSection, setActiveSection] = useState('about');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const systemReduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  
  // Respect both portfolio setting and system preference
  const reduceMotion = portfolioReduceMotion || systemReduceMotion;

  const visibleProjects = projects.filter(p => p.isVisible);
  const visibleExperiences = experiences.filter(e => e.isVisible);
  const visibleEducations = educations.filter(e => e.isVisible);
  const visibleSkills = skills.filter(s => s.isVisible);

  const navItems = [
    { id: 'about', label: 'About', icon: Terminal },
    { id: 'experience', label: 'Experience', icon: Cpu },
    { id: 'projects', label: 'Projects', icon: Layers },
    { id: 'skills', label: 'Skills', icon: Network },
  ];

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(sectionId);
      setMobileMenuOpen(false);
    }
  };

  // Glowing text effect
  const glowStyle = {
    textShadow: `0 0 10px ${accentColor}40, 0 0 20px ${accentColor}20, 0 0 30px ${accentColor}10`,
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
    <header key="about" id="section-about" className={`pt-8 md:pt-20 pb-8 md:pb-16 px-3 md:px-6 ${isMobilePreview ? 'pt-6 pb-6' : ''}`}>
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Avatar */}
          {user?.avatarUrl && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className={`mb-6 ${isMobilePreview ? 'hidden' : ''}`}
            >
              <div 
                className="w-28 h-28 md:w-32 md:h-32 mx-auto rounded-full overflow-hidden border-2 shadow-2xl"
                style={{ 
                  borderColor: `${accentColor}60`,
                  boxShadow: `0 0 30px ${accentColor}30`
                }}
              >
                <img
                  src={user.avatarUrl}
                  alt={user?.name || 'Profile'}
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>
          )}
          
          {/* Status Badge */}
          <motion.div 
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6"
            style={{ backgroundColor: `${accentColor}10`, border: `1px solid ${accentColor}30` }}
            animate={{ scale: [1, 1.02, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentColor }} />
            <span className="text-sm" style={{ color: accentColor }}>
              Available for opportunities
            </span>
          </motion.div>

          {/* Name */}
          <h1 
            className="text-3xl sm:text-4xl md:text-7xl font-bold mb-4"
            style={resolvedTheme === 'dark' ? glowStyle : { color: '#1e293b' }}
          >
            {user?.name || 'Developer'}
          </h1>

          {/* Title/Role */}
          <p className="text-base md:text-2xl text-slate-600 dark:text-slate-400 mb-4 md:mb-6">
            <span style={{ color: accentColor }}>{"{"}</span>
            {" "}
            {content?.jobTitle || 'Full-Stack Developer'}
            {" "}
            <span style={{ color: accentColor }}>{"}"}</span>
          </p>

          {/* Bio */}
          {content?.aboutText && (
            <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
              {content.aboutText}
            </p>
          )}

          {/* Location & Company */}
          <div className="flex items-center justify-center gap-4 md:gap-6 text-xs md:text-sm text-slate-500 mb-6 md:mb-8">
            {user?.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: accentColor }} />
                {user.location}
              </span>
            )}
            {user?.company && (
              <span className="flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 md:w-4 md:h-4" style={{ color: accentColor }} />
                {user.company}
              </span>
            )}
          </div>

          {/* Social Links */}
          <div className="flex items-center justify-center gap-2 md:gap-3 flex-wrap">
            {content?.githubUrl && (
              <a
                href={content.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 md:p-3 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group shadow-sm"
              >
                <Github className="w-4 h-4 md:w-5 md:h-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
              </a>
            )}
            {content?.linkedinUrl && (
              <a
                href={content.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 md:p-3 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group shadow-sm"
              >
                <Linkedin className="w-4 h-4 md:w-5 md:h-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
              </a>
            )}
            {content?.twitterUrl && (
              <a
                href={content.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 md:p-3 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group shadow-sm"
              >
                <Twitter className="w-4 h-4 md:w-5 md:h-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
              </a>
            )}
            {content?.websiteUrl && (
              <a
                href={content.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 md:p-3 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group shadow-sm"
              >
                <Globe className="w-4 h-4 md:w-5 md:h-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
              </a>
            )}
            {content?.contactEmail && (
              <a
                href={`mailto:${content.contactEmail}`}
                className="p-2 md:p-3 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group shadow-sm"
              >
                <Mail className="w-4 h-4 md:w-5 md:h-5 text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
              </a>
            )}
          </div>
        </motion.div>
      </div>
    </header>
  );

  // Render Contact Section
  const renderContactSection = () => (
    <section key="contact" id="section-contact" className="py-8 md:py-16 px-3 md:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex items-center gap-3 mb-8">
            <Mail className="w-5 h-5 md:w-6 md:h-6" style={{ color: accentColor }} />
            <h2 className="text-xl md:text-2xl font-bold">Contact</h2>
            <div className="flex-1 h-px bg-gradient-to-r from-slate-300 dark:from-slate-700 to-transparent" />
          </div>

          <div className="flex flex-wrap gap-3">
            {content?.contactEmail && (
              <a
                href={`mailto:${content.contactEmail}`}
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                style={{ borderLeft: `3px solid ${accentColor}` }}
              >
                <Mail className="w-4 h-4 inline mr-2" style={{ color: accentColor }} />
                Email
              </a>
            )}
            {content?.githubUrl && (
              <a
                href={content.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                style={{ borderLeft: `3px solid ${accentColor}` }}
              >
                <Github className="w-4 h-4 inline mr-2" style={{ color: accentColor }} />
                GitHub
              </a>
            )}
            {content?.linkedinUrl && (
              <a
                href={content.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                style={{ borderLeft: `3px solid ${accentColor}` }}
              >
                <Linkedin className="w-4 h-4 inline mr-2" style={{ color: accentColor }} />
                LinkedIn
              </a>
            )}
            {content?.twitterUrl && (
              <a
                href={content.twitterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                style={{ borderLeft: `3px solid ${accentColor}` }}
              >
                <Twitter className="w-4 h-4 inline mr-2" style={{ color: accentColor }} />
                Twitter
              </a>
            )}
            {content?.websiteUrl && (
              <a
                href={content.websiteUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-lg bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all"
                style={{ borderLeft: `3px solid ${accentColor}` }}
              >
                <Globe className="w-4 h-4 inline mr-2" style={{ color: accentColor }} />
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
      <section key="experience" id="section-experience" className="py-8 md:py-16 px-3 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-8">
              <Cpu className="w-5 h-5 md:w-6 md:h-6" style={{ color: accentColor }} />
              <h2 className="text-xl md:text-2xl font-bold">Experience</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-300 dark:from-slate-700 to-transparent" />
            </div>

            <div className="space-y-4">
              {visibleExperiences.map((exp, index) => (
                <motion.div
                  key={exp.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 md:p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all min-w-0 shadow-sm"
                  style={{ borderLeft: `3px solid ${accentColor}` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="text-base md:text-lg font-semibold truncate">{exp.role}</h3>
                      <p style={{ color: accentColor }} className="text-sm">
                        {exp.company}
                      </p>
                    </div>
                    <span className="text-sm text-slate-500 whitespace-nowrap shrink-0">
                      {exp.startDate} → {exp.isCurrent ? 'Present' : exp.endDate}
                    </span>
                  </div>
                  {exp.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 line-clamp-2">{exp.description}</p>
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
      <section key="education" id="section-education" className="py-8 md:py-16 px-3 md:px-6 bg-slate-100/50 dark:bg-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-8">
              <Terminal className="w-5 h-5 md:w-6 md:h-6" style={{ color: accentColor }} />
              <h2 className="text-xl md:text-2xl font-bold">Education</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-300 dark:from-slate-700 to-transparent" />
            </div>

            <div className="space-y-4">
              {visibleEducations.map((edu, index) => (
                <motion.div
                  key={edu.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="p-4 md:p-6 rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all min-w-0 shadow-sm"
                  style={{ borderLeft: `3px solid ${accentColor}` }}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 mb-2">
                    <div className="min-w-0">
                      <h3 className="text-base md:text-lg font-semibold truncate">
                        {edu.degree}{edu.field ? ` in ${edu.field}` : ''}
                      </h3>
                      <p style={{ color: accentColor }} className="text-sm">
                        {edu.institution}
                      </p>
                    </div>
                    <span className="text-sm text-slate-500 whitespace-nowrap shrink-0">
                      {edu.startDate} → {edu.isCurrent ? 'Present' : edu.endDate}
                    </span>
                  </div>
                  {edu.description && (
                    <p className="text-slate-600 dark:text-slate-400 text-sm mt-2 line-clamp-2">{edu.description}</p>
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
      <section key="projects" id="section-projects" className="py-8 md:py-16 px-3 md:px-6 bg-slate-100/50 dark:bg-transparent">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-8">
              <Layers className="w-5 h-5 md:w-6 md:h-6" style={{ color: accentColor }} />
              <h2 className="text-xl md:text-2xl font-bold">Projects</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-300 dark:from-slate-700 to-transparent" />
            </div>

            <div className={`grid gap-4 ${isMobilePreview ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
              {visibleProjects.map((project, index) => (
                <motion.div
                  key={project.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group rounded-xl bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer min-w-0 shadow-sm overflow-hidden"
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
                    <div 
                      className="absolute inset-0 opacity-20 group-hover:opacity-40 transition-opacity"
                      style={{ 
                        background: `linear-gradient(135deg, ${accentColor}30, transparent)`,
                      }}
                    />
                  </div>
                  
                  <div className="p-4 md:p-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-semibold group-hover:text-slate-900 dark:group-hover:text-white transition-colors truncate">
                        {project.title}
                      </h3>
                      {project.url && (
                        <ExternalLink className="w-4 h-4 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-white shrink-0" />
                      )}
                    </div>
                    {project.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 line-clamp-2">{project.description}</p>
                    )}
                    <div className="flex items-center flex-wrap gap-2 text-xs">
                      {project.githubLanguage && (
                        <span 
                          className="px-2 py-1 rounded"
                          style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                        >
                          {project.githubLanguage}
                        </span>
                      )}
                      {project.githubStars !== null && project.githubStars > 0 && (
                        <span className="flex items-center gap-0.5 text-slate-500">
                          <Star className="w-3 h-3" /> {project.githubStars}
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
      <section key="skills" id="section-skills" className="py-8 md:py-16 px-3 md:px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <div className="flex items-center gap-3 mb-8">
              <Network className="w-5 h-5 md:w-6 md:h-6" style={{ color: accentColor }} />
              <h2 className="text-xl md:text-2xl font-bold">Skills</h2>
              <div className="flex-1 h-px bg-gradient-to-r from-slate-300 dark:from-slate-700 to-transparent" />
            </div>

            <div className="flex flex-wrap gap-2">
              {visibleSkills.map((skill, index) => (
                <motion.div
                  key={skill.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.02 }}
                  className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all text-sm shadow-sm"
                  style={{ 
                    borderLeft: `2px solid ${accentColor}`,
                    opacity: 0.5 + (skill.proficiency * 0.1)
                  }}
                >
                  <span className="font-medium">{skill.name}</span>
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
    <div className="min-h-full w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-mono relative flex flex-col">

      {/* 3D Background - renders in both dark and light modes */}
      {mounted && !reduceMotion && (
        <AnimatedBackground accentColor={accentColor} />
      )}
      
      {/* Fallback gradient for reduced motion */}
      {(reduceMotion || !mounted) && (
        <div 
          className="absolute inset-0"
          style={{
            background: resolvedTheme === 'dark'
              ? `radial-gradient(ellipse at center, ${accentColor}10 0%, transparent 50%), linear-gradient(180deg, #0f172a 0%, #1e293b 100%)`
              : `radial-gradient(ellipse at center, ${accentColor}08 0%, transparent 50%), linear-gradient(180deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)`,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Navigation */}
        <nav className="sticky top-0 z-50 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80">
          <div className="max-w-6xl mx-auto px-4">
            <div className="flex items-center justify-between h-14">
              {/* Logo */}
              <div className="flex items-center gap-2 min-w-0">
                {user?.avatarUrl ? (
                  <div 
                    className="w-8 h-8 rounded-full overflow-hidden shrink-0 ring-2"
                    style={{ 
                      borderColor: `${accentColor}60`,
                      boxShadow: `0 0 12px ${accentColor}30`
                    }}
                  >
                    <img
                      src={user.avatarUrl}
                      alt={user?.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ backgroundColor: `${accentColor}20`, border: `1px solid ${accentColor}40` }}
                  >
                    <Zap className="w-4 h-4" style={{ color: accentColor }} />
                  </div>
                )}
                <span 
                  className="font-bold truncate text-sm md:text-base"
                  style={resolvedTheme === 'dark' ? glowStyle : { color: accentColor }}
                >
                  {user?.name?.split(' ')[0] || 'Developer'}
                </span>
              </div>

              {/* Nav Items - hidden on mobile/tablet */}
              <div className="hidden lg:flex items-center gap-1">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      activeSection === item.id
                        ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                    style={activeSection === item.id ? { 
                      backgroundColor: `${accentColor}20`,
                      color: accentColor 
                    } : {}}
                  >
                    <item.icon className="w-4 h-4" />
                    <span className="hidden xl:inline">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Right side: GitHub, Contact + Hamburger */}
              <div className="flex items-center gap-2">
                {/* GitHub Link */}
                {content?.githubUrl && (
                  <a
                    href={content.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-all shrink-0"
                    title="GitHub"
                  >
                    <Github className="w-4 h-4" />
                  </a>
                )}
                
                {/* Contact Button */}
                {content?.contactEmail && (
                  <a
                    href={`mailto:${content.contactEmail}`}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-white text-sm font-medium transition-all hover:opacity-90 shrink-0"
                    style={{ backgroundColor: accentColor }}
                  >
                    <Mail className="w-4 h-4" />
                    <span className="hidden sm:inline">Contact</span>
                  </a>
                )}

                {/* Hamburger Menu Button - visible on mobile/tablet */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="lg:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors items-center justify-center shrink-0"
                  aria-label="Toggle menu"
                >
                  {mobileMenuOpen ? (
                    <X className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  ) : (
                    <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Menu Dropdown - show when hamburger is visible and menu is open */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="lg:hidden border-t border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl"
            >
              <div className="max-w-6xl mx-auto px-4 py-3 space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activeSection === item.id
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                    style={activeSection === item.id ? { 
                      backgroundColor: `${accentColor}15`,
                      color: accentColor 
                    } : {}}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </nav>

        {/* Render sections in order */}
        <div className="flex-1">
          {orderedSections.map((sectionId) => sectionRenderers[sectionId]?.())}
        </div>

        {/* Footer */}
        <footer className="py-8 px-4 border-t border-slate-200 dark:border-slate-800 mt-auto">
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-slate-500 text-sm whitespace-nowrap">
              <span style={{ color: accentColor }}>Powered by Portfolio Generator</span>
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
