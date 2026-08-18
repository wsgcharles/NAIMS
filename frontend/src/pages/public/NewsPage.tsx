import React, { useState } from 'react';
import { ArrowRight, Search, Calendar, X } from 'lucide-react';

export interface NewsItem {
  id: string;
  title: string;
  category: string;
  date: string;
  author: string;
  image: string;
  summary: string;
  content: string[];
}

const allNews: NewsItem[] = [
  {
    id: 'graduation',
    title: 'Graduation Ceremony',
    category: 'Graduation',
    date: 'May 28, 2026',
    author: 'Office of the Registrar',
    image: '/images/news/graduation.jpg',
    summary: 'Senior High School graduation exercises honoring completers across ASSH, BE, ICT Support, and Hospitality & Tourism tracks.',
    content: [
      'Noah\'s Academy Incorporated conducted its official Graduation Ceremony at the Arca South Campus Auditorium in Taguig City.',
      'Graduating students across Senior High School tracks received their diplomas and academic excellence honors.',
      'School directress and faculty leads commended the graduates for their academic dedication and character virtues.'
    ],
  },
  {
    id: 'moving-up',
    title: 'Moving-Up Ceremony',
    category: 'Academic Ceremony',
    date: 'May 25, 2026',
    author: 'Junior High Department',
    image: '/images/news/moving-up.jpg',
    summary: 'Grade 10 completers officially advance to Senior High School tracks for AY 2026–2027.',
    content: [
      'The Junior High School Moving-Up Ceremony honored Grade 10 students for completing their basic secondary education.',
      'Certificates of completion and track advisories were awarded during the ceremony.',
      'Grade 10 completers participated in Senior High track counseling sessions following the program.'
    ],
  },
  {
    id: 'recognition',
    title: 'Recognition Day',
    category: 'Recognition',
    date: 'May 20, 2026',
    author: 'Academic Affairs',
    image: '/images/news/recognition.jpg',
    summary: 'Honoring academic achievers, honor roll awardees, and student leadership commendations.',
    content: [
      'Noah\'s Academy recognized top performing students from Grade 1 through Grade 12 during Recognition Day.',
      'Students receiving academic honors, perfect attendance pins, and leadership certificates were awarded.',
      'Parents and guardians joined the faculty in celebrating student excellence.'
    ],
  },
  {
    id: 'buwan-ng-wika',
    title: 'Buwan ng Wika Celebration',
    category: 'Cultural Festival',
    date: 'August 28, 2025',
    author: 'Filipino Department',
    image: '/images/news/buwan-ng-wika.jpg',
    summary: 'Promoting national language and Filipino cultural heritage through Sabayang Bigkas and folk arts.',
    content: [
      'Noah\'s Academy Incorporated celebrated Buwan ng Wika with cultural presentations and traditional Filipino attires.',
      'Students participated in Sabayang Bigkas, Balagtasan recitals, and kundiman vocal competitions.',
      'The celebration emphasized love for national language and cultural roots.'
    ],
  },
  {
    id: 'teachers-day',
    title: 'Teachers\' Day Celebration',
    category: 'Faculty Celebration',
    date: 'October 05, 2025',
    author: 'Supreme Student Council',
    image: '/images/news/teachers-day.jpg',
    summary: 'Student-led tribute program honoring the dedication of Noah\'s Academy educators.',
    content: [
      'The Supreme Student Council led the World Teachers\' Day celebration across campus.',
      'Students presented musical performances, handcrafted appreciation tokens, and letters of gratitude.',
      'Faculty members were recognized for their tireless dedication to learner development.'
    ],
  },
  {
    id: 'foundation-day',
    title: 'Foundation Day Celebration',
    category: 'Foundation Day',
    date: 'February 18, 2026',
    author: 'Institutional Events Committee',
    image: '/images/news/foundation-day.jpg',
    summary: 'Commemorating the founding of Noah\'s Academy Incorporated in Taguig City.',
    content: [
      'Noah\'s Academy celebrated its Foundation Day Anniversary in Signal Village, Taguig City.',
      'The event featured a campus parade, inter-house sports finals, and cultural dance competitions.',
      'Alumni and community leaders gathered to celebrate the school\'s educational growth.'
    ],
  },
  {
    id: 'united-nations',
    title: 'United Nations Celebration',
    category: 'Student Life',
    date: 'October 24, 2025',
    author: 'Social Studies Department',
    image: '/images/news/united-nations.jpg',
    summary: 'Global cultural costume parade and international unity pageant.',
    content: [
      'Learners showcased international attires representing member states during United Nations Day.',
      'Classrooms prepared country cultural booths promoting peace and global understanding.',
      'The event highlighted diversity, unity, and global citizenship.'
    ],
  },
];

