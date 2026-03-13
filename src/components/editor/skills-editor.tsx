'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wrench, Plus, X, Loader2, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePortfolioStore, type Skill } from '@/store/portfolio-store';
import { toast } from 'sonner';

const skillCategories = [
  { value: 'technical', label: 'Technical', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'tools', label: 'Tools & Frameworks', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'soft', label: 'Soft Skills', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
] as const;

const commonSkills = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'Go', 'Rust', 'Ruby',
  'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Rails',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'GraphQL', 'REST API',
  'Docker', 'Kubernetes', 'AWS', 'Azure', 'GCP', 'CI/CD',
  'Git', 'Linux', 'Agile', 'Scrum', 'Leadership', 'Communication',
];

export function SkillsEditor() {
  const { portfolio, addSkill, deleteSkill } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(false);
  const [skills, setSkills] = useState<Skill[]>(portfolio?.skills || []);
  const [newSkill, setNewSkill] = useState('');
  const [newCategory, setNewCategory] = useState<'technical' | 'tools' | 'soft'>('technical');
  const [newProficiency, setNewProficiency] = useState(3);

  useEffect(() => {
    setSkills(portfolio?.skills || []);
  }, [portfolio?.skills]);

  const handleAddSkill = async () => {
    if (!newSkill.trim()) {
      toast.error('Please enter a skill name');
      return;
    }

    if (skills.some(s => s.name.toLowerCase() === newSkill.toLowerCase())) {
      toast.error('Skill already exists');
      return;
    }

    if (!portfolio?.id) {
      toast.error('Portfolio not found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/portfolio/skills', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          portfolioId: portfolio.id,
          name: newSkill.trim(),
          category: newCategory,
          proficiency: newProficiency,
          displayOrder: skills.length,
        }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      addSkill({
        name: newSkill.trim(),
        category: newCategory,
        proficiency: newProficiency,
        displayOrder: skills.length,
        isVisible: true,
      });

      setNewSkill('');
      toast.success('Skill added!');
    } catch (error) {
      console.error('Add skill error:', error);
      toast.error('Failed to add skill');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteSkill = async (id: string) => {
    try {
      await fetch(`/api/portfolio/skills?id=${id}`, { method: 'DELETE' });
      deleteSkill(id);
      toast.success('Skill removed');
    } catch (error) {
      console.error('Delete skill error:', error);
      toast.error('Failed to remove skill');
    }
  };

  const handleAddCommonSkill = async (skillName: string) => {
    if (skills.some(s => s.name.toLowerCase() === skillName.toLowerCase())) {
      return;
    }

    setNewSkill(skillName);
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    const category = skill.category || 'technical';
    if (!acc[category]) acc[category] = [];
    acc[category].push(skill);
    return acc;
  }, {} as Record<string, Skill[]>);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-emerald-500" />
            Skills
          </CardTitle>
          <CardDescription>
            Add your technical and soft skills. They'll be displayed as tags in your portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Add Skill Form */}
          <div className="space-y-4 p-4 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800/50">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="skill-name">Skill Name</Label>
                <Input
                  id="skill-name"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="e.g., React, Python, Leadership"
                  className="bg-white dark:bg-slate-800"
                  onKeyDown={(e) => e.key === 'Enter' && handleAddSkill()}
                />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={newCategory} onValueChange={(v) => setNewCategory(v as typeof newCategory)}>
                  <SelectTrigger className="bg-white dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {skillCategories.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Proficiency (1-5)</Label>
                <Select value={newProficiency.toString()} onValueChange={(v) => setNewProficiency(parseInt(v))}>
                  <SelectTrigger className="bg-white dark:bg-slate-800">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={n.toString()}>
                        {'★'.repeat(n)}{'☆'.repeat(5 - n)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Button
              onClick={handleAddSkill}
              disabled={isLoading || !newSkill.trim()}
              className="w-full bg-emerald-500 hover:bg-emerald-600"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              Add Skill
            </Button>
          </div>

          {/* Quick Add */}
          <div className="space-y-2">
            <Label className="text-sm text-slate-500">Quick Add (click to add)</Label>
            <div className="flex flex-wrap gap-2">
              {commonSkills.filter(s => !skills.some(sk => sk.name.toLowerCase() === s.toLowerCase())).slice(0, 12).map((skill) => (
                <Button
                  key={skill}
                  variant="outline"
                  size="sm"
                  onClick={() => handleAddCommonSkill(skill)}
                  className="text-xs"
                >
                  <Hash className="w-3 h-3 mr-1" />
                  {skill}
                </Button>
              ))}
            </div>
          </div>

          {/* Skills by Category */}
          {Object.entries(groupedSkills).map(([category, categorySkills]) => (
            <div key={category} className="space-y-3">
              <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">
                {skillCategories.find(c => c.value === category)?.label || category}
              </h4>
              <div className="flex flex-wrap gap-2">
                <AnimatePresence>
                  {categorySkills.map((skill) => (
                    <motion.div
                      key={skill.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Badge
                        variant="secondary"
                        className={`px-3 py-1.5 text-sm ${
                          skillCategories.find(c => c.value === skill.category)?.color || ''
                        }`}
                      >
                        {skill.name}
                        <span className="ml-2 text-xs opacity-60">
                          {'★'.repeat(skill.proficiency)}
                        </span>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="ml-2 hover:text-red-500 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>
          ))}

          {skills.length === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <Wrench className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No skills added yet. Start by adding your key skills above.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
