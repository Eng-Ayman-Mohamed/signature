'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  FolderGit2,
  Settings,
  BarChart3,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Activity,
  Globe,
  UserCheck,
  FileText,
  TrendingUp,
  AlertTriangle,
  Shield,
  UserPlus,
  CheckCircle,
  XCircle,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { useAdminStore } from '@/store/admin-store';
import { useAuthStore } from '@/store/auth-store';
import { alert } from '@/store/alert-store';
import { toast } from '@/hooks/use-toast';

type AdminTab = 'dashboard' | 'users' | 'portfolios' | 'analytics' | 'settings';

const navItems = [
  { id: 'dashboard' as AdminTab, label: 'Dashboard', icon: LayoutDashboard },
  { id: 'users' as AdminTab, label: 'Users', icon: Users },
  { id: 'portfolios' as AdminTab, label: 'Portfolios', icon: FolderGit2 },
  { id: 'analytics' as AdminTab, label: 'Analytics', icon: BarChart3 },
  { id: 'settings' as AdminTab, label: 'Settings', icon: Settings },
];

// Stats Card Component
function StatsCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  color, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  subtitle?: string;
  icon: React.ElementType; 
  color: string;
  trend?: { value: number; label: string };
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">{value}</p>
          {subtitle && (
            <p className="text-sm text-slate-400 mt-1">{subtitle}</p>
          )}
          {trend && (
            <div className={cn(
              'flex items-center gap-1 mt-2 text-sm',
              trend.value >= 0 ? 'text-emerald-500' : 'text-red-500'
            )}>
              <TrendingUp className={cn('w-4 h-4', trend.value < 0 && 'rotate-180')} />
              <span>{Math.abs(trend.value)}%</span>
              <span className="text-slate-400">{trend.label}</span>
            </div>
          )}
        </div>
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: `${color}15` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

