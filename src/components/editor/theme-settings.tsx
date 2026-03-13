'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Check, Loader2, Eye, Sparkles, Code2, Cpu, Brush, Gem, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { usePortfolioStore, type PersonalityType, type DensityType } from '@/store/portfolio-store';
import { toast } from 'sonner';

interface PersonalityOption {
  id: PersonalityType;
  name: string;
  description: string;
  icon: React.ElementType;
  preview: React.ReactNode;
  features: string[];
  isPremium?: boolean;
}

const personalities: PersonalityOption[] = [
  {
    id: 'minimal',
    name: 'Minimal Professional',
    description: 'Clean, structured grid layout with high contrast',
    icon: Palette,
    preview: (
      <div className="w-full h-24 bg-white rounded border border-slate-200 p-2 flex flex-col gap-1">
        <div className="h-2 w-16 bg-slate-800 rounded" />
        <div className="flex gap-1 flex-1">
          <div className="flex-1 bg-slate-100 rounded" />
          <div className="flex-1 bg-slate-50 rounded" />
        </div>
        <div className="flex gap-1">
          <div className="h-1 w-8 bg-emerald-400 rounded" />
          <div className="h-1 w-8 bg-slate-300 rounded" />
        </div>
      </div>
    ),
    features: ['Sans-serif typography', 'High contrast', 'Clean grid layout', 'Subtle hover effects'],
  },
  {
    id: 'developer',
    name: 'Modern Developer',
    description: 'Terminal-inspired dark aesthetics with code styling',
    icon: Code2,
    preview: (
      <div className="w-full h-24 bg-slate-900 rounded border border-slate-700 p-2 flex flex-col gap-1 font-mono text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-red-500" />
          <div className="w-2 h-2 rounded-full bg-yellow-500" />
          <div className="w-2 h-2 rounded-full bg-green-500" />
        </div>
        <div className="text-emerald-400">$ whoami</div>
        <div className="text-slate-400">{'>'} developer</div>
        <div className="flex gap-2 mt-1">
          <span className="text-blue-400">const</span>
          <span className="text-yellow-300">skills</span>
          <span className="text-slate-400">=</span>
        </div>
      </div>
    ),
    features: ['Dark mode default', 'Monospace typography', 'Code-block styling', 'Terminal aesthetics'],
  },
  {
    id: 'futuristic',
    name: 'Futuristic 3D',
    description: 'WebGL-powered animated background with mouse interaction',
    icon: Cpu,
    preview: (
      <div className="w-full h-24 bg-slate-950 rounded border border-slate-700 p-2 relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          {[...Array(12)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-emerald-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}
        </div>
        <div className="relative z-10 flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span className="text-emerald-400 text-xs">{'<'}/{'>'}</span>
          </div>
          <div className="text-slate-300 text-xs font-mono">digital.experience</div>
        </div>
      </div>
    ),
    features: ['3D particle animation', 'Mouse interaction', 'Performance optimized', 'Mobile fallback'],
    isPremium: true,
  },
  {
    id: 'creative',
    name: 'Creative Designer',
    description: 'Asymmetrical layouts with vibrant accents and animations',
    icon: Brush,
    preview: (
      <div className="w-full h-24 bg-gradient-to-br from-slate-50 to-white rounded border border-slate-200 p-2 relative overflow-hidden">
        <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-emerald-200 opacity-50" />
        <div className="absolute -bottom-4 -left-4 w-12 h-12 rounded-full bg-purple-200 opacity-50" />
        <div className="relative z-10">
          <div className="h-2 w-12 bg-gradient-to-r from-emerald-400 to-purple-400 rounded" />
          <div className="flex gap-1 mt-2">
            <div className="w-8 h-8 rounded-lg bg-slate-100 rotate-3" />
            <div className="w-8 h-8 rounded-lg bg-slate-50 -rotate-2" />
          </div>
        </div>
      </div>
    ),
    features: ['Gradient backgrounds', 'Playful rotations', 'Vibrant accents', 'Scroll animations'],
    isPremium: true,
  },
  {
    id: 'elegant',
    name: 'Elegant Personal Brand',
    description: 'Centered alignments with serif typography and muted pastels',
    icon: Gem,
    preview: (
      <div className="w-full h-24 bg-gradient-to-b from-white to-slate-50 rounded border border-slate-100 p-2">
        <div className="flex flex-col items-center justify-center h-full gap-1">
          <Gem className="w-4 h-4 text-rose-300" />
          <div className="h-2 w-16 bg-slate-400 rounded font-serif" />
          <div className="h-1 w-10 bg-slate-200 rounded" />
          <div className="flex gap-1 mt-1">
            <div className="h-1 w-6 bg-rose-200 rounded" />
            <div className="h-1 w-6 bg-slate-100 rounded" />
          </div>
        </div>
      </div>
    ),
    features: ['Serif typography', 'Muted pastels', 'Centered layout', 'Subtle animations'],
    isPremium: true,
  },

];

const densityOptions: { id: DensityType; name: string; description: string }[] = [
  { id: 'compact', name: 'Compact', description: 'Less spacing, more content' },
  { id: 'normal', name: 'Normal', description: 'Balanced spacing' },
  { id: 'spacious', name: 'Spacious', description: 'More breathing room' },
];

