import React, { useMemo, useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { Users, UserCheck, Search, X, Loader2, ArrowUpCircle, LogOut, GraduationCap, History } from 'lucide-react';
import { useRegistrarApi } from '../../hooks/useRegistrarApi';
import type { RegistrarStudent } from '../../types';

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </td>
    ))}
  </tr>
);

type ActionType = 'promote' | 'transfer' | 'graduate' | 'history';

export const StudentDirectoryPage: React.FC = () => {
  const {
    useStudents,
    useAcademicYears,
    useCurrentEmployeeId,
    useStudentHistory,
    usePromoteStudentMutation,
    useTransferStudentMutation,
    useGraduateStudentMutation,
  } = useRegistrarApi();

  const { data: students, isLoading, isError } = useStudents();
  const { data: academicYears } = useAcademicYears();
  const { data: currentEmployeeId, isError: employeeError } = useCurrentEmployeeId();

  const promoteMutation = usePromoteStudentMutation();
  const transferMutation = useTransferStudentMutation();
  const graduateMutation = useGraduateStudentMutation();

  const [search, setSearch] = useState('');
  const [action, setAction] = useState<{ type: ActionType; student: RegistrarStudent } | null>(null);

  // Form fields — reused across the three action modals
  const [academicYearId, setAcademicYearId] = useState<number | ''>('');
  const [destinationSchool, setDestinationSchool] = useState('');
  const [schoolYear, setSchoolYear] = useState('');
  const [notes, setNotes] = useState('');

  const { data: history, isLoading: historyLoading, isError: historyError } = useStudentHistory(
    action?.type === 'history' ? action.student.studentId : null
  );

  const filtered = useMemo(() => {
    const list = students ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((s) => s.fullName.toLowerCase().includes(q) || s.studentNumber.toLowerCase().includes(q));
  }, [students, search]);

  const activeCount = (students ?? []).filter((s) => s.isActive).length;

  const openAction = (type: ActionType, student: RegistrarStudent) => {
    setAcademicYearId('');
    setDestinationSchool('');
    setSchoolYear('');
    setNotes('');
    setAction({ type, student });
  };
  const closeAction = () => setAction(null);

  const isMutating = promoteMutation.isPending || transferMutation.isPending || graduateMutation.isPending;

  const handleSubmit = async () => {
    if (!action || currentEmployeeId == null) return;
    const studentId = action.student.studentId;
    try {
      if (action.type === 'promote' && academicYearId !== '') {
        await promoteMutation.mutateAsync({
          studentId,
          academicYearId: Number(academicYearId),
          employeeId: currentEmployeeId,
          notes: notes || undefined,
        });
      } else if (action.type === 'transfer' && destinationSchool.trim()) {
        await transferMutation.mutateAsync({
          studentId,
          destinationSchool: destinationSchool.trim(),
          employeeId: currentEmployeeId,
          reason: notes || undefined,
        });
      } else if (action.type === 'graduate' && schoolYear.trim()) {
        await graduateMutation.mutateAsync({
          studentId,
          schoolYear: schoolYear.trim(),
          employeeId: currentEmployeeId,
          notes: notes || undefined,
        });
      } else {
        return;
      }
      closeAction();
    } catch {
      // toast already surfaced by the mutation's onError
    }
  };

  const canSubmit =
    currentEmployeeId != null &&
    !!action &&
    ((action.type === 'promote' && academicYearId !== '') ||
      (action.type === 'transfer' && destinationSchool.trim().length > 0) ||
      (action.type === 'graduate' && schoolYear.trim().length > 0));

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Student Directory</h1>
        <p className="text-sm text-slate-500 mt-1">
          Enrolled student roster — promote, transfer, or graduate students, and review their history.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard title="Total Students" value={isLoading ? '…' : `${(students ?? []).length}`} icon={Users} />
        <StatCard title="Active Students" value={isLoading ? '…' : `${activeCount}`} icon={UserCheck} iconBgColor="bg-emerald-500/10 text-emerald-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xs">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name or number..."
            aria-label="Search students"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-hidden"
          />
        </div>
      </div>

      {employeeError && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg text-xs text-amber-800 dark:text-amber-300">
          Unable to resolve your employee record — promotion, transfer, and graduation actions are disabled until this is fixed.
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Student #</th>
              <th className="px-6 py-3.5">Name</th>
              <th className="px-6 py-3.5">Grade &amp; Section</th>
              <th className="px-6 py-3.5">Academic Year</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && <SkeletonRow cols={6} />}
            {!isLoading && isError && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  Unable to reach the EduCore server to load students. Please check your connection and try again.
                </td>
              </tr>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  {search.trim() ? 'No students match your search.' : 'No students are enrolled yet.'}
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              filtered.map((s) => (
                <tr key={s.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{s.studentNumber}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{s.fullName}</td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">
                    {s.gradeLevel} {s.section ? `— ${s.section}` : ''}
                  </td>
                  <td className="px-6 py-4 text-xs text-slate-500">{s.academicYear || '—'}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        s.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button onClick={() => openAction('history', s)} title="View History" aria-label={`View history for ${s.fullName}`} className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                      <History className="w-4 h-4" />
                    </button>
                    <button onClick={() => openAction('promote', s)} title="Promote" aria-label={`Promote ${s.fullName}`} className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md">
                      <ArrowUpCircle className="w-4 h-4" />
                    </button>
                    <button onClick={() => openAction('transfer', s)} title="Transfer Out" aria-label={`Transfer ${s.fullName}`} className="p-1.5 text-amber-500 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-md">
                      <LogOut className="w-4 h-4" />
                    </button>
                    <button onClick={() => openAction('graduate', s)} title="Graduate" aria-label={`Graduate ${s.fullName}`} className="p-1.5 text-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950/40 rounded-md">
                      <GraduationCap className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Action Modal: Promote / Transfer / Graduate */}
      {action && action.type !== 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">
                {action.type === 'promote' && 'Promote Student'}
                {action.type === 'transfer' && 'Transfer Student Out'}
                {action.type === 'graduate' && 'Graduate Student'}
              </h3>
              <button onClick={closeAction} aria-label="Close" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              This action applies to <strong className="text-slate-900 dark:text-white">{action.student.fullName}</strong> ({action.student.studentNumber}).
            </p>

            {action.type === 'promote' && (
              <div className="space-y-1">
                <label htmlFor="promote-year" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Promote Into Academic Year <span className="text-rose-500">*</span>
                </label>
                <select
                  id="promote-year"
                  value={academicYearId}
                  onChange={(e) => setAcademicYearId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="">Select an academic year</option>
                  {(academicYears ?? []).map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.schoolYear} {y.isActive ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {action.type === 'transfer' && (
              <div className="space-y-1">
                <label htmlFor="transfer-school" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Destination School <span className="text-rose-500">*</span>
                </label>
                <input
                  id="transfer-school"
                  type="text"
                  value={destinationSchool}
                  onChange={(e) => setDestinationSchool(e.target.value)}
                  placeholder="Name of receiving school"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500"
                />
              </div>
            )}

            {action.type === 'graduate' && (
              <div className="space-y-1">
                <label htmlFor="graduate-year" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  School Year Graduating From <span className="text-rose-500">*</span>
                </label>
                <input
                  id="graduate-year"
                  type="text"
                  value={schoolYear}
                  onChange={(e) => setSchoolYear(e.target.value)}
                  placeholder="e.g. 2025-2026"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-purple-500"
                />
              </div>
            )}

            <div className="space-y-1">
              <label htmlFor="action-notes" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                {action.type === 'transfer' ? 'Reason (optional)' : 'Notes (optional)'}
              </label>
              <textarea
                id="action-notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button onClick={closeAction} className="px-4 py-2 text-xs font-semibold text-slate-500">
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isMutating}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md disabled:opacity-50 disabled:pointer-events-none"
              >
                {isMutating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {action && action.type === 'history' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Academic History — {action.student.fullName}</h3>
              <button onClick={closeAction} aria-label="Close" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {historyLoading && (
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-10 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
                  ))}
                </div>
              )}
              {!historyLoading && historyError && (
                <p className="text-center text-xs text-slate-500 py-6">Unable to load this student's history right now.</p>
              )}
              {!historyLoading && !historyError && history && history.length === 0 && (
                <p className="text-center text-xs text-slate-500 py-6">No history events recorded for this student yet.</p>
              )}
              {!historyLoading &&
                !historyError &&
                history?.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 dark:text-white">{h.action}</span>
                      <span className="text-slate-400">{new Date(h.dateOccurred).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-500 mt-1">{h.description}</p>
                    {h.performedBy && <p className="text-[10px] text-slate-400 mt-1">By {h.performedBy}</p>}
                  </div>
                ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button onClick={closeAction} className="px-4 py-2 text-xs font-semibold text-slate-500">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
