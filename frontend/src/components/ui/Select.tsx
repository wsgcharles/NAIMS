import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option<T = string> {
  label: string;
  value: T;
  disabled?: boolean;
}

interface SelectProps<T = string> extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: Option<T>[];
  placeholder?: string;
  error?: string;
  required?: boolean;
}

export const Select = <T extends string = string>({
  label,
  options,
  placeholder = 'Select…',
  error,
  required,
  className = '',
  id,
  ...props
}: SelectProps<T>) => {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="relative w-full space-y-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-xs font-semibold text-slate-700 dark:text-slate-300"
        >
          {label}
          {required && <span className="text-rose-500 ml-0.5">*</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={inputId}
          aria-invalid={!!error}
          className={[
            'block w-full appearance-none bg-white dark:bg-slate-950 border rounded-xl',
            'text-xs font-medium text-slate-900 dark:text-white',
            'py-2.5 px-3.5 pr-8',
            'placeholder:text-slate-400 dark:placeholder:text-slate-600',
            error
              ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500'
              : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 dark:focus:border-blue-500',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-0',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            className,
          ].join(' ')}
          {...props}
        >
          <option value="" disabled hidden>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={String(opt.value)} value={String(opt.value)} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -mt-2 w-4 h-4 text-slate-400" />
      </div>
      {error && (
        <p className="text-[11px] text-rose-600 dark:text-rose-400 mt-0.5">{error}</p>
      )}
    </div>
  );
};
