import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import {
  User,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Loader2,
  GraduationCap,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { AuthShell } from '../../components/auth/AuthShell';

export const StudentLoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState('2026-0001');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email: studentId, password });
      toast.success(`Welcome back, ${user.firstName || user.email}!`);
      if (user.mustChangePassword) {
        navigate('/change-password');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err: any) {
      if (err?.response) {
        const message =
          err.response.data?.message || err.response.data || 'Invalid student number/email or password.';
        toast.error(typeof message === 'string' ? message : 'Invalid student number/email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      accent="blue"
      title="Student Portal"
      subtitle="Noah's Academy Academic Self-Service Portal"
      icon={GraduationCap}
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
        {/* Student ID / Email */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Student Number or Email
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              required
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="2026-0001 or student@noahsacademy.edu"
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
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <span>Access Student Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Portal switcher */}
      <div className="mt-8 pt-6 border-t border-slate-800/80 text-center space-y-2">
        <p className="text-xs text-slate-500">Not a student?</p>
        <div className="flex items-center justify-center gap-4 text-xs font-semibold">
          <Link to="/parent/login" className="text-purple-400 hover:text-purple-300 transition-colors">
            Parent Portal
          </Link>
          <span className="text-slate-800">·</span>
          <Link to="/employee/login" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Employee SSO
          </Link>
        </div>
      </div>
    </AuthShell>
  );
};
