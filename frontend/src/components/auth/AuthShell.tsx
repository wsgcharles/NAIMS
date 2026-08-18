import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Zap, Star } from 'lucide-react';
import { NoahLogo } from '../brand/NoahLogo';

type Accent = 'purple' | 'emerald';

interface AuthShellProps {
  accent?: Accent;
  title: string;
  subtitle: string;
  icon?: React.ElementType;
  children: React.ReactNode;
}

const highlights = [
  { icon: ShieldCheck, label: 'Official Noah\'s Academy SSO Authentication' },
  { icon: Zap, label: 'Real-time gradebooks, ledgers & attendance' },
  { icon: Star, label: 'K-12 Educational Management System' },
];

export const AuthShell: React.FC<AuthShellProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="min-h-screen bg-[#FAF8FF] text-slate-900 flex relative overflow-hidden font-sans">
      {/* ════════════════════════════════════════════════
          LEFT BRAND PANEL — Noah's Academy Identity
      ════════════════════════════════════════════════ */}
      <div className="hidden lg:flex lg:w-[45%] xl:w-[40%] shrink-0 flex-col justify-between p-12 bg-gradient-to-br from-purple-950 via-purple-900 to-indigo-950 text-white relative shadow-2xl">
        {/* Top Logo Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <NoahLogo size="lg" showText={true} lightText={true} />
          </Link>
        </div>

        {/* Center Content & Motto */}
        <div className="relative z-10 space-y-8 my-auto max-w-sm">
          <div className="space-y-3">
            <span className="inline-block px-3.5 py-1 rounded-full bg-amber-400 text-purple-950 text-[10px] font-black uppercase tracking-wider shadow-sm">
              Arca South Campus · Taguig City
            </span>
            <h2 className="text-3xl font-black text-white tracking-tight leading-tight">
              "Excellence in Education, <br />
              <span className="text-amber-300">Virtue in Character."</span>
            </h2>
            <p className="text-xs text-purple-200 leading-relaxed font-medium">
              Welcome to NAISIS — Noah's Academy Student Information System. Secure portal for students, guardians, faculty, and administrators.
            </p>
          </div>

          <ul className="space-y-3 pt-2">
            {highlights.map((h, i) => {
              const HIcon = h.icon;
              return (
                <li key={i} className="flex items-center space-x-3 text-xs text-purple-100">
                  <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-300 shrink-0">
                    <HIcon className="w-4 h-4" />
                  </div>
                  <span className="font-semibold">{h.label}</span>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Footer info */}
        <div className="relative z-10 text-[11px] text-purple-300 font-semibold border-t border-purple-800/80 pt-4 flex items-center justify-between">
          <span>© {new Date().getFullYear()} Noah's Academy Inc.</span>
          <span>NAISIS v2.4</span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          RIGHT FORM PANEL (Clean White Form Card)
      ════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col justify-between p-6 sm:p-12 lg:p-16 overflow-y-auto">
        {/* Mobile Header Logo */}
        <div className="lg:hidden flex justify-center mb-6">
          <Link to="/">
            <NoahLogo size="md" showText={true} lightText={false} />
          </Link>
        </div>

        <div className="max-w-md w-full mx-auto my-auto space-y-8 bg-white border border-purple-100 rounded-3xl p-8 sm:p-10 shadow-xl">
          <div className="space-y-2">
            <h1 className="text-2xl sm:text-3xl font-black text-purple-950 tracking-tight">
              {title}
            </h1>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              {subtitle}
            </p>
          </div>

          {children}
        </div>

        <div className="text-center text-[11px] text-slate-500 font-semibold pt-6">
          <span>Need portal assistance? Contact </span>
          <a href="mailto:support@noahsacademy.edu.ph" className="text-purple-700 hover:underline">
            support@noahsacademy.edu.ph
          </a>
        </div>
      </div>
    </div>
  );
};
