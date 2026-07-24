import React from 'react';
import { Link } from 'react-router-dom';
import { User, Mail, ShieldCheck, KeyRound, CheckCircle2, XCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

export const ProfilePage: React.FC = () => {
  const { user } = useAuth();

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'EduCore User';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Your EduCore account details.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
        <div className="flex items-center gap-4 p-6 border-b border-slate-200 dark:border-slate-800">
          <div className="w-14 h-14 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xl shrink-0">
            {displayName[0]?.toUpperCase() || 'U'}
          </div>
          <div>
            <div className="font-bold text-lg text-slate-900 dark:text-white">{displayName}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{user?.role}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 p-6 text-sm">
          <div className="space-y-1">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
              <Mail className="w-3.5 h-3.5" /> Email Address
            </span>
            <div className="font-medium text-slate-900 dark:text-white">{user?.email || '—'}</div>
          </div>

          <div className="space-y-1">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
              <ShieldCheck className="w-3.5 h-3.5" /> Role
            </span>
            <div className="font-medium text-slate-900 dark:text-white">{user?.role || '—'}</div>
          </div>

          <div className="space-y-1">
            <span className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
              <User className="w-3.5 h-3.5" /> Account ID
            </span>
            <div className="font-mono text-slate-900 dark:text-white">{user?.id || '—'}</div>
          </div>

          <div className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-500">
              Account Status
            </span>
            <div className="flex items-center gap-1.5 font-medium">
              {user?.isActive ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="text-slate-900 dark:text-white">Active</span>
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 text-rose-500" />
                  <span className="text-slate-900 dark:text-white">Inactive</span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Need to update your name or contact details? Contact your school administrator — self-service profile editing isn't available yet.
          </p>
          <Link
            to="/change-password"
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg shadow-xs transition-colors shrink-0"
          >
            <KeyRound className="w-4 h-4" />
            Change Password
          </Link>
        </div>
      </div>
    </div>
  );
};
