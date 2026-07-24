import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  Users,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  Calendar,
  Newspaper,
  ChevronRight,
  Star,
  Zap,
  Globe,
} from 'lucide-react';

// ─── Reusable Section Header ───────────────────────────────────────────────
const SectionLabel: React.FC<{ text: string; color?: string }> = ({
  text,
  color = 'text-blue-400',
}) => (
  <span className={`text-[11px] font-bold uppercase tracking-[0.18em] ${color}`}>{text}</span>
);

// ─── Feature Card ──────────────────────────────────────────────────────────
interface FeatureCardProps {
  icon: React.ElementType;
  title: string;
  desc: string;
  accent?: string;
}
const FeatureCard: React.FC<FeatureCardProps> = ({
  icon: Icon,
  title,
  desc,
  accent = 'blue',
}) => {
  const colorMap: Record<string, string> = {
    blue: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20',
    amber: 'bg-amber-500/10 text-amber-400 group-hover:bg-amber-500/20',
    purple: 'bg-purple-500/10 text-purple-400 group-hover:bg-purple-500/20',
  };
  return (
    <div className="group relative bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-300">
      <div
        className={`p-3 rounded-xl w-12 h-12 flex items-center justify-center mb-4 transition-colors ${
          colorMap[accent] ?? colorMap.blue
        }`}
      >
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-white mb-2">{title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
  );
};

// ─── Stat Item ─────────────────────────────────────────────────────────────
const StatItem: React.FC<{ value: string; label: string; color: string }> = ({
  value,
  label,
  color,
}) => (
  <div className="text-center">
    <div className={`text-3xl sm:text-4xl font-extrabold font-mono ${color}`}>{value}</div>
    <div className="text-[11px] text-slate-400 font-medium mt-1">{label}</div>
  </div>
);

// ─── Program Card ──────────────────────────────────────────────────────────
interface ProgramCardProps {
  tag: string;
  title: string;
  desc: string;
}
const ProgramCard: React.FC<ProgramCardProps> = ({ tag, title, desc }) => (
  <div className="group bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between hover:border-blue-500/50 hover:-translate-y-0.5 transition-all duration-300">
    <div>
      <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-400 px-2.5 py-1 rounded-full bg-blue-950 border border-blue-800 mb-4">
        {tag}
      </span>
      <h3 className="text-base font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
        {title}
      </h3>
      <p className="text-xs text-slate-400 leading-relaxed">{desc}</p>
    </div>
    <Link
      to="/academics"
      className="mt-6 inline-flex items-center text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors group/link"
    >
      <span>Learn Details</span>
      <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover/link:translate-x-0.5 transition-transform" />
    </Link>
  </div>
);

