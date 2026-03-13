'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { 
  Info, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  HelpCircle,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAlertStore } from '@/store/alert-store';
import { cn } from '@/lib/utils';

const iconMap = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: XCircle,
  confirm: HelpCircle,
};

const colorMap = {
  info: 'text-blue-500 bg-blue-500/10',
  success: 'text-emerald-500 bg-emerald-500/10',
  warning: 'text-amber-500 bg-amber-500/10',
  error: 'text-red-500 bg-red-500/10',
  confirm: 'text-violet-500 bg-violet-500/10',
};

export function AlertModal() {
  const { isOpen, options, isLoading, hide, setLoading } = useAlertStore();

  const handleConfirm = async () => {
    // Execute custom onClick if provided
    if (options?.confirmButton?.onClick) {
      setLoading(true);
      try {
        await options.confirmButton.onClick();
        hide();
      } catch (error) {
        console.error('Alert action error:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Execute onConfirm callback if provided
    if (options?.onConfirm) {
      setLoading(true);
      try {
        await options.onConfirm();
        hide();
      } catch (error) {
        console.error('Alert action error:', error);
      } finally {
        setLoading(false);
      }
      return;
    }

    // Just close
    hide();
  };

  const handleCancel = () => {
    if (options?.cancelButton?.onClick) {
      options.cancelButton.onClick();
    } else if (options?.onCancel) {
      options.onCancel();
    }
    hide();
  };

  return (
    <AnimatePresence>
      {isOpen && options && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={isLoading ? undefined : handleCancel}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="relative w-full max-w-md mx-4 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden"
          >
            {/* Close button */}
            {!isLoading && (
              <button
                onClick={handleCancel}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <div className="p-6">
              {/* Icon */}
              <div className="flex justify-center mb-4">
                <div className={cn('w-14 h-14 rounded-full flex items-center justify-center', colorMap[options.type])}>
                  <IconComponent type={options.type} />
                </div>
              </div>

              {/* Content */}
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
                  {options.title}
                </h3>
                {options.description && (
                  <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
                    {options.description}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className={cn(
                'flex gap-3',
                options.type === 'confirm' || options.cancelButton ? 'flex-row-reverse justify-center' : 'justify-center'
              )}>
                <Button
                  onClick={handleConfirm}
                  disabled={isLoading}
                  variant={options.confirmButton?.variant || (options.type === 'error' ? 'destructive' : 'default')}
                  className={cn(
                    'min-w-[100px]',
                    options.type === 'success' && !options.confirmButton?.variant && 'bg-emerald-500 hover:bg-emerald-600',
                    options.type === 'confirm' && !options.confirmButton?.variant && 'bg-violet-500 hover:bg-violet-600'
                  )}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    options.confirmButton?.label || (options.type === 'confirm' ? 'Confirm' : 'OK')
                  )}
                </Button>

                {(options.type === 'confirm' || options.cancelButton) && (
                  <Button
                    onClick={handleCancel}
                    disabled={isLoading}
                    variant={options.cancelButton?.variant || 'outline'}
                    className="min-w-[100px]"
                  >
                    {options.cancelButton?.label || 'Cancel'}
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// Separate icon component to avoid ReactNode serialization issues
function IconComponent({ type }: { type: AlertType }) {
  const Icon = iconMap[type];
  return <Icon className="w-7 h-7" />;
}

type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm';
