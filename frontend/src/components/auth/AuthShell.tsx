/**
 * AuthShell — Shared split-screen wrapper for all auth pages.
 *
 * Left Panel  : Branded illustration column (hidden on mobile)
 * Right Panel : Form content slot
 *
 * Usage:
 *   <AuthShell accent="blue" title="Student Portal" subtitle="...">
 *     <form ...>...</form>
 *   </AuthShell>
 */

import React from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  ShieldCheck,
  Zap,
  Star,
} from 'lucide-react';

type Accent = 'blue' | 'purple' | 'emerald';

interface AuthShellProps {
  accent?: Accent;
  title: string;
  subtitle: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}

const accentConfig: Record<
  Accent,
  {
    glow: string;
    border: string;
    iconBg: string;
    badge: string;
    badgeText: string;
    panelFrom: string;
    panelTo: string;
  }
> = {
  blue: {
    glow: 'bg-blue-600/20',
    border: 'focus:border-blue-500 focus:ring-blue-500/20',
    iconBg: 'bg-blue-600 shadow-blue-500/30',
    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    badgeText: 'EduCore Platform',
    panelFrom: 'from-blue-950',
    panelTo: 'to-slate-950',
  },
  purple: {
    glow: 'bg-purple-600/20',
    border: 'focus:border-purple-500 focus:ring-purple-500/20',
    iconBg: 'bg-purple-600 shadow-purple-500/30',
    badge: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    badgeText: 'Guardian Portal',
    panelFrom: 'from-purple-950',
    panelTo: 'to-slate-950',
  },
  emerald: {
    glow: 'bg-emerald-600/15',
    border: 'focus:border-emerald-500 focus:ring-emerald-500/20',
    iconBg: 'bg-emerald-700 shadow-emerald-600/30',
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    badgeText: 'Employee SSO',
    panelFrom: 'from-emerald-950',
    panelTo: 'to-slate-950',
  },
};

const highlights = [
  { icon: ShieldCheck, label: 'Secure institutional authentication' },
  { icon: Zap, label: 'Real-time academic data access' },
  { icon: Star, label: 'Trusted by 2,480+ students & faculty' },
];

export const AuthShell: React.FC<AuthShellProps> = ({
  accent = 'blue',
  title,
  subtitle,
  icon: IconProp,
  children,
}) => {
  const c = accentConfig[accent];
  const Icon = IconProp ?? GraduationCap;

  return (
    <div className="min-h-screen bg-slate-950 flex relative overflow-hidden">
      {/* ── Ambient glows (full canvas) ─────────────────── */}
      <div
        className={`pointer-events-none absolute -top-40 -left-40 w-[600px] h-[600px] ${c.glow} rounded-full blur-3xl opacity-60`}
      />
      <div className="pointer-events-none absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-3xl opacity-50" />

      {/* ════════════════════════════════════════════════
          LEFT BRAND PANEL (hidden < lg)
      ════════════════════════════════════════════════ */}
      <div
        className={`hidden lg:flex lg:w-[45%] xl:w-[40%] shrink-0 flex-col justify-between p-12 bg-gradient-to-br ${c.panelFrom} ${c.panelTo} border-r border-slate-800/60 relative`}
      >
        {/* Decorative grid */}
        <div className="absolute inset-0 [background-image:linear-gradient(rgba(148,163,184,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.04)_1px,transparent_1px)] [background-size:64px_64px] pointer-events-none" />
        {/* Inner glow */}
        <div
          className={`absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 ${c.glow} rounded-full blur-3xl pointer-events-none`}
        />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="p-2.5 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="font-extrabold text-lg text-white tracking-tight group-hover:text-blue-300 transition-colors">
                Noah's Academy
              </p>
              <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                EduCore Platform
              </p>
            </div>
          </Link>
        </div>

        <div className="relative z-10 space-y-8 max-w-xs">
          <div className="space-y-3">
            <span
              className={`inline-block px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest ${c.badge}`}
            >
              {c.badgeText}
            </span>
            <h2 className="text-3xl font-extrabold text-white tracking-tight leading-tight">
              {title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">{subtitle}</p>
          </div>

          <ul className="space-y-4">
            {highlights.map((h) => {
              const HIcon = h.icon;
              return (
                <li key={h.label} className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${c.badge} border`}
                  >
                    <HIcon className="w-4 h-4" />
                  </div>
                  <span className="text-xs text-slate-300 font-medium">{h.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="relative z-10 text-[11px] text-slate-600">
          © {new Date().getFullYear()} Noah's Academy · Powered by EduCore
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          RIGHT FORM PANEL
      ════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 sm:px-10 lg:px-16 relative z-10">
        {/* Mobile brand header (visible < lg) */}
        <div className="lg:hidden mb-10 flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-500/25">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <p className="font-extrabold text-base text-white">Noah's Academy</p>
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
              EduCore Platform
            </p>
          </div>
        </div>

        {/* Form card */}
        <div className="w-full max-w-md mx-auto">
          {/* Icon + portal name */}
          <div className="flex flex-col items-center gap-3 mb-8 text-center">
            <div className={`p-3.5 rounded-2xl text-white shadow-xl ${c.iconBg}`}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold text-white tracking-tight">{title}</h1>
              <p className="text-xs text-slate-400 mt-1">{subtitle}</p>
            </div>
          </div>

          {/* Form slot */}
          {children}
        </div>

        {/* Bottom back-link */}
        <div className="mt-8 text-center">
          <Link
            to="/"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          >
            ← Return to Noah's Academy website
          </Link>
        </div>
      </div>
    </div>
  );
};
