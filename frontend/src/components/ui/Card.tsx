import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  footer,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm ${className}`}
      {...props}
    >
      {(title || description) && (
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          {title && <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>}
          {description && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>
          )}
        </div>
      )}
      <div className="p-4">{children}</div>
      {footer && <div className="p-4 border-t border-slate-200 dark:border-slate-800">{footer}</div>}
    </div>
  );
};
