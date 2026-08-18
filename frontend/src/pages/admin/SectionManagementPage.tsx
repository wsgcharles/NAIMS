import React, { useMemo, useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import {
  Layers,
  Users,
  Plus,
  Trash2,
  X,
  Loader2,
  Search,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  BookOpen,
  UserX,
  Activity,
  Edit,
  Eye,
  UserCheck,
  Power,
  Filter
} from 'lucide-react';
import { useAdminApi } from '../../hooks/useAdminApi';
import type { SectionOption } from '../../types';

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </td>
    ))}
  </tr>
);

export const SectionManagementPage: React.FC = () => {
  const {
    useSectionsLookup,
    useSectionStats,
    useAcademicYearsLookup,
    useActiveSchoolYear,
    useGradeLevels,
    useAcademicPrograms,
    useEmployees,
    useCreateSectionMutation,
    useUpdateSectionMutation,
    useDeleteSectionMutation,
    useToggleSectionStatusMutation,
    useAssignSectionTeacherMutation,
  } = useAdminApi();

  const { data: sections, isLoading, isError } = useSectionsLookup();
  const { data: stats } = useSectionStats();
  const { data: academicYears } = useAcademicYearsLookup();
  const { data: activeSchoolYear } = useActiveSchoolYear();
  const { data: gradeLevels } = useGradeLevels();
  const { data: programs } = useAcademicPrograms();
  const { data: employees } = useEmployees();

  const createMutation = useCreateSectionMutation();
  const updateMutation = useUpdateSectionMutation();
  const deleteMutation = useDeleteSectionMutation();
  const toggleStatusMutation = useToggleSectionStatusMutation();
  const assignTeacherMutation = useAssignSectionTeacherMutation();

  // Search and Filter State
  const [search, setSearch] = useState('');
  const [gradeFilter, setGradeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modals & Drawers State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<SectionOption | null>(null);
  const [viewingSection, setViewingSection] = useState<SectionOption | null>(null);
  const [assigningTeacherSection, setAssigningTeacherSection] = useState<SectionOption | null>(null);
  const [confirmArchiveId, setConfirmArchiveId] = useState<number | null>(null);

  // Form State
  const [sectionName, setSectionName] = useState('');
  const [academicYearId, setAcademicYearId] = useState<number | ''>('');
  const [gradeLevelId, setGradeLevelId] = useState<number | ''>('');
  const [programId, setProgramId] = useState<number | ''>('');
  const [capacity, setCapacity] = useState<number>(40);
  const [adviserEmployeeId, setAdviserEmployeeId] = useState<number | ''>('');
  const [isActive, setIsActive] = useState<boolean>(true);

  // Teacher Assignment Modal Form State
  const [selectedSubjectId, setSelectedSubjectId] = useState<number | ''>('');
  const [selectedTeacherId, setSelectedTeacherId] = useState<number | ''>('');

  const teachers = useMemo(() => {
    return (employees ?? []).filter(e => {
      if (!e.isActive) return false;
      const role = (e.role || '').toString().toLowerCase();
      const position = (e.position || '').toLowerCase();
      return (
        role === 'teacher' ||
        role.includes('teacher') ||
        position.includes('teacher') ||
        position.includes('faculty') ||
        position.includes('instructor') ||
        position.includes('professor')
      );
    });
  }, [employees]);


  const filteredSections = useMemo(() => {
    let list = sections ?? [];
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.sectionName.toLowerCase().includes(q) ||
          s.gradeLevelName.toLowerCase().includes(q) ||
          s.adviserName.toLowerCase().includes(q) ||
          s.trackCode.toLowerCase().includes(q) ||
          s.strandCode.toLowerCase().includes(q)
      );
    }
    if (gradeFilter) {
      list = list.filter((s) => s.gradeLevelName.toLowerCase() === gradeFilter.toLowerCase());
    }
    if (statusFilter) {
      if (statusFilter === 'Active') list = list.filter((s) => s.isActive);
      else if (statusFilter === 'Inactive') list = list.filter((s) => !s.isActive);
      else if (statusFilter === 'Full') list = list.filter((s) => s.remainingSlots <= 0);
      else if (statusFilter === 'Incomplete') list = list.filter((s) => s.readinessStatus === 'Incomplete');
    }
    return list;
  }, [sections, search, gradeFilter, statusFilter]);

  const openCreateModal = () => {
    setEditingSection(null);
    setSectionName('');
    setAcademicYearId(activeSchoolYear?.id ?? (academicYears && academicYears[0]?.id) ?? '');
    setGradeLevelId((gradeLevels && gradeLevels[0]?.id) ?? '');
    setProgramId('');
    setCapacity(40);
    setAdviserEmployeeId('');
    setIsActive(true);
    setIsCreateModalOpen(true);
  };

  const openEditModal = (sec: SectionOption) => {
    setEditingSection(sec);
    setSectionName(sec.sectionName);
    setAcademicYearId(sec.academicYearId || activeSchoolYear?.id || '');
    setGradeLevelId(sec.gradeLevelId || '');
    setProgramId(sec.programId || '');
    setCapacity(sec.capacity);
    setAdviserEmployeeId(sec.adviserEmployeeId || '');
    setIsActive(sec.isActive);
    setIsCreateModalOpen(true);
  };

  const closeModal = () => {
    setIsCreateModalOpen(false);
    setEditingSection(null);
  };

  const handleSaveSection = async () => {
    if (!sectionName.trim() || !gradeLevelId) return;

    const payload = {
      academicYearId: academicYearId ? Number(academicYearId) : undefined,
      gradeLevelId: Number(gradeLevelId),
      programId: programId ? Number(programId) : undefined,
      sectionName: sectionName.trim(),
      capacity: Number(capacity),
      adviserEmployeeId: adviserEmployeeId ? Number(adviserEmployeeId) : null,
      isActive: isActive
    };

    try {
      if (editingSection) {
        await updateMutation.mutateAsync({ id: editingSection.id, data: payload });
      } else {
        await createMutation.mutateAsync(payload);
      }
      closeModal();
    } catch {}
  };

  const handleAssignTeacher = async () => {
    if (!assigningTeacherSection || !selectedSubjectId || !selectedTeacherId) return;
    try {
      await assignTeacherMutation.mutateAsync({
        sectionId: assigningTeacherSection.id,
        payload: {
          subjectId: Number(selectedSubjectId),
          employeeId: Number(selectedTeacherId)
        }
      });
      setSelectedSubjectId('');
      setSelectedTeacherId('');
    } catch {}
  };

  // Readiness Badge Renderer
  const renderReadinessBadge = (status: string) => {
    switch (status) {
      case 'Ready':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 inline-flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> Ready</span>;
      case 'Warning':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800 inline-flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Warning</span>;
      case 'Incomplete':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800 inline-flex items-center gap-1"><AlertCircle className="w-3 h-3" /> Incomplete</span>;
      case 'Full':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800 inline-flex items-center gap-1"><Users className="w-3 h-3" /> Full</span>;
      default:
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300">{status}</span>;
    }
  };

  // Health Badge Renderer
  const renderHealthBadge = (health: string) => {
    switch (health) {
      case 'Excellent':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300">Excellent</span>;
      case 'Good':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">Good</span>;
      case 'Needs Attention':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300">Needs Attention</span>;
      case 'Configuration Required':
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">Configuration Required</span>;
      default:
        return <span className="px-2.5 py-1 text-[11px] font-bold rounded-full bg-slate-100 text-slate-800">{health}</span>;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Section Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure institutional sections, adviser assignments, subject lineups, and capacity limits per school year.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-xl shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.01]"
        >
          <Plus className="w-4 h-4 mr-2" />
          Create Section
        </button>
      </div>

      {/* 6 Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard title="Total Sections" value={isLoading ? '…' : `${stats?.totalSections ?? 0}`} icon={Layers} />
        <StatCard title="Active Sections" value={isLoading ? '…' : `${stats?.activeSections ?? 0}`} icon={CheckCircle2} iconBgColor="bg-emerald-500/10 text-emerald-500" />
        <StatCard title="Full Sections" value={isLoading ? '…' : `${stats?.fullSections ?? 0}`} icon={Users} iconBgColor="bg-purple-500/10 text-purple-500" />
        <StatCard title="Missing Adviser" value={isLoading ? '…' : `${stats?.sectionsMissingAdviser ?? 0}`} icon={UserX} iconBgColor="bg-amber-500/10 text-amber-500" />
        <StatCard title="Missing Teachers" value={isLoading ? '…' : `${stats?.sectionsMissingTeachers ?? 0}`} icon={BookOpen} iconBgColor="bg-rose-500/10 text-rose-500" />
        <StatCard title="Avg Utilization" value={isLoading ? '…' : `${stats?.averageUtilization ?? 0}%`} icon={Activity} iconBgColor="bg-blue-500/10 text-blue-500" />
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search section name, adviser, grade..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-hidden"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={gradeFilter}
              onChange={(e) => setGradeFilter(e.target.value)}
              className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
            >
              <option value="">All Grade Levels</option>
              {(gradeLevels ?? []).map((g) => (
                <option key={g.id} value={g.name}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Inactive">Inactive Only</option>
            <option value="Full">Full Sections</option>
            <option value="Incomplete">Incomplete Setup</option>
          </select>
        </div>
      </div>

      {/* Main Section Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-x-auto shadow-xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[10px] font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-4 py-3">Section</th>
              <th className="px-4 py-3">School Year</th>
              <th className="px-4 py-3">Grade & Track</th>
              <th className="px-4 py-3">Adviser</th>
              <th className="px-4 py-3">Capacity</th>
              <th className="px-4 py-3">Slots Left</th>
              <th className="px-4 py-3">Subject & Teacher Lineup</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Readiness</th>
              <th className="px-4 py-3">Health</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && <SkeletonRow cols={11} />}
            {!isLoading && isError && (
              <tr>
                <td colSpan={11} className="px-6 py-10 text-center text-sm text-slate-500">
                  Failed to load sections from PostgreSQL server. Please check your connection.
                </td>
              </tr>
            )}
            {!isLoading && !isError && filteredSections.length === 0 && (
              <tr>
                <td colSpan={11} className="px-6 py-10 text-center text-sm text-slate-500">
                  {search || gradeFilter || statusFilter
                    ? 'No sections match your search criteria.'
                    : 'No sections configured yet. Click "+ Create Section" to add institutional sections.'}
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              filteredSections.map((sec) => (
                <tr key={sec.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {sec.sectionName}
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    <div>{sec.schoolYear || activeSchoolYear?.schoolYear || 'Active SY'}</div>
                    <div className="text-[10px] text-slate-400">{sec.semester}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-purple-600 dark:text-purple-400">{sec.gradeLevelName}</span>
                    {(sec.trackCode !== 'Academic' || sec.strandCode !== 'General') && (
                      <div className="text-[10px] text-slate-500">{sec.trackCode} — {sec.strandCode}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {sec.hasAdviser ? (
                      <span className="inline-flex items-center gap-1 font-medium text-slate-900 dark:text-white">
                        <UserCheck className="w-3 h-3 text-emerald-500" />
                        {sec.adviserName}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                        <UserX className="w-3 h-3" /> Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {sec.currentStudents} / {sec.capacity}
                    </div>
                    <div className="w-20 bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full ${
                          sec.remainingSlots <= 0 ? 'bg-purple-600' : sec.currentStudents / sec.capacity >= 0.8 ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.min(100, sec.capacity > 0 ? (sec.currentStudents * 100) / sec.capacity : 0)}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900 dark:text-white">
                    {sec.remainingSlots}
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Subjects: <span className={sec.isSubjectComplete ? 'text-emerald-600 font-bold' : 'text-rose-500 font-bold'}>{sec.assignedSubjectsCount}/{sec.requiredSubjectsCount}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-300">
                      Teachers: <span className={sec.isTeacherComplete ? 'text-emerald-600 font-bold' : 'text-amber-500 font-bold'}>{sec.assignedTeachersCount}/{sec.requiredTeachersCount}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        sec.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {sec.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-4 py-3">{renderReadinessBadge(sec.readinessStatus)}</td>
                  <td className="px-4 py-3">{renderHealthBadge(sec.sectionHealth)}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => setViewingSection(sec)}
                        title="View Section Details & Rosters"
                        aria-label={`View details for ${sec.sectionName}`}
                        className="p-1.5 text-slate-500 hover:text-purple-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openEditModal(sec)}
                        title="Edit Section Configuration"
                        aria-label={`Edit ${sec.sectionName}`}
                        className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setAssigningTeacherSection(sec);
                          setSelectedSubjectId('');
                          setSelectedTeacherId('');
                        }}
                        title="Assign Teachers & Subjects"
                        aria-label={`Assign teachers for ${sec.sectionName}`}
                        className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                      >
                        <BookOpen className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toggleStatusMutation.mutate(sec.id)}
                        title={sec.isActive ? 'Deactivate Section' : 'Activate Section'}
                        aria-label={`Toggle active state for ${sec.sectionName}`}
                        className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                      >
                        <Power className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setConfirmArchiveId(sec.id)}
                        title="Archive Section"
                        aria-label={`Archive ${sec.sectionName}`}
                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Create / Edit Section Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">
                {editingSection ? `Edit Section (${editingSection.sectionName})` : 'Create New Class Section'}
              </h3>
              <button onClick={closeModal} aria-label="Close modal" className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Section Name *</label>
                <input
                  type="text"
                  value={sectionName}
                  onChange={(e) => setSectionName(e.target.value)}
                  placeholder="e.g. St. Thomas, STEM-11A, Grade 7-Rizal"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Academic Year *</label>
                  <select
                    value={academicYearId}
                    onChange={(e) => setAcademicYearId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">Select Academic Year</option>
                    {(academicYears ?? []).map((ay) => (
                      <option key={ay.id} value={ay.id}>
                        {ay.schoolYear} {ay.status === 'Current' ? '(Active)' : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Grade Level *</label>
                  <select
                    value={gradeLevelId}
                    onChange={(e) => setGradeLevelId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">Select Grade Level</option>
                    {(gradeLevels ?? []).map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Track / Program (Optional)</label>
                  <select
                    value={programId}
                    onChange={(e) => setProgramId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="">General / Academic</option>
                    {(programs ?? []).map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Max Capacity *</label>
                  <input
                    type="number"
                    min={1}
                    max={150}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Class Adviser Teacher</label>
                <select
                  value={adviserEmployeeId}
                  onChange={(e) => setAdviserEmployeeId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">Assign Adviser Later</option>
                  {teachers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.fullName} ({t.position || 'Faculty'})
                    </option>
                  ))}

                </select>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="section-active"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded border-slate-300 focus:ring-purple-500"
                />
                <label htmlFor="section-active" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  Activate Section Immediately (available for student section allocations)
                </label>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button onClick={closeModal} className="px-4 py-2 text-xs font-semibold text-slate-500">
                Cancel
              </button>
              <button
                onClick={handleSaveSection}
                disabled={!sectionName.trim() || !gradeLevelId || createMutation.isPending || updateMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-lg shadow-md disabled:opacity-50"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {editingSection ? 'Save Changes' : 'Create Section'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Teacher Modal */}
      {assigningTeacherSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-xl shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Teacher & Subject Lineup — {assigningTeacherSection.sectionName}
                </h3>
                <p className="text-xs text-slate-500">
                  {assigningTeacherSection.gradeLevelName} • {assigningTeacherSection.schoolYear}
                </p>
              </div>
              <button onClick={() => setAssigningTeacherSection(null)} aria-label="Close modal" className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Current Lineup Table */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200">Required Subject Lineup</h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2">Subject Code</th>
                      <th className="px-3 py-2">Subject Name</th>
                      <th className="px-3 py-2">Units</th>
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Assigned Teacher</th>
                      <th className="px-3 py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(assigningTeacherSection.subjects ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-4 text-center text-slate-400">
                          No active subjects configured for this grade level.
                        </td>
                      </tr>
                    ) : (
                      assigningTeacherSection.subjects.map((sub) => (
                        <tr key={sub.subjectId}>
                          <td className="px-3 py-2 font-semibold text-purple-600 dark:text-purple-400">{sub.subjectCode}</td>
                          <td className="px-3 py-2 text-slate-900 dark:text-white">{sub.subjectName}</td>
                          <td className="px-3 py-2 text-slate-500">{sub.units}</td>
                          <td className="px-3 py-2 font-medium">
                            {sub.isCoreSubject ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 rounded-full">Core</span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-full">Elective</span>
                            )}
                          </td>
                          <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">
                            {sub.hasTeacher ? sub.teacherName : <span className="text-amber-600 dark:text-amber-400 font-semibold">No Teacher Assigned</span>}
                          </td>
                          <td className="px-3 py-2">
                            {sub.hasTeacher ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 rounded-full">Assigned</span>
                            ) : (
                              <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 rounded-full">Missing Teacher</span>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>

              </div>

              {/* Assign Teacher Form */}
              <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="font-bold text-xs text-slate-900 dark:text-white">Assign Teacher to Subject</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Select Subject *</label>
                    <select
                      value={selectedSubjectId}
                      onChange={(e) => setSelectedSubjectId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="">Choose Subject</option>
                      {(assigningTeacherSection.subjects ?? []).map((s) => (
                        <option key={s.subjectId} value={s.subjectId}>
                          {s.subjectCode} — {s.subjectName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">Assign Teacher *</label>
                    <select
                      value={selectedTeacherId}
                      onChange={(e) => setSelectedTeacherId(e.target.value ? Number(e.target.value) : '')}
                      className="w-full p-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="">Select Faculty Teacher</option>
                      {teachers.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.fullName} ({t.employeeNumber})
                        </option>
                      ))}

                    </select>
                  </div>
                </div>
                <button
                  onClick={handleAssignTeacher}
                  disabled={!selectedSubjectId || !selectedTeacherId || assignTeacherMutation.isPending}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md disabled:opacity-50"
                >
                  {assignTeacherMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Assign Teacher to Selected Subject
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button onClick={() => setAssigningTeacherSection(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Section Details Drawer / Modal */}
      {viewingSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-2xl h-full p-6 shadow-2xl space-y-6 overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{viewingSection.sectionName}</h3>
                <p className="text-xs text-slate-500">
                  {viewingSection.gradeLevelName} • {viewingSection.schoolYear} ({viewingSection.semester})
                </p>
              </div>
              <button onClick={() => setViewingSection(null)} aria-label="Close drawer" className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px] font-semibold">Enrolled / Capacity</div>
                <div className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                  {viewingSection.currentStudents} / {viewingSection.capacity}
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px] font-semibold">Readiness Status</div>
                <div className="mt-1">{renderReadinessBadge(viewingSection.readinessStatus)}</div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="text-slate-500 text-[10px] font-semibold">Section Health</div>
                <div className="mt-1">{renderHealthBadge(viewingSection.sectionHealth)}</div>
              </div>
            </div>

            {/* Adviser Info */}
            <div className="bg-purple-500/5 border border-purple-500/15 rounded-xl p-4 space-y-1 text-xs">
              <div className="text-purple-600 dark:text-purple-400 font-semibold uppercase text-[10px]">Class Adviser</div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">
                {viewingSection.hasAdviser ? viewingSection.adviserName : 'No Class Adviser Assigned Yet'}
              </div>
            </div>

            {/* Roster of Enrolled Students */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-purple-600" /> Enrolled Student Roster ({(viewingSection.enrolledStudents ?? []).length})
              </h4>
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 text-[10px] uppercase font-semibold">
                    <tr>
                      <th className="px-3 py-2">Student No.</th>
                      <th className="px-3 py-2">Full Name</th>
                      <th className="px-3 py-2">Gender</th>
                      <th className="px-3 py-2">Assigned Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {(viewingSection.enrolledStudents ?? []).length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-4 py-6 text-center text-slate-400">
                          No students officially assigned to this section yet.
                        </td>
                      </tr>
                    ) : (
                      viewingSection.enrolledStudents.map((st) => (
                        <tr key={st.studentId}>
                          <td className="px-3 py-2 font-mono text-purple-600 dark:text-purple-400 font-semibold">{st.studentNumber}</td>
                          <td className="px-3 py-2 font-medium text-slate-900 dark:text-white">{st.fullName}</td>
                          <td className="px-3 py-2 text-slate-500">{st.gender}</td>
                          <td className="px-3 py-2 text-slate-500">{new Date(st.assignedAt).toLocaleDateString()}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Archive Modal */}
      {confirmArchiveId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Archive Class Section?</h3>
            <p className="text-xs text-slate-500">
              This will remove the section from active section allocation lists. Historical student assignments remain recorded.
            </p>
            <div className="pt-2 flex justify-end space-x-2">
              <button onClick={() => setConfirmArchiveId(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">
                Cancel
              </button>
              <button
                onClick={async () => {
                  await deleteMutation.mutateAsync(confirmArchiveId);
                  setConfirmArchiveId(null);
                }}
                disabled={deleteMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md disabled:opacity-50"
              >
                {deleteMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Archive Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
