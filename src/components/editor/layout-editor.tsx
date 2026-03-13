'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Wrench,
  Mail,
  Eye,
  EyeOff,
  Layout,
  Loader2,
  Save,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { usePortfolioStore } from '@/store/portfolio-store';
import { toast } from 'sonner';

// Section configuration
const sectionConfig = {
  about: { label: 'About Me', icon: User, description: 'Personal introduction and bio' },
  experience: { label: 'Experience', icon: Briefcase, description: 'Work history and positions' },
  education: { label: 'Education', icon: GraduationCap, description: 'Academic background' },
  projects: { label: 'Projects', icon: FolderGit2, description: 'Portfolio projects and work' },
  skills: { label: 'Skills', icon: Wrench, description: 'Technical and soft skills' },
  contact: { label: 'Contact', icon: Mail, description: 'Contact information and links' },
};

type SectionId = keyof typeof sectionConfig;

interface SortableItemProps {
  id: SectionId;
  isActive: boolean;
  onToggle: (id: SectionId) => void;
}

function SortableItem({ id, isActive, onToggle }: SortableItemProps) {
  const config = sectionConfig[id];
  const Icon = config.icon;
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`
        relative flex items-center gap-3 p-4 bg-white dark:bg-slate-900 
        border border-slate-200 dark:border-slate-700 rounded-xl
        ${isDragging ? 'shadow-xl ring-2 ring-emerald-500/50' : 'shadow-sm'}
        ${!isActive ? 'opacity-50' : ''}
        transition-all duration-200
      `}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-grab active:cursor-grabbing touch-none"
      >
        <GripVertical className="w-5 h-5 text-slate-400" />
      </button>

      {/* Icon */}
      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-slate-900 dark:text-white">{config.label}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{config.description}</p>
      </div>

      {/* Visibility Toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onToggle(id)}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          title={isActive ? 'Hide section' : 'Show section'}
        >
          {isActive ? (
            <Eye className="w-4 h-4 text-emerald-500" />
          ) : (
            <EyeOff className="w-4 h-4 text-slate-400" />
          )}
        </button>
      </div>
    </motion.div>
  );
}

interface DragOverlayItemProps {
  id: SectionId;
}

function DragOverlayItem({ id }: DragOverlayItemProps) {
  const config = sectionConfig[id];
  const Icon = config.icon;

  return (
    <div className="flex items-center gap-3 p-4 bg-white dark:bg-slate-900 border-2 border-emerald-500 rounded-xl shadow-2xl ring-2 ring-emerald-500/30">
      <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800">
        <GripVertical className="w-5 h-5 text-slate-400" />
      </div>
      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-slate-900 dark:text-white">{config.label}</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{config.description}</p>
      </div>
    </div>
  );
}

export function LayoutEditor() {
  const { portfolio, setLayoutOrder } = usePortfolioStore();
  const [sections, setSections] = useState<SectionId[]>([]);
  const [hiddenSections, setHiddenSections] = useState<Set<SectionId>>(new Set());
  const [activeId, setActiveId] = useState<SectionId | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Parse layoutOrder from portfolio
  useEffect(() => {
    if (portfolio?.layoutOrder) {
      const order = portfolio.layoutOrder.split(',').filter(Boolean) as SectionId[];
      // Ensure all sections are included
      const allSections: SectionId[] = ['about', 'experience', 'education', 'projects', 'skills', 'contact'];
      const missingSections = allSections.filter(s => !order.includes(s));
      setSections([...order, ...missingSections]);
    } else {
      // Default order
      setSections(['about', 'experience', 'education', 'projects', 'skills', 'contact']);
    }
  }, [portfolio?.layoutOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as SectionId);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setSections((items) => {
        const oldIndex = items.indexOf(active.id as SectionId);
        const newIndex = items.indexOf(over.id as SectionId);
        return arrayMove(items, oldIndex, newIndex);
      });
      setHasChanges(true);
    }

    setActiveId(null);
  };

  const handleToggleSection = (id: SectionId) => {
    setHiddenSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    if (!portfolio?.id) {
      toast.error('Portfolio not found');
      return;
    }

    setIsSaving(true);
    try {
      const newOrder = sections.filter(s => !hiddenSections.has(s)).join(',');
      
      const response = await fetch('/api/portfolio', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: portfolio.userId,
          layoutOrder: newOrder,
        }),
      });

      if (!response.ok) throw new Error('Failed to save layout');

      setLayoutOrder(newOrder);
      setHasChanges(false);
      toast.success('Layout saved successfully!');
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Failed to save layout');
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    setSections(['about', 'experience', 'education', 'projects', 'skills', 'contact']);
    setHiddenSections(new Set());
    setHasChanges(true);
    toast.info('Layout reset to default');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5 text-emerald-500" />
                Section Layout
              </CardTitle>
              <CardDescription>
                Drag and drop to reorder sections. Toggle visibility with the eye icon.
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
              >
                Reset
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
                className="bg-emerald-500 hover:bg-emerald-600"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Layout
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Info Banner */}
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800">
            <p className="text-sm text-emerald-700 dark:text-emerald-300">
              <strong>Tip:</strong> Drag sections to reorder them in your portfolio. 
              Hidden sections won't appear in the preview or published portfolio.
            </p>
          </div>

          {/* Drag and Drop List */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={sections} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                <AnimatePresence>
                  {sections.map((id) => (
                    <SortableItem
                      key={id}
                      id={id}
                      isActive={!hiddenSections.has(id)}
                      onToggle={handleToggleSection}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </SortableContext>

            <DragOverlay>
              {activeId ? <DragOverlayItem id={activeId} /> : null}
            </DragOverlay>
          </DndContext>

          {/* Stats */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-700">
            <p className="text-sm text-slate-500">
              {sections.length - hiddenSections.size} of {sections.length} sections visible
            </p>
            {hasChanges && (
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Unsaved changes
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card className="border-0 shadow-lg bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-base">Layout Preview</CardTitle>
          <CardDescription>
            Current section order in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {sections
              .filter(s => !hiddenSections.has(s))
              .map((id, index) => {
                const config = sectionConfig[id];
                const Icon = config.icon;
                return (
                  <motion.div
                    key={id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-sm"
                  >
                    <span className="w-5 h-5 rounded bg-emerald-500 text-white text-xs flex items-center justify-center font-medium">
                      {index + 1}
                    </span>
                    <Icon className="w-3.5 h-3.5 text-slate-500" />
                    <span className="text-slate-700 dark:text-slate-300">{config.label}</span>
                  </motion.div>
                );
              })}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
