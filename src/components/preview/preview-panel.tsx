'use client';

import { useState, useEffect, useCallback, Component, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Monitor, Smartphone, Maximize2, RefreshCw, X, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePortfolioStore } from '@/store/portfolio-store';
import { MinimalPersonality } from '@/components/personalities/minimal-personality';
import { DeveloperPersonality } from '@/components/personalities/developer-personality';
import { FuturisticPersonality } from '@/components/personalities/futuristic-personality';
import { CreativePersonality } from '@/components/personalities/creative-personality';
import { ElegantPersonality } from '@/components/personalities/elegant-personality';

import { useAuthStore } from '@/store/auth-store';

// Error Boundary Component
class PreviewErrorBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error) {
    console.error('Preview Error:', error);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}

// Error fallback component
function ErrorFallback({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-950 p-4">
      <div className="text-center max-w-sm">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
          Preview Error
        </h3>
        <p className="text-slate-500 text-sm mb-4">
          Something went wrong while rendering the preview. Please try again.
        </p>
        <Button onClick={onRetry} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </div>
    </div>
  );
}

// Helper function to render the correct personality
function renderPersonality(
  personalityType: string,
  portfolio: NonNullable<ReturnType<typeof usePortfolioStore>['portfolio']>,
  user: ReturnType<typeof useAuthStore>['user'],
  isMobilePreview: boolean
) {
  const commonProps = { portfolio, user, isMobilePreview };
  
  switch (personalityType) {
    case 'developer':
      return <DeveloperPersonality {...commonProps} />;
    case 'futuristic':
      return <FuturisticPersonality {...commonProps} />;
    case 'creative':
      return <CreativePersonality {...commonProps} />;
    case 'elegant':
      return <ElegantPersonality {...commonProps} />;

    case 'minimal':
    default:
      return <MinimalPersonality {...commonProps} />;
  }
}

// Get personality display name
function getPersonalityName(type: string): string {
  const names: Record<string, string> = {
    minimal: 'Minimal Professional',
    developer: 'Modern Developer',
    futuristic: 'Futuristic 3D',
    creative: 'Creative Designer',
    elegant: 'Elegant Personal Brand',

  };
  return names[type] || 'Unknown';
}

// Separate component for preview content
function PreviewContent({ 
  portfolio, 
  user, 
  deviceMode,
  onRetry,
}: { 
  portfolio: NonNullable<ReturnType<typeof usePortfolioStore>['portfolio']>;
  user: ReturnType<typeof useAuthStore>['user'];
  deviceMode: 'desktop' | 'mobile';
  onRetry: () => void;
}) {
  const isMobilePreview = deviceMode === 'mobile';
  
  return (
    <PreviewErrorBoundary fallback={<ErrorFallback onRetry={onRetry} />}>
      <motion.div
        key={`${portfolio.personalityType}-${deviceMode}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.2 }}
        className={`bg-white dark:bg-slate-900 rounded-lg shadow-xl ${
          deviceMode === 'mobile' ? 'max-w-[375px] mx-auto overflow-hidden' : 'w-full'
        }`}
        style={{
          minHeight: deviceMode === 'mobile' ? '667px' : '600px',
          height: deviceMode === 'mobile' ? '667px' : '100%',
        }}
      >
        {renderPersonality(portfolio.personalityType, portfolio, user, isMobilePreview)}
      </motion.div>
    </PreviewErrorBoundary>
  );
}

export function PreviewPanel() {
  const { portfolio, isLoading } = usePortfolioStore();
  const { user } = useAuthStore();
  const [deviceMode, setDeviceMode] = useState<'desktop' | 'mobile'>('desktop');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
  }, []);

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Close fullscreen on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  // Show loading state
  if (isLoading) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-400 text-sm">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  if (!portfolio) {
    return (
      <div className="h-full flex items-center justify-center bg-slate-100 dark:bg-slate-950">
        <div className="text-center">
          <p className="text-slate-400">No portfolio data</p>
          <p className="text-slate-500 text-xs mt-1">Try refreshing the page</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="h-full flex flex-col bg-slate-100 dark:bg-slate-950">
        {/* Preview Header */}
        <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-emerald-500" />
            <span className="font-medium text-sm text-slate-900 dark:text-white">Live Preview</span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setDeviceMode('desktop')}
              className="h-8 w-8"
              title="Desktop view"
            >
              <Monitor className="w-4 h-4" />
            </Button>
            <Button
              variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'}
              size="icon"
              onClick={() => setDeviceMode('mobile')}
              className="h-8 w-8"
              title="Mobile view"
            >
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="h-8 w-8"
              title="Refresh preview"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="h-8 w-8"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Preview Content */}
        <div className="flex-1 overflow-auto p-4" key={refreshKey}>
          <AnimatePresence mode="wait">
            <PreviewContent 
              portfolio={portfolio} 
              user={user} 
              deviceMode={deviceMode}
              onRetry={handleRefresh}
            />
          </AnimatePresence>
        </div>
      </div>

      {/* Fullscreen Modal */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/95 backdrop-blur-sm flex flex-col"
          >
            {/* Fullscreen Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700 shrink-0">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-emerald-500" />
                  <span className="font-medium text-white">Fullscreen Preview</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant={deviceMode === 'desktop' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setDeviceMode('desktop')}
                    className="h-8 w-8"
                  >
                    <Monitor className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={deviceMode === 'mobile' ? 'secondary' : 'ghost'}
                    size="icon"
                    onClick={() => setDeviceMode('mobile')}
                    className="h-8 w-8"
                  >
                    <Smartphone className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleFullscreen}
                className="h-10 w-10 text-white hover:text-white hover:bg-slate-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Fullscreen Content */}
            <div className="flex-1 overflow-auto flex items-start justify-center p-6">
              <div 
                className={`bg-white dark:bg-slate-900 rounded-lg shadow-xl overflow-hidden ${
                  deviceMode === 'mobile' ? 'max-w-[375px]' : 'w-full max-w-6xl'
                }`}
              >
                {renderPersonality(portfolio.personalityType, portfolio, user, deviceMode === 'mobile')}
              </div>
            </div>

            {/* Fullscreen Footer */}
            <div className="px-6 py-3 border-t border-slate-700 flex items-center justify-between shrink-0">
              <span className="text-sm text-slate-400">
                Press <kbd className="px-2 py-0.5 bg-slate-700 rounded text-xs">ESC</kbd> to exit fullscreen
              </span>
              <span className="text-sm text-slate-500">
                {getPersonalityName(portfolio.personalityType)} Theme
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
