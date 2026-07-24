import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, Loader2, GraduationCap, CheckCircle2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { AuthShell } from '../../components/auth/AuthShell';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call — wire to real endpoint when backend provides it
    await new Promise((r) => setTimeout(r, 1200));
    setLoading(false);
    setSent(true);
    toast.success('Password reset link sent to your email.');
  };

  return (
    <AuthShell
      accent="blue"
      title="Reset Your Password"
      subtitle="Enter your registered email and we'll send you a secure reset link."
      icon={GraduationCap}
    >
      {!sent ? (
        <>
          <Link
            to="/portal"
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-300 transition-colors mb-8"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Portal Selection
          </Link>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Registered Email Address
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
              <p className="text-[11px] text-slate-500 pt-1">
                Enter the email address associated with your EduCore account. Reset links expire
                after 30 minutes.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending reset link…</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Send Reset Link</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Remember your password?{' '}
              <Link to="/portal" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                Back to login
              </Link>
            </p>
          </div>
        </>
      ) : (
        /* ── Success state ─────────────────────────────── */
        <div className="flex flex-col items-center text-center space-y-6 py-4">
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">Check your inbox</h2>
            <p className="text-sm text-slate-400 leading-relaxed max-w-sm">
              We've sent a password reset link to{' '}
              <span className="text-white font-semibold">{email}</span>. The link expires in 30
              minutes.
            </p>
          </div>
          <div className="w-full space-y-3">
            <button
              onClick={() => setSent(false)}
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 text-sm font-semibold rounded-xl transition-all"
            >
              Resend reset link
            </button>
            <Link
              to="/portal"
              className="w-full flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/25 transition-all"
            >
              <span>Return to Portal Selection</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <p className="text-xs text-slate-600">
            Didn't receive the email? Check your spam folder or contact the{' '}
            <span className="text-slate-400">IT Helpdesk</span>.
          </p>
        </div>
      )}
    </AuthShell>
  );
};
