import React, { useState } from 'react';
import { X, Calendar, Maximize2 } from 'lucide-react';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  caption: string;
  date: string;
}

const galleryData: GalleryItem[] = [
  {
    id: 'g-1',
    title: 'Graduation Ceremony',
    category: 'Graduation',
    image: '/images/gallery/graduation/grad-1.jpg',
    caption: 'Senior High School graduates receiving diplomas at the Main Auditorium in Taguig City.',
    date: 'May 28, 2026',
  },
  {
    id: 'g-2',
    title: 'Recognition Day',
    category: 'Recognition',
    image: '/images/gallery/recognition/rec-1.jpg',
    caption: 'Awarding honor roll achievers across Grade 1 to Grade 12.',
    date: 'May 20, 2026',
  },
  {
    id: 'g-3',
    title: 'Teachers\' Day Celebration',
    category: 'Teachers\' Day',
    image: '/images/gallery/teachers-day/td-1.jpg',
    caption: 'Student Council musical tribute and appreciation presentation for Noah\'s Academy faculty.',
    date: 'October 05, 2025',
  },
  {
    id: 'g-4',
    title: 'Foundation Day Celebration',
    category: 'Foundation Day',
    image: '/images/gallery/foundation-day/fd-1.jpg',
    caption: 'Grand drum & lyre campus parade passing through Signal Village, Taguig City.',
    date: 'February 18, 2026',
  },
  {
    id: 'g-5',
    title: 'Buwan ng Wika Celebration',
    category: 'Buwan ng Wika',
    image: '/images/gallery/buwan-ng-wika/bw-1.jpg',
    caption: 'Students performing Sabayang Bigkas and traditional poetry in Filipiniana attires.',
    date: 'August 28, 2025',
  },
  {
    id: 'g-6',
    title: 'United Nations Celebration',
    category: 'United Nations',
    image: '/images/gallery/united-nations/un-1.jpg',
    caption: 'Elementary and High School learners representing international member states during the UN parade.',
    date: 'October 24, 2025',
  },
  {
    id: 'g-7',
    title: 'Intramurals',
    category: 'Sports Fest',
    image: '/images/gallery/sportsfest/sf-1.jpg',
    caption: 'Senior High inter-house basketball championship match at the Covered Court.',
    date: 'August 20, 2025',
  },
  {
    id: 'g-8',
    title: 'Campus Performance',
    category: 'Student Performances',
    image: '/images/gallery/performances/pf-1.jpg',
    caption: 'Student choir and folk dance presentation at the Main Auditorium.',
    date: 'December 12, 2025',
  },
  {
    id: 'g-9',
    title: 'Computer Laboratory Practical Session',
    category: 'Computer Laboratory',
    image: '/images/campus/computer-lab.jpg',
    caption: 'Students practicing computer system servicing and networking in the ICT lab.',
    date: 'January 15, 2026',
  },
  {
    id: 'g-10',
    title: 'Resource Library Reading Center',
    category: 'Library',
    image: '/images/campus/library.jpg',
    caption: 'Learners utilizing digital catalog workstations and reference reading halls.',
    date: 'February 02, 2026',
  },
  {
    id: 'g-11',
    title: 'Student Leadership Workshop',
    category: 'Student Activities',
    image: '/images/gallery/activities/act-1.jpg',
    caption: 'Student council officers attending youth leadership development seminar.',
    date: 'March 10, 2026',
  },
  {
    id: 'g-12',
    title: 'Main Academic Building & Quadrangle',
    category: 'Campus Facilities',
    image: '/images/campus/building.jpg',
    caption: 'Spacious campus grounds in Signal Village, Taguig City.',
    date: 'March 20, 2026',
  },
];

export const GalleryPage: React.FC = () => {
  const [filter, setFilter] = useState('All');
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const categories = [
    'All',
    'Graduation',
    'Recognition',
    'Foundation Day',
    'Teachers\' Day',
    'Buwan ng Wika',
    'United Nations',
    'Sports Fest',
    'Student Performances',
    'Computer Laboratory',
    'Library',
    'Campus Facilities',
    'Student Activities',
  ];

  const filtered = filter === 'All' ? galleryData : galleryData.filter((g) => g.category === filter);

  return (
    <div className="bg-[#FAF8FF] min-h-screen text-slate-900 py-12 lg:py-16 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-[11px] font-black uppercase tracking-[0.2em] text-purple-700">
            Campus Life & Photo Archives
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-purple-950 tracking-tight">
            Noah's Academy Photo Gallery
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Authorized campus photographs, graduation ceremonies, sportsfest highlights, and student life activities from Noah's Academy Incorporated.
          </p>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b border-purple-100 pb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-xs font-extrabold transition-all ${
                filter === cat
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-700/25'
                  : 'bg-white text-purple-950 hover:bg-purple-50 border border-purple-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Photos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <div
              key={item.id}
              onClick={() => setLightboxItem(item)}
              className="bg-white border border-purple-100 rounded-3xl overflow-hidden shadow-xs hover:shadow-2xl hover:border-purple-300 transition-all cursor-pointer group flex flex-col justify-between"
            >
              <div className="relative h-56 overflow-hidden bg-purple-950">
                <img
                  src={item.image}
                  alt={item.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 left-4 px-3 py-1 bg-amber-400 text-purple-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-md">
                  {item.category}
                </div>
                <div className="absolute inset-0 bg-purple-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="p-3 bg-white text-purple-950 rounded-full shadow-xl">
                    <Maximize2 className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="p-5 space-y-2">
                <h3 className="font-extrabold text-sm text-purple-950 group-hover:text-purple-700 transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {item.caption}
                </p>
                <div className="flex items-center text-[10px] font-bold text-slate-400 pt-2 border-t border-purple-50">
                  <Calendar className="w-3 h-3 mr-1 text-purple-700" />
                  <span>{item.date} · Noah's Academy Taguig</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* LIGHTBOX PREVIEW MODAL */}
      {lightboxItem && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="max-w-4xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative border border-purple-200 space-y-4 p-6 sm:p-8">
            <button
              onClick={() => setLightboxItem(null)}
              className="absolute top-6 right-6 p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-900 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="h-96 w-full rounded-2xl overflow-hidden bg-purple-950 relative">
              <img
                src={lightboxItem.image}
                alt={lightboxItem.title}
                className="w-full h-full object-contain"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="px-3 py-1 bg-purple-100 text-purple-800 font-extrabold text-[10px] uppercase tracking-wider rounded-full">
                  {lightboxItem.category}
                </span>
                <span className="text-xs font-semibold text-slate-400">{lightboxItem.date}</span>
              </div>
              <h2 className="text-xl font-black text-purple-950">{lightboxItem.title}</h2>
              <p className="text-xs text-slate-700 leading-relaxed font-medium">{lightboxItem.caption}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
