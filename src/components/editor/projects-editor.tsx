'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderGit2, Plus, Pencil, Trash2, Save, X, Loader2, ChevronUp, ChevronDown, Github, Star, GitFork, ExternalLink, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { usePortfolioStore, type Project } from '@/store/portfolio-store';
import { useAuthStore } from '@/store/auth-store';
import { useAlert } from '@/hooks/use-alert';
import { toast } from 'sonner';

interface ProjectFormData {
  id?: string;
  title: string;
  description: string;
  longDescription: string;
  url: string;
  imageUrl: string;
  isGithubImport: boolean;
  githubStars: number | null;
  githubForks: number | null;
  githubLanguage: string | null;
  githubUrl: string;
  isVisible: boolean;
}

const initialFormData: ProjectFormData = {
  title: '',
  description: '',
  longDescription: '',
  url: '',
  imageUrl: '',
  isGithubImport: false,
  githubStars: null,
  githubForks: null,
  githubLanguage: null,
  githubUrl: '',
  isVisible: true,
};

interface GitHubRepo {
  id: number;
  name: string;
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  homepage: string | null;
}

export function ProjectsEditor() {
  const { portfolio, addProject, updateProject, deleteProject, reorderProjects } = usePortfolioStore();
  const { user } = useAuthStore();
  const { confirm } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ProjectFormData>(initialFormData);
  const [projects, setProjects] = useState<Project[]>(portfolio?.projects || []);
  const [showGitHubImport, setShowGitHubImport] = useState(false);
  const [githubRepos, setGithubRepos] = useState<GitHubRepo[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);

  useEffect(() => {
    setProjects(portfolio?.projects || []);
  }, [portfolio?.projects]);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsEditing(false);
    setShowGitHubImport(false);
  };

  const fetchGitHubRepos = async () => {
    if (!user?.githubLogin) {
      toast.error('GitHub account not connected');
      return;
    }

    setIsLoadingRepos(true);
    try {
      const response = await fetch(`/api/github?username=${user.githubLogin}`);
      const data = await response.json();
      
      if (!response.ok) throw new Error(data.error);
      
      setGithubRepos(data.repositories || []);
    } catch (error) {
      console.error('Failed to fetch repos:', error);
      toast.error('Failed to fetch GitHub repositories');
    } finally {
      setIsLoadingRepos(false);
    }
  };

  const handleImportRepo = async (repo: GitHubRepo) => {
    if (!portfolio?.id) {
      toast.error('Portfolio not found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/portfolio/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: portfolio.id,
          title: repo.name,
          description: repo.description || '',
          url: repo.homepage || repo.url,
          isGithubImport: true,
          githubStars: repo.stars,
          githubForks: repo.forks,
          githubLanguage: repo.language,
          githubUrl: repo.url,
          displayOrder: projects.length,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      addProject({
        title: repo.name,
        description: repo.description || '',
        longDescription: null,
        url: repo.homepage || repo.url,
        imageUrl: null,
        isGithubImport: true,
        githubStars: repo.stars,
        githubForks: repo.forks,
        githubLanguage: repo.language,
        githubUrl: repo.url,
        displayOrder: projects.length,
        isVisible: true,
      });

      toast.success('Repository imported!');
    } catch (error) {
      console.error('Import error:', error);
      toast.error('Failed to import repository');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (project: Project) => {
    setFormData({
      id: project.id,
      title: project.title,
      description: project.description || '',
      longDescription: project.longDescription || '',
      url: project.url || '',
      imageUrl: project.imageUrl || '',
      isGithubImport: project.isGithubImport,
      githubStars: project.githubStars,
      githubForks: project.githubForks,
      githubLanguage: project.githubLanguage,
      githubUrl: project.githubUrl || '',
      isVisible: project.isVisible,
    });
    setEditingId(project.id);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.title) {
      toast.error('Project title is required');
      return;
    }

    if (!portfolio?.id) {
      toast.error('Portfolio not found');
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        const response = await fetch('/api/portfolio/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingId, ...formData }),
        });

        if (!response.ok) throw new Error('Failed to update');
        
        updateProject(editingId, formData);
        toast.success('Project updated!');
      } else {
        const response = await fetch('/api/portfolio/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portfolioId: portfolio.id,
            ...formData,
            displayOrder: projects.length,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        addProject({
          ...formData,
          displayOrder: projects.length,
        });
        toast.success('Project added!');
      }

      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save project');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirm(
      'Delete Project',
      'Are you sure you want to delete this project? This action cannot be undone.',
      async () => {
        try {
          await fetch(`/api/portfolio/projects?id=${id}`, { method: 'DELETE' });
          deleteProject(id);
          toast.success('Project deleted');
        } catch (error) {
          console.error('Delete error:', error);
          toast.error('Failed to delete project');
        }
      }
    );
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= projects.length) return;

    const newProjects = [...projects];
    [newProjects[index], newProjects[newIndex]] = [newProjects[newIndex], newProjects[index]];
    
    setProjects(newProjects);
    reorderProjects(newProjects);

    try {
      await Promise.all(
        newProjects.map((proj, i) =>
          fetch('/api/portfolio/projects', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: proj.id, displayOrder: i }),
          })
        )
      );
    } catch (error) {
      console.error('Reorder error:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-emerald-500" />
            Projects
          </CardTitle>
          <CardDescription>
            Showcase your work. Import from GitHub or add custom projects.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-medium text-slate-900 dark:text-white">{project.title}</h4>
                      {project.isGithubImport && (
                        <Badge variant="secondary" className="text-xs bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                          <Github className="w-3 h-3 mr-1" />
                          GitHub
                        </Badge>
                      )}
                      {project.githubLanguage && (
                        <Badge variant="outline" className="text-xs">
                          {project.githubLanguage}
                        </Badge>
                      )}
                      {!project.isVisible && (
                        <Badge variant="outline" className="text-xs text-slate-400">
                          Hidden
                        </Badge>
                      )}
                    </div>
                    {project.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                      {project.githubStars !== null && project.githubStars > 0 && (
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3" /> {project.githubStars}
                        </span>
                      )}
                      {project.githubForks !== null && project.githubForks > 0 && (
                        <span className="flex items-center gap-1">
                          <GitFork className="w-3 h-3" /> {project.githubForks}
                        </span>
                      )}
                      {project.url && (
                        <a href={project.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-emerald-500">
                          <ExternalLink className="w-3 h-3" /> View
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(index, 'up')}
                      disabled={index === 0}
                      className="h-8 w-8"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleMove(index, 'down')}
                      disabled={index === projects.length - 1}
                      className="h-8 w-8"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(project)}
                      className="h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(project.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* GitHub Import Section */}
          {showGitHubImport ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border border-slate-200 dark:border-slate-700 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-slate-900 dark:text-white">Import from GitHub</h4>
                <Button variant="ghost" size="sm" onClick={() => setShowGitHubImport(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <Button
                variant="outline"
                onClick={fetchGitHubRepos}
                disabled={isLoadingRepos}
                className="mb-4"
              >
                {isLoadingRepos ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="w-4 h-4 mr-2" />
                )}
                Refresh Repositories
              </Button>

              <div className="max-h-64 overflow-y-auto space-y-2">
                {githubRepos.map((repo) => (
                  <div
                    key={repo.id}
                    className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-slate-900 dark:text-white truncate">{repo.name}</p>
                      <p className="text-xs text-slate-500 truncate">{repo.description || 'No description'}</p>
                      <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                        {repo.language && <span>{repo.language}</span>}
                        <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {repo.stars}</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleImportRepo(repo)}
                      disabled={isLoading}
                    >
                      Import
                    </Button>
                  </div>
                ))}
                {githubRepos.length === 0 && !isLoadingRepos && (
                  <p className="text-center text-sm text-slate-500 py-4">
                    Click "Refresh Repositories" to load your GitHub repos
                  </p>
                )}
              </div>
            </motion.div>
          ) : isEditing ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 bg-emerald-50/50 dark:bg-emerald-950/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="project-title">Title *</Label>
                  <Input
                    id="project-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Project name"
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-url">URL</Label>
                  <Input
                    id="project-url"
                    value={formData.url}
                    onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                    placeholder="https://..."
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="project-description">Short Description</Label>
                  <Input
                    id="project-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Brief description for cards and listings"
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="project-long-description">Full Description</Label>
                  <Textarea
                    id="project-long-description"
                    value={formData.longDescription}
                    onChange={(e) => setFormData({ ...formData, longDescription: e.target.value })}
                    placeholder="Detailed description of the project, technologies used, and your role..."
                    rows={4}
                    className="bg-white dark:bg-slate-800 resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="project-image">Image URL</Label>
                  <Input
                    id="project-image"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    placeholder="https://..."
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    id="project-visible"
                    checked={formData.isVisible}
                    onCheckedChange={(checked) => setFormData({ ...formData, isVisible: checked })}
                  />
                  <Label htmlFor="project-visible">Visible in portfolio</Label>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={resetForm}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isLoading} className="bg-emerald-500 hover:bg-emerald-600">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </motion.div>
          ) : (
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                className="flex-1 border-dashed border-2 h-12 text-slate-500 hover:text-slate-700 hover:border-slate-400"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Custom Project
              </Button>
              {user?.githubLogin && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowGitHubImport(true);
                    fetchGitHubRepos();
                  }}
                  className="flex-1 border-dashed border-2 h-12 text-slate-500 hover:text-slate-700 hover:border-slate-400"
                >
                  <Github className="w-4 h-4 mr-2" />
                  Import from GitHub
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
