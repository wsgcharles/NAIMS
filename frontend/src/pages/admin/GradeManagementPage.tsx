import React, { useMemo, useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { Award, CheckCircle, Clock, Search, Loader2 } from 'lucide-react';
import { useAdminApi } from '../../hooks/useAdminApi';

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </td>
    ))}
  </tr>
);

const fmt = (v: number | null) => (v === null ? '—' : v.toFixed(1));

export const GradeManagementPage: React.FC = () => {
  const { useAdminGrades, useMarkGradeCompletedMutation } = useAdminApi();
  const { data: grades, isLoading, isError } = useAdminGrades();
  const markCompleteMutation = useMarkGradeCompletedMutation();

  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const list = grades ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((g) => g.studentName.toLowerCase().includes(q) || g.subjectName.toLowerCase().includes(q) || g.teacherName.toLowerCase().includes(q));
  }, [grades, search]);

  const counts = useMemo(() => {
    const list = grades ?? [];
    const withAverage = list.filter((g) => g.finalAverage !== null);
    const avg = withAverage.length ? withAverage.reduce((s, g) => s + (g.finalAverage ?? 0), 0) / withAverage.length : null;
    return {
      completed: list.filter((g) => g.isCompleted).length,
      pending: list.filter((g) => !g.isCompleted).length,
      average: avg,
    };
  }, [grades]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Institutional Gradebook Oversight</h1>
        <p className="text-sm text-slate-500 mt-1">
          Institution-wide grade records entered by faculty. Grade entry itself happens in the Teacher Portal — this
          view is for review and completion sign-off.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Institutional Average" value={isLoading ? '…' : counts.average !== null ? `${counts.average.toFixed(1)}%` : '—'} icon={Award} iconBgColor="bg-amber-500/10 text-amber-500" />
        <StatCard title="Completed Records" value={isLoading ? '…' : `${counts.completed}`} icon={CheckCircle} iconBgColor="bg-emerald-500/10 text-emerald-500" />
        <StatCard title="Pending Completion" value={isLoading ? '…' : `${counts.pending}`} icon={Clock} iconBgColor="bg-purple-500/10 text-purple-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Grade Records</h3>
          <div className="relative w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student, subject, or teacher..."
              aria-label="Search grade records"
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Student</th>
              <th className="px-6 py-3.5">Subject</th>
              <th className="px-6 py-3.5">Teacher</th>
              <th className="px-6 py-3.5 text-center">Prelim</th>
              <th className="px-6 py-3.5 text-center">Midterm</th>
              <th className="px-6 py-3.5 text-center">Final</th>
              <th className="px-6 py-3.5 text-center">Average</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && <SkeletonRow cols={9} />}
            {!isLoading && isError && (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-sm text-slate-500">
                  Unable to reach the EduCore server to load grade records. Please check your connection and try again.
                </td>
              </tr>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <tr>
                <td colSpan={9} className="px-6 py-10 text-center text-sm text-slate-500">
                  {search.trim() ? 'No grade records match your search.' : 'No grade records exist yet.'}
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              filtered.map((g) => (
                <tr key={g.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-semibold text-slate-900 dark:text-white">{g.studentName}</td>
                  <td className="px-6 py-4 text-xs font-bold text-purple-700 dark:text-purple-400">{g.subjectName}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{g.teacherName}</td>
                  <td className="px-6 py-4 text-center text-xs">{fmt(g.prelimGrade)}</td>
                  <td className="px-6 py-4 text-center text-xs">{fmt(g.midtermGrade)}</td>
                  <td className="px-6 py-4 text-center text-xs">{fmt(g.finalGrade)}</td>
                  <td className="px-6 py-4 text-center text-xs font-bold text-emerald-600 dark:text-emerald-400">{fmt(g.finalAverage)}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${g.isCompleted ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'}`}>
                      {g.isCompleted ? 'Completed' : 'In Progress'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!g.isCompleted ? (
                      <button
                        onClick={() => markCompleteMutation.mutate(g)}
                        disabled={markCompleteMutation.isPending}
                        className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-lg disabled:opacity-50"
                      >
                        {markCompleteMutation.isPending && markCompleteMutation.variables?.id === g.id && (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        )}
                        Mark Completed
                      </button>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