const accentColors = [
  '#10b981', // emerald
  '#3b82f6', // blue
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#f59e0b', // amber
  '#ef4444', // red
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#6366f1', // indigo
  '#f97316', // orange
];

export function ThemeSettings() {
  const { portfolio, setPersonality, setAccentColor, setDensity, setReduceMotion } = usePortfolioStore();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState<PersonalityType>(portfolio?.personalityType || 'minimal');
  const [selectedColor, setSelectedColor] = useState(portfolio?.accentColor || '#10b981');
  const [selectedDensity, setSelectedDensity] = useState<DensityType>(portfolio?.density || 'normal');
  const [selectedReduceMotion, setSelectedReduceMotion] = useState(portfolio?.reduceMotion || false);

  useEffect(() => {
    setSelectedPersonality(portfolio?.personalityType || 'minimal');
    setSelectedColor(portfolio?.accentColor || '#10b981');
    setSelectedDensity(portfolio?.density || 'normal');
    setSelectedReduceMotion(portfolio?.reduceMotion || false);
  }, [portfolio]);

  const handleSave = async () => {
    if (!portfolio?.id) {
      toast.error('Portfolio not found');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: portfolio.userId,
          personalityType: selectedPersonality,
          accentColor: selectedColor,
          density: selectedDensity,
          reduceMotion: selectedReduceMotion,
        }),
      });

      if (!response.ok) throw new Error('Failed to save');

      setPersonality(selectedPersonality);
      setAccentColor(selectedColor);
      setDensity(selectedDensity);
      setReduceMotion(selectedReduceMotion);

      toast.success('Theme settings saved!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save theme settings');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Personality Selection */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="w-5 h-5 text-emerald-500" />
            Personality
          </CardTitle>
          <CardDescription>
            Choose a design personality that matches your professional vibe.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {personalities.map((personality) => (
              <motion.button
                key={personality.id}
                onClick={() => setSelectedPersonality(personality.id)}
                className={`relative p-4 rounded-xl border-2 text-left transition-all ${
                  selectedPersonality === personality.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                }`}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                {selectedPersonality === personality.id && (
                  <div className="absolute top-2 right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                {personality.isPremium && (
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Premium
                  </div>
                )}
                <div className="flex items-center gap-2 mb-2">
                  <personality.icon className="w-4 h-4 text-slate-400" />
                  <h4 className="font-medium text-slate-900 dark:text-white">
                    {personality.name}
                  </h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-3">
                  {personality.description}
                </p>
                {personality.preview}
                <div className="mt-3 flex flex-wrap gap-1">
                  {personality.features.map((feature) => (
                    <span
                      key={feature}
                      className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-600 dark:text-slate-400"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accent Color */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Accent Color</CardTitle>
          <CardDescription>
            Choose a color that represents your brand.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            {accentColors.map((color) => (
              <motion.button
                key={color}
                onClick={() => setSelectedColor(color)}
                className={`w-10 h-10 rounded-full transition-all ${
                  selectedColor === color
                    ? 'ring-2 ring-offset-2 ring-slate-900 dark:ring-white'
                    : ''
                }`}
                style={{ backgroundColor: color }}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                {selectedColor === color && (
                  <Check className="w-5 h-5 text-white mx-auto" />
                )}
              </motion.button>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Label className="text-sm text-slate-500">Custom:</Label>
            <input
              type="color"
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-8 h-8 rounded cursor-pointer border-0"
            />
            <Input
              value={selectedColor}
              onChange={(e) => setSelectedColor(e.target.value)}
              className="w-24 h-8 text-xs bg-slate-50 dark:bg-slate-800"
            />
          </div>
        </CardContent>
      </Card>

      {/* Density */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Spacing Density</CardTitle>
          <CardDescription>
            Adjust the spacing and padding of your portfolio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            {densityOptions.map((option) => (
              <motion.button
                key={option.id}
                onClick={() => setSelectedDensity(option.id)}
                className={`flex-1 p-3 rounded-lg border-2 transition-all ${
                  selectedDensity === option.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300'
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="text-sm font-medium text-slate-900 dark:text-white">
                  {option.name}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {option.description}
                </div>
              </motion.button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Accessibility */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Accessibility</CardTitle>
          <CardDescription>
            Adjust settings for better accessibility.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-slate-900 dark:text-white">Reduce Motion</p>
              <p className="text-xs text-slate-500">
                Disable animations and 3D effects
              </p>
            </div>
            <Switch
              checked={selectedReduceMotion}
              onCheckedChange={setSelectedReduceMotion}
            />
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      <Button
        onClick={handleSave}
        disabled={isLoading}
        className="w-full bg-emerald-500 hover:bg-emerald-600 text-white h-12"
      >
        {isLoading ? (
          <Loader2 className="w-5 h-5 animate-spin mr-2" />
        ) : (
          <Eye className="w-5 h-5 mr-2" />
        )}
        Apply Theme Changes
      </Button>
    </motion.div>
  );
}
