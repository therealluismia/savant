import { create } from 'zustand';
import type { ToastMessage, ToastType } from '@/types';
import { TOAST_DURATION } from '@/constants';

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => void;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
}

function generateId(): string {
  return `toast_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function createToastHelper(type: ToastType) {
  return (get: () => ToastStore) =>
    (title: string, description?: string) => {
      get().addToast({ type, title, description, duration: TOAST_DURATION.MEDIUM });
    };
}

export const useToastStore = create<ToastStore>((set, get) => ({
  toasts: [],

  addToast: (toast) => {
    const id = generateId();
    const duration = toast.duration ?? TOAST_DURATION.MEDIUM;
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));
    setTimeout(() => {
      get().removeToast(id);
    }, duration);
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearToasts: () => {
    set({ toasts: [] });
  },

  showSuccess: createToastHelper('success')(get),
  showError: createToastHelper('error')(get),
  showWarning: createToastHelper('warning')(get),
  showInfo: createToastHelper('info')(get),
}));
