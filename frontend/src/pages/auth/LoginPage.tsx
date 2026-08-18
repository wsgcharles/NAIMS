import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  ArrowRight,
  Loader2,
  GraduationCap,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'sonner';
import { AuthShell } from '../../components/auth/AuthShell';
import type { CurrentUser } from '../../types';

/**
 * Maps the authenticated user's role (as returned by the backend JWT)
 * to the correct dashboard route. No hardcoded role assumptions —
 * every role is handled by reading the value from the server response.
 */
const getRoleRedirect = (user: CurrentUser): string => {
  switch (user.role) {
    case 'SuperAdministrator':
    case 'Administrator':
    case 'Principal':
      return '/admin/dashboard';
    case 'Registrar':
      return '/registrar/dashboard';
    case 'Accountant':
      return '/admin/accounting';
    case 'Teacher':
      return '/teacher/dashboard';
    case 'Student':
      return '/student/dashboard';
    case 'Parent':
      return '/parent/dashboard';
    default:
      return '/admin/dashboard';
  }
};

/**
 * Validates whether a candidate 'from' path is authorized for the authenticated user's role.
 * Prevents stale 'from' state (e.g. from a previous user session) from redirecting
 * a newly authenticated user to an unauthorized module and causing an immediate 403.
 */
const isRouteAllowedForRole = (pathname: string, role: string): boolean => {
  if (!pathname || pathname === '/login' || pathname === '/403') return false;

  if (role === 'SuperAdministrator') return true;

  if (pathname.startsWith('/admin')) {
    if (role === 'Administrator') return true;
    if (role === 'Principal') {
      return ['/admin/dashboard', '/admin/teachers', '/admin/grades', '/admin/grade-approvals', '/admin/reports'].some((p) => pathname.startsWith(p));
    }
    if (role === 'Registrar') {
      return ['/admin/students', '/admin/subjects', '/admin/school-years', '/admin/sections', '/admin/reports', '/admin/grade-approvals'].some((p) => pathname.startsWith(p));
    }
    if (role === 'Accountant') return pathname.startsWith('/admin/accounting');
    return false;
  }

  if (pathname.startsWith('/registrar')) {
    return role === 'Registrar' || role === 'Administrator';
  }

  if (pathname.startsWith('/teacher')) {
    return role === 'Teacher';
  }

  if (pathname.startsWith('/student')) {
    return role === 'Student';
  }

  if (pathname.startsWith('/parent')) {
    return role === 'Parent';
  }

  return true;
};

export const LoginPage: React.FC = () => {
  const { user, isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      const destination = getRoleRedirect(user);
      navigate(destination, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login({ email, password });
      toast.success(`Welcome back, ${user.firstName || user.email}!`);

      // Temporary password must be changed before accessing any module.
      if (user.mustChangePassword) {
        navigate('/change-password', { replace: true });
        return;
      }

      // If the AuthGuard preserved a deep-link "from" location that is authorized for this role, honour it.
      // Otherwise, automatically route to the role-specific dashboard.
      const from = (location.state as any)?.from?.pathname;
      const destination = from && isRouteAllowedForRole(from, user.role) ? from : getRoleRedirect(user);
      navigate(destination, { replace: true });
    } catch (err: any) {
      if (err?.response) {
        const message =
          err.response.data?.message || err.response.data || 'Invalid email or password.';
        toast.error(typeof message === 'string' ? message : 'Invalid email or password.');
      } else {
        toast.error('Unable to reach the server. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      accent="purple"
      title="Sign In to NAISIS"
      subtitle="Use your registered Noah's Academy email address and password."
      icon={GraduationCap}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email */}
        <div className="space-y-1.5">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Email Address
          </label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="login-email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@noahsacademy.edu"
              className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all shadow-xs"
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Password
            </label>
            <Link
              to="/forgot-password"
              className="text-[11px] font-bold text-purple-700 hover:underline"
            >
              Forgot Password?
            </Link>
          </div>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-10 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-600/20 transition-all shadow-xs"
            />
            <button
              type="button"
              onClick={() => setShowPassword((s) => !s)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Submit */}
        <button
          id="login-submit"
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none text-xs uppercase tracking-wider"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Authenticating…</span>
            </>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Universal role notice — no portal selection required */}
      <p className="text-center text-[11px] text-slate-400 font-medium pt-4 border-t border-slate-100 leading-relaxed">
        Students, Parents, Teachers, Employees, Registrars, Accounting Staff, Administrators, and
        Super Administrators all sign in using their registered email address.
      </p>
    </AuthShell>
  );
};
