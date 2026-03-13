import { create } from 'zustand';

export type PersonalityType = 'minimal' | 'developer' | 'creative' | 'elegant' | 'futuristic';
export type DensityType = 'compact' | 'normal' | 'spacious';

export interface Portfolio {
  id: string;
  userId: string;
  personalityType: PersonalityType;
  accentColor: string;
  layoutOrder: string;
  isPublished: boolean;
  density: DensityType;
  reduceMotion: boolean;
  content: Content | null;
  projects: Project[];
  experiences: Experience[];
  educations: Education[];
  skills: Skill[];
}

export interface Content {
  id: string;
  portfolioId: string;
  jobTitle: string | null;
  aboutText: string | null;
  resumeUrl: string | null;
  contactEmail: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  twitterUrl: string | null;
  websiteUrl: string | null;
}

export interface Project {
  id: string;
  portfolioId: string;
  title: string;
  description: string | null;
  longDescription: string | null;
  url: string | null;
  imageUrl: string | null;
  isGithubImport: boolean;
  githubStars: number | null;
  githubForks: number | null;
  githubLanguage: string | null;
  githubUrl: string | null;
  displayOrder: number;
  isVisible: boolean;
}

export interface Experience {
  id: string;
  portfolioId: string;
  company: string;
  role: string;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  displayOrder: number;
  isVisible: boolean;
}

export interface Education {
  id: string;
  portfolioId: string;
  institution: string;
  degree: string;
  field: string | null;
  location: string | null;
  startDate: string;
  endDate: string | null;
  isCurrent: boolean;
  description: string | null;
  displayOrder: number;
  isVisible: boolean;
}

export interface Skill {
  id: string;
  portfolioId: string;
  name: string;
  category: 'technical' | 'soft' | 'tools';
  proficiency: number;
  displayOrder: number;
  isVisible: boolean;
}

interface PortfolioState {
  portfolio: Portfolio | null;
  isLoading: boolean;
  previewMode: boolean;
  
  setPortfolio: (portfolio: Portfolio | null) => void;
  setLoading: (loading: boolean) => void;
  setPreviewMode: (mode: boolean) => void;
  
  // Personality & Theme
  setPersonality: (personality: PersonalityType) => void;
  setAccentColor: (color: string) => void;
  setDensity: (density: DensityType) => void;
  setLayoutOrder: (order: string) => void;
  setReduceMotion: (reduceMotion: boolean) => void;
  
  // Content
  updateContent: (content: Partial<Content>) => void;
  
  // Projects
  addProject: (project: Omit<Project, 'id' | 'portfolioId'>) => void;
  updateProject: (id: string, data: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  reorderProjects: (projects: Project[]) => void;
  
  // Experience
  addExperience: (experience: Omit<Experience, 'id' | 'portfolioId'>) => void;
  updateExperience: (id: string, data: Partial<Experience>) => void;
  deleteExperience: (id: string) => void;
  reorderExperiences: (experiences: Experience[]) => void;
  
  // Education
  addEducation: (education: Omit<Education, 'id' | 'portfolioId'>) => void;
  updateEducation: (id: string, data: Partial<Education>) => void;
  deleteEducation: (id: string) => void;
  reorderEducations: (educations: Education[]) => void;
  
  // Skills
  addSkill: (skill: Omit<Skill, 'id' | 'portfolioId'>) => void;
  updateSkill: (id: string, data: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  reorderSkills: (skills: Skill[]) => void;
}

export const usePortfolioStore = create<PortfolioState>((set) => ({
  portfolio: null,
  isLoading: false,
  previewMode: false,
  
  setPortfolio: (portfolio) => set({ portfolio }),
  setLoading: (loading) => set({ isLoading: loading }),
  setPreviewMode: (mode) => set({ previewMode: mode }),
  
  setPersonality: (personality) =>
    set((state) => ({
      portfolio: state.portfolio
        ? { ...state.portfolio, personalityType: personality }
        : null,
    })),
  
  setAccentColor: (color) =>
    set((state) => ({
      portfolio: state.portfolio
        ? { ...state.portfolio, accentColor: color }
        : null,
    })),
  
  setDensity: (density) =>
    set((state) => ({
      portfolio: state.portfolio
        ? { ...state.portfolio, density }
        : null,
    })),
  
  setLayoutOrder: (order) =>
    set((state) => ({
      portfolio: state.portfolio
        ? { ...state.portfolio, layoutOrder: order }
        : null,
    })),
  
  setReduceMotion: (reduceMotion) =>
    set((state) => ({
      portfolio: state.portfolio
        ? { ...state.portfolio, reduceMotion }
        : null,
    })),
  
  updateContent: (content) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            content: state.portfolio.content
              ? { ...state.portfolio.content, ...content }
              : null,
          }
        : null,
    })),
  
