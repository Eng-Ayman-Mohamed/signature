'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Briefcase, Plus, Pencil, Trash2, Save, X, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { usePortfolioStore, type Experience } from '@/store/portfolio-store';
import { useAlert } from '@/hooks/use-alert';
import { toast } from 'sonner';

interface ExperienceFormData {
  id?: string;
  company: string;
  role: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

const initialFormData: ExperienceFormData = {
  company: '',
  role: '',
  location: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
};

export function ExperienceEditor() {
  const { portfolio, addExperience, updateExperience, deleteExperience, reorderExperiences } = usePortfolioStore();
  const { confirm } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<ExperienceFormData>(initialFormData);
  const [experiences, setExperiences] = useState<Experience[]>(portfolio?.experiences || []);

  useEffect(() => {
    setExperiences(portfolio?.experiences || []);
  }, [portfolio?.experiences]);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEdit = (exp: Experience) => {
    setFormData({
      id: exp.id,
      company: exp.company,
      role: exp.role,
      location: exp.location || '',
      startDate: exp.startDate,
      endDate: exp.endDate || '',
      isCurrent: exp.isCurrent,
      description: exp.description || '',
    });
    setEditingId(exp.id);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.company || !formData.role || !formData.startDate) {
      toast.error('Company, role, and start date are required');
      return;
    }

    if (!portfolio?.id) {
      toast.error('Portfolio not found');
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        // Update existing
        const response = await fetch('/api/portfolio/experiences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            ...formData,
            endDate: formData.isCurrent ? null : formData.endDate,
          }),
        });

        if (!response.ok) throw new Error('Failed to update');
        
        updateExperience(editingId, {
          ...formData,
          endDate: formData.isCurrent ? null : formData.endDate,
        });
        toast.success('Experience updated!');
      } else {
        // Create new
        const response = await fetch('/api/portfolio/experiences', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portfolioId: portfolio.id,
            ...formData,
            endDate: formData.isCurrent ? null : formData.endDate,
            displayOrder: experiences.length,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create');
        
        addExperience({
          ...formData,
          endDate: formData.isCurrent ? null : formData.endDate,
          displayOrder: experiences.length,
          isVisible: true,
        });
        toast.success('Experience added!');
      }

      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save experience');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirm(
      'Delete Experience',
      'Are you sure you want to delete this experience? This action cannot be undone.',
      async () => {
        try {
          await fetch(`/api/portfolio/experiences?id=${id}`, { method: 'DELETE' });
          deleteExperience(id);
          toast.success('Experience deleted');
        } catch (error) {
          console.error('Delete error:', error);
          toast.error('Failed to delete experience');
        }
      }
    );
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= experiences.length) return;

    const newExperiences = [...experiences];
    [newExperiences[index], newExperiences[newIndex]] = [newExperiences[newIndex], newExperiences[index]];
    
    setExperiences(newExperiences);
    reorderExperiences(newExperiences);

    // Update display orders in backend
    try {
      await Promise.all(
        newExperiences.map((exp, i) =>
          fetch('/api/portfolio/experiences', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: exp.id, displayOrder: i }),
          })
        )
      );
    } catch (error) {
      console.error('Reorder error:', error);
    }
  };

  // Month options for dropdown
  const monthOptions = [];
  for (let year = new Date().getFullYear(); year >= 2000; year--) {
    for (let month = 12; month >= 1; month--) {
      const value = `${year}-${month.toString().padStart(2, '0')}`;
      const label = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      monthOptions.push({ value, label });
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-emerald-500" />
            Work Experience
          </CardTitle>
          <CardDescription>
            Add your professional experience to showcase your career journey.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Existing Experiences */}
          <AnimatePresence>
            {experiences.map((exp, index) => (
              <motion.div
                key={exp.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900 dark:text-white">{exp.role}</h4>
                      {exp.isCurrent && (
                        <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{exp.company}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {exp.startDate} - {exp.isCurrent ? 'Present' : exp.endDate}
                      {exp.location && ` • ${exp.location}`}
                    </p>
                    {exp.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{exp.description}</p>
                    )}
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
                      disabled={index === experiences.length - 1}
                      className="h-8 w-8"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(exp)}
                      className="h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(exp.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Add/Edit Form */}
          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 bg-emerald-50/50 dark:bg-emerald-950/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="company">Company *</Label>
                  <Input
                    id="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="Company name"
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="Job title"
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="exp-location">Location</Label>
                  <Input
                    id="exp-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <select
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="">Select month...</option>
                    {monthOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <select
                    id="endDate"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.isCurrent}
                    className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:border-slate-700"
                  >
                    <option value="">Select month...</option>
                    {monthOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-2 pt-6">
                  <Switch
                    id="current"
                    checked={formData.isCurrent}
                    onCheckedChange={(checked) => setFormData({ ...formData, isCurrent: checked })}
                  />
                  <Label htmlFor="current">Currently working here</Label>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="exp-description">Description</Label>
                <Textarea
                  id="exp-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe your responsibilities and achievements..."
                  rows={3}
                  className="bg-white dark:bg-slate-800 resize-none"
                />
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
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="w-full border-dashed border-2 h-12 text-slate-500 hover:text-slate-700 hover:border-slate-400"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Experience
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
