'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Eye, EyeOff, Settings, User, Briefcase, GraduationCap, FolderGit2, Wrench, Mail, Palette, Layout, LogOut, ChevronRight } from 'lucide-react';
import { GitHubLogin } from '@/components/auth/github-login';
import { AboutEditor } from '@/components/editor/about-editor';
import { ExperienceEditor } from '@/components/editor/experience-editor';
import { EducationEditor } from '@/components/editor/education-editor';
import { ProjectsEditor } from '@/components/editor/projects-editor';
import { SkillsEditor } from '@/components/editor/skills-editor';
import { ContactEditor } from '@/components/editor/contact-editor';
import { ThemeSettings } from '@/components/editor/theme-settings';
import { SettingsPanel } from '@/components/editor/settings-panel';
import { LayoutEditor } from '@/components/editor/layout-editor';
import { PreviewPanel } from '@/components/preview/preview-panel';
import { ThemeToggle } from '@/components/theme-toggle';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';
import { usePortfolioStore } from '@/store/portfolio-store';

export type EditorTab = 'about' | 'experience' | 'education' | 'projects' | 'skills' | 'contact' | 'layout' | 'theme' | 'settings';

const tabs = [
  { id: 'about' as EditorTab, label: 'About Me', icon: User },
  { id: 'experience' as EditorTab, label: 'Experience', icon: Briefcase },
  { id: 'education' as EditorTab, label: 'Education', icon: GraduationCap },
  { id: 'projects' as EditorTab, label: 'Projects', icon: FolderGit2 },
  { id: 'skills' as EditorTab, label: 'Skills', icon: Wrench },
  { id: 'contact' as EditorTab, label: 'Contact', icon: Mail },
];

const layoutTabs = [
  { id: 'layout' as EditorTab, label: 'Layout', icon: Layout },
];

const bottomTabs = [
  { id: 'theme' as EditorTab, label: 'Personality', icon: Palette },
  { id: 'settings' as EditorTab, label: 'Settings', icon: Settings },
];

