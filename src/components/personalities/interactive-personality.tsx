'use client';

import { useState, useEffect, useRef, useMemo, useSyncExternalStore, useCallback } from 'react';
import { Github, Linkedin, Twitter, Mail, ExternalLink, Send, MapPin, Building } from 'lucide-react';
import * as THREE from 'three';
import type { Portfolio } from '@/store/portfolio-store';
import type { User } from '@/store/auth-store';

interface InteractivePersonalityProps {
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
    () => false
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

export function InteractivePersonality({ portfolio, user, isMobilePreview }: InteractivePersonalityProps) {
  const { content, projects = [], experiences = [], educations = [], skills = [], accentColor, layoutOrder, reduceMotion: portfolioReduceMotion } = portfolio;
  const mounted = useMounted();
  const containerRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [currentAccentColor, setCurrentAccentColor] = useState(accentColor || '#58a6ff');
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const systemReduceMotion = useReducedMotion();
  
  const reduceMotion = portfolioReduceMotion || systemReduceMotion;

  const visibleProjects = projects.filter(p => p.isVisible);
  const visibleExperiences = experiences.filter(e => e.isVisible);
  const visibleEducations = educations.filter(e => e.isVisible);
  const visibleSkills = skills.filter(s => s.isVisible);

  // Three.js refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    particles: THREE.Points;
    lines: THREE.LineSegments;
    particlesMaterial: THREE.PointsMaterial;
    linesMaterial: THREE.LineBasicMaterial;
    animationId: number;
  } | null>(null);
  const mouseRef = useRef({ x: 0, y: 0 });

  // Parse layout order
  const orderedSections = useMemo(() => {
    const order = layoutOrder?.split(',').filter(Boolean) as SectionId[] || [];
    const defaultOrder: SectionId[] = ['about', 'experience', 'education', 'projects', 'skills', 'contact'];
    const allSections = new Set([...order, ...defaultOrder]);
    return Array.from(allSections);
  }, [layoutOrder]);

  // Initialize Three.js
  useEffect(() => {
    if (!canvasRef.current || reduceMotion) return;

    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!container) return;

    // Check if container has valid dimensions, if not wait for resize
    let width = container.clientWidth;
    let height = container.clientHeight;
    
    // If container has no dimensions yet, wait for resize
    if (width === 0 || height === 0) {
      const initOnResize = new ResizeObserver((entries) => {
        for (const entry of entries) {
          const { width: w, height: h } = entry.contentRect;
          if (w > 0 && h > 0) {
            initOnResize.disconnect();
            // Trigger re-initialization by setting a flag
            initializeThree(w, h);
          }
        }
      });
      initOnResize.observe(container);
      return () => initOnResize.disconnect();
    }
    
    initializeThree(width, height);
    
    function initializeThree(width: number, height: number) {
      if (!canvas || !container || sceneRef.current) return;
      
      try {
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, width / height || 1, 0.1, 1000);
        camera.position.z = 50;

        const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
        renderer.setSize(width || 800, height || 600);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

        // Create Particles
        const geometry = new THREE.BufferGeometry();
        const count = 1500;
        const positions = new Float32Array(count * 3);
        
        for (let i = 0; i < count * 3; i++) {
          positions[i] = (Math.random() - 0.5) * 100;
        }
        
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        const particlesMaterial = new THREE.PointsMaterial({ 
          size: 0.5, 
          color: new THREE.Color(currentAccentColor), 
          transparent: true, 
          opacity: 0.8 
        });
        
        const particles = new THREE.Points(geometry, particlesMaterial);
        scene.add(particles);

        // Create Lines for "Constellation" effect
        const linesGeometry = new THREE.BufferGeometry();
        linesGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(count * 6), 3));
        const linesMaterial = new THREE.LineBasicMaterial({ 
          color: new THREE.Color(currentAccentColor), 
          transparent: true, 
          opacity: 0.1 
        });
        const lines = new THREE.LineSegments(linesGeometry, linesMaterial);
        scene.add(lines);

