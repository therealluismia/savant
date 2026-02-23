import { useToastStore } from '@/store';

export function useToast() {
  const { showSuccess, showError, showWarning, showInfo, removeToast, clearToasts } =
    useToastStore();
  return { showSuccess, showError, showWarning, showInfo, removeToast, clearToasts };
}
