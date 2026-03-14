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
  _hasHydrated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  setUser: (user: User) => void;
  setLoading: (loading: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

// Safe storage that handles localStorage being blocked in iframes
const safeStorage = {
  getItem: (name: string): string | null => {
    try {
      return localStorage.getItem(name);
    } catch {
      // localStorage blocked (iframe with third-party cookies disabled)
      return null;
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      localStorage.setItem(name, value);
    } catch {
      // localStorage blocked - ignore silently
    }
  },
  removeItem: (name: string): void => {
    try {
      localStorage.removeItem(name);
    } catch {
      // localStorage blocked - ignore silently
    }
  },
};

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
      _hasHydrated: false,
      login: (user) => set({ user, isAuthenticated: true, isLoading: false, _hasHydrated: true }),
      logout: () => {
        // Clear auth cookies
        if (typeof document !== 'undefined') {
          document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'user_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'portfolio_data=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          
          // Clear persisted storage
          try {
            localStorage.removeItem('portfolio-auth');
          } catch {
            // localStorage might be blocked in iframe
          }
        }
        
        set({ user: null, isAuthenticated: false, _hasHydrated: true });
      },
      updateUser: (data) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...data } : null,
        })),
      setUser: (user) => set({ user }),
      setLoading: (loading) => set({ isLoading: loading }),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'portfolio-auth',
      storage: safeStorage,
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
      // On rehydration, check for cookie-based auth and mark as complete
      onRehydrateStorage: () => (state) => {
        // Check if we have auth cookies but no stored auth state
        const cookieUser = getUserFromCookie();
        if (cookieUser && (!state?.isAuthenticated || !state?.user)) {
          // Restore auth from cookie
          state?.login(cookieUser);
        } else {
          // Mark hydration as complete
          state?.setHasHydrated(true);
        }
      },
    }
  )
);
