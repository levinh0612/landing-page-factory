import { useEffect } from 'react';
import { X, Check, AlertCircle } from 'lucide-react';
import type { Toast as ToastType } from '@/hooks/useToast';
import { useToast } from '@/hooks/useToast';

interface ToastProps {
  toast: ToastType;
  onRemove: (id: string) => void;
}

function ToastItem({ toast, onRemove }: ToastProps) {
  useEffect(() => {
    if (toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast, onRemove]);

  const bgColor =
    toast.type === 'success'
      ? 'bg-green-900/20 border-green-900/50'
      : toast.type === 'error'
        ? 'bg-red-900/20 border-red-900/50'
        : 'bg-blue-900/20 border-blue-900/50';

  const textColor =
    toast.type === 'success'
      ? 'text-green-400'
      : toast.type === 'error'
        ? 'text-red-400'
        : 'text-blue-400';

  const Icon =
    toast.type === 'success'
      ? Check
      : toast.type === 'error'
        ? AlertCircle
        : AlertCircle;

  return (
    <div
      className={`flex items-center gap-3 rounded-lg border ${bgColor} ${textColor} px-4 py-3 shadow-lg backdrop-blur`}
    >
      <Icon size={20} />
      <span className="flex-1 text-sm font-medium">{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        className="hover:opacity-70"
      >
        <X size={16} />
      </button>
    </div>
  );
}

interface ToastContainerProps {
  toasts: ToastType[];
  onRemove: (id: string) => void;
}

function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className="pointer-events-none fixed bottom-20 left-4 right-4 z-50 flex flex-col gap-2 sm:bottom-4 sm:max-w-sm sm:left-auto sm:right-4">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}

export function useToastContext() {
  return useToast();
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { toasts, removeToast } = useToast();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

export { ToastContainer };
