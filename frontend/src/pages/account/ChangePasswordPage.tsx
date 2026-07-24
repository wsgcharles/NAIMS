import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, Loader2, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../contexts/AuthContext';
import { authService } from '../../services/authService';
import type { UserRoleString } from '../../types';

const dashboardPathForRole = (role?: UserRoleString): string => {
  switch (role) {
    case 'SuperAdministrator':
    case 'Administrator':
    case 'Principal':
      return '/admin/dashboard';
    case 'Registrar':
      return '/registrar/dashboard';
    case 'Teacher':
      return '/teacher/dashboard';
    case 'Accountant':
      return '/admin/accounting';
    case 'Student':
      return '/student/dashboard';
    case 'Parent':
      return '/parent/dashboard';
    default:
      return '/admin/dashboard';
  }
};

export const ChangePasswordPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [loading, setLoading] = useState(false);

  const requirements = [
    { rule: 'At least 8 characters', met: newPassword.length >= 8 },
    { rule: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
    { rule: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
    { rule: 'One digit', met: /[0-9]/.test(newPassword) },
    { rule: 'One special character', met: /[!@#$%^&*()_+=[{\]};:<>|./?,-]/.test(newPassword) },
  ];
  const allRequirementsMet = requirements.every((r) => r.met);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const canSubmit =
    currentPassword.length > 0 && allRequirementsMet && confirmPassword.length > 0 && !mismatch;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    try {
      await authService.changePassword({ currentPassword, newPassword });
      toast.success('Password updated successfully.');
      navigate(dashboardPathForRole(user?.role));
    } catch (err: any) {
      if (err?.response) {
        const message = err.response.data?.message || err.response.data || 'Unable to update password.';
        toast.error(typeof message === 'string' ? message : 'Unable to update password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Change Password</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          {user?.mustChangePassword
            ? 'For security, you must set a new password before continuing.'
            : 'Update the password for your EduCore account.'}
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs p-6 space-y-5"
      >
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Current Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type={showCurrent ? 'text' : 'password'}
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              placeholder="Your current password"
              className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowCurrent((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label={showCurrent ? 'Hide password' : 'Show password'}
            >
              {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            New Password
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type={showNew ? 'text' : 'password'}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Create a strong password"
              className="w-full pl-10 pr-11 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowNew((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label={showNew ? 'Hide password' : 'Show password'}
            >
              {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Confirm New Password
          </label>
          <input
            type={showNew ? 'text' : 'password'}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your new password"
            className={`w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border rounded-lg text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all ${
              mismatch
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20'
                : 'border-slate-200 dark:border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
            }`}
          />
          {mismatch && <p className="text-[11px] text-rose-500 font-medium">Passwords do not match.</p>}
        </div>

        <div className="p-3.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg space-y-1.5">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Password Requirements
          </p>
          {requirements.map((r) => (
            <div key={r.rule} className="flex items-center gap-2">
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                  r.met ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'
                }`}
              />
              <span
                className={`text-[11px] transition-colors ${
                  r.met ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400 dark:text-slate-600'
                }`}
              >
                {r.rule}
              </span>
            </div>
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-xs transition-all disabled:opacity-50 disabled:pointer-events-none text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Updating…</span>
            </>
          ) : (
            <span>Update Password</span>
          )}
        </button>
      </form>
    </div>
  );
};
