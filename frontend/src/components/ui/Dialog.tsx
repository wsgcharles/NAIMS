import React, { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export const Dialog: React.FC<DialogProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  className = '',
}) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? 'dialog-title' : undefined}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`relative z-10 w-full max-w-lg rounded-xl bg-white dark:bg-slate-900 p-6 shadow-2xl border border-slate-200 dark:border-slate-800 ${className}`}
      >
        <div className="flex items-start justify-between mb-4">
          {title && (
            <h2
              id="dialog-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              {title}
            </h2>
          )}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex items-center justify-center rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
        {description && (
          <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">{description}</p>
        )}
        {children}
      </div>
    </div>
  );
};
