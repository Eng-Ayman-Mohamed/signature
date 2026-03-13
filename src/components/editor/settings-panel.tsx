'use client';

import { motion } from 'framer-motion';
import { Settings, Globe, Download, Trash2, Loader2, ExternalLink, Copy, Check, Edit2, AlertTriangle, Code, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { usePortfolioStore } from '@/store/portfolio-store';
import { useAuthStore } from '@/store/auth-store';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';

export function SettingsPanel() {
  const { portfolio, setPortfolio, setLoading } = usePortfolioStore();
  const { user, setUser, logout } = useAuthStore();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isExportingResume, setIsExportingResume] = useState(false);
  const [isSavingUsername, setIsSavingUsername] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [username, setUsername] = useState('');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [copied, setCopied] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  useEffect(() => {
    if (user?.username) {
      setUsername(user.username);
    }
  }, [user?.username]);

  // Get the base URL
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const portfolioUrl = user?.username ? `${baseUrl}/${user.username}` : null;

  const handlePublishToggle = async (checked: boolean) => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch('/api/portfolio/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          isPublished: checked,
        }),
      });

      if (!response.ok) throw new Error('Failed to update publish status');
      
      const data = await response.json();
      
      // Update the portfolio in the store
      if (portfolio) {
        setPortfolio({
          ...portfolio,
          isPublished: data.portfolio.isPublished,
        });
      }
      
      toast.success(checked ? 'Portfolio published!' : 'Portfolio unpublished');
    } catch (error) {
      console.error('Publish error:', error);
      toast.error('Failed to update publish status');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleSaveUsername = async () => {
    if (!user?.id || !username.trim()) {
      toast.error('Username is required');
      return;
    }

    // Validate username format
    const usernameRegex = /^[a-zA-Z0-9_-]+$/;
    if (!usernameRegex.test(username)) {
      toast.error('Username can only contain letters, numbers, underscores, and hyphens');
      return;
    }

    setIsSavingUsername(true);
    try {
      const response = await fetch('/api/user/username', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          username: username.trim(),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to update username');
      }
      
      // Update the user in the store
      if (user) {
        setUser({
          ...user,
          username: data.user.username,
        });
      }
      
      setIsEditingUsername(false);
      toast.success('Username updated!');
    } catch (error) {
      console.error('Username error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update username');
    } finally {
      setIsSavingUsername(false);
    }
  };

  const handleCopyUrl = async () => {
    if (portfolioUrl) {
      await navigator.clipboard.writeText(portfolioUrl);
      setCopied(true);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExport = async () => {
    if (!portfolio) return;

    setIsExporting(true);
    try {
      // Create a JSON export of the portfolio
      const exportData = {
        portfolio: {
          personalityType: portfolio.personalityType,
          accentColor: portfolio.accentColor,
          density: portfolio.density,
          layoutOrder: portfolio.layoutOrder,
        },
        content: portfolio.content,
        projects: portfolio.projects,
        experiences: portfolio.experiences,
        educations: portfolio.educations,
        skills: portfolio.skills,
        exportedAt: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `portfolio-${user?.username || 'export'}-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Portfolio exported!');
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Failed to export portfolio');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportResume = async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    setIsExportingResume(true);
    try {
      const response = await fetch(`/api/portfolio/resume?userId=${user.id}`);
      
      if (!response.ok) {
        throw new Error('Failed to generate resume');
      }

      const pdfBlob = await response.blob();
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${user.username || 'resume'}-resume.pdf`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success('Resume PDF downloaded!');
    } catch (error) {
      console.error('Resume export error:', error);
      toast.error('Failed to generate resume');
    } finally {
      setIsExportingResume(false);
    }
  };

  const handleDeletePortfolio = async () => {
    if (!user?.id) {
      toast.error('User not found');
      return;
    }

    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/portfolio/delete?userId=${user.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete account');
      }

      toast.success('Account deleted successfully');
      setDeleteDialogOpen(false);
      
      // Clear cookies on client side
      document.cookie = 'auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'user_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      document.cookie = 'portfolio_data=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      
      // Clear portfolio from store and logout
      setPortfolio(null);
      logout();
      
      // Reload page to ensure clean state
      window.location.href = '/';
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsDeleting(false);
      setConfirmText('');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Username Card */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-emerald-500" />
            Portfolio URL
          </CardTitle>
          <CardDescription>
            Set your unique username for your portfolio URL.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Username Input */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Username</Label>
            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center bg-slate-50 dark:bg-slate-800 rounded-lg overflow-hidden">
                <span className="text-sm text-slate-500 dark:text-slate-400 px-3 whitespace-nowrap">
                  {baseUrl}/
                </span>
                {isEditingUsername ? (
                  <Input
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, ''))}
                    className="border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                    placeholder="username"
                    autoFocus
                  />
                ) : (
                  <span className="text-sm font-medium text-slate-900 dark:text-white py-2 px-1">
                    {user?.username || 'not-set'}
                  </span>
                )}
              </div>
              {isEditingUsername ? (
                <Button
                  onClick={handleSaveUsername}
                  disabled={isSavingUsername || !username.trim()}
                  size="sm"
                  className="shrink-0"
                >
                  {isSavingUsername ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditingUsername(true)}
                  className="shrink-0"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-slate-500">
              Only letters, numbers, underscores, and hyphens allowed.
            </p>
          </div>

          {/* Portfolio URL Display */}
          {portfolioUrl && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Your Portfolio</Label>
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Globe className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="text-sm text-slate-600 dark:text-slate-400 flex-1 truncate">
                  {portfolioUrl}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyUrl}
                  className="shrink-0"
                >
                  {copied ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                {portfolio?.isPublished && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => window.open(portfolioUrl, '_blank')}
                    className="shrink-0"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publish Settings */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-500" />
            Publish Settings
          </CardTitle>
          <CardDescription>
            Control the visibility of your portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Publish Status */}
          <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <div>
              <Label className="text-sm font-medium">Published</Label>
              <p className="text-xs text-slate-500 mt-1">
                {portfolio?.isPublished 
                  ? 'Your portfolio is publicly accessible'
                  : 'Your portfolio is private and only visible to you'}
              </p>
            </div>
            <Switch
              checked={portfolio?.isPublished || false}
              onCheckedChange={handlePublishToggle}
              disabled={isPublishing || !user?.username}
            />
          </div>

          {!user?.username && (
            <p className="text-xs text-amber-600 dark:text-amber-400">
              ⚠️ Set a username above to publish your portfolio.
            </p>
          )}

          {/* Export Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Export Options</Label>
            
            {/* Resume Download */}
            <Button
              onClick={handleExportResume}
              disabled={isExportingResume}
              className="w-full h-12 bg-emerald-500 hover:bg-emerald-600 text-white"
            >
              {isExportingResume ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <FileText className="w-4 h-4 mr-2" />
              )}
              Download Resume
            </Button>
            <p className="text-xs text-slate-500 -mt-1">
              Professional one-page resume in PDF format.
            </p>
            
            {/* JSON Export */}
            <Button
              variant="outline"
              onClick={handleExport}
              disabled={isExporting}
              className="w-full h-10"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Code className="w-4 h-4 mr-2" />
              )}
              Export as JSON
            </Button>
          </div>

          {/* Delete Account */}
          <div className="pt-4 border-t border-slate-200 dark:border-slate-700">
            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full h-12 text-red-500 hover:text-red-600 border-red-200 hover:border-red-300 hover:bg-red-50 dark:hover:bg-red-950/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Account
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="w-5 h-5" />
                    Delete Account
                  </DialogTitle>
                  <DialogDescription className="pt-2">
                    This action cannot be undone. This will permanently delete your account and portfolio including:
                  </DialogDescription>
                </DialogHeader>
                
                <div className="py-4">
                  <ul className="text-sm text-slate-600 dark:text-slate-400 space-y-1 mb-4">
                    <li>• All projects ({portfolio?.projects?.length || 0})</li>
                    <li>• All experiences ({portfolio?.experiences?.length || 0})</li>
                    <li>• All education entries ({portfolio?.educations?.length || 0})</li>
                    <li>• All skills ({portfolio?.skills?.length || 0})</li>
                    <li>• All contact information</li>
                    <li>• Theme and layout settings</li>
                  </ul>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">
                      Type <span className="font-bold text-red-600">DELETE</span> to confirm:
                    </Label>
                    <Input
                      value={confirmText}
                      onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                      placeholder="DELETE"
                      className="border-red-200 focus:border-red-500 focus:ring-red-500"
                    />
                  </div>
                </div>
                
                <DialogFooter className="gap-2 sm:gap-0">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setConfirmText('');
                    }}
                    disabled={isDeleting}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeletePortfolio}
                    disabled={isDeleting || confirmText !== 'DELETE'}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {isDeleting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Forever
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {portfolio?.projects?.length || 0}
              </p>
              <p className="text-xs text-slate-500">Projects</p>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {portfolio?.experiences?.length || 0}
              </p>
              <p className="text-xs text-slate-500">Experiences</p>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {portfolio?.educations?.length || 0}
              </p>
              <p className="text-xs text-slate-500">Education</p>
            </div>
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {portfolio?.skills?.length || 0}
              </p>
              <p className="text-xs text-slate-500">Skills</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
