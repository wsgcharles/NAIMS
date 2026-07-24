import React from 'react';
import { Frown } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description?: string;
  illustration?: React.ReactNode; // custom SVG or image
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  illustration,
  actionLabel,
  onAction,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {illustration ? (
        <div className="mb-4 flex justify-center">{illustration}</div>
      ) : (
        <Frown className="w-12 h-12 text-slate-400 dark:text-slate-500 mb-4" aria-hidden="true" />
      )}
      <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 max-w-md">{description}</p>
      )}
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
};
