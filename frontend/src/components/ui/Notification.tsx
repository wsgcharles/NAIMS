import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';

type ToastVariant = 'info' | 'success' | 'warning' | 'error';

interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
  duration?: number;
}

interface NotificationProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const variantStyles: Record<ToastVariant, string> = {
  info: 'bg-blue-50 border-blue-200 text-blue-800 dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200',
  success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-200',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-200',
  error: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-900/30 dark:border-rose-700 dark:text-rose-200',
};

const ToastItem: React.FC<{ toast: Toast; onRemove: (id: string) => void }> = ({
  toast,
  onRemove,
}) => {
  const { id, title, description, variant = 'info', duration = 5000 } = toast;
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setVisible(false), duration);
    return () => clearTimeout(timer);
  }, [duration]);

  useEffect(() => {
    if (!visible) {
      const timeout = setTimeout(() => onRemove(id), 300);
      return () => clearTimeout(timeout);
    }
  }, [visible, id, onRemove]);

  return (
    <div
      role="alert"
      className={[
        'border rounded-lg p-3 shadow-lg text-sm transition-opacity duration-300',
        variantStyles[variant],
        visible ? 'opacity-100' : 'opacity-0 pointer-events-none',
      ].join(' ')}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="font-medium">{title}</p>
          {description && (
            <p className="mt-1 text-xs opacity-90">{description}</p>
          )}
        </div>
        <button
          onClick={() => onRemove(id)}
          className="text-current hover:opacity-70 transition-opacity shrink-0"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const Notification: React.FC<NotificationProps> = ({ toasts, onRemove }) => {
  return (
    <div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50 max-w-xs w-full">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};
