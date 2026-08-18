import React, { useState } from 'react';
import { MapPin, Clock, Image as ImageIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

interface SchoolEvent {
  id: string;
  title: string;
  category: string;
  date: string;
  time: string;
  location: string;
  banner: string;
  description: string;
}

const events: SchoolEvent[] = [
  {
    id: 'intramurals',
    title: 'Intramurals',
    category: 'Sports',
    date: 'AUG 20, 2026',
    time: '08:00 AM – 05:00 PM',
    location: 'Noah\'s Academy Covered Court',
    banner: '/images/events/intramurals.jpg',
    description: 'Inter-house sports competitions, athletic tournaments, and traditional Filipino games for Elementary and High School learners.',
  },
  {
    id: 'christmas-program',
    title: 'Christmas Program',
    category: 'Performances',
    date: 'DEC 15, 2026',
    time: '01:30 PM – 05:00 PM',
    location: 'Main Campus Auditorium',
    banner: '/images/events/christmas-program.jpg',
    description: 'Yuletide musical presentations, choral songs, gift-giving activities, and student choir performances.',
  },
  {
    id: 'nutrition-month',
    title: 'Nutrition Month Celebration',
    category: 'Student Life',
    date: 'JUL 18, 2026',
    time: '09:00 AM – 03:00 PM',
    location: 'School Quadrangle & Hospitality Lab',
    banner: '/images/events/nutrition-month.jpg',
    description: 'Culinary preparation exhibits by Senior High Hospitality & Tourism students and elementary healthy poster contests.',
  },
  {
    id: 'reading-month',
    title: 'Reading Month',
    category: 'Academic',
    date: 'NOV 12, 2026',
    time: '08:30 AM – 04:00 PM',
    location: 'Library & Learning Resource Center',
    banner: '/images/events/reading-month.jpg',
    description: 'Book exhibits, storytelling sessions, and literary character presentation contests.',
  },
  {
    id: 'parent-orientation',
    title: 'Parent Orientation',
    category: 'School Programs',
    date: 'JUL 05, 2026',
    time: '01:00 PM – 04:30 PM',
    location: 'Multi-Purpose Hall',
    banner: '/images/events/parent-orientation.jpg',
    description: 'Parent-Teacher conference, student progress orientation, and NAISIS digital portal walkthrough.',
  },
];

export const EventsPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Academic', 'Sports', 'Performances', 'Student Life', 'School Programs'];

  const filtered = activeCategory === 'All' ? events : events.filter((e) => e.category === activeCategory);

  return (
    <div className="bg-[#FAF8FF] min-h-screen text-slate-900 py-12 lg:py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-700">
            Campus Calendar
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-purple-950 tracking-tight">
            Upcoming Events & Institutional Activities
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Official school activities, intramurals, parent orientations, and campus assemblies at Noah's Academy Incorporated.
          </p>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-purple-100 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 rounded-full text-xs font-extrabold transition-all ${
                activeCategory === cat
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-700/25'
                  : 'bg-white text-purple-950 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Events List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {filtered.map((e) => (
            <div
              key={e.id}
              className="bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-purple-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-4">
                <div className="relative h-52 overflow-hidden bg-purple-950">
                  <img
                    src={e.banner}
                    alt={e.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 bg-amber-400 text-purple-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-md">
                    {e.category}
                  </div>
                  <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-purple-950/90 text-white font-mono font-black text-xs rounded-xl backdrop-blur-md border border-purple-700">
                    {e.date}
                  </div>
                </div>

                <div className="p-6 space-y-3">
                  <h3 className="text-base font-extrabold text-purple-950 group-hover:text-purple-700 transition-colors">
                    {e.title}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 font-medium">
                    <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1 text-purple-700" />{e.time}</span>
                    <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1 text-purple-700" />{e.location}</span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed pt-1">
                    {e.description}
                  </p>
                </div>
              </div>

              <div className="p-6 pt-0 flex items-center gap-3">
                <Link
                  to="/gallery"
                  className="w-full flex items-center justify-center gap-2 py-3 bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all"
                >
                  <ImageIcon className="w-4 h-4" />
                  <span>View Gallery</span>
                </Link>
                <button
                  onClick={() => toast.success(`Event reminder for "${e.title}" set!`)}
                  className="px-4 py-3 bg-purple-50 hover:bg-purple-100 text-purple-950 font-bold text-xs rounded-2xl border border-purple-200 shrink-0"
                >
                  Remind Me
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