        sceneRef.current = { 
          scene, camera, renderer, particles, lines, particlesMaterial, linesMaterial, animationId: 0 
        };

        // Mouse Interaction
        const handleMouseMove = (e: MouseEvent) => {
          const rect = container.getBoundingClientRect();
          if (rect.width > 0 && rect.height > 0) {
            mouseRef.current = {
              x: ((e.clientX - rect.left) / rect.width) * 2 - 1,
              y: -((e.clientY - rect.top) / rect.height) * 2 + 1
            };
          }
        };
        container.addEventListener('mousemove', handleMouseMove);

        // Resize handler
        const handleResize = () => {
          const w = container.clientWidth;
          const h = container.clientHeight;
          if (w > 0 && h > 0) {
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
          }
        };
        
        const resizeObserver = new ResizeObserver(handleResize);
        resizeObserver.observe(container);

        // Animation loop
        const animate = () => {
          if (!sceneRef.current) return;
          sceneRef.current.animationId = requestAnimationFrame(animate);
          
          particles.rotation.y += 0.0005;
          particles.rotation.x += 0.0002;

          // Follow mouse slightly
          camera.position.x += (mouseRef.current.x * 5 - camera.position.x) * 0.05;
          camera.position.y += (mouseRef.current.y * 5 - camera.position.y) * 0.05;
          camera.lookAt(scene.position);

          lines.rotation.y = particles.rotation.y;
          lines.rotation.x = particles.rotation.x;

          renderer.render(scene, camera);
        };
        animate();

        // Store cleanup function
        const cleanup = () => {
          container.removeEventListener('mousemove', handleMouseMove);
          resizeObserver.disconnect();
          if (sceneRef.current) {
            cancelAnimationFrame(sceneRef.current.animationId);
            sceneRef.current.renderer.dispose();
            sceneRef.current = null;
          }
        };
        
