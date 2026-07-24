import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  change?: number;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  iconBgColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  description,
  change,
  changeType = 'positive',
  icon: Icon,
  iconBgColor = 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-lg ${iconBgColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between">
        <span className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </span>

        {change !== undefined && (
          <div
            className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${
              changeType === 'positive'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : changeType === 'negative'
                ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                : 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
            }`}
          >
            {changeType === 'positive' ? (
              <ArrowUpRight className="w-3 h-3 mr-0.5" />
            ) : changeType === 'negative' ? (
              <ArrowDownRight className="w-3 h-3 mr-0.5" />
            ) : null}
            {change > 0 ? `+${change}%` : `${change}%`}
          </div>
        )}
      </div>

      {description && (
        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
};