  addProject: (project) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            projects: [
              ...state.portfolio.projects,
              {
                ...project,
                id: `temp-${Date.now()}`,
                portfolioId: state.portfolio.id,
              },
            ],
          }
        : null,
    })),
  
  updateProject: (id, data) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            projects: state.portfolio.projects.map((p) =>
              p.id === id ? { ...p, ...data } : p
            ),
          }
        : null,
    })),
  
  deleteProject: (id) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            projects: state.portfolio.projects.filter((p) => p.id !== id),
          }
        : null,
    })),
  
  reorderProjects: (projects) =>
    set((state) => ({
      portfolio: state.portfolio
        ? { ...state.portfolio, projects }
        : null,
    })),
  
  addExperience: (experience) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            experiences: [
              ...state.portfolio.experiences,
              {
                ...experience,
                id: `temp-${Date.now()}`,
                portfolioId: state.portfolio.id,
              },
            ],
          }
        : null,
    })),
  
  updateExperience: (id, data) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            experiences: state.portfolio.experiences.map((e) =>
              e.id === id ? { ...e, ...data } : e
            ),
          }
        : null,
    })),
  
  deleteExperience: (id) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            experiences: state.portfolio.experiences.filter((e) => e.id !== id),
          }
        : null,
    })),
  
  reorderExperiences: (experiences) =>
    set((state) => ({
      portfolio: state.portfolio
        ? { ...state.portfolio, experiences }
        : null,
    })),
  
  addEducation: (education) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            educations: [
              ...state.portfolio.educations,
              {
                ...education,
                id: `temp-${Date.now()}`,
                portfolioId: state.portfolio.id,
              },
            ],
          }
        : null,
    })),
  
  updateEducation: (id, data) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            educations: state.portfolio.educations.map((e) =>
              e.id === id ? { ...e, ...data } : e
            ),
          }
        : null,
    })),
  
  deleteEducation: (id) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            educations: state.portfolio.educations.filter((e) => e.id !== id),
          }
        : null,
    })),
  
  reorderEducations: (educations) =>
    set((state) => ({
      portfolio: state.portfolio
        ? { ...state.portfolio, educations }
        : null,
    })),
  
  addSkill: (skill) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            skills: [
              ...state.portfolio.skills,
              {
                ...skill,
                id: `temp-${Date.now()}`,
                portfolioId: state.portfolio.id,
              },
            ],
          }
        : null,
    })),
  
  updateSkill: (id, data) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            skills: state.portfolio.skills.map((s) =>
              s.id === id ? { ...s, ...data } : s
            ),
          }
        : null,
    })),
  
  deleteSkill: (id) =>
    set((state) => ({
      portfolio: state.portfolio
        ? {
            ...state.portfolio,
            skills: state.portfolio.skills.filter((s) => s.id !== id),
          }
        : null,
    })),
  
  reorderSkills: (skills) =>
    set((state) => ({
      portfolio: state.portfolio
        ? { ...state.portfolio, skills }
        : null,
    })),
}));
