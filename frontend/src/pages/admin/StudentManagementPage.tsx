import React, { useMemo, useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { Users, UserCheck, UserX, Plus, Download, Search, Filter, Info, Power, Trash2, X, Loader2, KeyRound, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminApi } from '../../hooks/useAdminApi';
import type { StudentFormPayload } from '../../types';

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </td>
    ))}
  </tr>
);

const copyToClipboard = (value: string, label: string) => {
  navigator.clipboard?.writeText(value).then(
    () => toast.success(`${label} copied to clipboard.`),
    () => toast.error(`Unable to copy ${label.toLowerCase()}.`)
  );
};

const emptyForm: StudentFormPayload = {
  lrn: '',
  firstName: '',
  middleName: '',
  lastName: '',
  suffix: '',
  birthDate: '',
  gender: 'Male',
  email: '',
  phoneNumber: '',
  address: '',
  barangay: '',
  city: '',
  province: '',
  parentId: null,
};

export const StudentManagementPage: React.FC = () => {
  const { useStudents, useCreateStudentMutation, useToggleStudentStatusMutation, useDeleteStudentMutation } =
    useAdminApi();

  const { data: students, isLoading, isError } = useStudents();
  const createMutation = useCreateStudentMutation();
  const toggleMutation = useToggleStudentStatusMutation();
  const deleteMutation = useDeleteStudentMutation();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState<StudentFormPayload>(emptyForm);
  const [createdCredential, setCreatedCredential] = useState<{ studentNumber: string; password: string } | null>(null);
  const [editLimitationFor, setEditLimitationFor] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const list = students ?? [];
    return list.filter((s) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q || s.fullName.toLowerCase().includes(q) || s.studentNumber.toLowerCase().includes(q) || s.lrn.includes(q) || s.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === 'ALL' || (statusFilter === 'ACTIVE' ? s.isActive : !s.isActive);
      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);

  const counts = useMemo(() => {
    const list = students ?? [];
    return { total: list.length, active: list.filter((s) => s.isActive).length, inactive: list.filter((s) => !s.isActive).length };
  }, [students]);

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setForm(emptyForm);
    setCreatedCredential(null);
  };

  const canSubmit =
    form.lrn.trim().length > 0 &&
    form.lrn.trim().length <= 12 &&
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.birthDate.length > 0 &&
    form.email.trim().length > 0;

  const handleCreate = async () => {
    if (!canSubmit) return;
    try {
      const result = await createMutation.mutateAsync(form);
      setCreatedCredential({ studentNumber: result.studentNumber, password: result.temporaryPassword ?? '' });
      toast.success('Student profile created successfully.');
    } catch {
      // toast already surfaced by the mutation's onError
    }
  };

  const exportCSV = () => toast.success('Exporting Student Directory (CSV)...');

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Student Roster Management
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete student directory and account status.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={exportCSV}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 mr-2 text-emerald-500" />
            Export CSV
          </button>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Student Profile
          </button>
        </div>
      </div>

      {/* Metric Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Total Students" value={isLoading ? '…' : `${counts.total}`} icon={Users} />
        <StatCard title="Active" value={isLoading ? '…' : `${counts.active}`} icon={UserCheck} iconBgColor="bg-emerald-500/10 text-emerald-500" />
        <StatCard title="Inactive" value={isLoading ? '…' : `${counts.inactive}`} icon={UserX} iconBgColor="bg-rose-500/10 text-rose-500" />
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, number, LRN, or email..."
            aria-label="Search students"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
            aria-label="Filter by status"
            className="px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-300 outline-hidden"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Student ID</th>
                <th className="px-6 py-3.5">LRN</th>
                <th className="px-6 py-3.5">Full Name</th>
                <th className="px-6 py-3.5">Email</th>
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
                    {search.trim() || statusFilter !== 'ALL' ? 'No students match your filters.' : 'No students are enrolled yet.'}
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{s.studentNumber}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">{s.lrn}</td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{s.fullName}</td>
                    <td className="px-6 py-4 text-xs text-slate-500">{s.email}</td>
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
                      <button
                        onClick={() => setEditLimitationFor(s.fullName)}
                        title="Edit (limited)"
                        aria-label={`Edit ${s.fullName}`}
                        className="p-1.5 text-slate-400 hover:text-blue-500 rounded-md"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleMutation.mutate(s.id)}
                        disabled={toggleMutation.isPending}
                        title={s.isActive ? 'Deactivate' : 'Activate'}
                        aria-label={`Toggle status for ${s.fullName}`}
                        className="p-1.5 text-slate-400 hover:text-amber-500 rounded-md disabled:opacity-50"
                      >
                        {toggleMutation.isPending && toggleMutation.variables === s.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Power className="w-4 h-4" />
                        )}
                      </button>
                      <button
                        onClick={() => setConfirmDeleteId(s.id)}
                        title="Delete"
                        aria-label={`Delete ${s.fullName}`}
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit limitation notice */}
      {editLimitationFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Editing Not Yet Available</h3>
              <button onClick={() => setEditLimitationFor(null)} aria-label="Close" className="text-slate-400 hover:text-slate-700 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              The backend's student list doesn't return enough detail (birth date, address, gender, etc.) to safely
              pre-fill an edit form for <strong className="text-slate-900 dark:text-white">{editLimitationFor}</strong> without
              risking overwriting existing data with blanks. Use Activate/Deactivate or Delete for now.
            </p>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setEditLimitationFor(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDeleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Student Record?</h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
            <div className="pt-2 flex justify-end space-x-2">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">
                Cancel
              </button>
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

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {!createdCredential ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Create Student Profile</h3>
                  <button onClick={closeAddModal} aria-label="Close" className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-500 mb-1">LRN (Learner Reference Number) *</label>
                    <input type="text" maxLength={12} value={form.lrn} onChange={(e) => setForm({ ...form, lrn: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">First Name *</label>
                    <input type="text" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Last Name *</label>
                    <input type="text" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Middle Name</label>
                    <input type="text" value={form.middleName} onChange={(e) => setForm({ ...form, middleName: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Suffix</label>
                    <input type="text" value={form.suffix} onChange={(e) => setForm({ ...form, suffix: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Birth Date *</label>
                    <input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Gender *</label>
                    <select value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white">
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Email *</label>
                    <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Phone Number</label>
                    <input type="text" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-semibold text-slate-500 mb-1">Address</label>
                    <input type="text" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Barangay</label>
                    <input type="text" value={form.barangay} onChange={(e) => setForm({ ...form, barangay: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">City</label>
                    <input type="text" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Province</label>
                    <input type="text" value={form.province} onChange={(e) => setForm({ ...form, province: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button onClick={closeAddModal} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button
                    onClick={handleCreate}
                    disabled={!canSubmit || createMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-lg disabled:opacity-50"
                  >
                    {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Student Record
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <KeyRound className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Student Profile Created</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="text-slate-500 uppercase text-[10px] font-semibold">Student Number</div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">{createdCredential.studentNumber}</div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <div>
                      <div className="text-slate-500 uppercase text-[10px] font-semibold">Temporary Password</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{createdCredential.password}</div>
                    </div>
                    <button onClick={() => copyToClipboard(createdCredential.password, 'Password')} aria-label="Copy temporary password" className="p-1.5 text-slate-400 hover:text-emerald-500">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Share this password securely — it cannot be retrieved again from this screen.
                </p>
                <div className="pt-2 flex justify-end">
                  <button onClick={closeAddModal} className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg">
                    Done
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
