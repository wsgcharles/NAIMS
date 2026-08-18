import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle, ArrowRight, BookOpen, Compass, Briefcase, Laptop, Utensils } from 'lucide-react';

interface Program {
  id: string;
  tag: string;
  title: string;
  subtitle: string;
  units: string;
  features: string[];
  icon: React.ElementType;
}

const programs: Program[] = [
  {
    id: 'assh',
    tag: 'Senior High Track',
    title: 'Arts, Social Sciences and Humanities (ASSH)',
    subtitle: 'Humanities, Creative Writing & Social Inquiry',
    units: 'DepEd Aligned Track',
    icon: Compass,
    features: [
      'Creative Writing & Literature Analysis',
      'Philippine Governance & Social Sciences',
      'Community Action & Public Speaking',
      'Research Methodology & Capstone Project',
    ],
  },
  {
    id: 'be',
    tag: 'Senior High Track',
    title: 'Business Entrepreneurship (BE)',
    subtitle: 'Enterprise Creation, Marketing & Finance',
    units: 'DepEd Aligned Track',
    icon: Briefcase,
    features: [
      'Business Mathematics & Enterprise Planning',
      'Fundamentals of Accounting & Bookkeeping',
      'Marketing Principles & Customer Relations',
      'Real-world Entrepreneurial Simulation',
    ],
  },
  {
    id: 'ict-support',
    tag: 'Senior High Track',
    title: 'ICT Support',
    subtitle: 'Information & Communications Technology Support',
    units: 'Technical & Practical Track',
    icon: Laptop,
    features: [
      'Computer Systems Servicing & Networking',
      'Technical Support & System Administration',
      'Software & Digital Applications Integration',
      'IT Helpdesk & Troubleshooting Skills',
    ],
  },
  {
    id: 'hospitality',
    tag: 'Senior High Track',
    title: 'Hospitality and Tourism',
    subtitle: 'Service Management & Tourism Operations',
    units: 'Technical & Practical Track',
    icon: Utensils,
    features: [
      'Front Office & Customer Care Operations',
      'Tourism Principles & Event Management',
      'Food & Beverage Service Procedures',
      'Hospitality Workplace Safety & Hygiene',
    ],
  },
  {
    id: 'grade12-spec',
    tag: 'Grade 12 Specializations',
    title: 'Grade 12 Specialized Strands',
    subtitle: 'ABM · HUMSS 201 · GAS · AD · HE · ICT',
    units: 'College & Career Preparatory',
    icon: BookOpen,
    features: [
      'ABM (Accountancy, Business & Management)',
      'HUMSS 201 (Humanities & Social Sciences)',
      'GAS (General Academic Strand)',
      'AD (Arts & Design), HE (Home Economics) & ICT',
    ],
  },
];

export const AcademicsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('assh');
  const selectedProgram = programs.find((p) => p.id === activeTab) ?? programs[0];

  return (
    <div className="bg-[#FAF8FF] min-h-screen text-slate-900 py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-700">
            Academic Programs
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-purple-950 tracking-tight">
            Nurturing Minds, Building Character
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Noah's Academy Incorporated offers DepEd-recognized academic programs from Grade 1 through Grade 12, featuring specialized Senior High tracks.
          </p>
        </div>

        {/* Program Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-purple-100 pb-4">
          {programs.map((p) => (
            <button
              key={p.id}
              onClick={() => setActiveTab(p.id)}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all ${
                activeTab === p.id
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-700/25'
                  : 'bg-white text-purple-950 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        {/* Selected Program Showcase */}
        <div className="bg-white border border-purple-100 rounded-3xl p-8 lg:p-12 shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="space-y-2">
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-[10px] font-black uppercase tracking-wider rounded-full inline-block">
                {selectedProgram.tag}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-purple-950">{selectedProgram.title}</h2>
              <p className="text-xs font-bold text-purple-700">{selectedProgram.subtitle} · {selectedProgram.units}</p>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Curriculum Highlights</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {selectedProgram.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start space-x-2.5 p-3 bg-purple-50/60 rounded-2xl border border-purple-100">
                    <CheckCircle className="w-4 h-4 text-purple-700 shrink-0 mt-0.5" />
                    <span className="text-xs font-semibold text-purple-950 leading-tight">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4">
              <Link
                to="/admissions"
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-purple-700/25 transition-all"
              >
                <span>Enroll in {selectedProgram.title}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="lg:col-span-5 bg-gradient-to-br from-purple-950 to-indigo-950 text-white rounded-3xl p-8 space-y-6 shadow-xl text-center">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-purple-950 flex items-center justify-center mx-auto shadow-md">
              <selectedProgram.icon className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-black text-amber-300">DepEd Accredited</h3>
              <p className="text-xs text-purple-100 leading-relaxed">
                Full DepEd recognition with aligned learning competencies, modern learning materials, and continuous student progress monitoring via NAISIS.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
