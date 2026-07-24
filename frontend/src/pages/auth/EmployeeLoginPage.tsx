import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { AuthShell } from '../../components/auth/AuthShell';

export const EmployeeLoginPage: React.FC = () => {
  const { login, setMockRole } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('admin@noahsacademy.edu');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);

  // ── Route by role — business logic unchanged ─────────────────────────────
  const redirectByRole = (role: string) => {
    switch (role) {
      case 'SuperAdministrator':
      case 'Administrator':
      case 'Principal':
        navigate('/admin/dashboard');
        break;
      case 'Registrar':
        navigate('/registrar/dashboard');
        break;
      case 'Teacher':
        navigate('/teacher/dashboard');
        break;
      case 'Accountant':
        navigate('/admin/accounting');
        break;
      default:
        navigate('/admin/dashboard');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.firstName || user.email}!`);
      redirectByRole(user.role);
    } catch (err: any) {
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
      accent="emerald"
      title="Faculty & Staff Portal"
      subtitle="Noah's Academy Institutional Employee Single Sign-On"
      icon={Briefcase}
    >
      {/* Back link */}
      <Link
        to="/portal"
        className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Portal Selection
      </Link>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Employee Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="staff@noahsacademy.edu"
              className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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
              className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
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
              className="w-full pl-10 pr-11 py-3 bg-slate-900 border border-slate-800 rounded-xl text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all"
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

        {/* Remember me */}
        <label className="flex items-center gap-2.5 cursor-pointer group">
          <input
            type="checkbox"
            checked={rememberMe}
            onChange={(e) => setRememberMe(e.target.checked)}
            className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-emerald-600 focus:ring-emerald-500 focus:ring-offset-slate-950"
          />
          <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors select-none">
            Remember this session
          </span>
        </label>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-700 hover:bg-emerald-600 active:bg-emerald-800 text-white font-bold rounded-xl shadow-lg shadow-emerald-700/25 hover:shadow-emerald-600/40 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating…</span>
            </>
          ) : (
            <>
              <span>Sign In to Employee Portal</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Demo role switcher — development builds only */}
      {import.meta.env.DEV && (
        <div className="mt-8 pt-6 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
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

      {/* Portal switcher */}
      <div className="mt-6 text-center space-y-1.5">
        <p className="text-xs text-slate-500">Not an employee?</p>
        <div className="flex items-center justify-center gap-4 text-xs font-semibold">
          <Link to="/student/login" className="text-blue-400 hover:text-blue-300 transition-colors">
            Student Portal
          </Link>
          <span className="text-slate-800">·</span>
          <Link to="/parent/login" className="text-purple-400 hover:text-purple-300 transition-colors">
            Parent Portal
          </Link>
        </div>
      </div>
    </AuthShell>
  );
};
