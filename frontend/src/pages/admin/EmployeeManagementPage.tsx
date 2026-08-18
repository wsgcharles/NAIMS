import React, { useMemo, useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { Users, Briefcase, Shield, Plus, Download, Search, Info, Power, Trash2, X, Loader2, KeyRound, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminApi } from '../../hooks/useAdminApi';
import type { EmployeeFormPayload, EmployeePosition } from '../../types';

const POSITIONS: EmployeePosition[] = ['Administrator', 'Principal', 'Registrar', 'Teacher', 'Accountant'];

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

const emptyForm: EmployeeFormPayload = {
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
  position: 'Teacher',
  dateHired: '',
};

export const EmployeeManagementPage: React.FC = () => {
  const { useEmployees, useCreateEmployeeMutation, useToggleEmployeeStatusMutation, useDeleteEmployeeMutation } =
    useAdminApi();

  const { data: employees, isLoading, isError } = useEmployees();
  const createMutation = useCreateEmployeeMutation();
  const toggleMutation = useToggleEmployeeStatusMutation();
  const deleteMutation = useDeleteEmployeeMutation();

  const [search, setSearch] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [form, setForm] = useState<EmployeeFormPayload>(emptyForm);
  const [createdCredential, setCreatedCredential] = useState<{ employeeNumber: string; password: string } | null>(null);
  const [editLimitationFor, setEditLimitationFor] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const filtered = useMemo(() => {
    const list = employees ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((e) => e.fullName.toLowerCase().includes(q) || e.position.toLowerCase().includes(q) || e.employeeNumber.toLowerCase().includes(q));
  }, [employees, search]);

  const counts = useMemo(() => {
    const list = employees ?? [];
    return {
      total: list.length,
      admins: list.filter((e) => e.role === 'SuperAdministrator' || e.role === 'Administrator').length,
      teachers: list.filter((e) => e.role === 'Teacher').length,
    };
  }, [employees]);

  const closeAddModal = () => {
    setIsAddModalOpen(false);
    setForm(emptyForm);
    setCreatedCredential(null);
  };

  const canSubmit =
    form.firstName.trim().length > 0 &&
    form.lastName.trim().length > 0 &&
    form.birthDate.length > 0 &&
    form.email.trim().length > 0 &&
    form.dateHired.length > 0;

  const handleCreate = async () => {
    if (!canSubmit) return;
    try {
      const result = await createMutation.mutateAsync(form);
      setCreatedCredential({ employeeNumber: result.employeeNumber, password: result.temporaryPassword ?? '' });
      toast.success('Employee profile created successfully.');
    } catch {
      // toast already surfaced by the mutation's onError
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Employee Directory &amp; Roles
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Institutional staff, positions, and system role assignments.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button onClick={() => toast.success('Exporting Staff List (CSV)...')} className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50">
            <Download className="w-4 h-4 mr-2 text-emerald-500 inline" /> Export CSV
          </button>
          <button onClick={() => setIsAddModalOpen(true)} className="px-4 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-xl shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.01]">
            <Plus className="w-4 h-4 mr-2 inline" /> Add Staff Member
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        <StatCard title="Total Staff Members" value={isLoading ? '…' : `${counts.total}`} icon={Users} />
        <StatCard title="Administrative Staff" value={isLoading ? '…' : `${counts.admins}`} icon={Briefcase} iconBgColor="bg-purple-500/10 text-purple-500" />
        <StatCard title="Teaching Staff" value={isLoading ? '…' : `${counts.teachers}`} icon={Shield} iconBgColor="bg-emerald-500/10 text-emerald-500" />
      </div>

      {/* Staff Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter employee by name or position..."
              aria-label="Filter employees"
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
            />
          </div>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Emp ID</th>
              <th className="px-6 py-3.5">Employee Name</th>
              <th className="px-6 py-3.5">Position</th>
              <th className="px-6 py-3.5">Department</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && <SkeletonRow cols={6} />}
            {!isLoading && isError && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  Unable to reach the EduCore server to load employees. Please check your connection and try again.
                </td>
              </tr>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  {search.trim() ? 'No employees match your search.' : 'No employees are on record yet.'}
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              filtered.map((e) => (
                <tr key={e.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-purple-700 dark:text-purple-400">{e.employeeNumber}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{e.fullName}</td>
                  <td className="px-6 py-4 text-xs font-semibold text-purple-700 dark:text-purple-400">{e.position}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{e.department}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-0.5 text-xs font-bold rounded-full ${
                        e.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {e.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-1">
                    <button onClick={() => setEditLimitationFor(e.fullName)} title="Edit (limited)" aria-label={`Edit ${e.fullName}`} className="p-1.5 text-slate-400 hover:text-purple-700 rounded-md">
                      <Info className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => toggleMutation.mutate(e.id)}
                      disabled={toggleMutation.isPending}
                      title={e.isActive ? 'Deactivate' : 'Activate'}
                      aria-label={`Toggle status for ${e.fullName}`}
                      className="p-1.5 text-slate-400 hover:text-amber-500 rounded-md disabled:opacity-50"
                    >
                      {toggleMutation.isPending && toggleMutation.variables === e.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Power className="w-4 h-4" />
                      )}
                    </button>
                    <button onClick={() => setConfirmDeleteId(e.id)} title="Delete" aria-label={`Delete ${e.fullName}`} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

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
              The backend's employee list doesn't return enough detail (birth date, address, gender, etc.) to safely
              pre-fill an edit form for <strong className="text-slate-900 dark:text-white">{editLimitationFor}</strong> without
              risking overwriting existing data with blanks. Use Activate/Deactivate or Delete for now.
            </p>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setEditLimitationFor(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">Close</button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Employee Record?</h3>
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

      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {!createdCredential ? (
              <>
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Add Staff Member</h3>
                  <button onClick={closeAddModal} aria-label="Close" className="text-slate-400 hover:text-slate-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
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
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Position *</label>
                    <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value as EmployeePosition })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white">
                      {POSITIONS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-500 mb-1">Date Hired *</label>
                    <input type="date" value={form.dateHired} onChange={(e) => setForm({ ...form, dateHired: e.target.value })} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
                  </div>
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button onClick={closeAddModal} className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg">Cancel</button>
                  <button
                    onClick={handleCreate}
                    disabled={!canSubmit || createMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-purple-700 hover:bg-purple-600 rounded-lg disabled:opacity-50"
                  >
                    {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Save Employee Record
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <KeyRound className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Employee Profile Created</h3>
                </div>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <div className="text-slate-500 uppercase text-[10px] font-semibold">Employee Number</div>
                    <div className="font-mono font-bold text-slate-900 dark:text-white">{createdCredential.employeeNumber}</div>
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
                  <button onClick={closeAddModal} className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg">Done</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