// Dashboard Tab
function DashboardTab() {
  const { analytics, setAnalytics, analyticsLoading, setAnalyticsLoading } = useAdminStore();

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch('/api/admin/analytics?range=30');
      const data = await response.json();
      setAnalytics({
        overview: data.overview,
        contentStats: data.contentStats,
        personalityDistribution: data.personalityDistribution,
        recentUsers: data.recentUsers,
        recentPortfolios: data.recentPortfolios,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [setAnalytics, setAnalyticsLoading]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { overview, contentStats, personalityDistribution, recentUsers, recentPortfolios } = analytics;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={overview?.totalUsers || 0}
          icon={Users}
          color="#10b981"
          trend={overview?.newUsersThisPeriod ? { value: 12, label: 'this month' } : undefined}
        />
        <StatsCard
          title="Total Portfolios"
          value={overview?.totalPortfolios || 0}
          icon={Globe}
          color="#6366f1"
        />
        <StatsCard
          title="Published"
          value={overview?.publishedPortfolios || 0}
          icon={FileText}
          color="#f59e0b"
          subtitle={`${overview?.unpublishedPortfolios || 0} unpublished`}
        />
        <StatsCard
          title="Active Today"
          value={overview?.activeUsersToday || 0}
          icon={Activity}
          color="#ec4899"
        />
      </div>

      {/* Content Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Projects"
          value={contentStats?.totalProjects || 0}
          icon={FolderGit2}
          color="#8b5cf6"
          subtitle={`Avg ${overview?.avgProjectsPerPortfolio || 0} per portfolio`}
        />
        <StatsCard
          title="Experiences"
          value={contentStats?.totalExperiences || 0}
          icon={UserCheck}
          color="#06b6d4"
        />
        <StatsCard
          title="Skills"
          value={contentStats?.totalSkills || 0}
          icon={BarChart3}
          color="#f43f5e"
        />
        <StatsCard
          title="Educations"
          value={contentStats?.totalEducations || 0}
          icon={FileText}
          color="#14b8a6"
        />
      </div>

      {/* Personality Distribution & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personality Distribution */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Personality Distribution
          </h3>
          <div className="space-y-3">
            {personalityDistribution?.map((p, index) => {
              const colors = ['#10b981', '#6366f1', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];
              const total = personalityDistribution.reduce((acc, curr) => acc + curr.count, 0);
              const percentage = total > 0 ? ((p.count / total) * 100).toFixed(1) : 0;
              return (
                <div key={p.type} className="flex items-center gap-3">
                  <div className="w-32 text-sm text-slate-600 dark:text-slate-400 capitalize">
                    {p.type}
                  </div>
                  <div className="flex-1 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: index * 0.1 }}
                      className="h-full rounded-full"
                      style={{ backgroundColor: colors[index % colors.length] }}
                    />
                  </div>
                  <div className="w-16 text-sm text-slate-500 text-right">
                    {p.count} ({percentage}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Users */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Recent Users
          </h3>
          <div className="space-y-3">
            {recentUsers?.map((user) => (
              <div key={user.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatarUrl || undefined} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                    {user.name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {user.name || user.email}
                  </p>
                  <p className="text-xs text-slate-500 truncate">{user.email}</p>
                </div>
                <div className="text-xs text-slate-400">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Portfolios */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Recent Portfolios
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentPortfolios?.map((portfolio) => (
            <div
              key={portfolio.id}
              className="p-4 rounded-lg border border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Avatar className="w-8 h-8">
                  <AvatarImage src={portfolio.user.avatarUrl || undefined} />
                  <AvatarFallback className="bg-slate-100 text-slate-700 text-xs">
                    {portfolio.user.name?.[0] || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {portfolio.user.name || portfolio.user.email}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">{portfolio.personalityType}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'px-2 py-0.5 rounded text-xs font-medium',
                    portfolio.isPublished
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  )}
                >
                  {portfolio.isPublished ? 'Published' : 'Draft'}
                </span>
                <span className="text-xs text-slate-400">
                  {portfolio.projectCount} projects
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Add User Modal
function AddUserModal({ 
  isOpen, 
  onClose, 
  onSuccess 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  onSuccess: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN'>('USER');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/admin/users/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, role }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create user');
      }

      // Reset form
      setName('');
      setEmail('');
      setPassword('');
      setRole('USER');
      
      toast({
        title: 'User Created',
        description: `Successfully created ${role === 'ADMIN' ? 'admin' : 'user'} account for ${email}.`,
      });
      
      onSuccess();
      onClose();
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to create user';
      setError(errorMsg);
      toast({
        title: 'Error',
        description: errorMsg,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-md p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Add New User
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="user@example.com"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="•••••••• (min 6 characters)"
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'USER' | 'ADMIN')}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="USER">User</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Users Tab
function UsersTab() {
  const { 
    users, 
    setUsers, 
    usersPagination, 
    setUsersPagination, 
    usersLoading, 
    setUsersLoading 
  } = useAdminStore();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(usersPagination.page));
      params.set('limit', String(usersPagination.limit));
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);

      const response = await fetch(`/api/admin/users?${params}`);
      const data = await response.json();
      setUsers(data.users);
      setUsersPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setUsersLoading(false);
    }
  }, [usersPagination.page, usersPagination.limit, search, roleFilter, statusFilter, setUsers, setUsersPagination, setUsersLoading]);

  useEffect(() => {
    fetchUsers();
  }, [usersPagination.page, roleFilter, statusFilter]);

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    const newStatus = !currentStatus;
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      
      if (!response.ok) throw new Error('Failed to update user');
      
      toast({
        title: 'Status Updated',
        description: `User has been ${newStatus ? 'activated' : 'deactivated'}.`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status.',
        variant: 'destructive',
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) throw new Error('Failed to update role');
      
      toast({
        title: 'Role Updated',
        description: `User role changed to ${newRole}.`,
      });
      fetchUsers();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user role.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    alert.confirm(
      'Delete User',
      `Are you sure you want to delete "${userName}"? This action cannot be undone and will also delete their portfolio.`,
      async () => {
        try {
          const response = await fetch(`/api/admin/users/${userId}`, { method: 'DELETE' });
          
          if (!response.ok) throw new Error('Failed to delete user');
          
          toast({
            title: 'User Deleted',
            description: 'The user has been permanently deleted.',
          });
          fetchUsers();
        } catch (error) {
          toast({
            title: 'Error',
            description: 'Failed to delete user.',
            variant: 'destructive',
          });
        }
      }
    );
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="">All Roles</option>
          <option value="USER">User</option>
          <option value="ADMIN">Admin</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <Button onClick={fetchUsers} variant="outline" size="sm">
          Search
        </Button>
        <Button 
          onClick={() => setShowAddUserModal(true)} 
          className="bg-emerald-500 hover:bg-emerald-600 text-white"
        >
          <UserPlus className="w-4 h-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Add User Modal */}
      <AddUserModal 
        isOpen={showAddUserModal} 
        onClose={() => setShowAddUserModal(false)}
        onSuccess={fetchUsers}
      />

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Role</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Portfolio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {usersLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                            {user.name?.[0] || user.email?.[0]?.toUpperCase() || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {user.name || 'No name'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        className={cn(
                          'px-2 py-1 rounded text-xs font-medium border-0 cursor-pointer',
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        )}
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleToggleUserStatus(user.id, user.isActive)}
                        className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          user.isActive
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                        )}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {user.portfolio ? (
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'px-2 py-0.5 rounded text-xs font-medium',
                              user.portfolio.isPublished
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-slate-100 text-slate-600'
                            )}
                          >
                            {user.portfolio.isPublished ? 'Published' : 'Draft'}
                          </span>
                          <span className="text-xs text-slate-500 capitalize">
                            {user.portfolio.personalityType}
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">No portfolio</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteUser(user.id, user.name || user.email)}
                          className="text-red-500 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {usersPagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500">
              Showing {((usersPagination.page - 1) * usersPagination.limit) + 1} to{' '}
              {Math.min(usersPagination.page * usersPagination.limit, usersPagination.total)} of{' '}
              {usersPagination.total} users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={usersPagination.page === 1}
                onClick={() => setUsersPagination({ ...usersPagination, page: usersPagination.page - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={usersPagination.page === usersPagination.totalPages}
                onClick={() => setUsersPagination({ ...usersPagination, page: usersPagination.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Portfolios Tab
function PortfoliosTab() {
  const {
    portfolios,
    setPortfolios,
    portfoliosPagination,
    setPortfoliosPagination,
    portfoliosLoading,
    setPortfoliosLoading,
  } = useAdminStore();
  const [search, setSearch] = useState('');
  const [personalityFilter, setPersonalityFilter] = useState('');
  const [publishedFilter, setPublishedFilter] = useState('');

  const fetchPortfolios = useCallback(async () => {
    setPortfoliosLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('page', String(portfoliosPagination.page));
      params.set('limit', String(portfoliosPagination.limit));
      if (search) params.set('search', search);
      if (personalityFilter) params.set('personality', personalityFilter);
      if (publishedFilter) params.set('published', publishedFilter);

      const response = await fetch(`/api/admin/portfolios?${params}`);
      const data = await response.json();
      setPortfolios(data.portfolios);
      setPortfoliosPagination(data.pagination);
    } catch (error) {
      console.error('Failed to fetch portfolios:', error);
    } finally {
      setPortfoliosLoading(false);
    }
  }, [portfoliosPagination.page, portfoliosPagination.limit, search, personalityFilter, publishedFilter, setPortfolios, setPortfoliosPagination, setPortfoliosLoading]);

  useEffect(() => {
    fetchPortfolios();
  }, [portfoliosPagination.page, personalityFilter, publishedFilter]);

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <input
          type="text"
          placeholder="Search portfolios..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchPortfolios()}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <select
          value={personalityFilter}
          onChange={(e) => setPersonalityFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="">All Personalities</option>
          <option value="minimal">Minimal</option>
          <option value="developer">Developer</option>
          <option value="creative">Creative</option>
          <option value="elegant">Elegant</option>
          <option value="futuristic">Futuristic</option>
        </select>
        <select
          value={publishedFilter}
          onChange={(e) => setPublishedFilter(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="">All Status</option>
          <option value="true">Published</option>
          <option value="false">Unpublished</option>
        </select>
        <Button onClick={fetchPortfolios} variant="outline" size="sm">
          Search
        </Button>
      </div>

      {/* Portfolios Table */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Owner</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Personality</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Content</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {portfoliosLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    Loading...
                  </td>
                </tr>
              ) : portfolios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                    No portfolios found
                  </td>
                </tr>
              ) : (
                portfolios.map((portfolio) => (
                  <tr key={portfolio.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={portfolio.user.avatarUrl || undefined} />
                          <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                            {portfolio.user.name?.[0] || 'U'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                            {portfolio.user.name || 'No name'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">{portfolio.user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 capitalize">
                        {portfolio.personalityType}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          'px-2 py-1 rounded text-xs font-medium',
                          portfolio.isPublished
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        )}
                      >
                        {portfolio.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span>{portfolio.projectCount} projects</span>
                        <span>{portfolio.experienceCount} exp</span>
                        <span>{portfolio.skillCount} skills</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-500">
                      {new Date(portfolio.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {portfoliosPagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-slate-200 dark:border-slate-800">
            <p className="text-sm text-slate-500">
              Showing {((portfoliosPagination.page - 1) * portfoliosPagination.limit) + 1} to{' '}
              {Math.min(portfoliosPagination.page * portfoliosPagination.limit, portfoliosPagination.total)} of{' '}
              {portfoliosPagination.total} portfolios
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={portfoliosPagination.page === 1}
                onClick={() => setPortfoliosPagination({ ...portfoliosPagination, page: portfoliosPagination.page - 1 })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={portfoliosPagination.page === portfoliosPagination.totalPages}
                onClick={() => setPortfoliosPagination({ ...portfoliosPagination, page: portfoliosPagination.page + 1 })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Analytics Tab
function AnalyticsTab() {
  const { analytics, setAnalytics, analyticsLoading, setAnalyticsLoading } = useAdminStore();
  const [range, setRange] = useState('30');

  const fetchAnalytics = useCallback(async () => {
    setAnalyticsLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${range}`);
      const data = await response.json();
      setAnalytics({
        overview: data.overview,
        contentStats: data.contentStats,
        personalityDistribution: data.personalityDistribution,
        recentUsers: data.recentUsers,
        recentPortfolios: data.recentPortfolios,
      });
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [range, setAnalytics, setAnalyticsLoading]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  if (analyticsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const { overview, contentStats, personalityDistribution } = analytics;

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center gap-4">
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white"
        >
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="90">Last 90 days</option>
          <option value="365">Last year</option>
        </select>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Users"
          value={overview?.totalUsers || 0}
          icon={Users}
          color="#10b981"
        />
        <StatsCard
          title="Total Portfolios"
          value={overview?.totalPortfolios || 0}
          icon={Globe}
          color="#6366f1"
        />
        <StatsCard
          title="New Users"
          value={overview?.newUsersThisPeriod || 0}
          icon={TrendingUp}
          color="#f59e0b"
        />
        <StatsCard
          title="New Portfolios"
          value={overview?.newPortfoliosThisPeriod || 0}
          icon={FileText}
          color="#ec4899"
        />
      </div>

      {/* Content Stats */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Content Statistics
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {contentStats?.totalProjects || 0}
            </p>
            <p className="text-sm text-slate-500">Total Projects</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {contentStats?.totalExperiences || 0}
            </p>
            <p className="text-sm text-slate-500">Total Experiences</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {contentStats?.totalSkills || 0}
            </p>
            <p className="text-sm text-slate-500">Total Skills</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {contentStats?.totalEducations || 0}
            </p>
            <p className="text-sm text-slate-500">Total Educations</p>
          </div>
        </div>
      </div>

      {/* Personality Distribution */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Personality Type Distribution
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {personalityDistribution?.map((p) => {
            const total = personalityDistribution.reduce((acc, curr) => acc + curr.count, 0);
            const percentage = total > 0 ? ((p.count / total) * 100).toFixed(1) : 0;
            return (
              <div key={p.type} className="text-center p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{p.count}</p>
                <p className="text-sm text-slate-500 capitalize">{p.type}</p>
                <p className="text-xs text-slate-400">{percentage}%</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Settings Tab
function SettingsTab() {
  const { settings, setSettings, settingsLoading, setSettingsLoading } = useAdminStore();
  const [formData, setFormData] = useState({
    siteName: '',
    siteDescription: '',
    maintenanceMode: false,
    maintenanceMessage: '',
    allowRegistration: true,
    defaultAccentColor: '#10b981',
    maxPortfoliosPerUser: 1,
  });
  const [saving, setSaving] = useState(false);

  const fetchSettings = useCallback(async () => {
    setSettingsLoading(true);
    try {
      const response = await fetch('/api/admin/settings');
      const data = await response.json();
      setSettings(data.settings);
      setFormData({
        siteName: data.settings.siteName || '',
        siteDescription: data.settings.siteDescription || '',
        maintenanceMode: data.settings.maintenanceMode || false,
        maintenanceMessage: data.settings.maintenanceMessage || '',
        allowRegistration: data.settings.allowRegistration ?? true,
        defaultAccentColor: data.settings.defaultAccentColor || '#10b981',
        maxPortfoliosPerUser: data.settings.maxPortfoliosPerUser || 1,
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setSettingsLoading(false);
    }
  }, [setSettings, setSettingsLoading]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) throw new Error('Failed to save settings');
      
      setSettings(formData as any);
      
      toast({
        title: 'Settings Saved',
        description: 'Your changes have been applied successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (settingsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Maintenance Mode Alert */}
      {formData.maintenanceMode && (
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-medium text-amber-800 dark:text-amber-200">Maintenance Mode is Active</p>
            <p className="text-sm text-amber-600 dark:text-amber-300">
              Users will see the maintenance message instead of the application.
            </p>
          </div>
        </div>
      )}

      {/* Site Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Site Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Site Name
            </label>
            <input
              type="text"
              value={formData.siteName}
              onChange={(e) => setFormData({ ...formData, siteName: e.target.value })}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Site Description
            </label>
            <textarea
              value={formData.siteDescription}
              onChange={(e) => setFormData({ ...formData, siteDescription: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Default Accent Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={formData.defaultAccentColor}
                onChange={(e) => setFormData({ ...formData, defaultAccentColor: e.target.value })}
                className="w-10 h-10 rounded cursor-pointer"
              />
              <input
                type="text"
                value={formData.defaultAccentColor}
                onChange={(e) => setFormData({ ...formData, defaultAccentColor: e.target.value })}
                className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Maintenance Mode */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Maintenance Mode
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Enable Maintenance Mode</p>
              <p className="text-sm text-slate-500">Disable access to the application for non-admin users</p>
            </div>
            <button
              onClick={() => setFormData({ ...formData, maintenanceMode: !formData.maintenanceMode })}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                formData.maintenanceMode ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  formData.maintenanceMode ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
          {formData.maintenanceMode && (
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Maintenance Message
              </label>
              <textarea
                value={formData.maintenanceMessage}
                onChange={(e) => setFormData({ ...formData, maintenanceMessage: e.target.value })}
                rows={3}
                placeholder="We're currently performing maintenance. Please check back soon."
                className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          )}
        </div>
      </div>

      {/* Registration Settings */}
      <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200 dark:border-slate-800">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
          Registration Settings
        </h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Allow Registration</p>
              <p className="text-sm text-slate-500">Allow new users to register</p>
            </div>
            <button
              onClick={() => setFormData({ ...formData, allowRegistration: !formData.allowRegistration })}
              className={cn(
                'relative inline-flex h-6 w-11 items-center rounded-full transition-colors',
                formData.allowRegistration ? 'bg-emerald-500' : 'bg-slate-200 dark:bg-slate-700'
              )}
            >
              <span
                className={cn(
                  'inline-block h-4 w-4 transform rounded-full bg-white transition-transform',
                  formData.allowRegistration ? 'translate-x-6' : 'translate-x-1'
                )}
              />
            </button>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Max Portfolios Per User
            </label>
            <input
              type="number"
              value={formData.maxPortfoliosPerUser}
              onChange={(e) => setFormData({ ...formData, maxPortfoliosPerUser: parseInt(e.target.value) || 1 })}
              min={1}
              className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
            />
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={saving} className="px-6">
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>
    </div>
  );
}

// Main Admin Panel Component
export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardTab />;
      case 'users':
        return <UsersTab />;
      case 'portfolios':
        return <PortfoliosTab />;
      case 'analytics':
        return <AnalyticsTab />;
      case 'settings':
        return <SettingsTab />;
      default:
        return <DashboardTab />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-slate-900 dark:text-white">Admin Panel</h1>
              <p className="text-xs text-slate-500">Portfolio Generator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <ScrollArea className="flex-1 p-4">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  activeTab === item.id
                    ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                )}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
              </button>
            ))}
          </nav>
        </ScrollArea>

        {/* User Info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 mb-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={user?.avatarUrl || undefined} />
              <AvatarFallback className="bg-emerald-100 text-emerald-700 text-xs">
                {user?.name?.[0] || 'A'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-slate-500 truncate">{user?.email}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Shield className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-slate-900 dark:text-white">Admin</span>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 pt-14"
          >
            <ScrollArea className="flex-1 p-4">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                      activeTab === item.id
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </nav>
            </ScrollArea>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-red-600"
                onClick={handleLogout}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 lg:ml-0 pt-14 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
              {activeTab}
            </h1>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
              {activeTab === 'dashboard' && 'Overview of your portfolio generator system'}
              {activeTab === 'users' && 'Manage and monitor user accounts'}
              {activeTab === 'portfolios' && 'View and manage all portfolios'}
              {activeTab === 'analytics' && 'Detailed analytics and statistics'}
              {activeTab === 'settings' && 'Configure system settings'}
            </p>
          </div>

          {/* Content */}
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