// ─── Page Component ────────────────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  // Parallax mouse-glow effect on hero
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;
    const handler = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      el.style.setProperty('--glow-x', `${x}%`);
      el.style.setProperty('--glow-y', `${y}%`);
    };
    el.addEventListener('mousemove', handler);
    return () => el.removeEventListener('mousemove', handler);
  }, []);

  const programs = [
    {
      tag: 'Early Childhood',
      title: 'Preschool & K-2',
      desc: 'Play-based foundational learning developing motor, cognitive, and social skills.',
    },
    {
      tag: 'Primary Focus',
      title: 'Elementary (Grades 1–6)',
      desc: 'Core literacy, mathematics, science exploration, and arts enrichment.',
    },
    {
      tag: 'Secondary Phase',
      title: 'Junior High (Grades 7–10)',
      desc: 'Comprehensive academic prep with robotics, languages, and athletics.',
    },
    {
      tag: 'College Prep',
      title: 'Senior High (STEM / ABM)',
      desc: 'Specialized tracks in Science, Technology, Business, and Humanities.',
    },
  ];

  const news = [
    {
      title: "Noah's Academy Receives Regional STEM Excellence Award",
      date: 'July 18, 2026',
      cat: 'Achievement',
    },
    {
      title: 'AY 2026–2027 Early Bird Enrollment Discount Schedule',
      date: 'July 10, 2026',
      cat: 'Admissions',
    },
  ];

  const events = [
    {
      title: 'Parent-Teacher Orientation Conference',
      date: 'Aug 5, 2026',
      location: 'Main Auditorium',
    },
    {
      title: 'Annual Foundation Day & Sports Fest',
      date: 'Aug 20, 2026',
      location: 'Academy Sports Complex',
    },
  ];

  return (
    <div className="space-y-28 pb-24">
      {/* ══════════════════════════════════════════
          SECTION 1 — HERO
      ══════════════════════════════════════════ */}
      <section ref={heroRef} className="relative pt-20 pb-32 overflow-hidden">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-blue-600/12 rounded-full blur-3xl" />
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/8 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/8 rounded-full blur-3xl" />
          {/* Animated grid lines */}
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(148,163,184,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.03)_1px,transparent_1px)] [background-size:80px_80px]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/25 text-blue-400 text-[11px] font-bold uppercase tracking-widest mb-8 animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Admissions Open — AY 2026–2027</span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.08] max-w-5xl mx-auto">
            Empowering Future Leaders
            <br />
            Through{' '}
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400 bg-clip-text text-transparent">
              Excellence in Education
            </span>
          </h1>

          <p className="mt-7 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Noah's Academy delivers a technology-driven learning ecosystem engineered for academic
            rigor, character development, and lifelong achievement.
          </p>

          {/* CTAs */}
          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/admissions"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold rounded-2xl shadow-xl shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02] text-sm"
            >
              <span>Apply for Admission</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 font-bold rounded-2xl transition-all text-sm"
            >
              <GraduationCap className="w-4 h-4 text-blue-400" />
              <span>EduCore Portal Login</span>
            </Link>
          </div>

          {/* Key Metrics */}
          <div className="mt-20 max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 pt-12 border-t border-slate-800/60">
            <StatItem value="2,480+" label="Enrolled Students" color="text-white" />
            <StatItem value="99.4%" label="Graduation Rate" color="text-emerald-400" />
            <StatItem value="184+" label="Licensed Educators" color="text-blue-400" />
            <StatItem value="25+" label="Years Excellence" color="text-amber-400" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 2 — SCHOOL OVERVIEW
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800 rounded-3xl p-8 lg:p-14 grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
          <div className="space-y-6">
            <SectionLabel text="About Noah's Academy" />
            <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight leading-tight">
              A Legacy of Academic Innovation &amp; Character Building
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Founded with the vision to nurture well-rounded, compassionate, and academically
              skilled leaders, Noah's Academy combines traditional values with modern educational
              technology — all managed through EduCore, our integrated school management platform.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                {
                  icon: ShieldCheck,
                  label: 'Mission',
                  text: 'Transformative education through holistic curricula and technology.',
                  color: 'text-blue-400 bg-blue-500/10',
                },
                {
                  icon: Award,
                  label: 'Vision',
                  text: 'Premier institution recognized for global student excellence.',
                  color: 'text-emerald-400 bg-emerald-500/10',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div
                    key={item.label}
                    className="p-4 bg-slate-950/70 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors"
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${item.color}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-bold text-white text-sm mb-1">{item.label}</h4>
                    <p className="text-xs text-slate-400 leading-relaxed">{item.text}</p>
                  </div>
                );
              })}
            </div>
            <Link
              to="/about"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span>Learn about our institution</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Principal's Welcome */}
          <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950/80 p-8 flex flex-col items-center text-center space-y-5">
            <div className="absolute inset-0 [background:radial-gradient(ellipse_at_center,rgba(59,130,246,0.08),transparent_70%)] pointer-events-none" />
            <div className="relative p-4 bg-blue-600/20 text-blue-400 rounded-full w-20 h-20 flex items-center justify-center">
              <GraduationCap className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-bold text-white">
              Welcome Message from the Principal
            </h3>
            <div className="flex gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <blockquote className="text-sm italic text-slate-300 leading-relaxed max-w-sm">
              "At Noah's Academy, we empower our learners to reach their highest potential in a
              supportive, innovative atmosphere. We welcome you to join our thriving academic
              family."
            </blockquote>
            <div className="pt-2 border-t border-slate-800 w-full">
              <p className="text-xs font-bold text-blue-400">— Dr. Robert Vance</p>
              <p className="text-[11px] text-slate-500">School Principal</p>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 3 — WHY CHOOSE US
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <SectionLabel text="Why Noah's Academy" />
          <h2 className="mt-3 text-3xl font-bold text-white">
            An Education Designed for the Future
          </h2>
          <p className="text-slate-400 text-sm mt-3 max-w-xl mx-auto leading-relaxed">
            A safe, tech-enabled environment built to cultivate every student's unique potential.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <FeatureCard
            icon={Users}
            title="Licensed & Expert Faculty"
            desc="All educators hold advanced degrees and certified pedagogical training."
            accent="blue"
          />
          <FeatureCard
            icon={Zap}
            title="Technology-Driven Learning"
            desc="EduCore provides real-time gradebooks, digital ledgers, and attendance tracking."
            accent="amber"
          />
          <FeatureCard
            icon={ShieldCheck}
            title="Safe & Secure Campus"
            desc="24/7 security, automated student gate check-ins, and instant guardian alerts."
            accent="emerald"
          />
          <FeatureCard
            icon={Globe}
            title="Globally Competitive Graduates"
            desc="Our alumni go on to lead in universities and industries across the globe."
            accent="purple"
          />
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 4 — ACADEMIC PROGRAMS
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
          <div>
            <SectionLabel text="Academic Offerings" color="text-emerald-400" />
            <h2 className="mt-2 text-3xl font-bold text-white">Curriculum & Track Options</h2>
          </div>
          <Link
            to="/academics"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors"
          >
            <span>Explore Full Curriculum</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {programs.map((prog) => (
            <ProgramCard key={prog.tag} {...prog} />
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 5 — NEWS + EVENTS
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Latest News */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Newspaper className="w-5 h-5 text-blue-400" />
              Latest Announcements
            </h3>
            <Link
              to="/news"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="space-y-3">
            {news.map((item, i) => (
              <div
                key={i}
                className="group p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    {item.cat}
                  </span>
                  <span className="text-[10px] text-slate-500">{item.date}</span>
                </div>
                <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors leading-snug">
                  {item.title}
                </h4>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Events */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              Upcoming Events
            </h3>
            <Link
              to="/events"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold transition-colors"
            >
              View Calendar →
            </Link>
          </div>
          <div className="space-y-3">
            {events.map((ev, i) => (
              <div
                key={i}
                className="p-4 bg-slate-950/80 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4 hover:border-slate-700 transition-colors"
              >
                <div>
                  <h4 className="text-sm font-semibold text-white leading-snug">{ev.title}</h4>
                  <span className="text-[11px] text-slate-400 mt-1 block">{ev.location}</span>
                </div>
                <span className="px-3 py-1.5 bg-amber-500/10 text-amber-400 font-mono text-[11px] font-bold rounded-lg border border-amber-500/20 shrink-0 whitespace-nowrap">
                  {ev.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          SECTION 6 — CTA BANNER
      ══════════════════════════════════════════ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 p-10 sm:p-16 text-center text-white shadow-2xl shadow-blue-900/30">
          {/* Decorative grid */}
          <div className="absolute inset-0 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:60px_60px] pointer-events-none" />
          {/* Ambient blobs */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-[11px] font-bold uppercase tracking-widest">
              <Sparkles className="w-3 h-3" />
              <span>Now Accepting Applications</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Ready to Begin Your Educational Journey?
            </h2>
            <p className="text-blue-100 text-sm sm:text-base leading-relaxed">
              Applications for AY 2026–2027 are processed online through the EduCore Registrar
              System — fast, paperless, and tracked in real time.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/admissions"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-blue-700 font-extrabold rounded-2xl hover:bg-blue-50 transition-all shadow-xl text-sm"
              >
                <span>Apply Online Now</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/contact"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl border border-white/20 transition-all text-sm"
              >
                <span>Schedule Campus Tour</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
