'use client';

import { motion } from 'framer-motion';
import { 
  User, 
  Briefcase, 
  GraduationCap, 
  FolderGit2, 
  Wrench, 
  Mail,
  Palette,
  Settings,
  Eye,
  Github,
  LogOut,
  Layout
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth-store';

export type EditorTab = 'about' | 'experience' | 'education' | 'projects' | 'skills' | 'contact' | 'layout' | 'theme' | 'settings';

interface EditorSidebarProps {
  activeTab: EditorTab;
  onTabChange: (tab: EditorTab) => void;
  onLogout: () => void;
}

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

export function EditorSidebar({ activeTab, onTabChange, onLogout }: EditorSidebarProps) {
  const { user } = useAuthStore();

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full">
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
              onClick={() => onTabChange(tab.id)}
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
              onClick={() => onTabChange(tab.id)}
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
              onClick={() => onTabChange(tab.id)}
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
          variant="outline"
          size="sm"
          className="w-full justify-start text-slate-600 dark:text-slate-400"
          onClick={() => window.open(`https://github.com/${user?.githubLogin}`, '_blank')}
          disabled={!user?.githubLogin}
        >
          <Github className="w-4 h-4 mr-2" />
          GitHub Profile
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start text-slate-600 dark:text-slate-400 hover:text-red-600"
          onClick={onLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
