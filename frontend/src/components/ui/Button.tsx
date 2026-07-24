import React from 'react';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'outline';
type ButtonSize = 'xs' | 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white shadow-sm shadow-blue-500/20 hover:shadow-blue-500/30 disabled:bg-blue-400',
  secondary:
    'bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs',
  ghost:
    'bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
  danger:
    'bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white shadow-sm shadow-rose-500/20 disabled:bg-rose-400',
  success:
    'bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white shadow-sm shadow-emerald-500/20 disabled:bg-emerald-400',
  outline:
    'bg-transparent border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
};

const sizeStyles: Record<ButtonSize, string> = {
  xs: 'px-2.5 py-1 text-[11px] rounded-lg gap-1',
  sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
  md: 'px-4 py-2 text-xs rounded-xl gap-2',
  lg: 'px-5 py-2.5 text-sm rounded-xl gap-2',
};

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  iconPosition = 'left',
  className = '',
  disabled,
  ...props
}) => {
  const isDisabled = disabled || loading;

  return (
    <button
      {...props}
      disabled={isDisabled}
      className={[
        'inline-flex items-center justify-center font-semibold transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none',
        'select-none active:scale-[0.98]',
        variantStyles[variant],
        sizeStyles[size],
        className,
      ].join(' ')}
    >
      {loading ? (
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
      ) : (
        icon && iconPosition === 'left' && <span className="shrink-0">{icon}</span>
      )}
      {children && <span>{children}</span>}
      {!loading && icon && iconPosition === 'right' && <span className="shrink-0">{icon}</span>}
    </button>
  );
};
