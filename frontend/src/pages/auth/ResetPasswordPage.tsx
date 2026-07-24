import React, { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  GraduationCap,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { AuthShell } from '../../components/auth/AuthShell';

// Password strength helper
const getStrength = (pw: string): { score: number; label: string; color: string } => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length >= 12) score++;

  if (score <= 1) return { score, label: 'Weak', color: 'bg-rose-500' };
  if (score <= 2) return { score, label: 'Fair', color: 'bg-amber-500' };
  if (score <= 3) return { score, label: 'Good', color: 'bg-blue-500' };
  return { score, label: 'Strong', color: 'bg-emerald-500' };
};

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? 'demo-token';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const strength = getStrength(newPassword);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (strength.score < 2) {
      toast.error('Please choose a stronger password.');
      return;
    }
    setLoading(true);
    // Simulate API call — wire to real /auth/reset-password endpoint using token
    if (!token) return;
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setDone(true);
    toast.success('Password successfully reset! Please sign in.');
  };

  return (
    <AuthShell
      accent="blue"
      title="Set New Password"
      subtitle="Create a strong new password for your EduCore account."
      icon={GraduationCap}
    >
      {!done ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* New password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Create a strong password"
                className="w-full pl-10 pr-11 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowNew((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength bar */}
            {newPassword.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((bar) => (
                    <div
                      key={bar}
                      className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                        bar <= strength.score ? strength.color : 'bg-slate-800'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[11px] text-slate-500">
                  Password strength:{' '}
                  <span
                    className={`font-semibold ${
                      strength.score <= 1
                        ? 'text-rose-400'
                        : strength.score <= 2
                        ? 'text-amber-400'
                        : strength.score <= 3
                        ? 'text-blue-400'
                        : 'text-emerald-400'
                    }`}
                  >
                    {strength.label}
                  </span>
                </p>
              </div>
            )}
          </div>

          {/* Confirm password */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Confirm New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat your new password"
                className={`w-full pl-10 pr-11 py-3 bg-slate-900 border rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 transition-all ${
                  mismatch
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-800 focus:border-blue-500 focus:ring-blue-500/20'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirm((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                aria-label="Toggle confirm password visibility"
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {mismatch && (
              <p className="text-[11px] text-rose-400 font-medium">Passwords do not match.</p>
            )}
          </div>

          {/* Password requirements */}
          <div className="p-4 bg-slate-900/60 border border-slate-800 rounded-xl space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              Password Requirements
            </p>
            {[
              { rule: 'At least 8 characters', met: newPassword.length >= 8 },
              { rule: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
              { rule: 'One number', met: /[0-9]/.test(newPassword) },
              { rule: 'One special character', met: /[^A-Za-z0-9]/.test(newPassword) },
            ].map((r) => (
              <div key={r.rule} className="flex items-center gap-2">
                <CheckCircle2
                  className={`w-3.5 h-3.5 shrink-0 transition-colors ${
                    r.met ? 'text-emerald-400' : 'text-slate-700'
                  }`}
                />
                <span className={`text-[11px] transition-colors ${r.met ? 'text-slate-300' : 'text-slate-600'}`}>
                  {r.rule}
                </span>
              </div>
            ))}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || mismatch || newPassword.length === 0}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Saving new password…</span>
              </>
            ) : (
              <>
                <span>Reset Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      ) : (
        /* ── Success state ──────────────────────── */
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Password Reset Successful</h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              Your EduCore account password has been updated. Please sign in with your new password.
            </p>
          </div>
          <Link
            to="/portal"
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
          >
            <span>Go to Portal Login</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </AuthShell>
  );
};
