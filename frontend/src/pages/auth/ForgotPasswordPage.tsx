import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, ArrowLeft, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';
import { AuthShell } from '../../components/auth/AuthShell';
import { authService } from '../../services/authService';

export const ForgotPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setErrorMessage(null);
    try {
      await authService.forgotPassword({ email: email.trim() });
      toast.success('Verification code delivered to your email inbox.');
      // ONLY redirect after backend confirms request was processed successfully
      navigate(`/reset-password?email=${encodeURIComponent(email.trim())}`);
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { message?: string } | string; status?: number } };
      const status = axiosError?.response?.status;
      const data = axiosError?.response?.data;

      let msg = 'Failed to request verification code. Please check your email and connection.';
      if (status === 429) {
        msg = 'Too many password reset requests. Please wait 15 minutes before trying again.';
      } else if (data) {
        msg = typeof data === 'string' ? data : data?.message || msg;
      }

      setErrorMessage(msg);
      toast.error(msg);
      // DO NOT REDIRECT ON FAILURE
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      accent="purple"
      title="Reset Your Password"
      subtitle="Enter your account email to receive a 6-digit verification code."
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMessage && (
          <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs font-semibold text-rose-800 dark:text-rose-300">
            {errorMessage}
          </div>
        )}

        <div className="space-y-1">
          <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Employee / Account Email
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

        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="w-full flex items-center justify-center gap-2 py-3.5 bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all text-xs uppercase tracking-wider disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending Verification Code…</span>
            </>
          ) : (
            <>
              <span>Send Verification Code</span>
              <Send className="w-4 h-4" />
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
    </AuthShell>
  );
};
