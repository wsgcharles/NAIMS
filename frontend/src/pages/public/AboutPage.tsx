import React from 'react';
import { Link } from 'react-router-dom';
import { Award, ShieldCheck, Users, Heart, BookOpen, ArrowRight } from 'lucide-react';

// ─── Section Helpers ──────────────────────────────────────────────────────
const PageHero: React.FC<{
  label: string;
  labelColor?: string;
  title: string;
  desc: string;
}> = ({ label, labelColor = 'text-blue-400', title, desc }) => (
  <div className="relative text-center space-y-5 max-w-3xl mx-auto">
    {/* Glow */}
    <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
    <span className={`relative text-[11px] font-bold uppercase tracking-[0.18em] ${labelColor}`}>
      {label}
    </span>
    <h1 className="relative text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
      {title}
    </h1>
    <p className="relative text-slate-400 text-sm leading-relaxed">{desc}</p>
  </div>
);

const ValueCard: React.FC<{
  icon: React.ElementType;
  title: string;
  desc: string;
  accent?: string;
}> = ({ icon: Icon, title, desc, accent = 'blue' }) => {
  const colorMap: Record<string, string> = {
    blue: 'text-blue-400 bg-blue-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    purple: 'text-purple-400 bg-purple-500/10',
    amber: 'text-amber-400 bg-amber-500/10',
  };
  return (
    <div className="group p-8 bg-slate-900 border border-slate-800 rounded-3xl space-y-4 hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-300">
      <div
        className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colorMap[accent] ?? colorMap.blue}`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-lg font-bold text-white group-hover:text-blue-300 transition-colors">
        {title}
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
};

export const AboutPage: React.FC = () => {
  const coreValues = [
    {
      icon: Award,
      title: 'Academic Rigor',
      desc: 'Fostering deep inquiry, critical problem-solving, and continuous cognitive growth across all grade levels.',
      accent: 'blue',
    },
    {
      icon: ShieldCheck,
      title: 'Character & Integrity',
      desc: 'Instilling ethical values, personal accountability, and principled community leadership.',
      accent: 'emerald',
    },
    {
      icon: Users,
      title: 'Inclusive Community',
      desc: "Creating a safe, affirming environment where every learner's background is celebrated.",
      accent: 'purple',
    },
    {
      icon: Heart,
      title: 'Holistic Wellness',
      desc: 'Nurturing mental, physical, and emotional health as foundational pillars of student success.',
      accent: 'amber',
    },
  ];

  const leadership = [
    {
      name: 'Dr. Robert Vance',
      role: 'School Principal',
      degree: 'Ph.D. Educational Leadership',
      color: 'bg-blue-600/20 text-blue-400',
    },
    {
      name: 'Prof. Clara Higgins',
      role: 'Vice Principal, Academic Affairs',
      degree: 'M.Ed. Curriculum Design',
      color: 'bg-purple-600/20 text-purple-400',
    },
    {
      name: 'Marcus Sterling',
      role: 'Head Registrar & Administrator',
      degree: 'M.S. Information Systems',
      color: 'bg-emerald-600/20 text-emerald-400',
    },
  ];

  const milestones = [
    { year: '2001', event: 'Noah\'s Academy founded with 3 classrooms and 48 students.' },
    { year: '2008', event: 'Junior High program launched; campus expanded to 2 hectares.' },
    { year: '2015', event: 'Senior High STEM and ABM tracks accredited by DepEd.' },
    { year: '2022', event: 'EduCore digital management platform deployed across all departments.' },
    { year: '2026', event: 'Enrollment surpasses 2,480 students. AI-Lab inaugurated.' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* Hero */}
      <PageHero
        label="About Noah's Academy"
        title="Nurturing Minds, Inspiring Excellence"
        desc="Discover the history, leadership, and educational core values driving Noah's Academy forward — a 25-year legacy of transformative education."
      />

      {/* Core Values */}
      <section>
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-400">
            Our Foundation
          </span>
          <h2 className="mt-2 text-3xl font-bold text-white">Core Values & Principles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {coreValues.map((v) => (
            <ValueCard key={v.title} {...v} />
          ))}
        </div>
      </section>

      {/* Institutional History — Timeline */}
      <section>
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400">
            Our Journey
          </span>
          <h2 className="mt-2 text-3xl font-bold text-white">25 Years of Impact</h2>
        </div>
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-4 sm:left-1/2 sm:-translate-x-px top-0 bottom-0 w-px bg-slate-800" />
          <div className="space-y-10">
            {milestones.map((m, i) => (
              <div
                key={m.year}
                className={`relative flex items-start gap-6 ${
                  i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'
                }`}
              >
                {/* Dot */}
                <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-blue-500 ring-4 ring-slate-950 mt-1.5" />
                {/* Content */}
                <div
                  className={`ml-12 sm:ml-0 sm:w-[calc(50%-2rem)] p-5 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors ${
                    i % 2 === 0 ? 'sm:mr-8' : 'sm:ml-8'
                  }`}
                >
                  <span className="text-xs font-bold text-blue-400 font-mono">{m.year}</span>
                  <p className="mt-1 text-sm text-slate-300 leading-relaxed">{m.event}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership Team */}
      <section>
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-purple-400">
            Our Leaders
          </span>
          <h2 className="mt-2 text-3xl font-bold text-white">Institutional Leadership</h2>
          <p className="text-slate-400 text-sm mt-3">
            Dedicated administrators guiding Noah's Academy toward excellence.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {leadership.map((m) => (
            <div
              key={m.name}
              className="group p-6 bg-slate-900 border border-slate-800 rounded-3xl text-center space-y-4 hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div
                className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center text-2xl font-extrabold ${m.color}`}
              >
                {m.name[0]}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm group-hover:text-blue-300 transition-colors">
                  {m.name}
                </h4>
                <p className="text-xs text-blue-400 font-semibold mt-1">{m.role}</p>
                <p className="text-[11px] text-slate-500 mt-1">{m.degree}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Strip */}
      <section className="text-center">
        <div className="inline-flex flex-col sm:flex-row items-center gap-4">
          <Link
            to="/admissions"
            className="inline-flex items-center gap-2 px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-500/20"
          >
            <span>Start Your Application</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/academics"
            className="inline-flex items-center gap-2 px-7 py-3 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold rounded-xl text-sm transition-all"
          >
            <BookOpen className="w-4 h-4 text-emerald-400" />
            <span>Explore Academics</span>
          </Link>
        </div>
      </section>
    </div>
  );
};
