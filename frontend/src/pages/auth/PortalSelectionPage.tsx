import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowLeft,
  ArrowRight,
  User,
  HeartHandshake,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

interface Portal {
  id: string;
  title: string;
  badge: string;
  icon: React.ElementType;
  desc: string;
  link: string;
  accentCard: string;
  accentIcon: string;
  accentBtn: string;
  accentBadge: string;
  features: string[];
}

const portals: Portal[] = [
  {
    id: 'student',
    title: 'Student Portal',
    badge: 'Learner Access',
    icon: User,
    desc: 'Access your quarterly grades, class attendance, enrolled subjects, tuition ledger, and academic announcements.',
    link: '/student/login',
    accentCard: 'hover:border-blue-500/50 group-hover:shadow-blue-500/10',
    accentIcon: 'bg-blue-600/15 text-blue-400 border-blue-500/20',
    accentBtn: 'bg-blue-600 hover:bg-blue-500 shadow-blue-500/25',
    accentBadge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    features: ['Grade Viewer', 'Attendance Logs', 'Tuition Ledger'],
  },
  {
    id: 'parent',
    title: 'Parent & Guardian Portal',
    badge: 'Guardian Access',
    icon: HeartHandshake,
    desc: "Monitor your child's academic progress, attendance, tuition statements, official receipts, and teacher advisories.",
    link: '/parent/login',
    accentCard: 'hover:border-purple-500/50 group-hover:shadow-purple-500/10',
    accentIcon: 'bg-purple-600/15 text-purple-400 border-purple-500/20',
    accentBtn: 'bg-purple-600 hover:bg-purple-500 shadow-purple-500/25',
    accentBadge: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    features: ["Child's Progress", 'Financial Records', 'School Advisories'],
  },
  {
    id: 'employee',
    title: 'Employee Portal',
    badge: 'Staff SSO',
    icon: Briefcase,
    desc: 'Secure Single Sign-On for faculty, registrars, administrators, principals, and financial accountants.',
    link: '/employee/login',
    accentCard: 'hover:border-emerald-500/50 group-hover:shadow-emerald-500/10',
    accentIcon: 'bg-emerald-600/15 text-emerald-400 border-emerald-500/20',
    accentBtn: 'bg-emerald-700 hover:bg-emerald-600 shadow-emerald-600/25',
    accentBadge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    features: ['Class Management', 'Grading System', 'Admin ERP'],
  },
];

export const PortalSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col relative overflow-hidden">
      {/* ── Background ─────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-600/6 rounded-full blur-3xl" />
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] [background-size:72px_72px]" />
      </div>

      {/* ── Header ─────────────────────────────────────── */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-6 pt-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <p className="font-extrabold text-lg text-white group-hover:text-blue-300 transition-colors leading-none">
              Noah's Academy
            </p>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
              EduCore Platform
            </p>
          </div>
        </Link>

        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white rounded-xl transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Website
        </Link>
      </header>

      {/* ── Main ───────────────────────────────────────── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 py-16">
        {/* Headline */}
        <div className="text-center space-y-4 mb-14 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-[11px] font-bold uppercase tracking-widest text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
            EduCore Single Sign-On
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Select Your Portal
          </h1>
          <p className="text-sm text-slate-400 leading-relaxed">
            Choose your assigned institutional portal to securely access your EduCore workspace.
          </p>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-5xl">
          {portals.map((p) => {
            const Icon = p.icon;
            return (
              <div
                key={p.id}
                className={`group relative bg-slate-900/70 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 flex flex-col justify-between gap-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${p.accentCard}`}
              >
                {/* Top */}
                <div className="space-y-5">
                  {/* Icon + badge row */}
                  <div className="flex items-start justify-between">
                    <div
                      className={`p-3.5 rounded-2xl border w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-transform ${p.accentIcon}`}
                    >
                      <Icon className="w-7 h-7" />
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border ${p.accentBadge}`}
                    >
                      {p.badge}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <h2 className="text-xl font-bold text-white">{p.title}</h2>
                    <p className="text-xs text-slate-400 leading-relaxed">{p.desc}</p>
                  </div>

                  {/* Feature pills */}
                  <div className="flex flex-wrap gap-2">
                    {p.features.map((f) => (
                      <span
                        key={f}
                        className="text-[10px] font-semibold text-slate-400 bg-slate-800 border border-slate-700/60 px-2.5 py-1 rounded-full"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <button
                  onClick={() => navigate(p.link)}
                  className={`w-full py-3.5 px-4 text-white text-sm font-bold rounded-2xl shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] ${p.accentBtn}`}
                >
                  <span>Continue to Login</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────── */}
      <footer className="relative z-10 pb-8 text-center text-xs text-slate-600">
        Need help with portal access? Contact the{' '}
        <span className="text-slate-400 font-medium">Registrar's Office</span> or{' '}
        <span className="text-slate-400 font-medium">IT Helpdesk</span>.
        <br />
        <span className="text-slate-700">
          © {new Date().getFullYear()} Noah's Academy · Powered by EduCore
        </span>
      </footer>
    </div>
  );
};
