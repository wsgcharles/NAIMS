import React, { useState } from 'react';
import { Camera } from 'lucide-react';

export const GalleryPage: React.FC = () => {
  const [filter, setFilter] = useState('All');

  const photos = [
    { title: 'STEM Computer Laboratory', cat: 'Facilities' },
    { title: 'Main Campus Quadrangle', cat: 'Campus' },
    { title: 'Annual Commencement Ceremony', cat: 'Graduation' },
    { title: 'Robotics Competition Arena', cat: 'Activities' },
    { title: 'Sports Complex Gymnasium', cat: 'Facilities' },
    { title: 'Junior High Science Fair', cat: 'Activities' },
  ];

  const categories = ['All', 'Campus', 'Facilities', 'Activities', 'Graduation'];

  const filteredPhotos = filter === 'All' ? photos : photos.filter((p) => p.cat === filter);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-purple-400 uppercase tracking-widest">Campus Life</span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Noah's Academy Photo Gallery
        </h1>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              filter === cat
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-400 hover:text-white'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPhotos.map((photo, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between h-56 hover:border-blue-500/50 transition-all group">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400 px-2 py-0.5 rounded-full bg-blue-950 border border-blue-800">
                {photo.cat}
              </span>
              <Camera className="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-colors" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white group-hover:text-blue-300 transition-colors">
                {photo.title}
              </h3>
              <p className="text-xs text-slate-500 mt-1">High-Resolution Photo Preview</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
