import React, { useEffect, useMemo, useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { BookOpen, Users, Award, Save, Lock, Unlock, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTeacherApi } from '../../hooks/useTeacherApi';

const formatGrade = (value: number | null | undefined): string =>
  value === null || value === undefined ? '' : String(value);

const parseGradeInput = (raw: string): number | null => {
  if (raw.trim() === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
};

interface GradeDraft {
  prelimGrade: number | null;
  midtermGrade: number | null;
  finalGrade: number | null;
}

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </td>
    ))}
  </tr>
);

export const TeacherDashboard: React.FC = () => {
  const { useTeacherClasses, useTeacherGrades, useUpdateGradeMutation, useReleaseGradesMutation } =
    useTeacherApi();

  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [drafts, setDrafts] = useState<Record<number, GradeDraft>>({});

  const {
    data: classes,
    isLoading: classesLoading,
    isError: classesError,
  } = useTeacherClasses();

  const {
    data: grades,
    isLoading: gradesLoading,
    isError: gradesError,
  } = useTeacherGrades(selectedClassId);

  const updateGrade = useUpdateGradeMutation(selectedClassId);
  const releaseGrades = useReleaseGradesMutation(selectedClassId);

  useEffect(() => {
    if (!selectedClassId && classes && classes.length > 0) {
      setSelectedClassId(classes[0].teachingAssignmentId);
    }
  }, [classes, selectedClassId]);

  // Reset the local edit buffer to match the server whenever a fresh grade set loads.
  useEffect(() => {
    if (!grades) return;
    const next: Record<number, GradeDraft> = {};
    for (const g of grades) {
      next[g.gradeId] = { prelimGrade: g.prelimGrade, midtermGrade: g.midtermGrade, finalGrade: g.finalGrade };
    }
    setDrafts(next);
  }, [grades]);

  const selectedClass = classes?.find((c) => c.teachingAssignmentId === selectedClassId);

  const totalStudents = useMemo(
    () => (classes ?? []).reduce((sum, c) => sum + c.studentCount, 0),
    [classes]
  );

  const allReleased = grades && grades.length > 0 && grades.every((g) => g.isReleased);

  const dirtyGradeIds = useMemo(() => {
    if (!grades) return [];
    return grades
      .filter((g) => {
        const d = drafts[g.gradeId];
        if (!d) return false;
        return d.prelimGrade !== g.prelimGrade || d.midtermGrade !== g.midtermGrade || d.finalGrade !== g.finalGrade;
      })
      .map((g) => g.gradeId);
  }, [grades, drafts]);

  const handleFieldChange = (gradeId: number, field: keyof GradeDraft, raw: string) => {
    setDrafts((prev) => ({
      ...prev,
      [gradeId]: { ...prev[gradeId], [field]: parseGradeInput(raw) },
    }));
  };

  const handleSaveAll = async () => {
    if (dirtyGradeIds.length === 0) {
      toast.info('No grade changes to save.');
      return;
    }
    const results = await Promise.allSettled(
      dirtyGradeIds.map((gradeId) => updateGrade.mutateAsync({ gradeId, ...drafts[gradeId] }))
    );
    const failed = results.filter((r) => r.status === 'rejected').length;
    if (failed === 0) {
      toast.success(`${dirtyGradeIds.length} grade${dirtyGradeIds.length > 1 ? 's' : ''} saved successfully.`);
    } else {
      toast.error(`${failed} of ${dirtyGradeIds.length} grade updates failed. Please retry.`);
    }
  };

  const hasClasses = !classesLoading && !classesError && classes && classes.length > 0;
  const noClasses = !classesLoading && !classesError && (!classes || classes.length === 0);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Faculty Teaching Workspace
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage class rosters and enter quarterly grades.
        </p>
      </div>

      {classesLoading && (
        <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          Loading your teaching assignments…
        </div>
      )}
      {classesError && (
        <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          Unable to reach the EduCore server to load your classes. Please check your connection and try again.
        </div>
      )}
      {noClasses && (
        <div className="p-6 text-center text-sm text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
          No active teaching assignments are currently linked to your account.
        </div>
      )}

      {hasClasses && (
        <>
          {/* Class Selector */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4">
            <label htmlFor="class-select" className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
              Viewing Class
            </label>
            <select
              id="class-select"
              aria-label="Select class"
              value={selectedClassId ?? ''}
              onChange={(e) => setSelectedClassId(Number(e.target.value))}
              className="flex-1 px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
            >
              {classes!.map((c) => (
                <option key={c.teachingAssignmentId} value={c.teachingAssignmentId}>
                  {c.subjectName} — {c.sectionName} ({c.academicYear})
                </option>
              ))}
            </select>
          </div>

          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard
              title="Assigned Classes"
              value={`${classes!.length} Class${classes!.length === 1 ? '' : 'es'}`}
              description="Active teaching assignments"
              icon={BookOpen}
              iconBgColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
            />
            <StatCard
              title="Total Students"
              value={`${totalStudents} Students`}
              description="Across all assigned sections"
              icon={Users}
              iconBgColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
            />
            <StatCard
              title="Grade Status"
              value={gradesLoading ? '…' : allReleased ? 'Released' : 'Pending Release'}
              description={selectedClass ? `${selectedClass.subjectName} — ${selectedClass.sectionName}` : ''}
              icon={Award}
              iconBgColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
            />
          </div>

          {/* Gradebook */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Interactive Gradebook Entry{selectedClass ? ` — ${selectedClass.sectionName}` : ''}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedClass ? `Subject: ${selectedClass.subjectName}` : ''}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => releaseGrades.mutate(!allReleased)}
                  disabled={releaseGrades.isPending || !grades || grades.length === 0}
                  className="inline-flex items-center px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors disabled:opacity-50 disabled:pointer-events-none"
                >
                  {releaseGrades.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : allReleased ? (
                    <Unlock className="w-4 h-4 mr-2" />
                  ) : (
                    <Lock className="w-4 h-4 mr-2" />
                  )}
                  {allReleased ? 'Unpublish Grades' : 'Release Grades'}
                </button>
                <button
                  onClick={handleSaveAll}
                  disabled={updateGrade.isPending || dirtyGradeIds.length === 0}
                  className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {updateGrade.isPending ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="w-4 h-4 mr-2" />
                  )}
                  Save &amp; Submit Grades{dirtyGradeIds.length > 0 ? ` (${dirtyGradeIds.length})` : ''}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Student Number</th>
                    <th className="px-4 py-3">Student Name</th>
                    <th className="px-4 py-3 text-center">Prelim</th>
                    <th className="px-4 py-3 text-center">Midterm</th>
                    <th className="px-4 py-3 text-center">Final</th>
                    <th className="px-4 py-3 text-center">Average</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {gradesLoading && <SkeletonRow cols={7} />}
                  {!gradesLoading && gradesError && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        Unable to load grades for this class right now.
                      </td>
                    </tr>
                  )}
                  {!gradesLoading && !gradesError && grades && grades.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                        No grade records exist yet for this class.
                      </td>
                    </tr>
                  )}
                  {!gradesLoading &&
                    !gradesError &&
                    grades?.map((row) => {
                      const draft = drafts[row.gradeId] ?? {
                        prelimGrade: row.prelimGrade,
                        midtermGrade: row.midtermGrade,
                        finalGrade: row.finalGrade,
                      };
                      return (
                        <tr key={row.gradeId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-3 font-mono text-xs text-slate-500">{row.studentNumber}</td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{row.studentName}</td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              aria-label={`${row.studentName} prelim grade`}
                              value={formatGrade(draft.prelimGrade)}
                              onChange={(e) => handleFieldChange(row.gradeId, 'prelimGrade', e.target.value)}
                              className="w-16 text-center py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              aria-label={`${row.studentName} midterm grade`}
                              value={formatGrade(draft.midtermGrade)}
                              onChange={(e) => handleFieldChange(row.gradeId, 'midtermGrade', e.target.value)}
                              className="w-16 text-center py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              aria-label={`${row.studentName} final grade`}
                              value={formatGrade(draft.finalGrade)}
                              onChange={(e) => handleFieldChange(row.gradeId, 'finalGrade', e.target.value)}
                              className="w-16 text-center py-1 bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-md text-xs font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                            />
                          </td>
                          <td className="px-4 py-3 text-center font-bold text-blue-600 dark:text-blue-400">
                            {row.finalAverage ?? '—'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <span
                              className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                                row.isReleased
                                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {row.remarks}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
