'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { AdminPanel } from '@/components/admin/admin-panel';
import { AdminLogin } from '@/components/admin/admin-login';

export default function AdminPage() {
  const { user, isAuthenticated } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is admin
    const checkAdmin = async () => {
      setIsLoading(false);
    };
    checkAdmin();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // If not authenticated or not admin, show login
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return <AdminLogin />;
  }

  // Show admin panel
  return <AdminPanel />;
}