        // Store cleanup for later use
        (container as any).__threeCleanup = cleanup;
      } catch (error) {
        console.error('Failed to initialize Three.js:', error);
      }
    }

    return () => {
      const cleanup = (container as any).__threeCleanup;
      if (cleanup) {
        cleanup();
        delete (container as any).__threeCleanup;
      }
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.renderer.dispose();
        sceneRef.current = null;
      }
    };
  }, [reduceMotion]);

  // Update particle color when accent color changes
  useEffect(() => {
    if (sceneRef.current) {
      const color = new THREE.Color(currentAccentColor);
      sceneRef.current.particlesMaterial.color = color;
      sceneRef.current.linesMaterial.color = color;
    }
  }, [currentAccentColor]);

  // Scroll handler for navbar
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setScrolled(container.scrollTop > 50);
    };
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // Color presets
  const colorPresets = [
    '#58a6ff', // blue
    '#ff5861', // red
    '#58ff8f', // green
    '#ffce58', // yellow
    '#c158ff', // purple
  ];

  // Change accent color
  const changeColor = useCallback((color: string) => {
    setCurrentAccentColor(color);
  }, []);

  // Toggle theme
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  }, []);

  // Social links
  const socials = [];
  if (content?.githubUrl) socials.push({ icon: Github, link: content.githubUrl });
  if (content?.linkedinUrl) socials.push({ icon: Linkedin, link: content.linkedinUrl });
  if (content?.twitterUrl) socials.push({ icon: Twitter, link: content.twitterUrl });
  if (content?.contactEmail) socials.push({ icon: Mail, link: `mailto:${content.contactEmail}` });

  // CSS variables based on theme
  const cssVars = {
    '--bg-color': theme === 'dark' ? '#0d1117' : '#f3f4f6',
    '--bg-secondary': theme === 'dark' ? '#161b22' : '#ffffff',
    '--text-primary': theme === 'dark' ? '#eeeeee' : '#111827',
    '--text-secondary': theme === 'dark' ? '#9ca3af' : '#4b5563',
    '--accent-color': currentAccentColor,
    '--accent-glow': `${currentAccentColor}33`,
    '--border-color': theme === 'dark' ? '#30363d' : '#e5e7eb',
    '--card-bg': theme === 'dark' ? 'rgba(22, 27, 34, 0.7)' : 'rgba(255, 255, 255, 0.9)',
    '--transition': '0.3s ease all',
  } as React.CSSProperties;

  // Render About Section (Hero)
  const renderAboutSection = () => (
    <section key="about" id="hero" className="ip-hero">
      <div className="ip-container">
        <div className="ip-hero-content ip-fade-in">
          <span className="ip-hero-subtitle" style={{ color: currentAccentColor }}>
            Welcome to my portfolio
          </span>
          <h1 className="ip-hero-title">{user?.name || 'Your Name'}</h1>
          <h2 className="ip-hero-role">{content?.jobTitle || 'Full Stack Engineer'}</h2>
          <p className="ip-hero-desc">
            {content?.aboutText || user?.bio || 'I build accessible, pixel-perfect digital experiences for the web. Focused on clean code and modern architecture.'}
          </p>
          <div className="ip-hero-meta">
            {user?.location && (
              <span className="ip-meta-item">
                <MapPin className="w-4 h-4" style={{ color: currentAccentColor }} />
                {user.location}
              </span>
            )}
            {user?.company && (
              <span className="ip-meta-item">
                <Building className="w-4 h-4" style={{ color: currentAccentColor }} />
                {user.company}
              </span>
            )}
          </div>
          {content?.contactEmail && (
            <a href={`mailto:${content.contactEmail}`} className="ip-btn">
              <Send className="w-4 h-4" /> Get In Touch
            </a>
          )}
        </div>
      </div>
    </section>
  );

  // Render Skills Section
  const renderSkillsSection = () => {
    if (visibleSkills.length === 0) return null;
    return (
      <section key="skills" id="skills" className="ip-section">
        <div className="ip-container">
          <h2 className="ip-section-title ip-fade-in">Skills & Technologies</h2>
          <div className="ip-skills-grid ip-fade-in">
            {visibleSkills.map((skill) => (
              <div key={skill.id} className="ip-skill-tag">{skill.name}</div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Render Projects Section
  const renderProjectsSection = () => {
    if (visibleProjects.length === 0) return null;
    return (
      <section key="projects" id="projects" className="ip-section ip-section-alt">
        <div className="ip-container">
          <h2 className="ip-section-title ip-fade-in">Featured Projects</h2>
          <div className="ip-project-grid">
            {visibleProjects.map((project) => (
              <div key={project.id} className="ip-project-card ip-fade-in">
                <div className="ip-project-icon" style={{ color: currentAccentColor }}>
                  <ExternalLink className="w-8 h-8" />
                </div>
                <h3 className="ip-project-title">{project.title}</h3>
                <p className="ip-project-desc">{project.description}</p>
                <div className="ip-project-tech">
                  {project.githubLanguage && (
                    <span className="ip-tech-badge">{project.githubLanguage}</span>
                  )}
                </div>
                <div className="ip-project-links">
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noopener noreferrer">
                      <Github className="w-5 h-5" />
                    </a>
                  )}
                  {project.url && (
                    <a href={project.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-5 h-5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Render Experience Section
  const renderExperienceSection = () => {
    if (visibleExperiences.length === 0) return null;
    return (
      <section key="experience" id="experience" className="ip-section">
        <div className="ip-container">
          <h2 className="ip-section-title ip-fade-in">Experience</h2>
          <div className="ip-timeline">
            {visibleExperiences.map((exp) => (
              <div key={exp.id} className="ip-timeline-item ip-fade-in">
                <span className="ip-timeline-date" style={{ color: currentAccentColor }}>
                  {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                </span>
                <h3 className="ip-timeline-title">{exp.role}</h3>
                <span className="ip-timeline-company">{exp.company}</span>
                <p className="ip-timeline-desc">{exp.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Render Education Section
  const renderEducationSection = () => {
    if (visibleEducations.length === 0) return null;
    return (
      <section key="education" id="education" className="ip-section ip-section-alt">
        <div className="ip-container">
          <h2 className="ip-section-title ip-fade-in">Education</h2>
          <div className="ip-timeline">
            {visibleEducations.map((edu) => (
              <div key={edu.id} className="ip-timeline-item ip-fade-in">
                <span className="ip-timeline-date" style={{ color: currentAccentColor }}>
                  {edu.startDate} - {edu.isCurrent ? 'Present' : edu.endDate}
                </span>
                <h3 className="ip-timeline-title">{edu.degree}{edu.field ? ` in ${edu.field}` : ''}</h3>
                <span className="ip-timeline-company">{edu.institution}</span>
                {edu.description && <p className="ip-timeline-desc">{edu.description}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  };

  // Render Contact Section
  const renderContactSection = () => (
    <section key="contact" id="contact" className="ip-section ip-section-center">
      <div className="ip-container">
        <h2 className="ip-section-title ip-fade-in">Get In Touch</h2>
        <div className="ip-contact-form ip-fade-in">
          <div className="ip-contact-links">
            {content?.contactEmail && (
              <a href={`mailto:${content.contactEmail}`} className="ip-contact-link">
                <Mail className="w-5 h-5" style={{ color: currentAccentColor }} />
                <span>{content.contactEmail}</span>
              </a>
            )}
            {content?.githubUrl && (
              <a href={content.githubUrl} target="_blank" rel="noopener noreferrer" className="ip-contact-link">
                <Github className="w-5 h-5" style={{ color: currentAccentColor }} />
                <span>GitHub</span>
              </a>
            )}
            {content?.linkedinUrl && (
              <a href={content.linkedinUrl} target="_blank" rel="noopener noreferrer" className="ip-contact-link">
                <Linkedin className="w-5 h-5" style={{ color: currentAccentColor }} />
                <span>LinkedIn</span>
              </a>
            )}
            {content?.twitterUrl && (
              <a href={content.twitterUrl} target="_blank" rel="noopener noreferrer" className="ip-contact-link">
                <Twitter className="w-5 h-5" style={{ color: currentAccentColor }} />
                <span>Twitter</span>
              </a>
            )}
          </div>
        </div>
      </div>
    </section>
  );

  // Map section IDs to render functions
  const sectionRenderers: Record<SectionId, () => React.ReactNode> = {
    about: renderAboutSection,
    experience: renderExperienceSection,
    education: renderEducationSection,
    projects: renderProjectsSection,
    skills: renderSkillsSection,
    contact: renderContactSection,
  };

  const isPreview = isMobilePreview !== undefined;

  return (
    <div 
      ref={containerRef}
      className={`ip-wrapper ${theme === 'light' ? 'ip-light' : ''} ${isPreview ? 'ip-preview-mode' : ''}`}
      style={cssVars}
    >
      {/* THREE.JS BACKGROUND */}
      {mounted && !reduceMotion && (
        <canvas 
          ref={canvasRef} 
          className="ip-canvas"
        />
      )}

      {/* Fallback gradient for reduced motion */}
      {(reduceMotion || !mounted) && (
        <div 
          className="ip-canvas-fallback"
          style={{
            background: theme === 'dark'
              ? `radial-gradient(ellipse at center, ${currentAccentColor}15 0%, transparent 50%), linear-gradient(180deg, #0d1117 0%, #161b22 100%)`
              : `radial-gradient(ellipse at center, ${currentAccentColor}08 0%, transparent 50%), linear-gradient(180deg, #f3f4f6 0%, #ffffff 100%)`
          }}
        />
      )}

      {/* SETTINGS WIDGET - Only show in non-preview mode */}
      {!isPreview && (
        <>
          <button 
            className="ip-settings-btn"
            onClick={() => {
              const panel = document.getElementById('ipSettingsPanel');
              panel?.classList.toggle('ip-active');
            }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>

          <div id="ipSettingsPanel" className="ip-settings-panel">
            <div className="ip-option-group">
              <label>Theme Mode</label>
              <label className="ip-switch">
                <input 
                  type="checkbox" 
                  checked={theme === 'light'}
                  onChange={toggleTheme}
                />
                <span className="ip-slider"></span>
              </label>
            </div>
            <div className="ip-option-group">
              <label>Accent Color</label>
              <div className="ip-color-options">
                {colorPresets.map((color) => (
                  <div
                    key={color}
                    className={`ip-color-dot ${currentAccentColor === color ? 'ip-active' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => changeColor(color)}
                  />
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* NAVBAR */}
      <header className={`ip-navbar ${scrolled ? 'ip-scrolled' : ''}`}>
        <div className="ip-container">
          <nav className="ip-nav">
            <a href="#" className="ip-logo" style={{ color: currentAccentColor }}>
              &lt;{user?.name?.split(' ')[0] || 'Dev'} /&gt;
            </a>
            <ul className="ip-nav-links">
              <li><a href="#hero">About</a></li>
              <li><a href="#skills">Skills</a></li>
              <li><a href="#projects">Projects</a></li>
              <li><a href="#experience">Experience</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </nav>
        </div>
      </header>

      {/* SECTIONS */}
      {orderedSections.map((sectionId) => sectionRenderers[sectionId]?.())}

      {/* FOOTER */}
      <footer className="ip-footer">
        <div className="ip-container">
          <div className="ip-social-links">
            {socials.map((social, index) => (
              <a key={index} href={social.link} target="_blank" rel="noopener noreferrer">
                <social.icon className="w-5 h-5" />
              </a>
            ))}
          </div>
          <p className="ip-copyright">
            Designed & Built by {user?.name || 'Developer'} &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>

      {/* EMBEDDED CSS */}
      <style jsx global>{`
        .ip-wrapper {
          min-height: 100%;
          width: 100%;
          font-family: 'Poppins', sans-serif;
          overflow-x: hidden;
          overflow-y: auto;
          transition: all 0.3s ease;
          color: var(--text-primary);
          background-color: var(--bg-color);
          position: relative;
        }
        
        .ip-preview-mode {
          height: 100%;
          min-height: 600px;
        }
        
        .ip-preview-mode .ip-hero {
          min-height: 600px;
        }

        .ip-light {
          --bg-color: #f3f4f6;
          --bg-secondary: #ffffff;
          --text-primary: #111827;
          --text-secondary: #4b5563;
          --border-color: #e5e7eb;
          --card-bg: rgba(255, 255, 255, 0.9);
        }

        /* Canvas */
        .ip-canvas {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }
        
        .ip-canvas-fallback {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
        }

        /* Container */
        .ip-container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 20px;
        }

        /* Fade animation - always visible by default */
        .ip-fade-in {
          opacity: 1 !important;
          transform: translateY(0) !important;
          transition: opacity 0.6s ease-out, transform 0.6s ease-out;
        }

        /* Settings Widget */
        .ip-settings-btn {
          position: fixed;
          bottom: 30px;
          right: 30px;
          width: 50px;
          height: 50px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 50%;
          cursor: pointer;
          z-index: 1000;
          display: flex;
          justify-content: center;
          align-items: center;
          color: var(--text-primary);
          box-shadow: 0 5px 15px rgba(0,0,0,0.3);
          transition: all 0.3s ease;
        }
        .ip-settings-btn:hover {
          transform: rotate(90deg);
          color: var(--accent-color);
        }

        .ip-settings-panel {
          position: fixed;
          bottom: 100px;
          right: 30px;
          width: 240px;
          background-color: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 12px;
          padding: 20px;
          z-index: 999;
          opacity: 0;
          visibility: hidden;
          transform: translateY(20px);
          transition: all 0.3s ease;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
        }
        .ip-settings-panel.ip-active {
          opacity: 1;
          visibility: visible;
          transform: translateY(0);
        }
        .ip-option-group {
          margin-bottom: 15px;
        }
        .ip-option-group label {
          display: block;
          margin-bottom: 8px;
          font-size: 0.85rem;
          color: var(--text-secondary);
          font-weight: 600;
        }

        /* Toggle Switch */
        .ip-switch {
          position: relative;
          display: inline-block;
          width: 45px;
          height: 22px;
        }
        .ip-switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }
        .ip-slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: var(--border-color);
          transition: 0.4s;
          border-radius: 22px;
        }
        .ip-slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 3px;
          bottom: 3px;
          background-color: white;
          transition: 0.4s;
          border-radius: 50%;
        }
        input:checked + .ip-slider {
          background-color: var(--accent-color);
        }
        input:checked + .ip-slider:before {
          transform: translateX(23px);
        }

        .ip-color-options {
          display: flex;
          gap: 8px;
        }
        .ip-color-dot {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          border: 2px solid transparent;
          transition: all 0.3s ease;
        }
        .ip-color-dot:hover {
          transform: scale(1.2);
        }
        .ip-color-dot.ip-active {
          border-color: var(--text-primary);
        }

        /* Navbar */
        .ip-navbar {
          position: sticky;
          top: 0;
          z-index: 100;
          padding: 15px 0;
          transition: all 0.3s ease;
        }
        .ip-navbar.ip-scrolled {
          background-color: rgba(13, 17, 23, 0.9);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--border-color);
        }
        .ip-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .ip-logo {
          font-size: 1.5rem;
          font-weight: 700;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .ip-nav-links {
          display: flex;
          gap: 30px;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .ip-nav-links a {
          color: var(--text-secondary);
          font-weight: 500;
          font-size: 0.9rem;
          position: relative;
          text-decoration: none;
          transition: color 0.3s ease;
        }
        .ip-nav-links a::after {
          content: '';
          position: absolute;
          width: 0;
          height: 2px;
          bottom: -5px;
          left: 0;
          background-color: var(--accent-color);
          transition: width 0.3s ease;
        }
        .ip-nav-links a:hover {
          color: var(--text-primary);
        }
        .ip-nav-links a:hover::after {
          width: 100%;
        }

        /* Hero */
        .ip-hero {
          min-height: 100vh;
          display: flex;
          align-items: center;
          position: relative;
        }
        .ip-hero-content {
          max-width: 700px;
          position: relative;
          z-index: 1;
        }
        .ip-hero-subtitle {
          font-weight: 600;
          letter-spacing: 2px;
          text-transform: uppercase;
          margin-bottom: 10px;
          display: block;
        }
        .ip-hero-title {
          font-size: 4.5rem;
          font-weight: 700;
          line-height: 1.1;
          margin-bottom: 10px;
        }
        .ip-hero-role {
          font-size: 2.5rem;
          color: var(--text-secondary);
          margin-bottom: 20px;
          font-weight: 300;
        }
        .ip-hero-desc {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 30px;
          max-width: 500px;
        }
        .ip-hero-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 16px;
        }
        .ip-meta-item {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          color: var(--text-secondary);
        }
        .ip-btn {
          padding: 12px 28px;
          background-color: var(--accent-color);
          color: white;
          border-radius: 5px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          border: 2px solid var(--accent-color);
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .ip-btn:hover {
          background-color: transparent;
          color: var(--accent-color);
          box-shadow: 0 0 20px var(--accent-glow);
        }

        /* Sections */
        .ip-section {
          padding: 100px 0;
          position: relative;
          z-index: 1;
        }
        .ip-section-alt {
          background: linear-gradient(180deg, transparent, var(--bg-secondary), transparent);
        }
        .ip-section-center {
          text-align: center;
        }
        .ip-section-title {
          font-size: 2rem;
          margin-bottom: 50px;
          position: relative;
          display: inline-block;
        }
        .ip-section-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 0;
          width: 50px;
          height: 4px;
          background-color: var(--accent-color);
          border-radius: 2px;
        }

        /* Skills */
        .ip-skills-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
        }
        .ip-skill-tag {
          padding: 10px 20px;
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 25px;
          color: var(--text-secondary);
          font-weight: 500;
          transition: all 0.3s ease;
          cursor: default;
        }
        .ip-skill-tag:hover {
          border-color: var(--accent-color);
          color: var(--accent-color);
          transform: translateY(-3px);
        }

        /* Projects */
        .ip-project-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 25px;
        }
        .ip-project-card {
          background-color: var(--card-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          padding: 25px;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }
        .ip-project-card:hover {
          transform: translateY(-5px);
          border-color: var(--accent-color);
          box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        }
        .ip-project-icon {
          font-size: 2rem;
          margin-bottom: 15px;
        }
        .ip-project-title {
          font-size: 1.2rem;
          margin-bottom: 10px;
        }
        .ip-project-desc {
          color: var(--text-secondary);
          font-size: 0.9rem;
          line-height: 1.6;
          margin-bottom: 20px;
        }
        .ip-project-tech {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 15px;
        }
        .ip-tech-badge {
          font-size: 0.75rem;
          padding: 4px 10px;
          background: rgba(0,0,0,0.2);
          border-radius: 4px;
          color: var(--text-secondary);
          font-family: monospace;
        }
        .ip-project-links a {
          margin-right: 15px;
          color: var(--text-secondary);
          font-size: 1.1rem;
          transition: color 0.3s ease;
        }
        .ip-project-links a:hover {
          color: var(--accent-color);
        }

        /* Timeline */
        .ip-timeline {
          position: relative;
          border-left: 2px solid var(--border-color);
          margin-left: 20px;
          padding-left: 40px;
        }
        .ip-timeline-item {
          margin-bottom: 40px;
          position: relative;
        }
        .ip-timeline-item::before {
          content: '';
          position: absolute;
          left: -49px;
          top: 5px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background-color: var(--bg-color);
          border: 3px solid var(--accent-color);
        }
        .ip-timeline-date {
          font-size: 0.9rem;
          margin-bottom: 5px;
          font-weight: 600;
          display: block;
        }
        .ip-timeline-title {
          font-size: 1.3rem;
          margin-bottom: 5px;
          font-weight: 600;
        }
        .ip-timeline-company {
          font-style: italic;
          color: var(--text-secondary);
          margin-bottom: 10px;
          display: block;
        }
        .ip-timeline-desc {
          color: var(--text-secondary);
          font-size: 0.95rem;
        }

        /* Contact */
        .ip-contact-form {
          max-width: 500px;
          margin: 0 auto;
          background-color: var(--card-bg);
          padding: 40px;
          border-radius: 12px;
          border: 1px solid var(--border-color);
        }
        .ip-contact-links {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .ip-contact-link {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-radius: 8px;
          background-color: var(--bg-color);
          border: 1px solid var(--border-color);
          color: var(--text-primary);
          text-decoration: none;
          transition: all 0.3s ease;
        }
        .ip-contact-link:hover {
          border-color: var(--accent-color);
        }

        /* Footer */
        .ip-footer {
          padding: 40px 0;
          border-top: 1px solid var(--border-color);
          text-align: center;
          position: relative;
          z-index: 1;
        }
        .ip-social-links {
          display: flex;
          justify-content: center;
          gap: 20px;
          margin-bottom: 20px;
        }
        .ip-social-links a {
          font-size: 1.4rem;
          color: var(--text-secondary);
          transition: all 0.3s ease;
        }
        .ip-social-links a:hover {
          color: var(--accent-color);
          transform: translateY(-3px);
        }
        .ip-copyright {
          font-size: 0.85rem;
          color: var(--text-secondary);
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .ip-hero-title {
            font-size: 2.8rem;
          }
          .ip-hero-role {
            font-size: 1.5rem;
          }
          .ip-nav-links {
            display: none;
          }
          .ip-timeline {
            margin-left: 10px;
            padding-left: 20px;
          }
          .ip-timeline-item::before {
            left: -29px;
          }
          .ip-project-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
