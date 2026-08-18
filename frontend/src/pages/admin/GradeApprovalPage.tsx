import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  Search,
  Loader2,
  AlertTriangle,
  Send,
  Eye,
  FileText,
} from 'lucide-react';
import { useAdminApi } from '../../hooks/useAdminApi';
import type { GradeApprovalItem } from '../../types';

export const GradeApprovalPage: React.FC = () => {
  const {
    usePendingGradeApprovals,
    useAllGradesForApproval,
    useApproveGradeMutation,
    useRejectGradeMutation,
    useReleaseClassGradesMutation,
  } = useAdminApi();

  const [activeTab, setActiveTab] = useState<'pending' | 'all' | 'approved' | 'released' | 'rejected'>('pending');
  const [searchTerm, setSearchTerm] = useState('');

  // Fetch data
  const { data: pendingItems, isLoading: isPendingLoading } = usePendingGradeApprovals();
  const { data: allItems, isLoading: isAllLoading } = useAllGradesForApproval(
    undefined,
    activeTab === 'pending' ? 'Submitted' : activeTab === 'all' ? undefined : activeTab
  );

  const approveGradeMutation = useApproveGradeMutation();
  const rejectGradeMutation = useRejectGradeMutation();
  const releaseClassMutation = useReleaseClassGradesMutation();

  // Rejection modal state
  const [rejectingItem, setRejectingItem] = useState<GradeApprovalItem | null>(null);
  const [rejectionRemarks, setRejectionRemarks] = useState('');

  // Details modal state
  const [viewingItem, setViewingItem] = useState<GradeApprovalItem | null>(null);

  const displayedItems: GradeApprovalItem[] = (
    activeTab === 'pending' ? pendingItems || [] : allItems || []
  ).filter(
    (item) =>
      item.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.studentNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.subjectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sectionName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingItem || !rejectionRemarks.trim()) return;

    rejectGradeMutation.mutate(
      { gradeId: rejectingItem.gradeId, remarks: rejectionRemarks.trim() },
      {
        onSuccess: () => {
          setRejectingItem(null);
          setRejectionRemarks('');
        },
      }
    );
  };

  const getStatusBadge = (statusStr: string) => {
    switch (statusStr) {
      case 'Submitted':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
            <Clock className="w-3 h-3 mr-1 animate-pulse" /> Pending Review
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-700">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Approved
          </span>
        );
      case 'Released':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700">
            <Sparkles className="w-3 h-3 mr-1" /> Released to Portals
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-700">
            <XCircle className="w-3 h-3 mr-1" /> Returned for Revision
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            Draft
          </span>
        );
    }
  };

  const isLoading = activeTab === 'pending' ? isPendingLoading : isAllLoading;

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-full">
              Academic Governance Subsystem
            </span>
          </div>
          <h1 className="text-3xl font-black text-purple-950 dark:text-white tracking-tight mt-1">
            Academic Head Grade Approvals
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Review, approve, return for revision, and officially release submitted faculty grades.
          </p>
        </div>
      </div>

      {/* Tabs & Search Filter Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 rounded-3xl shadow-xs">
        <div className="flex items-center space-x-1 overflow-x-auto custom-scrollbar pb-1 md:pb-0">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center shrink-0 ${
              activeTab === 'pending'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-3.5 h-3.5 mr-1.5" /> Pending Review ({pendingItems?.length || 0})
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center shrink-0 ${
              activeTab === 'all'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            All Submissions
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center shrink-0 ${
              activeTab === 'approved'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Approved
          </button>
          <button
            onClick={() => setActiveTab('released')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center shrink-0 ${
              activeTab === 'released'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Released to Portals
          </button>
          <button
            onClick={() => setActiveTab('rejected')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center shrink-0 ${
              activeTab === 'rejected'
                ? 'bg-purple-900 text-white shadow-md shadow-purple-900/20'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Returned for Revision
          </button>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search student, teacher, subject..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs text-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
          </div>
        ) : displayedItems.length === 0 ? (
          <div className="p-12 text-center text-sm text-slate-500">
            No grade submissions found matching the current filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 border-b border-slate-100 dark:border-slate-800 uppercase font-bold text-[11px] tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Subject &amp; Section</th>
                  <th className="px-6 py-3.5">Teacher</th>
                  <th className="px-6 py-3.5">Prelim / Mid / Final</th>
                  <th className="px-6 py-3.5">Final Average</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {displayedItems.map((item) => (
                  <tr
                    key={item.gradeId}
                    className="hover:bg-purple-50/40 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white text-sm">{item.studentName}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{item.studentNumber}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 dark:text-white">{item.subjectName}</p>
                      <p className="text-[11px] text-slate-500">{item.sectionName} ({item.gradeLevelName})</p>
                    </td>
                    <td className="px-6 py-4 text-slate-700 dark:text-slate-300 font-medium">
                      {item.teacherName}
                    </td>
                    <td className="px-6 py-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                      {item.prelimGrade ?? '—'} / {item.midtermGrade ?? '—'} / {item.finalGrade ?? '—'}
                    </td>
                    <td className="px-6 py-4 font-mono font-bold text-purple-900 dark:text-purple-300 text-sm">
                      {item.finalAverage != null ? item.finalAverage.toFixed(2) : '—'}
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(item.status)}</td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <button
                        onClick={() => setViewingItem(item)}
                        className="inline-flex items-center px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5 mr-1" /> View
                      </button>

                      {item.status === 'Submitted' && (
                        <>
                          <button
                            onClick={() => approveGradeMutation.mutate({ gradeId: item.gradeId })}
                            disabled={approveGradeMutation.isPending}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-xs transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Approve
                          </button>
                          <button
                            onClick={() => {
                              setRejectingItem(item);
                              setRejectionRemarks('');
                            }}
                            className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 rounded-lg transition-colors"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" /> Reject
                          </button>
                        </>
                      )}

                      {item.status === 'Approved' && (
                        <button
                          onClick={() => releaseClassMutation.mutate(item.teachingAssignmentId)}
                          disabled={releaseClassMutation.isPending}
                          className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-xs transition-all"
                        >
                          <Send className="w-3.5 h-3.5 mr-1" /> Release Class Grades
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-rose-600 dark:text-rose-400 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Return Grades for Revision
              </h3>
              <button
                onClick={() => setRejectingItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300">
              Return submitted grades for <strong>{rejectingItem.studentName}</strong> ({rejectingItem.subjectName}) to teacher <strong>{rejectingItem.teacherName}</strong>.
            </p>

            <form onSubmit={handleConfirmReject} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Revision Remarks &amp; Feedback <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Please review computation for Mathematics prelim exam."
                  value={rejectionRemarks}
                  onChange={(e) => setRejectionRemarks(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingItem(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={rejectGradeMutation.isPending}
                  className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-md inline-flex items-center"
                >
                  {rejectGradeMutation.isPending && <Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" />}
                  Confirm Return
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Details View Modal */}
      {viewingItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center">
                <FileText className="w-5 h-5 mr-2 text-purple-700 dark:text-purple-400" />
                Grade Record Details
              </h3>
              <button
                onClick={() => setViewingItem(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="text-slate-400 font-semibold block">Student</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewingItem.studentName}</span>
                  <p className="text-[11px] text-slate-500 font-mono">{viewingItem.studentNumber}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Faculty Teacher</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewingItem.teacherName}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Subject &amp; Section</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewingItem.subjectName}</span>
                  <p className="text-[11px] text-slate-500">{viewingItem.sectionName}</p>
                </div>
                <div>
                  <span className="text-slate-400 font-semibold block">Academic Year / Semester</span>
                  <span className="font-bold text-slate-900 dark:text-white">{viewingItem.academicYear}</span>
                  <p className="text-[11px] text-slate-500">{viewingItem.semester}</p>
                </div>
              </div>

              <div className="p-3.5 bg-purple-50 dark:bg-purple-950/40 rounded-2xl border border-purple-100 dark:border-purple-900/50 space-y-2">
                <span className="font-bold text-purple-950 dark:text-purple-200 block text-xs">Grade Breakdown</span>
                <div className="grid grid-cols-4 gap-2 text-center font-mono">
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900">
                    <span className="text-[10px] text-slate-400 block font-sans">Prelim</span>
                    <span className="font-bold text-slate-900 dark:text-white">{viewingItem.prelimGrade ?? '—'}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900">
                    <span className="text-[10px] text-slate-400 block font-sans">Midterm</span>
                    <span className="font-bold text-slate-900 dark:text-white">{viewingItem.midtermGrade ?? '—'}</span>
                  </div>
                  <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-purple-100 dark:border-purple-900">
                    <span className="text-[10px] text-slate-400 block font-sans">Final</span>
                    <span className="font-bold text-slate-900 dark:text-white">{viewingItem.finalGrade ?? '—'}</span>
                  </div>
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/80 rounded-xl border border-purple-300 dark:border-purple-700">
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 block font-sans font-bold">Average</span>
                    <span className="font-black text-purple-950 dark:text-white">{viewingItem.finalAverage != null ? viewingItem.finalAverage.toFixed(2) : '—'}</span>
                  </div>
                </div>
              </div>

              {viewingItem.reviewerRemarks && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-xs">
                  <span className="font-bold text-amber-900 dark:text-amber-300 block mb-1">Academic Head Remarks:</span>
                  <p className="text-amber-800 dark:text-amber-200">{viewingItem.reviewerRemarks}</p>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setViewingItem(null)}
                className="px-4 py-2 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-xl shadow-xs"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
