// Toast.tsx
import type { ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastProps {
  toast: Toast;
  onRemove: (id: string) => void;
}

const icons: Record<ToastType, ReactNode> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

const colors: Record<ToastType, string> = {
  success: 'bg-success text-white',
  error: 'bg-error text-white',
  warning: 'bg-warning text-white',
  info: 'bg-primary text-white',
};

export default function Toast({ toast, onRemove }: ToastProps) {
  return (
    <div
      className={`${colors[toast.type]} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 min-w-75  animate-slide-in`}
    >
      <span className="text-xl">{icons[toast.type]}</span>
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button onClick={() => onRemove(toast.id)} className="text-white hover:opacity-80">
        ✕
      </button>
    </div>
  );
}
