import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export type UserRole = 'USER' | 'ADMIN';

export interface User {
  id: string;
  email: string;
  name: string | null;
  username: string | null;
  githubId: string | null;
  githubLogin: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  company: string | null;
  blog: string | null;
  role: UserRole;
  isActive: boolean;
  lastLoginAt: string | null;
  createdAt?: string;
  updatedAt?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
}

// Helper to get cookie value
function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
}

// Helper to parse user data from cookie
function getUserFromCookie(): User | null {
  try {
    const userDataCookie = getCookie('user_data');
    if (userDataCookie) {
      return JSON.parse(decodeURIComponent(userDataCookie));
    }
  } catch (e) {
    console.error('Failed to parse user data cookie:', e);
  }
  return null;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      login: (user) => set({ user, isAuthenticated: true, isLoading: false }),
      logout: () => {
        // Clear auth cookies
        document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        document.cookie = 'portfolio_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
        
        // Clear persisted storage
        if (typeof window !== 'undefined') {
          localStorage.removeItem('portfolio-auth');
        }
        
        set({ user: null, isAuthenticated: false });
      },
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ isLoading: loading }),
    }),
    {
      name: 'portfolio-auth',
      storage: createJSONStorage(() => localStorage),
      // On rehydration, check for cookie-based auth
      onRehydrateStorage: () => (state) => {
        // Check if we have auth cookies but no stored auth state
        const cookieUser = getUserFromCookie();
        if (cookieUser && (!state?.isAuthenticated || !state?.user)) {
          // Restore auth from cookie
          state?.login(cookieUser);
        }
      },
    }
  )
);
