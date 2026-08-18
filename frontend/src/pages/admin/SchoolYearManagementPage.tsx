import React, { useState } from 'react';
import {
  Calendar,
  Plus,
  CheckCircle2,
  AlertTriangle,
  Archive,
  Edit3,
  Clock,
  Layers,
  Sparkles,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useAdminApi } from '../../hooks/useAdminApi';
import type { AcademicYearRecord } from '../../types';

export const SchoolYearManagementPage: React.FC = () => {
  const {
    useAcademicYearsLookup,
    useCreateSchoolYearMutation,
    useUpdateSchoolYearMutation,
    useSetActiveSchoolYearMutation,
    useSetSemesterMutation,
    useArchiveSchoolYearMutation,
  } = useAdminApi();

  const { data: schoolYears, isLoading, isError } = useAcademicYearsLookup();

  const createMutation = useCreateSchoolYearMutation();
  const updateMutation = useUpdateSchoolYearMutation();
  const setActiveMutation = useSetActiveSchoolYearMutation();
  const setSemesterMutation = useSetSemesterMutation();
  const archiveMutation = useArchiveSchoolYearMutation();

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingYear, setEditingYear] = useState<AcademicYearRecord | null>(null);
  const [activateConfirmYear, setActivateConfirmYear] = useState<AcademicYearRecord | null>(null);
  const [archiveConfirmYear, setArchiveConfirmYear] = useState<AcademicYearRecord | null>(null);

  // Form states
  const [formSchoolYear, setFormSchoolYear] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formEndDate, setFormEndDate] = useState('');
  const [formSemester, setFormSemester] = useState('1st Semester');
  const [formIsActive, setFormIsActive] = useState(false);

  const openCreateModal = () => {
    setFormSchoolYear('SY 2027–2028');
    setFormStartDate('2027-06-01');
    setFormEndDate('2028-03-31');
    setFormSemester('1st Semester');
    setFormIsActive(false);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (yr: AcademicYearRecord) => {
    setEditingYear(yr);
    setFormSchoolYear(yr.schoolYear);
    setFormStartDate(yr.startDate ? yr.startDate.split('T')[0] : '');
    setFormEndDate(yr.endDate ? yr.endDate.split('T')[0] : '');
    setFormSemester(yr.currentSemester || '1st Semester');
    setFormIsActive(yr.status === 'Current' || yr.isActive);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(
      {
        schoolYear: formSchoolYear,
        startDate: formStartDate,
        endDate: formEndDate,
        currentSemester: formSemester,
        isActive: formIsActive,
        isEnrollmentOpen: false,
        isReturningEnrollmentOpen: false,
      },
      {
        onSuccess: () => setIsCreateModalOpen(false),
      }
    );
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingYear) return;

    updateMutation.mutate(
      {
        id: editingYear.id,
        data: {
          schoolYear: formSchoolYear,
          startDate: formStartDate,
          endDate: formEndDate,
          currentSemester: formSemester,
          isActive: formIsActive,
        },
      },
      {
        onSuccess: () => setEditingYear(null),
      }
    );
  };

  const handleConfirmActivate = () => {
    if (!activateConfirmYear) return;
    setActiveMutation.mutate(activateConfirmYear.id, {
      onSuccess: () => setActivateConfirmYear(null),
    });
  };

  const handleConfirmArchive = () => {
    if (!archiveConfirmYear) return;
    archiveMutation.mutate(archiveConfirmYear.id, {
      onSuccess: () => setArchiveConfirmYear(null),
    });
  };

  const getStatusBadge = (statusStr: string, isActive: boolean) => {
    const s = isActive ? 'Current' : statusStr;
    switch (s) {
      case 'Current':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <Sparkles className="w-3 h-3 mr-1 animate-pulse" /> Active / Current
          </span>
        );
      case 'Upcoming':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
            <Clock className="w-3 h-3 mr-1" /> Upcoming
          </span>
        );
      case 'Completed':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Completed
          </span>
        );
      case 'Archived':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
            Archived
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-600">
            {s}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-full">
              Administration Subsystem
            </span>
          </div>
          <h1 className="text-3xl font-black text-purple-950 dark:text-white tracking-tight mt-1">
            School Year Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage institutional academic periods, active statuses, semesters, and historical school years.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-xl shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New School Year
        </button>
      </div>

      {/* Primary Status Banner */}
      {schoolYears && (
        <div className="p-6 bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-950 rounded-3xl text-white shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4 border border-purple-800/40">
          <div className="space-y-1">
            <div className="flex items-center space-x-2 text-amber-300 text-xs font-bold">
              <Sparkles className="w-4 h-4" />
              <span>CURRENTLY ACTIVE SCHOOL YEAR</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight">
              {schoolYears.find((y) => y.status === 'Current' || y.isActive)?.schoolYear || 'No Active School Year'}
            </h2>
            <p className="text-xs text-purple-200">
              Semester:{' '}
              <strong className="text-white">
                {schoolYears.find((y) => y.status === 'Current' || y.isActive)?.currentSemester || '1st Semester'}
              </strong>
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-purple-900/60 p-3 rounded-2xl border border-purple-700/50 backdrop-blur-xs">
            <Layers className="w-5 h-5 text-amber-300 shrink-0" />
            <div className="text-xs">
              <p className="font-bold text-white">System-Wide Impact Active</p>
              <p className="text-[11px] text-purple-200">
                All dashboards, enrollment controls &amp; portals read from this status.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-purple-700 dark:text-purple-400" />
            School Year Directory
          </h3>
          <span className="text-xs text-slate-500">{schoolYears?.length || 0} Total School Years</span>
        </div>

        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
        ) : isError ? (
          <div className="p-8 text-center text-sm text-slate-500">
            Unable to load School Years. Please verify server connection.
          </div>
        ) : !schoolYears || schoolYears.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No School Years registered yet. Click &quot;Add New School Year&quot; above to create one.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-100 dark:border-slate-800 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">School Year</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Active Semester</th>
                  <th className="px-6 py-3.5">Start Date</th>
                  <th className="px-6 py-3.5">End Date</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {schoolYears.map((yr) => {
                  const isCurrent = yr.status === 'Current' || yr.isActive;
                  return (
                    <tr
                      key={yr.id}
                      className={`hover:bg-purple-50/40 dark:hover:bg-slate-800/40 transition-colors ${
                        isCurrent ? 'bg-purple-50/20 dark:bg-purple-950/20 font-medium' : ''
                      }`}
                    >
                      <td className="px-6 py-4 font-bold text-slate-900 dark:text-white text-sm">
                        {yr.schoolYear}
                      </td>
                      <td className="px-6 py-4">{getStatusBadge(yr.status, yr.isActive)}</td>
                      <td className="px-6 py-4">
                        <select
                          value={yr.currentSemester || '1st Semester'}
                          onChange={(e) =>
                            setSemesterMutation.mutate({ id: yr.id, semester: e.target.value })
                          }
                          className="px-2.5 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500"
                        >
                          <option value="1st Semester">1st Semester</option>
                          <option value="2nd Semester">2nd Semester</option>
                          <option value="Summer">Summer</option>
                          <option value="Annual">Annual</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">
                        {yr.startDate ? new Date(yr.startDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 font-mono">
                        {yr.endDate ? new Date(yr.endDate).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        {!isCurrent && yr.status !== 'Archived' && (
                          <button
                            onClick={() => setActivateConfirmYear(yr)}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-all shadow-xs"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Set Active
                          </button>
                        )}
                        <button
                          onClick={() => openEditModal(yr)}
                          className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-3.5 h-3.5 mr-1" /> Edit
                        </button>
                        {yr.status !== 'Archived' && !isCurrent && (
                          <button
                            onClick={() => setArchiveConfirmYear(yr)}
                            className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-300 rounded-lg transition-colors"
                          >
                            <Archive className="w-3.5 h-3.5 mr-1" /> Archive
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center">
                <Plus className="w-4 h-4 mr-2 text-purple-700 dark:text-purple-400" />
                Add New School Year
              </h3>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  School Year Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SY 2027–2028"
                  value={formSchoolYear}
                  onChange={(e) => setFormSchoolYear(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Initial Semester
                </label>
                <select
                  value={formSemester}
                  onChange={(e) => setFormSemester(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Summer">Summer</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">Set as Active Immediately</span>
                  <p className="text-[11px] text-slate-500">
                    This will complete the existing active School Year.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={formIsActive}
                  onChange={(e) => setFormIsActive(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded-md"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-xl shadow-md disabled:opacity-50 inline-flex items-center"
                >
                  {createMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                  Create School Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingYear && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center">
                <Edit3 className="w-4 h-4 mr-2 text-purple-700 dark:text-purple-400" />
                Edit School Year
              </h3>
              <button
                onClick={() => setEditingYear(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  School Year Title
                </label>
                <input
                  type="text"
                  required
                  value={formSchoolYear}
                  onChange={(e) => setFormSchoolYear(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formStartDate}
                    onChange={(e) => setFormStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                    End Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formEndDate}
                    onChange={(e) => setFormEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
                  Active Semester
                </label>
                <select
                  value={formSemester}
                  onChange={(e) => setFormSemester(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium"
                >
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Summer">Summer</option>
                  <option value="Annual">Annual</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingYear(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-xl shadow-md disabled:opacity-50 inline-flex items-center"
                >
                  {updateMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Activate Confirmation Dialog */}
      {activateConfirmYear && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-emerald-600 dark:text-emerald-400">
              <div className="p-3 bg-emerald-100 dark:bg-emerald-950 rounded-2xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Activate School Year</h3>
                <p className="text-xs text-slate-500 font-semibold">{activateConfirmYear.schoolYear}</p>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs text-slate-600 dark:text-slate-300">
              <p className="font-bold text-slate-900 dark:text-white mb-1">Activating this School Year will:</p>
              <ul className="space-y-1.5">
                <li className="flex items-center text-slate-700 dark:text-slate-300 font-medium">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500 mr-1.5 shrink-0" />
                  Complete the current School Year
                </li>
                <li className="flex items-center text-slate-700 dark:text-slate-300 font-medium">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500 mr-1.5 shrink-0" />
                  Make <strong>{activateConfirmYear.schoolYear}</strong> the active School Year
                </li>
                <li className="flex items-center text-slate-500">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                  Update Admissions &amp; Enrollment controls
                </li>
                <li className="flex items-center text-slate-500">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                  Update Registrar, Accounting &amp; Teacher Portals
                </li>
                <li className="flex items-center text-slate-500">
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 mr-1.5 shrink-0" />
                  Update Student &amp; Parent Portals automatically
                </li>
              </ul>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setActivateConfirmYear(null)}
                className="px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmActivate}
                disabled={setActiveMutation.isPending}
                className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-lg shadow-emerald-600/25 inline-flex items-center"
              >
                {setActiveMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />}
                Activate School Year
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      {archiveConfirmYear && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center space-x-3 text-amber-600">
              <div className="p-3 bg-amber-100 dark:bg-amber-950 rounded-2xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">Archive School Year</h3>
                <p className="text-xs text-slate-500 font-semibold">{archiveConfirmYear.schoolYear}</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Are you sure you want to archive <strong>{archiveConfirmYear.schoolYear}</strong>? Archived school years are preserved for historical records but cannot become active without administrator action.
            </p>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setArchiveConfirmYear(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmArchive}
                disabled={archiveMutation.isPending}
                className="px-4 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 rounded-xl shadow-md inline-flex items-center"
              >
                {archiveMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                Archive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
