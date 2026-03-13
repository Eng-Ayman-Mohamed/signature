import { create } from 'zustand';

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  avatarUrl: string | null;
  role: 'USER' | 'ADMIN';
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  portfolio?: {
    id: string;
    isPublished: boolean;
    personalityType: string;
  } | null;
}

export interface AdminPortfolio {
  id: string;
  personalityType: string;
  accentColor: string;
  isPublished: boolean;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    username: string | null;
    avatarUrl: string | null;
  };
  projectCount: number;
  experienceCount: number;
  skillCount: number;
}

export interface SystemSettings {
  id: string;
  siteName: string;
  siteDescription: string | null;
  maintenanceMode: boolean;
  maintenanceMessage: string | null;
  allowRegistration: boolean;
  defaultAccentColor: string;
  maxPortfoliosPerUser: number;
}

export interface AnalyticsOverview {
  totalUsers: number;
  totalPortfolios: number;
  publishedPortfolios: number;
  unpublishedPortfolios: number;
  activeUsersToday: number;
  newUsersThisPeriod: number;
  newPortfoliosThisPeriod: number;
  avgProjectsPerPortfolio: string;
  avgSkillsPerPortfolio: string;
}

export interface ContentStats {
  totalProjects: number;
  totalExperiences: number;
  totalSkills: number;
  totalEducations: number;
}

interface AdminState {
  // Users
  users: AdminUser[];
  usersPagination: { page: number; limit: number; total: number; totalPages: number };
  usersLoading: boolean;
  setUsers: (users: AdminUser[]) => void;
  setUsersPagination: (pagination: { page: number; limit: number; total: number; totalPages: number }) => void;
  setUsersLoading: (loading: boolean) => void;
  
  // Portfolios
  portfolios: AdminPortfolio[];
  portfoliosPagination: { page: number; limit: number; total: number; totalPages: number };
  portfoliosLoading: boolean;
  setPortfolios: (portfolios: AdminPortfolio[]) => void;
  setPortfoliosPagination: (pagination: { page: number; limit: number; total: number; totalPages: number }) => void;
  setPortfoliosLoading: (loading: boolean) => void;
  
  // Analytics
  analytics: {
    overview: AnalyticsOverview | null;
    contentStats: ContentStats | null;
    personalityDistribution: { type: string; count: number }[];
    recentUsers: AdminUser[];
    recentPortfolios: AdminPortfolio[];
  };
  analyticsLoading: boolean;
  setAnalytics: (analytics: AdminState['analytics']) => void;
  setAnalyticsLoading: (loading: boolean) => void;
  
  // Settings
  settings: SystemSettings | null;
  settingsLoading: boolean;
  setSettings: (settings: SystemSettings | null) => void;
  setSettingsLoading: (loading: boolean) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
  // Users
  users: [],
  usersPagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  usersLoading: false,
  setUsers: (users) => set({ users }),
  setUsersPagination: (usersPagination) => set({ usersPagination }),
  setUsersLoading: (usersLoading) => set({ usersLoading }),
  
  // Portfolios
  portfolios: [],
  portfoliosPagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
  portfoliosLoading: false,
  setPortfolios: (portfolios) => set({ portfolios }),
  setPortfoliosPagination: (portfoliosPagination) => set({ portfoliosPagination }),
  setPortfoliosLoading: (portfoliosLoading) => set({ portfoliosLoading }),
  
  // Analytics
  analytics: {
    overview: null,
    contentStats: null,
    personalityDistribution: [],
    recentUsers: [],
    recentPortfolios: [],
  },
  analyticsLoading: false,
  setAnalytics: (analytics) => set({ analytics }),
  setAnalyticsLoading: (analyticsLoading) => set({ analyticsLoading }),
  
  // Settings
  settings: null,
  settingsLoading: false,
  setSettings: (settings) => set({ settings }),
  setSettingsLoading: (settingsLoading) => set({ settingsLoading }),
}));
