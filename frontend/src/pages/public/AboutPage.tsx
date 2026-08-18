import React from 'react';
import { Heart, Award, BookOpen } from 'lucide-react';

const facilities = [
  {
    title: 'Main Campus Gate & Entrance',
    desc: 'Secure entrance gates with 24/7 campus security personnel at 31 DBP Avenue, Arca South, Taguig City.',
    image: '/images/campus/entrance.jpg',
  },
  {
    title: 'Main Academic Building',
    desc: 'Spacious multistory learning facilities housing Grade 1 through Grade 12 classrooms at Arca South.',
    image: '/images/campus/building.jpg',
  },
  {
    title: 'Air-Conditioned Learning Classrooms',
    desc: 'Equipped with multimedia projectors, ergonomic seating, and conducive study layouts.',
    image: '/images/campus/classrooms.jpg',
  },
  {
    title: 'ICT Support & Computer Laboratory',
    desc: 'High-speed computer workstations for IT practicals, web development, and NAISIS orientation.',
    image: '/images/campus/computer-lab.jpg',
  },
  {
    title: 'Institutional Resource Library',
    desc: 'Digital reference catalog, research quiet halls, and comprehensive learning materials.',
    image: '/images/campus/library.jpg',
  },
  {
    title: 'Covered Athletic Court & Quadrangle',
    desc: 'Multi-purpose court for sports intramurals, physical education, and institutional assemblies.',
    image: '/images/campus/covered-court.jpg',
  },
];

const milestones = [
  { year: '2002', event: 'Noah\'s Academy Incorporated founded in Taguig City, Metro Manila.' },
  { year: '2008', event: 'Junior High School program expanded with modernized academic facilities.' },
  { year: '2015', event: 'Senior High School tracks (ASSH, BE, ICT Support, Hospitality & Tourism) DepEd accredited.' },
  { year: '2022', event: 'Arca South Campus facility integration & NAISIS digital platform launch.' },
  { year: '2026', event: 'Enrollment reaches over 2,400 active learners across Grade 1 to Grade 12.' },
];

export const AboutPage: React.FC = () => {
  return (
    <div className="bg-[#FAF8FF] min-h-screen text-slate-900 py-12 lg:py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
        {/* Hero */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-700">
            About Noah's Academy Incorporated – Arca South
          </span>
          <h1 className="text-3xl sm:text-5xl font-black text-purple-950 tracking-tight">
            Excellence in Education, Virtue in Character
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
            Noah's Academy Incorporated – Arca South Campus provides quality basic education in Taguig City while nurturing academic excellence, leadership, and Christian values. Located at 31 DBP Avenue, Arca South, we foster intellectual curiosity, moral integrity, and holistic personal growth.
          </p>
        </div>

        {/* Mission, Vision, Values */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white border border-purple-100 rounded-3xl p-8 shadow-xs space-y-4">
            <div className="p-3.5 bg-purple-100 text-purple-700 rounded-2xl w-12 h-12 flex items-center justify-center font-black">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-purple-950">Our Mission</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              To provide accessible, quality basic education from Grade 1 through Senior High School, fostering intellectual curiosity, ethical leadership, and practical life skills.
            </p>
          </div>

          <div className="bg-white border border-purple-100 rounded-3xl p-8 shadow-xs space-y-4">
            <div className="p-3.5 bg-purple-100 text-purple-700 rounded-2xl w-12 h-12 flex items-center justify-center font-black">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-purple-950">Our Vision</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              To be a leading private educational institution in Taguig City recognized for holistic character formation, academic excellence, and university readiness.
            </p>
          </div>

          <div className="bg-white border border-purple-100 rounded-3xl p-8 shadow-xs space-y-4">
            <div className="p-3.5 bg-purple-100 text-purple-700 rounded-2xl w-12 h-12 flex items-center justify-center font-black">
              <Heart className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-extrabold text-purple-950">Core Values</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Integrity, Discipline, Academic Mastery, Respect, and Service to God and Country.
            </p>
          </div>
        </div>

        {/* Official Campus Facilities Showcase */}
        <div className="space-y-8">
          <div className="text-center space-y-2 max-w-2xl mx-auto">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-700">Arca South Environment</span>
            <h2 className="text-2xl sm:text-3xl font-black text-purple-950">Arca South Campus Facilities</h2>
            <p className="text-xs text-slate-600">Take a visual tour of our facilities at 31 DBP Avenue, Arca South, Taguig City.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {facilities.map((fac, idx) => (
              <div key={idx} className="bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl transition-all group">
                <div className="h-52 overflow-hidden bg-purple-950 relative">
                  <img
                    src={fac.image}
                    alt={fac.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-amber-400 text-purple-950 font-black text-[10px] uppercase tracking-wider rounded-full">
                    Facility
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="font-extrabold text-base text-purple-950">{fac.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{fac.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="bg-white border border-purple-100 rounded-3xl p-8 lg:p-12 shadow-sm space-y-8">
          <div className="text-center space-y-2">
            <span className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-700">Our Journey</span>
            <h2 className="text-2xl sm:text-3xl font-black text-purple-950">Institutional Milestones</h2>
          </div>

          <div className="space-y-4 max-w-3xl mx-auto">
            {milestones.map((m, idx) => (
              <div key={idx} className="flex items-center space-x-4 p-4 bg-purple-50/60 rounded-2xl border border-purple-100">
                <span className="px-4 py-2 bg-purple-700 text-white font-mono font-black text-xs rounded-xl shrink-0">
                  {m.year}
                </span>
                <span className="text-xs font-semibold text-purple-950">{m.event}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
