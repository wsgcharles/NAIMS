import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  ArrowLeft,
  Loader2,
  ShieldAlert,
  GraduationCap,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { AuthShell } from '../../components/auth/AuthShell';

export const LoginPage: React.FC = () => {
  const { login, setMockRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@noahsacademy.edu');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.firstName || user.email}!`);
      if (user.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      // apiClient's interceptor already toasts network/5xx failures — only add
      // our own message when the backend actually responded (e.g. 401/423).
      if (err?.response) {
        const message = err.response.data?.message || err.response.data || 'Invalid email or password.';
        toast.error(typeof message === 'string' ? message : 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      accent="blue"
      title="EduCore Portal"
      subtitle="Noah's Academy Integrated Management System"
      icon={GraduationCap}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@noahsacademy.edu"
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-11 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating…</span>
            </>
          ) : (
            <>
              <span>Sign In to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo fast-access — development builds only */}
      {import.meta.env.DEV && (
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <ShieldAlert className="w-4 h-4 text-emerald-400" />
            Instant Demo Role Switcher (dev only)
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {[
              { emoji: '🔑', label: 'Super Admin', role: 'SuperAdministrator', path: '/admin/dashboard' },
              { emoji: '📑', label: 'Registrar', role: 'Registrar', path: '/registrar/dashboard' },
              { emoji: '👩‍🏫', label: 'Teacher', role: 'Teacher', path: '/teacher/dashboard' },
              { emoji: '🎓', label: 'Student / Parent', role: 'Student', path: '/student/dashboard' },
            ].map((d) => (
              <button
                key={d.role}
                onClick={() => {
                  setMockRole(d.role as any);
                  navigate(d.path);
                }}
                className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-left font-medium transition-colors border border-slate-800 hover:border-slate-700"
              >
                {d.emoji} {d.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-5 text-center">
        <Link
          to="/portal"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Portal Selection
        </Link>
      </div>
    </AuthShell>
  );
};
