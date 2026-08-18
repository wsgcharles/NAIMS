import React, { useMemo, useState, useEffect } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { StatusChip } from '../../components/data-display/StatusChip';
import { Users, Hourglass, CheckCircle2, XCircle, Search, X, Loader2, KeyRound, Copy, FileText, Download, Eye, Check, FileCheck, FileX, Printer, Star, AlertTriangle } from 'lucide-react';
import { useRegistrarApi } from '../../hooks/useRegistrarApi';
import { admissionService, type TrackApplicationResponse } from '../../services/admissionService';
import { verificationSlipPdfService } from '../../services/verificationSlipPdfService';
import type { FrontendEnrollmentType, AvailableSection } from '../../types';
import { toast } from 'sonner';
import { getApiUrl } from '../../services/apiClient';
import { DocumentViewerModal } from '../../components/modals/DocumentViewerModal';

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

const isSeniorHighGrade = (grade?: string) => {
  if (!grade) return false;
  const g = grade.toLowerCase().trim();
  return g.includes('11') || g.includes('12') || g.includes('senior');
};


export const ApplicantManagementPage: React.FC = () => {

  const {
    useEnrollmentApplications,
    useAvailableSectionsForEnrollment,
    useCurrentEmployeeId,
    useApproveAndEnrollMutation,
  } = useRegistrarApi();

  const { data: applications, isLoading, isError } = useEnrollmentApplications();
  const { data: currentEmployeeId, isLoading: employeeLoading, isError: employeeError } = useCurrentEmployeeId();
  const enrollMutation = useApproveAndEnrollMutation();

  const [search, setSearch] = useState('');
  const [selectedApplicationId, setSelectedApplicationId] = useState<number | null>(null);
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  const [convertedIds, setConvertedIds] = useState<Set<number>>(new Set());

  const { data: availableSections, isLoading: availableSectionsLoading } = useAvailableSectionsForEnrollment(selectedApplicationId);

  const [previewSection, setPreviewSection] = useState<AvailableSection | null>(null);
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false);
  const [isOverrideEnabled, setIsOverrideEnabled] = useState(false);

  const [lrn, setLrn] = useState('');
  const [sectionId, setSectionId] = useState<number | ''>('');
  const [enrollmentType, setEnrollmentType] = useState<FrontendEnrollmentType>('New');
  const [createParentPortal, setCreateParentPortal] = useState<boolean>(true);
  const [enrollResult, setEnrollResult] = useState<Awaited<ReturnType<typeof enrollMutation.mutateAsync>> | null>(null);



  const isElementaryGradeLevel = (gradeName?: string | null): boolean => {
    if (!gradeName) return false;
    const g = gradeName.toLowerCase().trim();

    // Parse numeric grade level first to prevent Grade 10, 11, 12 from matching 'grade 1' substring
    const match = g.match(/\d+/);
    if (match) {
      const num = parseInt(match[0], 10);
      return num >= 1 && num <= 6;
    }

    // Fallback keyword check for non-numeric grade names (e.g. Kinder, Nursery, Prep)
    if (
      g.includes('kinder') || g.includes('nursery') || g.includes('prep') || g.includes('elem')
    ) {
      return true;
    }

    return false;
  };


  // Digital Document Review State

  const [appDetails, setAppDetails] = useState<TrackApplicationResponse | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [previewFile, setPreviewFile] = useState<{ id: number; name: string; type: string } | null>(null);
  const [rejectModalDoc, setRejectModalDoc] = useState<{ id: number; name: string } | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');
  const [isSubmittingStatus, setIsSubmittingStatus] = useState(false);

  const filtered = useMemo(() => {
    const list = applications ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (a) => a.fullName.toLowerCase().includes(q) || a.applicationNumber.toLowerCase().includes(q)
    );
  }, [applications, search]);

  const selectedApplication = applications?.find((a) => a.id === selectedApplicationId) ?? null;
  const selectedAvailableSec = availableSections?.find((s) => s.sectionId === sectionId) ?? null;

  useEffect(() => {
    if (!selectedApplication) {
      setAppDetails(null);
      return;
    }

    setIsLoadingDetails(true);
    admissionService
      .trackApplication(selectedApplication.applicationNumber, selectedApplication.email)
      .then((data) => setAppDetails(data))
      .catch(() => toast.error('Unable to fetch detailed document status.'))
      .finally(() => setIsLoadingDetails(false));
  }, [selectedApplication]);

  const refreshAppDetails = () => {
    if (!selectedApplication) return;
    admissionService
      .trackApplication(selectedApplication.applicationNumber, selectedApplication.email)
      .then((data) => setAppDetails(data))
      .catch(() => {});
  };

  const handleApproveDocument = async (docId: number, docName: string) => {
    try {
      setIsSubmittingStatus(true);
      await admissionService.verifyDocumentStatus(docId, 'Verified', 'Verified by Registrar.');
      toast.success(`${docName} digital copy has been verified!`);
      refreshAppDetails();
    } catch (err: any) {
      console.error(`[Document Verification Error] Failed to verify digital copy (Doc ID: ${docId}):`, err);
      const msg = err.response?.data?.message || err.message || 'Unable to verify digital document.';
      toast.error(msg);
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleConfirmRejectDocument = async () => {
    if (!rejectModalDoc) return;
    if (!rejectionRemarks.trim()) {
      toast.error('Please enter a rejection reason / instruction.');
      return;
    }

    try {
      setIsSubmittingStatus(true);
      await admissionService.verifyDocumentStatus(rejectModalDoc.id, 'Rejected', rejectionRemarks.trim());
      toast.success(`${rejectModalDoc.name} digital copy marked as rejected.`);
      setRejectModalDoc(null);
      setRejectionRemarks('');
      refreshAppDetails();
    } catch (err: any) {
      console.error(`[Document Verification Error] Failed to reject digital copy (Doc ID: ${rejectModalDoc.id}):`, err);
      const msg = err.response?.data?.message || err.message || 'Unable to reject digital document.';
      toast.error(msg);
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleVerifyOriginalDocument = async (docId: number, name: string, status: 'Verified' | 'Rejected', remarks?: string) => {
    try {
      setIsSubmittingStatus(true);
      await admissionService.verifyOriginalDocumentStatus(docId, status, remarks);
      toast.success(`Original physical copy of ${name} marked as ${status}.`);
      refreshAppDetails();
    } catch (err: any) {
      console.error(`[Document Verification Error] Failed to update original status (Doc ID: ${docId}):`, err);
      const msg = err.response?.data?.message || err.message || 'Unable to update original document status.';
      toast.error(msg);
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleGenerateVerificationSlip = async (applicationId: number) => {
    try {
      setIsSubmittingStatus(true);
      const slip = await admissionService.generateVerificationSlip(applicationId);
      toast.success(`Verification Slip ${slip.verificationSlipNumber} generated successfully!`);
      verificationSlipPdfService.printVerificationSlip(slip);
      refreshAppDetails();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate verification slip.');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleReprintVerificationSlip = async (applicationId: number) => {
    try {
      setIsSubmittingStatus(true);
      const slip = await admissionService.getVerificationSlip(applicationId);
      if (slip) {
        verificationSlipPdfService.printVerificationSlip(slip);
      } else {
        toast.error('Verification slip has not been generated yet.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to retrieve verification slip.');
    } finally {
      setIsSubmittingStatus(false);
    }
  };

  const handleOpenPreview = (docId: number, name: string, type: string) => {
    setPreviewFile({ id: docId, name, type });
  };

  const handleDownloadFile = (docId: number) => {
    window.open(getApiUrl(`/Enrollment/documents/${docId}/download`), '_blank');
  };



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
    setCreateParentPortal(true);
    setEnrollResult(null);
    setIsConvertModalOpen(true);
  };

  const closeConvertModal = () => {
    setIsConvertModalOpen(false);
    setEnrollResult(null);
  };

  // Synchronize sectionId with recommended or first selectable section when availableSections load
  useEffect(() => {
    if (availableSections && availableSections.length > 0 && sectionId === '') {
      const rec = availableSections.find((s) => s.recommended && (s.isSelectable || isOverrideEnabled)) 
               || availableSections.find((s) => s.isSelectable || isOverrideEnabled);
      if (rec) {
        setSectionId(rec.sectionId);
      }
    }
  }, [availableSections, isOverrideEnabled, sectionId]);

  const canSubmitConvert = useMemo(() => {
    if (!selectedApplicationId) return false;
    if (!lrn.trim() || lrn.trim().length > 12) return false;
    if (sectionId === '') return false;
    if (!enrollmentType) return false;

    const sec = availableSections?.find((s) => s.sectionId === Number(sectionId));
    if (!sec) return false;

    // Check institutional readiness & lineup completeness rules
    const isReadyOrOverride = sec.readinessStatus === 'Ready' || sec.isSelectable || isOverrideEnabled;
    const isSubjectComplete = sec.isSubjectComplete || (sec.assignedSubjects >= sec.requiredSubjects);
    const isTeacherComplete = sec.isTeacherComplete || (sec.assignedTeachers >= sec.requiredTeachers);
    const hasAdviser = sec.hasAdviser || sec.adviserEmployeeId != null;
    const isCapacityValid = sec.remainingSlots > 0 || isOverrideEnabled;

    if (!isReadyOrOverride || !isSubjectComplete || !isTeacherComplete || !hasAdviser || !isCapacityValid) {
      return false;
    }

    if (!currentEmployeeId || currentEmployeeId <= 0) return false;

    // TASK 4, 5, 6: Parent Email belongs exclusively to Admission Application
    const isElem = isElementaryGradeLevel(selectedApplication?.gradeApplyingFor);
    const willCreateParent = isElem || createParentPortal;

    if (willCreateParent) {
      if (!selectedApplication?.parentEmail || !selectedApplication.parentEmail.trim()) {
        return false; // Enrollment BLOCKED until Admission record is updated
      }
    }

    return true;
  }, [
    selectedApplicationId,
    selectedApplication,
    lrn,
    sectionId,
    enrollmentType,
    createParentPortal,
    availableSections,
    isOverrideEnabled,
    currentEmployeeId
  ]);

  const handleConfirmConvert = async () => {
    if (!selectedApplicationId || sectionId === '' || !currentEmployeeId || currentEmployeeId <= 0) return;
    try {
      const isElem = isElementaryGradeLevel(selectedApplication?.gradeApplyingFor);
      const result = await enrollMutation.mutateAsync({
        applicationId: selectedApplicationId,
        lrn: lrn.trim(),
        employeeId: currentEmployeeId,
        sectionId: Number(sectionId),
        enrollmentType,
        createParentPortal: isElem || createParentPortal,
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

              {isSeniorHighGrade(selectedApplication.gradeApplyingFor) && (
                <>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="text-slate-500 uppercase text-[10px] font-semibold">Applied Track</div>
                    <div className="font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {selectedApplication.track?.trim() || 'No Track Selected'}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                    <div className="text-slate-500 uppercase text-[10px] font-semibold">Applied Strand</div>
                    <div className="font-bold text-purple-600 dark:text-purple-400 mt-1">
                      {selectedApplication.strand?.trim() || selectedApplication.track?.trim() || 'No Strand Selected'}
                    </div>
                  </div>
                </>
              )}

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


            {/* Dual Document Review & Verification Section */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-600" />
                  <span>Dual Document Verification (Digital + Physical Originals) ({appDetails?.documents?.length || 0})</span>
                </h4>
                {isLoadingDetails && <Loader2 className="w-3.5 h-3.5 text-purple-600 animate-spin" />}
              </div>

              {isLoadingDetails ? (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  <Loader2 className="w-6 h-6 text-purple-600 animate-spin mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading document verification status…</p>
                </div>
              ) : !appDetails?.documents || appDetails.documents.length === 0 ? (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-xs text-amber-800 dark:text-amber-300">
                  No admission document checklist initialized for this application.
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                  {appDetails.documents.map((doc) => {
                    const digStatus = doc.digitalStatus || (doc.status === 'Verified' ? 'Verified' : doc.status === 'Uploaded' ? 'Uploaded' : 'PendingUpload');
                    const origStatus = doc.originalStatus || 'NotSubmitted';

                    return (
                      <div
                        key={doc.id}
                        className="p-4 sm:p-5 bg-white dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800 rounded-2xl space-y-4 shadow-2xs hover:border-purple-500/30 transition-all"
                      >
                        {/* 1. File Info Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800/80 pb-3">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                              <h4 className="font-extrabold text-slate-900 dark:text-white text-sm tracking-tight">{doc.documentName}</h4>
                              {doc.version > 1 && (
                                <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-600 dark:text-purple-300 font-mono text-[10px] font-bold">
                                  V{doc.version}
                                </span>
                              )}
                            </div>
                            {doc.originalFilename ? (
                              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span className="font-semibold text-slate-700 dark:text-slate-300">📄 {doc.originalFilename}</span>
                                {doc.fileSize && <span>({(doc.fileSize / 1024).toFixed(1)} KB)</span>}
                                {doc.uploadedAt && <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>}
                              </div>
                            ) : (
                              <div className="text-[11px] text-slate-400 dark:text-slate-500 italic">No digital file uploaded yet</div>
                            )}
                          </div>
                        </div>

                        {/* 2. Dual Verification Stages Grid */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          
                          {/* Digital Copy Stage */}
                          <div className="p-4 bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-2.5 py-1 rounded-md bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 text-[10px] font-extrabold uppercase tracking-wider">
                                  Digital Copy
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                                    digStatus === 'Verified'
                                      ? 'bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300'
                                      : digStatus === 'Uploaded'
                                      ? 'bg-blue-100 dark:bg-blue-950/50 text-blue-800 dark:text-blue-300 border-blue-300'
                                      : digStatus === 'Rejected'
                                      ? 'bg-rose-100 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-300'
                                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300'
                                  }`}
                                >
                                  {digStatus}
                                </span>
                              </div>

                              {doc.remarks && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 italic bg-rose-50 dark:bg-rose-950/40 p-2 rounded border border-rose-200 dark:border-rose-900">
                                  Remarks: {doc.remarks}
                                </p>
                              )}
                            </div>

                            {/* Digital Action Controls */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
                              {doc.previewUrl && (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPreview(doc.id, doc.documentName, doc.contentType || '')}
                                  className="px-3 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-700 flex items-center gap-1.5 transition-colors"
                                >
                                  <Eye className="w-3.5 h-3.5 text-purple-600" />
                                  <span>Preview</span>
                                </button>
                              )}
                              {doc.downloadUrl && (
                                <button
                                  type="button"
                                  onClick={() => handleDownloadFile(doc.id)}
                                  className="px-3 py-1.5 text-xs font-semibold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 hover:bg-blue-100 rounded-lg border border-blue-200 dark:border-blue-900 flex items-center gap-1.5 transition-colors"
                                >
                                  <Download className="w-3.5 h-3.5 text-blue-600" />
                                  <span>Download</span>
                                </button>
                              )}
                              {digStatus !== 'Verified' && (doc.previewUrl || doc.originalFilename || digStatus === 'Uploaded') && (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => handleApproveDocument(doc.id, doc.documentName)}
                                    disabled={isSubmittingStatus}
                                    className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Verify Digital</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setRejectModalDoc({ id: doc.id, name: doc.documentName })}
                                    disabled={isSubmittingStatus}
                                    className="px-3 py-1.5 text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                    <span>Reject</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </div>

                          {/* Original Physical Copy Stage */}
                          <div className="p-4 bg-slate-50/70 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-3 flex flex-col justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between gap-2">
                                <span className="px-2.5 py-1 rounded-md bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 text-[10px] font-extrabold uppercase tracking-wider">
                                  Original Physical Copy
                                </span>
                                <span
                                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                                    origStatus === 'Verified'
                                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-300'
                                      : origStatus === 'Submitted'
                                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300 border-blue-300'
                                      : origStatus === 'Rejected'
                                      ? 'bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border-rose-300'
                                      : 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border-amber-300'
                                  }`}
                                >
                                  {origStatus === 'Verified'
                                    ? 'Original Verified'
                                    : origStatus === 'Submitted'
                                    ? 'Physical Copy Submitted'
                                    : origStatus === 'Rejected'
                                    ? 'Original Rejected'
                                    : 'Awaiting Original Submission'}
                                </span>
                              </div>

                              {doc.originalRemarks && (
                                <p className="text-[11px] text-amber-700 dark:text-amber-400 italic bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-900">
                                  Remarks: {doc.originalRemarks}
                                </p>
                              )}
                            </div>

                            {/* Original Action Controls */}
                            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/50 dark:border-slate-800/60">
                              {digStatus !== 'Verified' ? (
                                <span className="text-amber-600 dark:text-amber-400 font-semibold text-xs italic flex items-center gap-1.5 py-1">
                                  <Hourglass className="w-3.5 h-3.5 text-amber-500" />
                                  <span>Verify digital copy first</span>
                                </span>
                              ) : (
                                <>
                                  {origStatus !== 'Verified' && (
                                    <button
                                      type="button"
                                      onClick={() => handleVerifyOriginalDocument(doc.id, doc.documentName, 'Verified')}
                                      disabled={isSubmittingStatus}
                                      className="px-3 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-600 text-white rounded-lg flex items-center gap-1.5 shadow-2xs transition-colors"
                                    >
                                      <FileCheck className="w-3.5 h-3.5" />
                                      <span>Verify Original</span>
                                    </button>
                                  )}
                                  {origStatus !== 'Rejected' && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const remarks = prompt(`Enter rejection reason for physical original ${doc.documentName}:`);
                                        if (remarks !== null) handleVerifyOriginalDocument(doc.id, doc.documentName, 'Rejected', remarks);
                                      }}
                                      disabled={isSubmittingStatus}
                                      className="px-3 py-1.5 text-xs font-bold bg-slate-200 dark:bg-slate-800 hover:bg-rose-100 text-slate-700 dark:text-slate-300 hover:text-rose-700 rounded-lg flex items-center gap-1.5 transition-colors"
                                    >
                                      <FileX className="w-3.5 h-3.5" />
                                      <span>Reject Original</span>
                                    </button>
                                  )}
                                  {origStatus === 'Verified' && (
                                    <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-xs flex items-center gap-1.5 py-1">
                                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                      <span>Verified In-Person</span>
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </div>

                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Official Verification Slip Section */}
            <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="font-extrabold text-purple-950 dark:text-purple-200 text-xs flex items-center gap-1.5">
                  <Printer className="w-4 h-4 text-purple-600" />
                  <span>Official Registrar Verification Slip</span>
                </h4>
                <p className="text-[11px] text-purple-800 dark:text-purple-300 mt-0.5">
                  {selectedApplication.hasRegistrarVerificationSlip
                    ? `Issued: ${selectedApplication.verificationSlipNumber || 'REG-SLIP-2026'}`
                    : 'Required before Accounting Assessment & Billing'}
                </p>
              </div>

              {selectedApplication.hasRegistrarVerificationSlip ? (
                <button
                  type="button"
                  onClick={() => handleReprintVerificationSlip(selectedApplication.id)}
                  disabled={isSubmittingStatus}
                  className="px-3.5 py-2 text-xs font-bold bg-purple-800 hover:bg-purple-700 text-white rounded-lg flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print / Download Slip</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => handleGenerateVerificationSlip(selectedApplication.id)}
                  disabled={isSubmittingStatus}
                  className="px-3.5 py-2 text-xs font-extrabold bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white rounded-lg flex items-center gap-1.5 shadow-md"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Generate Verification Slip</span>
                </button>
              )}
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
                             <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                        Intelligent Section Allocation <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setIsOverrideEnabled(!isOverrideEnabled)}
                          className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border transition-colors ${
                            isOverrideEnabled
                              ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 hover:bg-slate-200'
                          }`}
                        >
                          {isOverrideEnabled ? '⚠ Override ON' : 'Override Capacity'}
                        </button>
                        <span className="text-[10px] font-extrabold text-purple-600 dark:text-purple-400 uppercase tracking-wide">
                          SY 2026-2027 • Rule-Based
                        </span>
                      </div>
                    </div>

                    {availableSectionsLoading ? (
                      <div className="p-8 text-center bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                        <Loader2 className="w-5 h-5 text-purple-600 animate-spin mx-auto" />
                        <p className="text-xs text-slate-500 font-medium">Evaluating section allocation & load balancing rules…</p>
                      </div>
                    ) : !availableSections || availableSections.length === 0 ? (
                      <div className="p-5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-xl text-xs space-y-2">
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold">
                          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>No eligible sections are currently available for this applicant.</span>
                        </div>
                        <p className="text-[11px] text-amber-700 dark:text-amber-400">Possible reasons for institutional gating:</p>
                        <ul className="list-disc list-inside text-[11px] text-amber-700 dark:text-amber-400 space-y-1 pl-1">
                          <li>No active School Year configured in System Settings</li>
                          <li>No active sections created for Grade Level: {selectedApplication.gradeApplyingFor}</li>
                          <li>Adviser teacher has not been assigned to available sections</li>
                          <li>All sections for this track/strand have reached maximum capacity</li>
                          <li>Subject and teacher allocations are incomplete</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
                        {availableSections.map((sec) => {
                          const isSelected = sectionId === sec.sectionId;
                          return (
                            <div
                              key={sec.sectionId}
                              className={`p-4 rounded-xl border transition-all text-xs space-y-3 ${
                                isSelected
                                  ? 'bg-purple-50/90 dark:bg-slate-800/90 border-purple-600 dark:border-purple-500 shadow-sm'
                                  : sec.isSelectable
                                  ? 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-purple-300'
                                  : 'bg-slate-50/60 dark:bg-slate-950/60 border-slate-200/60 dark:border-slate-800/60 opacity-80'
                              }`}
                            >
                              {/* Header */}
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{sec.sectionName}</h4>
                                    {sec.recommended && (
                                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] flex items-center gap-1 border border-amber-300 dark:border-amber-700">
                                        <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                        <span>Recommended</span>
                                      </span>
                                    )}
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                                      sec.readinessStatus === 'Ready'
                                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                                        : sec.readinessStatus === 'Warning'
                                        ? 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                                        : sec.readinessStatus === 'Full'
                                        ? 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950 dark:text-rose-300'
                                        : 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300'
                                    }`}>
                                      {sec.readinessStatus}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 mt-0.5">
                                    Adviser: <strong className="text-slate-700 dark:text-slate-300">{sec.adviserName}</strong> • {sec.trackCode}/{sec.strandCode}
                                  </p>
                                </div>

                                <div className="text-right shrink-0">
                                  <div className="font-mono font-bold text-slate-900 dark:text-white">
                                    {sec.currentEnrollment} / {sec.capacity}
                                  </div>
                                  <div className="text-[10px] text-slate-400 font-semibold">{sec.remainingSlots} slots left</div>
                                </div>
                              </div>

                              {/* Recommendation Reasons */}
                              {sec.recommended && sec.recommendationReasons.length > 0 && (
                                <div className="p-2.5 bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/60 rounded-lg space-y-1">
                                  <div className="text-[10px] font-extrabold text-amber-900 dark:text-amber-300 uppercase tracking-wider">
                                    Decision Engine Analysis:
                                  </div>
                                  <ul className="list-disc list-inside text-[11px] text-amber-800 dark:text-amber-300 space-y-0.5">
                                    {sec.recommendationReasons.map((r: string, i: number) => (
                                      <li key={i}>{r}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Reasons Not Selectable */}
                              {!sec.isSelectable && sec.reasonsNotSelectable.length > 0 && (
                                <div className="p-2.5 bg-rose-50/60 dark:bg-rose-950/30 border border-rose-200/80 dark:border-rose-900/60 rounded-lg space-y-1">
                                  <div className="text-[10px] font-extrabold text-rose-900 dark:text-rose-300 uppercase tracking-wider">
                                    Unavailable Reasons:
                                  </div>
                                  <ul className="list-disc list-inside text-[11px] text-rose-800 dark:text-rose-300 space-y-0.5">
                                    {sec.reasonsNotSelectable.map((r: string, i: number) => (
                                      <li key={i}>{r}</li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Action Bar */}
                              <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-800">
                                <button
                                  type="button"
                                  onClick={() => setPreviewSection(sec)}
                                  className="text-[11px] font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1"
                                >
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>Preview Subjects &amp; Timetable</span>
                                </button>

                                <button
                                  type="button"
                                  disabled={!sec.isSelectable && !isOverrideEnabled}
                                  onClick={() => setSectionId(sec.sectionId)}
                                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                                    isSelected
                                      ? 'bg-purple-700 text-white shadow-xs'
                                      : sec.isSelectable
                                      ? 'bg-slate-100 dark:bg-slate-800 hover:bg-purple-100 text-slate-800 dark:text-slate-200'
                                      : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                                  }`}
                                >
                                  {isSelected ? '✓ Selected' : sec.isSelectable ? 'Select Section' : 'Unavailable'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
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

                  {/* Portal Accounts Generation Selection (Institutional Business Rule) */}
                  <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                      Portal Accounts Generation <span className="text-rose-500">*</span>
                    </label>
                    <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
                      {/* Student Portal - Always Required */}
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="font-bold text-slate-900 dark:text-white">Student Portal</span>
                        </div>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                          Required
                        </span>
                      </div>

                      {/* Parent Portal - Mandatory for Grade 1-6, Optional for Grade 7-12 */}
                      {(() => {
                        const isElem = isElementaryGradeLevel(selectedApplication.gradeApplyingFor);
                        const isParentRequired = isElem;
                        const isChecked = isParentRequired || createParentPortal;

                        return (
                          <div className="space-y-2 pt-1.5 border-t border-slate-200/60 dark:border-slate-800">
                            <div className="flex items-center justify-between text-xs">
                              <label className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  disabled={isParentRequired}
                                  onChange={(e) => setCreateParentPortal(e.target.checked)}
                                  className="w-4 h-4 rounded border-slate-300 text-purple-600 focus:ring-purple-500 disabled:opacity-70 disabled:cursor-not-allowed"
                                />
                                <span className="font-bold text-slate-900 dark:text-white">
                                  Parent Portal
                                </span>
                              </label>
                              <span
                                className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${
                                  isParentRequired
                                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                                    : isChecked
                                    ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-800'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-300 dark:border-slate-700'
                                }`}
                              >
                                {isParentRequired ? 'Required (Grade 1–6)' : isChecked ? 'Enabled (Optional)' : 'Not Generated (Optional)'}
                              </span>
                            </div>

                            {isChecked && (
                              <div className="pl-6 space-y-2 pt-1">
                                {/* READ-ONLY VERIFIED PARENT INFORMATION CARD */}
                                <div className="p-2.5 bg-purple-50/60 dark:bg-slate-900/60 border border-purple-200/80 dark:border-purple-900/60 rounded-lg text-[11px] space-y-1">
                                  <div className="flex items-center justify-between">
                                    <span className="font-extrabold uppercase text-[10px] text-purple-900 dark:text-purple-300">
                                      Verified Parent Information
                                    </span>
                                    <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                                      <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0" />
                                      Verified During Admission
                                    </span>
                                  </div>
                                  <div className="grid grid-cols-2 gap-1 text-slate-700 dark:text-slate-300">
                                    <div>Parent Name: <strong>{selectedApplication.parentName || 'N/A'}</strong></div>
                                    <div>Relationship: <strong>{selectedApplication.relationship || 'Parent'}</strong></div>
                                    <div>Parent Contact: <strong>{selectedApplication.parentContact || 'N/A'}</strong></div>
                                    <div>
                                      Parent Email:{' '}
                                      {selectedApplication.parentEmail ? (
                                        <strong className="text-purple-700 dark:text-purple-300">{selectedApplication.parentEmail}</strong>
                                      ) : (
                                        <span className="text-rose-600 dark:text-rose-400 font-bold">Not Provided</span>
                                      )}
                                    </div>
                                  </div>
                                </div>

                                {/* TASK 4 & 5: Missing Parent Email Banner */}
                                {(!selectedApplication.parentEmail || !selectedApplication.parentEmail.trim()) && (
                                  <div className="p-2.5 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 rounded-lg text-xs space-y-1.5">
                                    <div className="flex items-start gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-[11px]">
                                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                                      <span>
                                        Admission Record Incomplete — Please coordinate with the Admissions Office. Parent Email must be completed before Parent Portal generation.
                                      </span>
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}

                          </div>
                        );
                      })()}

                    </div>
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
                    onClick={() => setIsSummaryModalOpen(true)}
                    disabled={!canSubmitConvert || enrollMutation.isPending || employeeLoading}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-md disabled:opacity-50 disabled:pointer-events-none"
                  >
                    Review Enrollment Decision
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

      {/* SECTION PREVIEW PANEL (Part 1) */}
      {previewSection && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-lg h-full shadow-2xl p-6 overflow-y-auto space-y-5 animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-900 dark:text-white">{previewSection.sectionName}</h3>
                <p className="text-xs text-purple-600 font-semibold">{previewSection.gradeLevelName} • SY {previewSection.schoolYear}</p>
              </div>
              <button onClick={() => setPreviewSection(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="text-slate-400 uppercase text-[9px] font-extrabold">Adviser</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1 truncate">{previewSection.adviserName}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="text-slate-400 uppercase text-[9px] font-extrabold">Capacity</div>
                <div className="font-bold text-slate-900 dark:text-white mt-1">{previewSection.currentEnrollment} / {previewSection.capacity}</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl">
                <div className="text-slate-400 uppercase text-[9px] font-extrabold">Remaining</div>
                <div className="font-bold text-emerald-600 dark:text-emerald-400 mt-1">{previewSection.remainingSlots} Slots</div>
              </div>
            </div>

            {/* Subject Roster */}
            <div className="space-y-3">
              <h4 className="font-extrabold text-xs text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                <span>Assigned Subjects &amp; Teachers ({previewSection.subjects.length})</span>
                <span className="text-[10px] text-purple-600 font-bold">{previewSection.assignedTeachers}/{previewSection.requiredTeachers} Teachers</span>
              </h4>

              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {previewSection.subjects.map((sub) => (
                  <div key={sub.subjectId} className="p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between text-xs">
                    <div>
                      <div className="font-bold text-slate-900 dark:text-white">{sub.subjectCode} - {sub.subjectName}</div>
                      <div className="text-[11px] text-slate-500">{sub.units} Units</div>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.hasTeacher ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                      }`}>
                        {sub.teacherName}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex justify-end">
              <button onClick={() => setPreviewSection(null)} className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold">
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGISTRAR DECISION SUMMARY CONFIRMATION MODAL (Part 3) */}
      {isSummaryModalOpen && selectedApplication && selectedAvailableSec && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white">Registrar Decision Summary</h3>
              <button onClick={() => setIsSummaryModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-purple-50/70 dark:bg-slate-800/80 border border-purple-200 dark:border-purple-800 rounded-xl space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold">Applicant Name</span>
                  <div className="font-bold text-slate-900 dark:text-white">{selectedApplication.fullName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold">Selected Section</span>
                  <div className="font-bold text-purple-700 dark:text-purple-300">{selectedAvailableSec.sectionName}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold">School Year</span>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{selectedAvailableSec.schoolYear}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-extrabold">Adviser</span>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">{selectedAvailableSec.adviserName}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-purple-200/60 dark:border-slate-700 flex justify-between text-[11px]">
                <span>Current Capacity: <strong>{selectedAvailableSec.currentEnrollment}/{selectedAvailableSec.capacity}</strong></span>
                <span>Slots After Assignment: <strong className="text-emerald-600">{Math.max(0, selectedAvailableSec.remainingSlots - 1)} Slots</strong></span>
              </div>
            </div>

            {/* Checklist */}
            <div className="space-y-2 text-xs">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">Automated Institutional Pipeline Execution:</div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] text-slate-700 dark:text-slate-300 font-medium">
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /><span>Create Student Record</span></div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /><span>Create Enrollment Record</span></div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /><span>Create Academic History</span></div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /><span>Activate Student Portal</span></div>
                {(isElementaryGradeLevel(selectedApplication.gradeApplyingFor) || createParentPortal) ? (
                  <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /><span>Activate Parent Portal</span></div>
                ) : (
                  <div className="flex items-center gap-1.5 text-slate-400"><X className="w-3.5 h-3.5 text-slate-400" /><span>Parent Portal (Not Generated - Optional)</span></div>
                )}

                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /><span>Assign Grades &amp; Subjects</span></div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /><span>Link Financial Account</span></div>
                <div className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /><span>Archive Application</span></div>
              </div>
            </div>


            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex justify-end space-x-2">
              <button onClick={() => setIsSummaryModalOpen(false)} className="px-4 py-2 text-xs font-semibold text-slate-500">
                Cancel
              </button>
              <button
                onClick={() => {
                  setIsSummaryModalOpen(false);
                  handleConfirmConvert();
                }}
                disabled={enrollMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md"
              >
                {enrollMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Complete Official Enrollment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Document Preview Modal */}
      <DocumentViewerModal
        isOpen={!!previewFile}
        onClose={() => setPreviewFile(null)}
        documentId={previewFile?.id ?? null}
        documentName={previewFile?.name ?? ''}
        contentType={previewFile?.type}
      />

      {/* Rejection Reason Modal */}
      {rejectModalDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
              <FileX className="w-6 h-6" />
              <h3 className="font-extrabold text-base">Request Document Replacement</h3>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Please enter the reason for rejecting <strong className="text-slate-900 dark:text-white">{rejectModalDoc.name}</strong>. This remark will be sent to the applicant via notification and email.
            </p>

            <div className="space-y-1">
              <label htmlFor="rejection-reason" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Rejection Remarks / Instruction <span className="text-rose-500">*</span>
              </label>
              <textarea
                id="rejection-reason"
                rows={3}
                value={rejectionRemarks}
                onChange={(e) => setRejectionRemarks(e.target.value)}
                placeholder="e.g. Please upload a clearer scanned copy of the document."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button
                onClick={() => {
                  setRejectModalDoc(null);
                  setRejectionRemarks('');
                }}
                className="px-4 py-2 text-xs font-semibold text-slate-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRejectDocument}
                disabled={isSubmittingStatus || !rejectionRemarks.trim()}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md disabled:opacity-50"
              >
                {isSubmittingStatus && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
