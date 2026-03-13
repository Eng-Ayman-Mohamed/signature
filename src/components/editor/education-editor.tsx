'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GraduationCap, Plus, Pencil, Trash2, Save, X, Loader2, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { usePortfolioStore, type Education } from '@/store/portfolio-store';
import { useAlert } from '@/hooks/use-alert';
import { toast } from 'sonner';

interface EducationFormData {
  id?: string;
  institution: string;
  degree: string;
  field: string;
  location: string;
  startDate: string;
  endDate: string;
  isCurrent: boolean;
  description: string;
}

const initialFormData: EducationFormData = {
  institution: '',
  degree: '',
  field: '',
  location: '',
  startDate: '',
  endDate: '',
  isCurrent: false,
  description: '',
};

export function EducationEditor() {
  const { portfolio, addEducation, updateEducation, deleteEducation, reorderEducations } = usePortfolioStore();
  const { confirm } = useAlert();
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<EducationFormData>(initialFormData);
  const [educations, setEducations] = useState<Education[]>(portfolio?.educations || []);

  useEffect(() => {
    setEducations(portfolio?.educations || []);
  }, [portfolio?.educations]);

  const resetForm = () => {
    setFormData(initialFormData);
    setEditingId(null);
    setIsEditing(false);
  };

  const handleEdit = (edu: Education) => {
    setFormData({
      id: edu.id,
      institution: edu.institution,
      degree: edu.degree,
      field: edu.field || '',
      location: edu.location || '',
      startDate: edu.startDate,
      endDate: edu.endDate || '',
      isCurrent: edu.isCurrent,
      description: edu.description || '',
    });
    setEditingId(edu.id);
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!formData.institution || !formData.degree || !formData.startDate) {
      toast.error('Institution, degree, and start date are required');
      return;
    }

    if (!portfolio?.id) {
      toast.error('Portfolio not found');
      return;
    }

    setIsLoading(true);
    try {
      if (editingId) {
        const response = await fetch('/api/portfolio/educations', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            ...formData,
            endDate: formData.isCurrent ? null : formData.endDate,
          }),
        });

        if (!response.ok) throw new Error('Failed to update');
        
        updateEducation(editingId, {
          ...formData,
          endDate: formData.isCurrent ? null : formData.endDate,
        });
        toast.success('Education updated!');
      } else {
        const response = await fetch('/api/portfolio/educations', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            portfolioId: portfolio.id,
            ...formData,
            endDate: formData.isCurrent ? null : formData.endDate,
            displayOrder: educations.length,
          }),
        });

        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Failed to create');
        
        addEducation({
          ...formData,
          endDate: formData.isCurrent ? null : formData.endDate,
          displayOrder: educations.length,
          isVisible: true,
        });
        toast.success('Education added!');
      }

      resetForm();
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save education');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    confirm(
      'Delete Education',
      'Are you sure you want to delete this education? This action cannot be undone.',
      async () => {
        try {
          await fetch(`/api/portfolio/educations?id=${id}`, { method: 'DELETE' });
          deleteEducation(id);
          toast.success('Education deleted');
        } catch (error) {
          console.error('Delete error:', error);
          toast.error('Failed to delete education');
        }
      }
    );
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= educations.length) return;

    const newEducations = [...educations];
    [newEducations[index], newEducations[newIndex]] = [newEducations[newIndex], newEducations[index]];
    
    setEducations(newEducations);
    reorderEducations(newEducations);

    try {
      await Promise.all(
        newEducations.map((edu, i) =>
          fetch('/api/portfolio/educations', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: edu.id, displayOrder: i }),
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
            <GraduationCap className="w-5 h-5 text-emerald-500" />
            Education
          </CardTitle>
          <CardDescription>
            Add your educational background to highlight your academic achievements.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <AnimatePresence>
            {educations.map((edu, index) => (
              <motion.div
                key={edu.id}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="border border-slate-200 dark:border-slate-700 rounded-lg p-4 bg-slate-50 dark:bg-slate-800/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium text-slate-900 dark:text-white">{edu.degree}</h4>
                      {edu.field && (
                        <Badge variant="outline" className="text-xs">
                          {edu.field}
                        </Badge>
                      )}
                      {edu.isCurrent && (
                        <Badge variant="secondary" className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          Current
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{edu.institution}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                      {edu.startDate} - {edu.isCurrent ? 'Present' : edu.endDate}
                      {edu.location && ` • ${edu.location}`}
                    </p>
                    {edu.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mt-2">{edu.description}</p>
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
                      disabled={index === educations.length - 1}
                      className="h-8 w-8"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(edu)}
                      className="h-8 w-8"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(edu.id)}
                      className="h-8 w-8 text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isEditing ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 bg-emerald-50/50 dark:bg-emerald-950/20"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="institution">Institution *</Label>
                  <Input
                    id="institution"
                    value={formData.institution}
                    onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                    placeholder="University name"
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="degree">Degree *</Label>
                  <Input
                    id="degree"
                    value={formData.degree}
                    onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                    placeholder="Bachelor's, Master's, etc."
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field">Field of Study</Label>
                  <Input
                    id="field"
                    value={formData.field}
                    onChange={(e) => setFormData({ ...formData, field: e.target.value })}
                    placeholder="Computer Science, Design, etc."
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edu-location">Location</Label>
                  <Input
                    id="edu-location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="City, Country"
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edu-startDate">Start Date *</Label>
                  <Input
                    id="edu-startDate"
                    type="month"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edu-endDate">End Date</Label>
                  <Input
                    id="edu-endDate"
                    type="month"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    disabled={formData.isCurrent}
                    className="bg-white dark:bg-slate-800"
                  />
                </div>
                <div className="flex items-center gap-2 pt-6 md:col-span-2">
                  <Switch
                    id="edu-current"
                    checked={formData.isCurrent}
                    onCheckedChange={(checked) => setFormData({ ...formData, isCurrent: checked })}
                  />
                  <Label htmlFor="edu-current">Currently studying here</Label>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="edu-description">Description</Label>
                <Textarea
                  id="edu-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Notable achievements, activities, or focus areas..."
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
              Add Education
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
