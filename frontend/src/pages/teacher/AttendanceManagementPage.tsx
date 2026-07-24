import React, { useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { CheckSquare, Clock, UserX, Save } from 'lucide-react';
import { toast } from 'sonner';

// No Attendance entity/endpoint exists in the backend yet (verified against
// every controller) — this roster and its statuses are local-only, matching
// how the Parent and Student portals' Attendance tabs are also kept mocked.
const roster = [
  { id: '2026-0001', name: 'John Mark Doe', status: 'Present' },
  { id: '2026-0002', name: 'Angela Santos', status: 'Present' },
  { id: '2026-0003', name: 'Brian Miller', status: 'Tardy' },
  { id: '2026-0004', name: 'Catherine Cruz', status: 'Present' },
];

export const AttendanceManagementPage: React.FC = () => {
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(roster.map((s) => [s.id, s.status]))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Daily Attendance Tracker</h1>
          <p className="text-sm text-slate-500 mt-1">Log student presence, tardiness, and excused absences for active classes.</p>
        </div>

        <button onClick={() => toast.success('Attendance sheet submitted for Section 10-A!')} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-md">
          <Save className="w-4 h-4 mr-2 inline" /> Submit Daily Sheet
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Present Today" value="142 Students (98%)" icon={CheckSquare} iconBgColor="bg-emerald-500/10 text-emerald-500" />
        <StatCard title="Tardy Logged" value="2 Students" icon={Clock} iconBgColor="bg-amber-500/10 text-amber-500" />
        <StatCard title="Absent Logged" value="1 Student" icon={UserX} iconBgColor="bg-rose-500/10 text-rose-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Section 10-A — Attendance Sheet ({new Date().toLocaleDateString()})</h3>
          <span className="text-xs font-semibold text-blue-500">MATH101 Period</span>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Student ID</th>
              <th className="px-6 py-3.5">Student Name</th>
              <th className="px-6 py-3.5 text-center">Attendance Status</th>
              <th className="px-6 py-3.5">Remarks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {roster.map((s) => (
              <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{s.id}</td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{s.name}</td>
                <td className="px-6 py-4 text-center">
                  <select
                    aria-label={`${s.name} attendance status`}
                    value={statuses[s.id]}
                    onChange={(e) => setStatuses((prev) => ({ ...prev, [s.id]: e.target.value }))}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-bold text-slate-900 dark:text-white"
                  >
                    <option value="Present">Present</option>
                    <option value="Tardy">Tardy</option>
                    <option value="Absent">Absent</option>
                    <option value="Excused">Excused</option>
                  </select>
                </td>
                <td className="px-6 py-4 text-xs text-slate-400">Regular Entry</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
