import React from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckCircle2, Download, ArrowRight, Clock, Star, Sparkles } from 'lucide-react';
import { toast } from 'sonner';

const steps = [
  {
    step: '01',
    title: 'Submit Application Form',
    desc: 'Fill out student profile & upload required digital documents via the EduCore portal.',
    icon: FileText,
  },
  {
    step: '02',
    title: 'Document Verification',
    desc: 'Registrar reviews Form 138, Birth Certificate, and Conduct records within 24 hours.',
    icon: CheckCircle2,
  },
  {
    step: '03',
    title: 'Academic Interview',
    desc: 'Brief consultation scheduled with Guidance Counselor or Track Head.',
    icon: Star,
  },
  {
    step: '04',
    title: 'Section Assignment & Billing',
    desc: 'Registrar allocates class section and issues digital tuition ledger.',
    icon: Clock,
  },
  {
    step: '05',
    title: 'Official Confirmation',
    desc: 'Receive official Student ID and EduCore Portal login credentials by email.',
    icon: Sparkles,
  },
];

const requirements = [
  'PSA Authenticated Birth Certificate (Original & Photocopy)',
  'Report Card (Form 138) with Final Grades & Learner Reference Number',
  'Certificate of Good Moral Character from Previous School',
  'Recent 2×2 ID Photos with White Background (4 copies)',
];

const faqItems = [
  {
    q: 'When does enrollment open?',
    a: 'Online enrollment is open from July 1 to August 31 for AY 2026–2027.',
  },
  {
    q: 'Is there an entrance exam?',
    a: 'No entrance exam for Grade 7 and below. Senior High applicants undergo a track orientation interview.',
  },
  {
    q: 'Can I apply without a Form 138?',
    a: 'Conditional enrollment is allowed pending submission of Form 138 within 30 days.',
  },
];

export const AdmissionsPage: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
      {/* Hero */}
      <div className="relative text-center space-y-5 max-w-3xl mx-auto">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-600/8 rounded-full blur-3xl pointer-events-none" />
        <span className="relative text-[11px] font-bold uppercase tracking-[0.18em] text-blue-400">
          Admissions AY 2026–2027
        </span>
        <h1 className="relative text-4xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
          Online Enrollment Workflow
        </h1>
        <p className="relative text-slate-400 text-sm leading-relaxed">
          Follow our streamlined 5-step digital enrollment process — paperless, fast, and fully
          managed through EduCore.
        </p>
      </div>

      {/* Step Timeline */}
      <section>
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-400">
            Enrollment Process
          </span>
          <h2 className="mt-2 text-3xl font-bold text-white">5-Step Admission Guide</h2>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden md:block absolute top-[52px] left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-700 to-transparent mx-12" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-5">
            {steps.map((s, _idx) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.step}
                  className="relative flex flex-col items-center text-center gap-4 group"
                >
                  {/* Step circle */}
                  <div className="relative w-14 h-14 rounded-full bg-blue-600/20 border-2 border-blue-500/40 text-blue-400 flex items-center justify-center font-extrabold text-lg font-mono z-10 group-hover:bg-blue-600/40 group-hover:border-blue-400 transition-all">
                    {s.step}
                  </div>
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-300 w-full">
                    <Icon className="w-5 h-5 text-blue-400 mx-auto" />
                    <h3 className="font-bold text-white text-sm">{s.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Requirements + Start Application */}
      <section className="bg-slate-900/60 border border-slate-800 rounded-3xl p-8 lg:p-14 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Requirements */}
        <div className="space-y-6">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-400">
              Documents Needed
            </span>
            <h3 className="mt-2 text-2xl font-bold text-white">
              Required for New Students
            </h3>
          </div>
          <ul className="space-y-3">
            {requirements.map((req, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                <FileText className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                <span>{req}</span>
              </li>
            ))}
          </ul>
          <button
            onClick={() => toast.success('Downloading Admissions Checklist PDF…')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download Admissions Checklist PDF</span>
          </button>
        </div>

        {/* Start Application Box */}
        <div className="bg-slate-950 p-8 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-6">
          <div className="space-y-3">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-bold text-white">Start Your Application</h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Begin the online registration process today. Our Registrar Team will review your
              digital documents within 24 hours and confirm your application status by email.
            </p>
          </div>
          <div className="space-y-3">
            <Link
              to="/admissions/apply"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-500/20 transition-all"
            >
              <span>Submit Online Application</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/contact"
              className="w-full inline-flex items-center justify-center gap-2 py-3.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition-all"
            >
              Contact Admissions Office
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section>
        <div className="text-center mb-12">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-amber-400">
            Frequently Asked
          </span>
          <h2 className="mt-2 text-3xl font-bold text-white">Admissions FAQ</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((faq, i) => (
            <div
              key={i}
              className="p-6 bg-slate-900 border border-slate-800 rounded-2xl hover:border-slate-700 transition-colors"
            >
              <h4 className="text-sm font-bold text-white mb-2">{faq.q}</h4>
              <p className="text-xs text-slate-400 leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
