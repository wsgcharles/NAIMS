import React, { useMemo, useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { Layers, Users, Plus, Trash2, X, Loader2, Search } from 'lucide-react';
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

export const SectionAllocationsPage: React.FC = () => {
  const {
    useSectionAssignments,
    useSectionsLookup,
    useStudentsLookup,
    useCreateSectionAssignmentMutation,
    useDeleteSectionAssignmentMutation,
  } = useAdminApi();

  const { data: assignments, isLoading, isError } = useSectionAssignments();
  const { data: sections, isLoading: sectionsLoading } = useSectionsLookup();
  const { data: students, isLoading: studentsLoading } = useStudentsLookup();
  const createMutation = useCreateSectionAssignmentMutation();
  const deleteMutation = useDeleteSectionAssignmentMutation();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [studentId, setStudentId] = useState<number | ''>('');
  const [sectionId, setSectionId] = useState<number | ''>('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const list = assignments ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((a) => a.studentName.toLowerCase().includes(q) || a.sectionName.toLowerCase().includes(q));
  }, [assignments, search]);

  const activeSections = useMemo(() => (sections ?? []).filter((s) => s.isActive), [sections]);

  const closeModal = () => {
    setIsModalOpen(false);
    setStudentId('');
    setSectionId('');
  };

  const canSubmit = studentId !== '' && sectionId !== '';

  const handleCreate = async () => {
    if (!canSubmit) return;
    try {
      await createMutation.mutateAsync({ studentId: Number(studentId), sectionId: Number(sectionId) });
      closeModal();
    } catch {
      // toast already surfaced by the mutation's onError
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Section Allocations</h1>
          <p className="text-sm text-slate-500 mt-1">Assign enrolled students to class sections.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-xl shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Assignment
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard title="Total Assignments" value={isLoading ? '…' : `${(assignments ?? []).length}`} icon={Layers} />
        <StatCard title="Active Sections" value={sectionsLoading ? '…' : `${activeSections.length}`} icon={Users} iconBgColor="bg-purple-500/10 text-purple-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xs">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student or section name..."
            aria-label="Search section assignments"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-hidden"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Student</th>
              <th className="px-6 py-3.5">Section</th>
              <th className="px-6 py-3.5">Academic Year</th>
              <th className="px-6 py-3.5">Assigned</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && <SkeletonRow cols={6} />}
            {!isLoading && isError && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  Unable to reach the EduCore server to load section assignments. Please check your connection and try again.
                </td>
              </tr>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  {search.trim() ? 'No assignments match your search.' : 'No students have been assigned to a section yet.'}
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{a.studentName}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-purple-600 dark:text-purple-400">{a.sectionName}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{a.academicYear}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(a.assignedAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${a.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => setConfirmDeleteId(a.id)} title="Remove Assignment" aria-label={`Remove section assignment for ${a.studentName}`} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {confirmDeleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Remove Section Assignment?</h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
            <div className="pt-2 flex justify-end space-x-2">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">Cancel</button>
              <button
                onClick={async () => {
                  await deleteMutation.mutateAsync(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md disabled:opacity-50"
              >
                {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">New Section Assignment</h3>
              <button onClick={closeModal} aria-label="Close" className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label htmlFor="student-select" className="block font-semibold text-slate-500 mb-1">Student *</label>
                <select
                  id="student-select"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value ? Number(e.target.value) : '')}
                  disabled={studentsLoading}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">{studentsLoading ? 'Loading students…' : 'Select a student'}</option>
                  {(students ?? []).map((s) => (
                    <option key={s.studentId} value={s.studentId}>
                      {s.fullName} ({s.studentNumber})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="section-select" className="block font-semibold text-slate-500 mb-1">Section *</label>
                <select
                  id="section-select"
                  value={sectionId}
                  onChange={(e) => setSectionId(e.target.value ? Number(e.target.value) : '')}
                  disabled={sectionsLoading}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">{sectionsLoading ? 'Loading sections…' : 'Select a section'}</option>
                  {activeSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.programOfferingName} — {s.sectionName} ({s.currentStudents}/{s.capacity})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button onClick={closeModal} className="px-4 py-2 text-xs font-semibold text-slate-500">Cancel</button>
              <button
                onClick={handleCreate}
                disabled={!canSubmit || createMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-lg shadow-md disabled:opacity-50"
              >
                {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Assign
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
