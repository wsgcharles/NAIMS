import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, GraduationCap, FlaskConical, Calculator, Globe, Music } from 'lucide-react';

interface Program {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  subtitle: string;
  units: string;
  features: string[];
  icon: React.ElementType;
  accent: string;
}

const programs: Program[] = [
  {
    id: 'stem',
    tag: 'College Prep',
    tagColor: 'bg-blue-950 border-blue-800 text-blue-400',
    title: 'Senior High — STEM Track',
    subtitle: 'Science, Technology, Engineering & Mathematics',
    units: '36 Units / Year',
    icon: FlaskConical,
    accent: 'blue',
    features: [
      'Advanced Physics & Chemistry Labs',
      'Computer Programming (Python / Web Dev)',
      'Calculus & Analytic Geometry',
      'Research Methodology & Innovation',
    ],
  },
  {
    id: 'abm',
    tag: 'College Prep',
    tagColor: 'bg-emerald-950 border-emerald-800 text-emerald-400',
    title: 'Senior High — ABM Track',
    subtitle: 'Accountancy, Business & Management',
    units: '34 Units / Year',
    icon: Calculator,
    accent: 'emerald',
    features: [
      'Fundamentals of Accounting',
      'Business Mathematics & Finance',
      'Principles of Marketing',
      'Entrepreneurship & Business Planning',
    ],
  },
  {
    id: 'jhs',
    tag: 'Secondary Phase',
    tagColor: 'bg-amber-950 border-amber-800 text-amber-400',
    title: 'Junior High School Program',
    subtitle: 'Grades 7 through 10',
    units: 'Core Competency Track',
    icon: Globe,
    accent: 'amber',
    features: [
      'Integrated Sciences & Robotics',
      'World History & Social Studies',
      'Literary Arts & Speech',
      'Physical Education & Wellness',
    ],
  },
  {
    id: 'elem',
    tag: 'Foundational',
    tagColor: 'bg-purple-950 border-purple-800 text-purple-400',
    title: 'Elementary Education',
    subtitle: 'Grades 1 through 6',
    units: 'Foundational Track',
    icon: Music,
    accent: 'purple',
    features: [
      'Foundational Mathematics',
      'Environmental Science',
      'Values Education & Creative Arts',
      'Mother Tongue & Filipino Language',
    ],
  },
];

const accentMap: Record<string, { border: string; bg: string; text: string; badge: string }> = {
  blue: {
    border: 'border-blue-500/50',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  },
  emerald: {
    border: 'border-emerald-500/50',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  },
  amber: {
    border: 'border-amber-500/50',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  },
  purple: {
    border: 'border-purple-500/50',
    bg: 'bg-purple-500/10',
    text: 'text-purple-400',
    badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  },
};

export const AcademicsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Programs' },
    { id: 'stem', label: 'STEM' },
    { id: 'abm', label: 'ABM' },
    { id: 'jhs', label: 'Junior High' },
    { id: 'elem', label: 'Elementary' },
  ];

  const filtered = activeTab === 'all' ? programs : programs.filter((p) => p.id === activeTab);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">
      {/* Hero */}
      <div className="relative text-center space-y-5 max-w-3xl mx-auto">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-emerald-500/6 rounded-full blur-3xl pointer-events-none" />
        <span className="relative text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">
          Academic Offerings
        </span>
        <h1 className="relative text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Comprehensive K–12 Curriculum
        </h1>
        <p className="relative text-slate-400 text-sm leading-relaxed">
          Explore our progressive academic tracks engineered for college readiness, career
          excellence, and global competitiveness.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Program Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {filtered.map((prog) => {
          const Icon = prog.icon;
          const c = accentMap[prog.accent] ?? accentMap.blue;
          return (
            <div
              key={prog.id}
              className={`group p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-5 hover:${c.border} hover:-translate-y-0.5 transition-all duration-300`}
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-[11px] font-bold border ${c.badge}`}
                >
                  {prog.units}
                </span>
                <div className={`p-2.5 rounded-xl ${c.bg} ${c.text}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              {/* Title */}
              <div>
                <h3 className={`text-xl font-bold text-white group-hover:${c.text} transition-colors`}>
                  {prog.title}
                </h3>
                <p className={`text-xs font-semibold mt-1 ${c.text}`}>{prog.subtitle}</p>
              </div>

              {/* Subject List */}
              <ul className="space-y-2.5 pt-1">
                {prog.features.map((feat) => (
                  <li key={feat} className="flex items-start gap-2.5 text-xs text-slate-300">
                    <CheckCircle className={`w-4 h-4 ${c.text} shrink-0 mt-0.5`} />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                to="/admissions"
                className={`inline-flex items-center gap-1.5 text-xs font-semibold ${c.text} hover:opacity-80 transition-opacity pt-2`}
              >
                <span>Enroll in this track</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          );
        })}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-8 border-t border-slate-800">
        {[
          { label: 'Academic Programs', value: '4', color: 'text-blue-400' },
          { label: 'Qualified Teachers', value: '184+', color: 'text-emerald-400' },
          { label: 'Subjects Offered', value: '60+', color: 'text-amber-400' },
          { label: 'Graduate Rate', value: '99.4%', color: 'text-purple-400' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className={`text-3xl font-extrabold font-mono ${s.color}`}>{s.value}</div>
            <div className="text-xs text-slate-400 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="text-center">
        <p className="text-sm text-slate-400 mb-6">
          Ready to find the right academic track for your child?
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/admissions"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Start Your Application</span>
          </Link>
          <Link
            to="/contact"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold rounded-xl text-sm transition-all"
          >
            <span>Ask an Advisor</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
