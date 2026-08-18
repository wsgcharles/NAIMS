import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';

export interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmVariant?: 'danger' | 'primary' | 'warning';
  icon?: React.ComponentType<{ className?: string }>;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

export const ConfirmationDialog: React.FC<ConfirmationDialogProps> = ({
  isOpen,
  title,
  message,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmVariant = 'primary',
  icon: IconComponent = AlertTriangle,
  onConfirm,
  onCancel,
  loading = false,
}) => {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  // Keyboard navigation & accessibility (ESC to cancel, ENTER to confirm)
  useEffect(() => {
    if (!isOpen) return;

    // Auto focus the primary action button for accessibility
    setTimeout(() => {
      confirmBtnRef.current?.focus();
    }, 50);

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      } else if (e.key === 'Enter') {
        // Only confirm if enter wasn't pressed on the cancel button
        if (document.activeElement?.getAttribute('data-action') === 'cancel') {
          return;
        }
        e.preventDefault();
        if (!loading) {
          onConfirm();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onConfirm, onCancel]);

  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (confirmVariant) {
      case 'danger':
        return {
          badge: 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800',
          icon: 'text-rose-600 dark:text-rose-400',
          btn: 'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-rose-600/20',
        };
      case 'warning':
        return {
          badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border-amber-200 dark:border-amber-800',
          icon: 'text-amber-600 dark:text-amber-400',
          btn: 'bg-amber-600 hover:bg-amber-500 active:bg-amber-700 text-white shadow-amber-600/20',
        };
      case 'primary':
      default:
        return {
          badge: 'bg-purple-100 text-purple-800 dark:bg-purple-950/80 dark:text-purple-300 border-purple-200 dark:border-purple-800',
          icon: 'text-purple-700 dark:text-purple-300',
          btn: 'bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white shadow-purple-700/20',
        };
    }
  };

  const variant = getVariantStyles();

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150 font-sans"
      onClick={onCancel}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirmation-dialog-title"
      aria-describedby="confirmation-dialog-desc"
    >
      <div
        ref={dialogRef}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Icon Badge */}
        <div className="flex items-center space-x-3.5 pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className={`p-3 rounded-2xl border shrink-0 ${variant.badge}`}>
            <IconComponent className={`w-6 h-6 ${variant.icon}`} />
          </div>
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 mb-0.5">
              <span>NAISIS Portal Action</span>
            </div>
            <h3 id="confirmation-dialog-title" className="text-lg font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </h3>
          </div>
        </div>

        {/* Message & Supporting Description */}
        <div className="space-y-3 text-xs">
          <p id="confirmation-dialog-desc" className="font-bold text-slate-800 dark:text-slate-200 text-sm leading-snug">
            {message}
          </p>

          {description && (
            <div className="p-3.5 bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-900/60 rounded-2xl text-amber-900 dark:text-amber-300 flex items-start space-x-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <span className="leading-relaxed">{description}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-2.5 pt-2">
          <button
            type="button"
            data-action="cancel"
            onClick={onCancel}
            disabled={loading}
            className="px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-xl transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            data-action="confirm"
            onClick={onConfirm}
            disabled={loading}
            className={`px-5 py-2.5 text-xs font-bold rounded-xl shadow-md transition-all inline-flex items-center space-x-1.5 disabled:opacity-50 disabled:pointer-events-none ${variant.btn}`}
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing...</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
