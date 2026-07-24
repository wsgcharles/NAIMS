import React from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { Bell, Plus, Send } from 'lucide-react';
import { toast } from 'sonner';

export const AnnouncementsPage: React.FC = () => {
  const announcements = [
    { id: '1', title: 'AY 2026–2027 Early Bird Enrollment Schedule Released', cat: 'Admissions', date: 'July 20, 2026', audience: 'All Students & Parents' },
    { id: '2', title: 'Q1 Gradebook Submission Lockdown Notice', cat: 'Academic', date: 'July 18, 2026', audience: 'Faculty Members' },
    { id: '3', title: 'Campus Maintenance & System Update Notice', cat: 'System', date: 'July 15, 2026', audience: 'All Portal Users' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Institutional Broadcast & Announcements</h1>
          <p className="text-sm text-slate-500 mt-1">Publish bulletins to students, faculty, staff, and parents.</p>
        </div>

        <button onClick={() => toast.info('Opening New Announcement Form...')} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-md">
          <Plus className="w-4 h-4 mr-2 inline" /> New Broadcast
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard title="Active Broadcasts" value="12 Published" icon={Bell} />
        <StatCard title="Total Recipients" value="3,150 Users" icon={Send} iconBgColor="bg-emerald-500/10 text-emerald-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Announcement Title</th>
              <th className="px-6 py-3.5">Category</th>
              <th className="px-6 py-3.5">Publish Date</th>
              <th className="px-6 py-3.5">Target Audience</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {announcements.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{a.title}</td>
                <td className="px-6 py-4 text-xs font-bold text-emerald-600 dark:text-emerald-400">{a.cat}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{a.date}</td>
                <td className="px-6 py-4 text-xs font-semibold text-purple-600 dark:text-purple-400">{a.audience}</td>
                <td className="px-6 py-4 text-right">
                  <button onClick={() => toast.info(`Viewing announcement details...`)} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300">
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