// Mobile Navigation Content - defined OUTSIDE main component to prevent Fast Refresh issues
function MobileNavContent({ 
  user, 
  activeTab, 
  onTabChange, 
  onLogout 
}: { 
  user: { name?: string | null; email?: string | null; githubLogin?: string | null; avatarUrl?: string | null } | null;
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  onLogout: () => void;
}) {
  return (
    <div className="flex flex-col h-full">
      {/* User Info */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Avatar className="w-10 h-10 border-2 border-emerald-500">
            <AvatarImage src={user?.avatarUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
              {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
              {user?.name || 'Anonymous'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
              {user?.githubLogin || user?.email}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            </button>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          {layoutTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            </button>
          ))}
        </div>

        <Separator className="my-4" />

        <div className="space-y-1">
          {bottomTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={cn(
                'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                activeTab === tab.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
              )}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
            </button>
          ))}
        </div>
      </ScrollArea>

      {/* Footer Actions */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

export default function PortfolioBuilder() {
  const { isAuthenticated, user, logout } = useAuthStore();
  const { portfolio, setPortfolio, setLoading, isLoading } = usePortfolioStore();
  const [activeTab, setActiveTab] = useState<EditorTab>('about');
  const [showPreview, setShowPreview] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration to complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Load portfolio on mount or when user changes
  useEffect(() => {
    const loadPortfolio = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      setLoading(true);
      try {
        // Always fetch fresh data from the database
        const response = await fetch(`/api/portfolio?userId=${user.id}`);
        const data = await response.json();
        
        if (data.portfolio) {
          setPortfolio(data.portfolio);
        }
      } catch (error) {
        console.error('Failed to load portfolio:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPortfolio();
  }, [isAuthenticated, user?.id]);

  // Refresh user data from database on mount to ensure sync
  useEffect(() => {
    const refreshUserData = async () => {
      if (!isAuthenticated || !user?.id) return;
      
      try {
        const response = await fetch(`/api/user?userId=${user.id}`);
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            // Update the auth store with fresh data from database
            const { login } = useAuthStore.getState();
            login(data.user);
          }
        }
      } catch (error) {
        console.error('Failed to refresh user data:', error);
      }
    };

    refreshUserData();
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    setPortfolio(null);
    setSidebarOpen(false);
  };

  const handleTabChange = (tab: EditorTab) => {
    setActiveTab(tab);
    setSidebarOpen(false);
  };

  const renderEditor = () => {
    switch (activeTab) {
      case 'about':
        return <AboutEditor />;
      case 'experience':
        return <ExperienceEditor />;
      case 'education':
        return <EducationEditor />;
      case 'projects':
        return <ProjectsEditor />;
      case 'skills':
        return <SkillsEditor />;
      case 'contact':
        return <ContactEditor />;
      case 'layout':
        return <LayoutEditor />;
      case 'theme':
        return <ThemeSettings />;
      case 'settings':
        return <SettingsPanel />;
      default:
        return <AboutEditor />;
    }
  };

  if (!isHydrated) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <GitHubLogin />;
  }

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top Bar */}
      <header className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Button */}
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="min-[1300px]:hidden">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
              </SheetHeader>
              <MobileNavContent 
                user={user}
                activeTab={activeTab}
                onTabChange={handleTabChange}
                onLogout={handleLogout}
              />
            </SheetContent>
          </Sheet>
          
          <img 
            src="/logo.png" 
            alt="Portfolio Generator" 
            className="w-8 h-8 rounded-lg object-contain"
          />
          <span className="font-semibold text-slate-900 dark:text-white hidden sm:inline">Signature</span>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {/* Desktop Preview Toggle - visible at lg (1024px) and up */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className={`hidden lg:flex px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              showPreview
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
            }`}
          >
            {showPreview ? 'Preview On' : 'Preview Off'}
          </button>
          
          {/* Mobile Preview Button - only visible below lg (1024px) */}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPreviewModalOpen(true)}
            className="lg:hidden"
          >
            <Eye className="w-4 h-4" />
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <aside className="hidden min-[1300px]:flex w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex-col h-full shrink-0">
          {/* User Info */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 border-2 border-emerald-500">
                <AvatarImage src={user?.avatarUrl || undefined} />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
                  {user?.name?.[0] || user?.email?.[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-slate-900 dark:text-white truncate">
                  {user?.name || 'Anonymous'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.githubLogin || user?.email}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <ScrollArea className="flex-1 px-2 py-4">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              {layoutTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
              {bottomTabs.map((tab) => (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    activeTab === tab.id
                      ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  )}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </motion.button>
              ))}
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-red-600"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </aside>

        {/* Editor */}
        <main className="flex-1 flex overflow-hidden">
          <div className={`${showPreview ? 'lg:w-[50%] lg:min-w-[400px] xl:min-w-[500px]' : 'flex-1'} w-full overflow-y-auto`}>
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className="p-4 md:p-6"
            >
              {renderEditor()}
            </motion.div>
          </div>

          {/* Desktop Preview Panel - visible at lg (1024px) and up */}
          {showPreview && (
            <div className="hidden lg:block flex-1 border-l border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950 overflow-hidden">
              <PreviewPanel />
            </div>
          )}
        </main>
      </div>

      {/* Mobile Bottom Navigation - hidden at lg (1024px) when preview is on, otherwise at min-[1300px] */}
      <nav className={`${showPreview ? 'lg:hidden' : 'min-[1300px]:hidden'} h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-around px-2 shrink-0`}>
        {tabs.slice(0, 5).map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors min-w-[60px]',
              activeTab === tab.id
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-slate-500 dark:text-slate-400'
            )}
          >
            <tab.icon className="w-5 h-5" />
            <span className="text-xs font-medium">{tab.label.split(' ')[0]}</span>
          </button>
        ))}
        {/* More button */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetTrigger asChild>
            <button className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg text-slate-500 dark:text-slate-400 min-w-[60px]">
              <Menu className="w-5 h-5" />
              <span className="text-xs font-medium">More</span>
            </button>
          </SheetTrigger>
        </Sheet>
      </nav>

      {/* Mobile Preview Modal */}
      <AnimatePresence>
        {previewModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex flex-col"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700 shrink-0">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-emerald-500" />
                <span className="font-medium text-white">Preview</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewModalOpen(false)}
                className="h-9 w-9 text-white hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-auto">
              <PreviewPanel />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer - Desktop Only */}
      <footer className="hidden min-[1300px]:flex h-10 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 items-center justify-center px-4 shrink-0">
        <p className="text-xs text-slate-500">
          Built with{' '}
          <span className="text-emerald-500 font-medium">Signature</span>
          {' '}• Version 1.0
        </p>
      </footer>
    </div>
  );
}
