import React, { useState } from 'react';
import { ArrowRight, Search } from 'lucide-react';

interface NewsItem {
  title: string;
  category: string;
  categoryColor: string;
  date: string;
  desc: string;
}

const allNews: NewsItem[] = [
  {
    title: "Noah's Academy Receives Regional STEM Excellence Award",
    category: 'Achievement',
    categoryColor: 'bg-blue-950 border-blue-800 text-blue-400',
    date: 'July 18, 2026',
    desc: 'Our Senior High robotics team secured 1st place in the Regional Innovation Challenge, beating 48 competing schools.',
  },
  {
    title: 'AY 2026–2027 Early Bird Enrollment Schedule Released',
    category: 'Admissions',
    categoryColor: 'bg-emerald-950 border-emerald-800 text-emerald-400',
    date: 'July 10, 2026',
    desc: 'Parents and guardians can now submit applications via the EduCore Portal with early-bird discount incentives.',
  },
  {
    title: 'New Computer Science & Artificial Intelligence Lab Opening',
    category: 'Campus',
    categoryColor: 'bg-purple-950 border-purple-800 text-purple-400',
    date: 'June 28, 2026',
    desc: 'State-of-the-art workstations and AI development kits installed for STEM programming courses.',
  },
  {
    title: 'Outstanding Board Passers: Batch 2026 Alumni Report',
    category: 'Achievement',
    categoryColor: 'bg-blue-950 border-blue-800 text-blue-400',
    date: 'June 15, 2026',
    desc: 'Sixteen Noah\'s Academy alumni placed in the top 10 of national board exams across engineering, medicine, and law.',
  },
  {
    title: 'Annual Sports Fest Concludes with Record Participation',
    category: 'Events',
    categoryColor: 'bg-amber-950 border-amber-800 text-amber-400',
    date: 'May 30, 2026',
    desc: 'Over 1,800 students competed across 12 sports disciplines in our biggest Foundation Day ever.',
  },
  {
    title: 'Noah\'s Academy Partners with DOST for Research Grants',
    category: 'Academics',
    categoryColor: 'bg-rose-950 border-rose-800 text-rose-400',
    date: 'May 20, 2026',
    desc: 'Ten STEM students awarded research grants under the DOST-SEI Science Excellence Program.',
  },
];

const categories = ['All', 'Achievement', 'Admissions', 'Campus', 'Events', 'Academics'];

export const NewsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const filtered = allNews.filter((n) => {
    const matchCat = activeCategory === 'All' || n.category === activeCategory;
    const matchSearch =
      search.trim() === '' ||
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.desc.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  // Pin first news as featured
  const [featured, ...rest] = filtered;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">
      {/* Hero */}
      <div className="relative text-center space-y-5 max-w-3xl mx-auto">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-80 h-80 bg-blue-500/6 rounded-full blur-3xl pointer-events-none" />
        <span className="relative text-[11px] font-bold uppercase tracking-[0.18em] text-blue-400">
          News & Announcements
        </span>
        <h1 className="relative text-4xl sm:text-5xl font-extrabold text-white tracking-tight">
          Institutional News Bulletin
        </h1>
        <p className="relative text-slate-400 text-sm leading-relaxed">
          Stay updated with the latest achievements, campus developments, and official announcements
          from Noah's Academy.
        </p>
      </div>

      {/* Search + Filter Row */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Search */}
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
          />
        </div>
        {/* Category pills */}
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-white hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Article */}
      {featured && (
        <div className="group relative bg-gradient-to-br from-slate-900/80 to-slate-900/40 border border-slate-800 rounded-3xl p-8 lg:p-12 hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
          <div className="absolute inset-0 [background:radial-gradient(ellipse_at_top_right,rgba(59,130,246,0.06),transparent_60%)] pointer-events-none" />
          <div className="relative space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <span
                className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${featured.categoryColor}`}
              >
                {featured.category}
              </span>
              <span className="text-xs text-slate-500">{featured.date}</span>
              <span className="text-[10px] font-bold text-blue-400 uppercase tracking-wider px-2 py-0.5 bg-blue-500/10 border border-blue-500/20 rounded-full">
                Featured
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
              {featured.title}
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">{featured.desc}</p>
            <button className="inline-flex items-center gap-2 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
              <span>Read Full Story</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* News Grid */}
      {rest.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest.map((n, idx) => (
            <div
              key={idx}
              className="group bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 hover:-translate-y-0.5 transition-all duration-300"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span
                    className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${n.categoryColor}`}
                  >
                    {n.category}
                  </span>
                  <span className="text-[11px] text-slate-500">{n.date}</span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors leading-snug">
                  {n.title}
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">{n.desc}</p>
              </div>
              <button className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors">
                <span>Read Full Story</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <p className="text-sm">No articles found matching your filters.</p>
        </div>
      )}
    </div>
  );
};
