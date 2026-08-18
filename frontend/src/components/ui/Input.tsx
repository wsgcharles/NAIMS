import React from 'react';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'prefix'> {
  label?: string;
  error?: string;
  hint?: string;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  hint,
  prefix,
  suffix,
  required,
  className = '',
  id,
  ...props
}) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}

      <div className="relative flex items-center">
        {prefix && (
          <div className="absolute left-3 text-slate-400 flex items-center pointer-events-none">
            {prefix}
          </div>
        )}

        <input
          id={inputId}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
          className={[
            'w-full text-xs font-medium text-slate-900 dark:text-slate-100',
            'bg-white dark:bg-slate-900 border rounded-xl',
            'placeholder:text-slate-400 dark:placeholder:text-slate-500',
            'transition-all duration-150',
            'hover:border-purple-300 dark:hover:border-purple-500',
            'focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            prefix ? 'pl-9' : 'pl-3.5',
            suffix ? 'pr-9' : 'pr-3.5',
            'py-2.5',
            error
              ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
              : 'border-slate-200 dark:border-slate-700',
            className,
          ].join(' ')}
          {...props}
        />

        {suffix && (
          <div className="absolute right-3 text-slate-400 flex items-center pointer-events-none">
            {suffix}
          </div>
        )}
      </div>

      {error && (
        <p
          id={`${inputId}-error`}
          role="alert"
          className="flex items-center gap-1 text-[11px] font-medium text-rose-600 dark:text-rose-400"
        >
          <AlertCircle className="w-3 h-3 shrink-0" />
          {error}
        </p>
      )}

      {!error && hint && (
        <p id={`${inputId}-hint`} className="text-[11px] text-slate-500 dark:text-slate-400">
          {hint}
        </p>
      )}
    </div>
  );
};
