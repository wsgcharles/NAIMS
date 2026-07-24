import React, { useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { Users, BookOpen, Award, CheckSquare, Plus, Download, Search, Eye, Edit } from 'lucide-react';
import { toast } from 'sonner';

export const TeacherManagementPage: React.FC = () => {
  const [search, setSearch] = useState('');

  const teachers = [
    { id: 'TCH-001', name: 'Dr. Maria Santos', dept: 'Mathematics', load: '5 Subjects (15 Units)', status: 'Active', rating: '4.9 / 5.0' },
    { id: 'TCH-002', name: 'Prof. Joseph Miller', dept: 'Science & Physics', load: '4 Subjects (14 Units)', status: 'Active', rating: '4.8 / 5.0' },
    { id: 'TCH-003', name: 'Elena Rostova', dept: 'English & Literature', load: '6 Subjects (18 Units)', status: 'Active', rating: '5.0 / 5.0' },
    { id: 'TCH-004', name: 'Carlos Mendoza', dept: 'Computer Science', load: '4 Subjects (16 Units)', status: 'Active', rating: '4.7 / 5.0' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Faculty Directory & Teaching Load
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Licensed educators, teaching assignments, and performance evaluations.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => toast.success('Exporting Faculty Report (CSV)...')}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 mr-2 text-emerald-500" />
            Export CSV
          </button>
          <button
            onClick={() => toast.info('Opening Add Faculty Form...')}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Faculty Member
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard title="Active Faculty" value="142 Teachers" icon={Users} />
        <StatCard title="Departments" value="8 Academic Depts" icon={BookOpen} iconBgColor="bg-purple-500/10 text-purple-500" />
        <StatCard title="Average Teaching Load" value="15.2 Units" icon={CheckSquare} iconBgColor="bg-emerald-500/10 text-emerald-500" />
        <StatCard title="Faculty Rating" value="4.85 / 5.0" icon={Award} iconBgColor="bg-amber-500/10 text-amber-500" />
      </div>

      {/* Search */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search faculty by name or department..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-hidden"
          />
        </div>
      </div>

      {/* Faculty Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Faculty ID</th>
                <th className="px-6 py-3.5">Teacher Name</th>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Teaching Load</th>
                <th className="px-6 py-3.5">Evaluation Score</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {teachers.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{t.id}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{t.name}</td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">{t.dept}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-purple-600 dark:text-purple-400">{t.load}</td>
                  <td className="px-6 py-4 text-xs font-bold text-amber-500">{t.rating}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">
                      {t.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button onClick={() => toast.info(`Viewing profile for ${t.name}`)} className="p-1.5 text-slate-400 hover:text-white">
                      <Eye className="w-4 h-4" />
                    </button>
                    <button onClick={() => toast.info(`Assigning subjects for ${t.name}`)} className="p-1.5 text-slate-400 hover:text-blue-400">
                      <Edit className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
