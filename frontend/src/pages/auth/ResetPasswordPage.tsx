import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle2, ArrowRight, Loader2, Mail, ShieldCheck, ArrowLeft, RefreshCw, Clock } from 'lucide-react';
import { AuthShell } from '../../components/auth/AuthShell';
import { authService } from '../../services/authService';
import { toast } from 'sonner';

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [code, setCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // 15-minute verification code expiration countdown (900 seconds)
  const [codeExpiryTimer, setCodeExpiryTimer] = useState<number>(900);

  // 60-second resend button countdown
  const [resendTimer, setResendTimer] = useState<number>(60);
  const [resendLoading, setResendLoading] = useState(false);

  useEffect(() => {
    if (codeExpiryTimer <= 0) return;
    const interval = setInterval(() => {
      setCodeExpiryTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [codeExpiryTimer]);

  useEffect(() => {
    if (resendTimer <= 0) return;
    const interval = setInterval(() => {
      setResendTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [resendTimer]);

  const formatTimer = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleResendCode = async () => {
    if (!email.trim() || resendTimer > 0 || resendLoading) return;
    setResendLoading(true);
    try {
      await authService.forgotPassword({ email: email.trim() });
      toast.success('A new 6-digit verification code has been sent to your email.');
      setResendTimer(60);
      setCodeExpiryTimer(900);
    } catch {
      toast.error('Failed to resend verification code. Please check your email.');
    } finally {
      setResendLoading(false);
    }
  };

  const requirements = [
    { rule: 'At least 8 characters', met: newPassword.length >= 8 },
    { rule: 'One uppercase letter', met: /[A-Z]/.test(newPassword) },
    { rule: 'One lowercase letter', met: /[a-z]/.test(newPassword) },
    { rule: 'One digit', met: /[0-9]/.test(newPassword) },
    { rule: 'One special character', met: /[!@#$%^&*()_+=[{\]};:<>|./?,-]/.test(newPassword) },
  ];

  const allMet = requirements.every((r) => r.met);
  const mismatch = confirmPassword.length > 0 && newPassword !== confirmPassword;
  const isCodeValid = code.trim().length === 6 && /^\d{6}$/.test(code.trim());
  const canSubmit = email.trim().length > 0 && isCodeValid && allMet && !mismatch && confirmPassword.length > 0 && codeExpiryTimer > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setCodeError(null);
    try {
      await authService.resetPassword({
        email: email.trim(),
        code: code.trim(),
        newPassword,
      });
      setSuccess(true);
      toast.success('Password has been successfully reset.');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } | string; status?: number } };
      const status = axiosError?.response?.status;
      const responseData = axiosError?.response?.data;
      if (status === 400) {
        const msg = typeof responseData === 'string' ? responseData : responseData?.message || 'Invalid or expired 6-digit verification code.';
        setCodeError(msg);
        toast.error(msg);
      } else {
        toast.error('Unable to reach EduCore server. Please check your connection.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      accent="purple"
      title="Reset Password"
      subtitle="Enter your 6-digit verification code and choose a new password."
      icon={ShieldCheck}
    >
      {success ? (
        <div className="text-center space-y-4 py-4">
          <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Password Reset Complete</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Your password has been successfully updated. You may now log in with your new credentials.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-3.5 bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all text-xs uppercase tracking-wider"
          >
            Proceed to Sign In
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {codeError && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-700 dark:text-rose-300">
              {codeError}
            </div>
          )}

          {/* Expiration Countdown Banner */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 text-xs font-semibold text-purple-900 dark:text-purple-300">
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-700 dark:text-purple-400" />
              <span>Verification code expires in:</span>
            </div>
            <span className="font-mono font-bold text-sm text-purple-700 dark:text-purple-300">
              {codeExpiryTimer > 0 ? formatTimer(codeExpiryTimer) : 'EXPIRED'}
            </span>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@noahsacademy.edu"
                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-all hover:border-purple-300 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-xs"
              />
            </div>
          </div>

          {/* 6-Digit Verification Code */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                6-Digit Verification Code
              </label>
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendTimer > 0 || resendLoading || !email.trim()}
                className="text-[11px] font-bold text-purple-700 dark:text-purple-400 hover:underline disabled:opacity-50 inline-flex items-center gap-1"
              >
                {resendLoading ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : resendTimer > 0 ? (
                  `Resend Code (${resendTimer}s)`
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" /> Resend Code
                  </>
                )}
              </button>
            </div>
            <input
              type="text"
              required
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="Enter 6-digit code"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-center text-lg tracking-[0.3em] font-mono font-black text-purple-950 dark:text-purple-900 placeholder:text-slate-300 placeholder:tracking-normal placeholder:font-sans placeholder:text-xs transition-all hover:border-purple-300 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-xs"
            />
          </div>

          {/* New Password */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-all hover:border-purple-300 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-xs"
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Password Requirements Checklist */}
          {newPassword.length > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">Password Requirements:</span>
              <div className="grid grid-cols-2 gap-1">
                {requirements.map((req, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${req.met ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-400'}`}>
                      ✓
                    </div>
                    <span className={`text-[11px] ${req.met ? 'text-emerald-700 dark:text-emerald-400 font-semibold' : 'text-slate-500'}`}>
                      {req.rule}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Confirm Password */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Confirm Password
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 transition-all hover:border-purple-300 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 shadow-xs"
            />
            {mismatch && <p className="text-[11px] font-semibold text-rose-500 mt-1">Passwords do not match.</p>}
          </div>

          <button
            type="submit"
            disabled={!canSubmit || loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-700 hover:bg-purple-600 text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all text-xs uppercase tracking-wider disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Resetting Password…</span>
              </>
            ) : (
              <>
                <span>Reset Password</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>

          <div className="text-center pt-2">
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-purple-700 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Login
            </Link>
          </div>
        </form>
      )}
    </AuthShell>
  );
};
