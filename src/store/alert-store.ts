import { create } from 'zustand';

export type AlertType = 'info' | 'success' | 'warning' | 'error' | 'confirm';

export interface AlertButton {
  label: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  onClick?: () => void | Promise<void>;
}

export interface AlertOptions {
  type: AlertType;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  confirmButton?: AlertButton;
  cancelButton?: AlertButton;
  onConfirm?: () => void | Promise<void>;
  onCancel?: () => void;
}

interface AlertState {
  isOpen: boolean;
  options: AlertOptions | null;
  isLoading: boolean;
  
  show: (options: AlertOptions) => void;
  hide: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAlertStore = create<AlertState>((set) => ({
  isOpen: false,
  options: null,
  isLoading: false,
  
  show: (options) => set({ isOpen: true, options }),
  hide: () => set({ isOpen: false, options: null, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
}));

// Helper object for imperative usage (outside of React components)
export const alert = {
  show: (options: AlertOptions) => useAlertStore.getState().show(options),
  hide: () => useAlertStore.getState().hide(),
  
  info: (title: string, description?: string) => {
    useAlertStore.getState().show({
      type: 'info',
      title,
      description,
      confirmButton: { label: 'OK' },
    });
  },
  
  success: (title: string, description?: string) => {
    useAlertStore.getState().show({
      type: 'success',
      title,
      description,
      confirmButton: { label: 'Got it' },
    });
  },
  
  warning: (title: string, description?: string) => {
    useAlertStore.getState().show({
      type: 'warning',
      title,
      description,
      confirmButton: { label: 'Understood' },
    });
  },
  
  error: (title: string, description?: string) => {
    useAlertStore.getState().show({
      type: 'error',
      title,
      description,
      confirmButton: { label: 'Close', variant: 'destructive' },
    });
  },
  
  confirm: (
    title: string, 
    description: string, 
    onConfirm: () => void | Promise<void>,
    onCancel?: () => void
  ) => {
    useAlertStore.getState().show({
      type: 'confirm',
      title,
      description,
      onConfirm,
      onCancel,
      confirmButton: { label: 'Confirm' },
      cancelButton: { label: 'Cancel', variant: 'outline' },
    });
  },
};
