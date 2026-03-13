'use client';

import { useAlertStore, type AlertOptions, type AlertType, alert } from '@/store/alert-store';

export function useAlert() {
  const store = useAlertStore();

  return {
    // State
    isOpen: store.isOpen,
    isLoading: store.isLoading,
    options: store.options,
    
    // Core methods
    show: store.show,
    hide: store.hide,
    
    // Convenience methods via store
    info: alert.info,
    success: alert.success,
    warning: alert.warning,
    error: alert.error,
    confirm: alert.confirm,
  };
}

// Export imperative API for use outside components
export { alert };

// Re-export types
export type { AlertOptions, AlertType };
