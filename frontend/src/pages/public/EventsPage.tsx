import React from 'react';
import { MapPin, Clock } from 'lucide-react';

export const EventsPage: React.FC = () => {
  const events = [
    { title: 'Parent-Teacher Orientation Conference', date: 'Aug 05, 2026', time: '9:00 AM – 12:00 PM', location: 'Main Auditorium', tag: 'Orientation' },
    { title: 'Annual Foundation Day & Sports Fest', date: 'Aug 20, 2026', time: '8:00 AM – 5:00 PM', location: 'Academy Sports Complex', tag: 'Institutional' },
    { title: 'Science & Innovation Fair', date: 'Sep 12, 2026', time: '10:00 AM – 4:00 PM', location: 'STEM Science Wing', tag: 'Academic' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">Campus Calendar</span>
        <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">
          Upcoming Events & Activities
        </h1>
      </div>

      <div className="space-y-4">
        {events.map((e, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-700 transition-colors">
            <div className="flex items-start space-x-4">
              <div className="px-4 py-3 bg-amber-500/10 text-amber-400 font-mono font-bold text-sm rounded-xl border border-amber-500/20 text-center shrink-0">
                {e.date}
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">{e.tag}</span>
                <h3 className="text-base font-bold text-white mt-0.5">{e.title}</h3>
                <div className="flex items-center space-x-4 text-xs text-slate-400 mt-2">
                  <span className="flex items-center"><Clock className="w-3.5 h-3.5 mr-1" />{e.time}</span>
                  <span className="flex items-center"><MapPin className="w-3.5 h-3.5 mr-1" />{e.location}</span>
                </div>
              </div>
            </div>

            <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white rounded-xl shrink-0 self-start md:self-center">
              Add to Calendar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
