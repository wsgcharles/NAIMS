import React, { useMemo, useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { BookOpen, Layers, Plus, Edit, Trash2, X, Loader2, Search } from 'lucide-react';
import { useAdminApi } from '../../hooks/useAdminApi';
import type { AdminSubject, SubjectFormPayload } from '../../types';

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </td>
    ))}
  </tr>
);

const blankForm: SubjectFormPayload = {
  subjectCode: '',
  subjectName: '',
  gradeLevelId: 0,
  isCoreSubject: true,
  units: 1,
  isActive: true,
};

export const SubjectManagementPage: React.FC = () => {
  const { useSubjects, useGradeLevels, useCreateSubjectMutation, useUpdateSubjectMutation, useDeleteSubjectMutation } =
    useAdminApi();

  const { data: subjects, isLoading, isError } = useSubjects();
  const { data: gradeLevels } = useGradeLevels();
  const createMutation = useCreateSubjectMutation();
  const updateMutation = useUpdateSubjectMutation();
  const deleteMutation = useDeleteSubjectMutation();

  const [search, setSearch] = useState('');
  const [editingSubject, setEditingSubject] = useState<AdminSubject | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<SubjectFormPayload>(blankForm);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const list = subjects ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((s) => s.subjectName.toLowerCase().includes(q) || s.subjectCode.toLowerCase().includes(q));
  }, [subjects, search]);

  const openCreate = () => {
    setEditingSubject(null);
    setForm({ ...blankForm, gradeLevelId: gradeLevels?.[0]?.id ?? 0 });
    setIsModalOpen(true);
  };

  const openEdit = (s: AdminSubject) => {
    setEditingSubject(s);
    setForm({
      subjectCode: s.subjectCode,
      subjectName: s.subjectName,
      gradeLevelId: s.gradeLevelId,
      isCoreSubject: s.isCoreSubject,
      units: s.units,
      isActive: s.isActive,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
    setForm(blankForm);
  };

  const canSubmit = form.subjectCode.trim().length > 0 && form.subjectName.trim().length > 0 && form.gradeLevelId > 0 && form.units > 0;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      if (editingSubject) {
        await updateMutation.mutateAsync({ id: editingSubject.id, data: form });
      } else {
        await createMutation.mutateAsync(form);
      }
      closeModal();
    } catch {
      // toast already surfaced by the mutation's onError
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Curriculum &amp; Subject Catalog</h1>
          <p className="text-sm text-slate-500 mt-1">Master list of accredited academic subjects, units, and grade-level allocations.</p>
        </div>
        <button onClick={openCreate} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500">
          <Plus className="w-4 h-4 mr-2 inline" /> Add Subject Entry
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard title="Active Subject Catalog" value={isLoading ? '…' : `${(subjects ?? []).filter((s) => s.isActive).length}`} icon={BookOpen} />
        <StatCard title="Grade Levels Configured" value={`${gradeLevels?.length ?? 0}`} icon={Layers} iconBgColor="bg-purple-500/10 text-purple-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xs">
        <div className="relative w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by subject name or code..."
            aria-label="Search subjects"
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Subject Code</th>
              <th className="px-6 py-3.5">Subject Title</th>
              <th className="px-6 py-3.5">Units</th>
              <th className="px-6 py-3.5">Grade Level</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && <SkeletonRow cols={6} />}
            {!isLoading && isError && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  Unable to reach the EduCore server to load subjects. Please check your connection and try again.
                </td>
              </tr>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  {search.trim() ? 'No subjects match your search.' : 'No subjects have been added yet.'}
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              filtered.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{s.subjectCode}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{s.subjectName}</td>
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{s.units} Units</td>
                  <td className="px-6 py-4 text-xs font-semibold text-purple-600 dark:text-purple-400">{s.gradeLevel}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${s.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {s.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button onClick={() => openEdit(s)} title="Edit" aria-label={`Edit ${s.subjectName}`} className="p-1.5 text-slate-400 hover:text-blue-500 rounded-md">
                      <Edit className="w-4 h-4" />
                    </button>
                    <button onClick={() => setConfirmDeleteId(s.id)} title="Delete" aria-label={`Delete ${s.subjectName}`} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md">
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
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Subject?</h3>
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{editingSubject ? 'Edit Subject' : 'Add Subject Entry'}</h3>
              <button onClick={closeModal} aria-label="Close" className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Subject Code *</label>
                <input type="text" value={form.subjectCode} onChange={(e) => setForm({ ...form, subjectCode: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Subject Title *</label>
                <input type="text" value={form.subjectName} onChange={(e) => setForm({ ...form, subjectName: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Grade Level *</label>
                  <select
                    value={form.gradeLevelId}
                    onChange={(e) => setForm({ ...form, gradeLevelId: Number(e.target.value) })}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value={0}>Select grade level</option>
                    {(gradeLevels ?? []).map((gl) => (
                      <option key={gl.id} value={gl.id}>{gl.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Units *</label>
                  <input type="number" min={1} value={form.units} onChange={(e) => setForm({ ...form, units: Number(e.target.value) })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                </div>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isCoreSubject} onChange={(e) => setForm({ ...form, isCoreSubject: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                <span>Core Subject</span>
              </label>
              {editingSubject && (
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={form.isActive ?? true} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="w-4 h-4 text-blue-600 rounded" />
                  <span>Active</span>
                </label>
              )}
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button onClick={closeModal} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit || isSaving}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-50"
              >
                {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingSubject ? 'Save Changes' : 'Create Subject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
