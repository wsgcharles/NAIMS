import React, { useMemo, useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { StatusChip } from '../../components/data-display/StatusChip';
import { Users, Hourglass, CheckCircle2, XCircle, Search, X, Loader2, KeyRound, Copy } from 'lucide-react';
import { useRegistrarApi } from '../../hooks/useRegistrarApi';
import type { FrontendEnrollmentType } from '../../types';
import { toast } from 'sonner';

const ENROLLMENT_TYPES: FrontendEnrollmentType[] = ['New', 'Old', 'Transferee', 'Returnee'];

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

export const ApplicantManagementPage: React.FC = () => {
  const {
    useEnrollmentApplications,
    useSections,
    useCurrentEmployeeId,
    useApproveAndEnrollMutation,
  } = useRegistrarApi();

  const { data: applications, isLoading, isError } = useEnrollmentApplications();
  const { data: sections, isLoading: sectionsLoading } = useSections();
  const { data: currentEmployeeId, isLoading: employeeLoading, isError: employeeError } = useCurrentEmployeeId();
  const enrollMutation = useApproveAndEnrollMutation();

  const [search, setSearch] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertedIds, setConvertedIds] = useState<Set<number>>(new Set());

  const [lrn, setLrn] = useState('');
  const [sectionId, setSectionId] = useState<number | ''>('');
  const [enrollmentType, setEnrollmentType] = useState<FrontendEnrollmentType>('New');
  const [enrollResult, setEnrollResult] = useState<Awaited<ReturnType<typeof enrollMutation.mutateAsync>> | null>(null);

  const filtered = useMemo(() => {
    const list = applications ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (a) => a.fullName.toLowerCase().includes(q) || a.applicationNumber.toLowerCase().includes(q)
    );
  }, [applications, search]);

  const selectedApplication = applications?.find((a) => a.id === selectedApplicationId) ?? null;

  const relevantSections = useMemo(() => {
    if (!sections) return [];
    if (!selectedApplication) return sections;
    const gradeQuery = selectedApplication.gradeApplyingFor.toLowerCase();
    const matches = sections.filter((s) => s.programOfferingName.toLowerCase().includes(gradeQuery));
    return matches.length > 0 ? matches : sections;
  }, [sections, selectedApplication]);

  const counts = useMemo(() => {
    const list = applications ?? [];
    return {
      total: list.length,
      pending: list.filter((a) => a.status === 'Pending').length,
      approved: list.filter((a) => a.status === 'Approved').length,
      rejected: list.filter((a) => a.status === 'Rejected').length,
    };
  }, [applications]);

  const openConvertModal = (applicationId: number) => {
    setSelectedApplicationId(applicationId);
    setLrn('');
    setSectionId('');
    setEnrollmentType('New');
    setEnrollResult(null);
    setIsConvertModalOpen(true);
  };

  const closeConvertModal = () => {
    setIsConvertModalOpen(false);
    setEnrollResult(null);
  };

  const canSubmitConvert =
    !!selectedApplicationId &&
    lrn.trim().length > 0 &&
    lrn.trim().length <= 12 &&
    sectionId !== '' &&
    currentEmployeeId != null;

  const handleConfirmConvert = async () => {
    if (!selectedApplicationId || sectionId === '' || currentEmployeeId == null) return;
    try {
      const result = await enrollMutation.mutateAsync({
        applicationId: selectedApplicationId,
        lrn: lrn.trim(),
        employeeId: currentEmployeeId,
        sectionId: Number(sectionId),
        enrollmentType,
      });
      setEnrollResult(result);
      setConvertedIds((prev) => new Set(prev).add(selectedApplicationId));
    } catch {
      // toast already surfaced by the mutation's onError
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Registrar Applicant Workspace</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review submitted applications, approve or reject from the Enrollment Queue, then enroll approved
          applicants into a section here.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-5">
        <StatCard title="Total Applications" value={isLoading ? '…' : `${counts.total}`} icon={Users} />
        <StatCard title="Pending Review" value={isLoading ? '…' : `${counts.pending}`} icon={Hourglass} iconBgColor="bg-amber-500/10 text-amber-500" />
        <StatCard title="Approved" value={isLoading ? '…' : `${counts.approved}`} icon={CheckCircle2} iconBgColor="bg-emerald-500/10 text-emerald-500" />
        <StatCard title="Rejected" value={isLoading ? '…' : `${counts.rejected}`} icon={XCircle} iconBgColor="bg-rose-500/10 text-rose-500" />
      </div>

      {/* Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex items-center justify-between shadow-xs">
        <div className="relative w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by applicant name or ref #..."
            aria-label="Search applications"
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs outline-hidden"
          />
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Ref Number</th>
              <th className="px-6 py-3.5">Applicant Name</th>
              <th className="px-6 py-3.5">Grade Applying For</th>
              <th className="px-6 py-3.5">Submission Date</th>
              <th className="px-6 py-3.5">Status</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && <SkeletonRow cols={6} />}
            {!isLoading && isError && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  Unable to reach the EduCore server to load applications. Please check your connection and try again.
                </td>
              </tr>
            )}
            {!isLoading && !isError && filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                  {search.trim() ? 'No applications match your search.' : 'No enrollment applications have been submitted yet.'}
                </td>
              </tr>
            )}
            {!isLoading &&
              !isError &&
              filtered.map((a) => (
                <tr key={a.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{a.applicationNumber}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{a.fullName}</td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">{a.gradeApplyingFor}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(a.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4">
                    <StatusChip status={a.status} type="enrollment" />
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => setSelectedApplicationId(a.id)}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300"
                    >
                      View Details
                    </button>
                    {a.status === 'Approved' && !convertedIds.has(a.id) && (
                      <button
                        onClick={() => openConvertModal(a.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white rounded-lg shadow-xs"
                      >
                        Enroll as Student
                      </button>
                    )}
                    {convertedIds.has(a.id) && (
                      <span className="px-2.5 py-1 text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-full">
                        Enrolled this session
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {/* Application Detail Drawer / Modal (view-only, no convert modal open) */}
      {selectedApplication && !isConvertModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-2xl shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{selectedApplication.fullName}</h3>
                <span className="font-mono text-xs text-blue-500">{selectedApplication.applicationNumber}</span>
              </div>
              <button
                onClick={() => setSelectedApplicationId(null)}
                aria-label="Close application details"
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="text-slate-500 uppercase text-[10px] font-semibold">Grade Applying For</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">{selectedApplication.gradeApplyingFor}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="text-slate-500 uppercase text-[10px] font-semibold">Previous School</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">{selectedApplication.previousSchool || '—'}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="text-slate-500 uppercase text-[10px] font-semibold">Contact Email</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">{selectedApplication.email}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="text-slate-500 uppercase text-[10px] font-semibold">Submitted</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">
                  {new Date(selectedApplication.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>

            <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-dashed border-amber-300 dark:border-amber-800 rounded-xl text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
              Document upload &amp; per-file verification tracking is not yet available from the backend for this
              application. Verify submitted requirements through your institution's existing manual process before
              approving or enrolling.
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-3">
              <button onClick={() => setSelectedApplicationId(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">
                Close
              </button>
              {selectedApplication.status === 'Approved' && !convertedIds.has(selectedApplication.id) && (
                <button
                  onClick={() => openConvertModal(selectedApplication.id)}
                  className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md"
                >
                  Enroll as Student
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Enroll (Approve-and-Enroll) Modal */}
      {isConvertModalOpen && selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            {!enrollResult ? (
              <>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">Enroll Applicant as Student</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This will officially register{' '}
                  <strong className="text-slate-900 dark:text-white">{selectedApplication.fullName}</strong> as a
                  student and generate portal credentials. This action calls the real enrollment pipeline and
                  cannot be undone from this screen.
                </p>

                <div className="space-y-3">
                  <div className="space-y-1">
                    <label htmlFor="lrn-input" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Verified LRN <span className="text-rose-500">*</span>
                    </label>
                    <input
                      id="lrn-input"
                      type="text"
                      maxLength={12}
                      value={lrn}
                      onChange={(e) => setLrn(e.target.value)}
                      placeholder="12-digit Learner Reference Number"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="section-select" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Assign Section <span className="text-rose-500">*</span>
                    </label>
                    <select
                      id="section-select"
                      value={sectionId}
                      onChange={(e) => setSectionId(e.target.value ? Number(e.target.value) : '')}
                      disabled={sectionsLoading}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="">{sectionsLoading ? 'Loading sections…' : 'Select a section'}</option>
                      {relevantSections.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.programOfferingName} — {s.sectionName} ({s.currentStudents}/{s.capacity})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="enrollment-type-select" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Enrollment Type
                    </label>
                    <select
                      id="enrollment-type-select"
                      value={enrollmentType}
                      onChange={(e) => setEnrollmentType(e.target.value as FrontendEnrollmentType)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                    >
                      {ENROLLMENT_TYPES.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>

                  {employeeError && (
                    <p className="text-[11px] text-rose-500">
                      Unable to resolve your employee record, which is required to process this enrollment. Contact
                      your administrator.
                    </p>
                  )}
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button onClick={closeConvertModal} className="px-4 py-2 text-xs font-semibold text-slate-500">
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmConvert}
                    disabled={!canSubmitConvert || enrollMutation.isPending || employeeLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md disabled:opacity-50 disabled:pointer-events-none"
                  >
                    {enrollMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    Confirm &amp; Enroll Student
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
                  <KeyRound className="w-5 h-5" />
                  <h3 className="font-bold text-lg">Student Enrolled Successfully</h3>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{enrollResult.message}</p>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <div>
                      <div className="text-slate-500 uppercase text-[10px] font-semibold">Student Number</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{enrollResult.studentNumber}</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                    <div>
                      <div className="text-slate-500 uppercase text-[10px] font-semibold">Student Temporary Password</div>
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{enrollResult.temporaryPassword}</div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(enrollResult.temporaryPassword, 'Student password')}
                      aria-label="Copy student temporary password"
                      className="p-1.5 text-slate-400 hover:text-emerald-500"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  {enrollResult.parentEmail && (
                    <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                      <div>
                        <div className="text-slate-500 uppercase text-[10px] font-semibold">Parent Temporary Password</div>
                        <div className="font-mono font-bold text-slate-900 dark:text-white">{enrollResult.parentTemporaryPassword}</div>
                      </div>
                      <button
                        onClick={() => copyToClipboard(enrollResult.parentTemporaryPassword, 'Parent password')}
                        aria-label="Copy parent temporary password"
                        className="p-1.5 text-slate-400 hover:text-emerald-500"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>

                <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                  Share these credentials securely — they cannot be retrieved again from this screen.
                </p>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      closeConvertModal();
                      setSelectedApplicationId(null);
                    }}
                    className="px-4 py-2 text-xs font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-lg"
                  >
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