export const NewsPage: React.FC = () => {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const categories = ['All', 'Graduation', 'Academic Ceremony', 'Recognition', 'Cultural Festival', 'Faculty Celebration', 'Foundation Day', 'Student Life'];

  const filtered = allNews.filter((n) => {
    const matchesCat = selectedCategory === 'All' || n.category === selectedCategory;
    const matchesSearch = n.title.toLowerCase().includes(search.toLowerCase()) || n.summary.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="bg-[#FAF8FF] min-h-screen text-slate-900 py-12 lg:py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-700">
            Official School Bulletin
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-purple-950 tracking-tight">
            Noah's Academy News & Activities
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Official activities, graduation ceremonies, foundation day celebrations, and student recognitions from Noah's Academy Incorporated.
          </p>
        </div>

        {/* Search & Category Filter */}
        <div className="space-y-4">
          <div className="bg-white border border-purple-100 rounded-3xl p-4 shadow-xs max-w-md mx-auto relative">
            <Search className="w-4 h-4 text-purple-600 absolute left-7 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search announcements or event titles..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-purple-100 rounded-2xl text-xs text-slate-900 focus:outline-none focus:border-purple-600 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 border-b border-purple-100 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                  selectedCategory === cat
                    ? 'bg-purple-700 text-white shadow-md shadow-purple-700/25'
                    : 'bg-white text-purple-950 hover:bg-purple-50 border border-purple-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="relative h-48 overflow-hidden bg-purple-950">
                  <img
                    src={item.image}
                    alt={item.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-4 left-4 px-3 py-1 bg-amber-400 text-purple-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-md">
                    {item.category}
                  </span>
                </div>

                <div className="p-6 space-y-3">
                  <div className="flex items-center text-[11px] font-semibold text-slate-400 space-x-3">
                    <span className="flex items-center"><Calendar className="w-3.5 h-3.5 mr-1 text-purple-700" />{item.date}</span>
                    <span>·</span>
                    <span>{item.author}</span>
                  </div>

                  <h3 className="text-base font-extrabold text-purple-950 group-hover:text-purple-700 transition-colors leading-snug">
                    {item.title}
                  </h3>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.summary}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0">
                <button
                  onClick={() => setSelectedNews(item)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-50 hover:bg-purple-700 text-purple-950 hover:text-white font-bold text-xs rounded-2xl transition-all border border-purple-200"
                >
                  <span>Read Full Article</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* READ MORE MODAL */}
      {selectedNews && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-purple-100 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <button
              onClick={() => setSelectedNews(null)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-4">
              <span className="px-3 py-1 bg-amber-400 text-purple-950 font-black text-[10px] uppercase tracking-wider rounded-full inline-block">
                {selectedNews.category}
              </span>
              <h2 className="text-2xl font-black text-purple-950 leading-tight">{selectedNews.title}</h2>
              <div className="flex items-center text-xs text-slate-500 space-x-4 border-b border-purple-100 pb-4">
                <span>{selectedNews.date}</span>
                <span>·</span>
                <span>By {selectedNews.author}</span>
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden h-64 bg-purple-950">
              <img src={selectedNews.image} alt={selectedNews.title} className="w-full h-full object-cover" />
            </div>

            <div className="space-y-3 text-xs text-slate-700 leading-relaxed">
              {selectedNews.content.map((p, idx) => (
                <p key={idx}>{p}</p>
              ))}
            </div>

            <div className="pt-4 border-t border-purple-100 flex justify-end">
              <button
                onClick={() => setSelectedNews(null)}
                className="px-6 py-2.5 bg-purple-700 text-white font-bold text-xs rounded-xl"
              >
                Close Article
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
