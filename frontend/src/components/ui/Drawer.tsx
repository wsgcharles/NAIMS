import React, { useEffect, type ReactNode } from 'react';
import { X } from 'lucide-react';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  placement?: 'left' | 'right' | 'top' | 'bottom';
  title?: string;
  children: ReactNode;
  className?: string;
}

const placementClasses: Record<string, string> = {
  left: 'inset-y-0 left-0 w-80 h-full',
  right: 'inset-y-0 right-0 w-80 h-full',
  top: 'inset-x-0 top-0 w-full h-64',
  bottom: 'inset-x-0 bottom-0 w-full h-64',
};

export const Drawer: React.FC<DrawerProps> = ({
  isOpen,
  onClose,
  placement = 'right',
  title,
  children,
  className = '',
}) => {
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
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        className={`absolute bg-white dark:bg-slate-900 p-6 shadow-xl border border-slate-200 dark:border-slate-800 overflow-y-auto ${placementClasses[placement]} ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{title}</h3>}
          <button
            type="button"
            onClick={onClose}
            className="ml-auto inline-flex items-center justify-center rounded-full p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close drawer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};
