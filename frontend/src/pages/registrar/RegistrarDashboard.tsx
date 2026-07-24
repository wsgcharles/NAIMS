import React, { useMemo } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { StatusChip } from '../../components/data-display/StatusChip';
import { FolderPlus, CheckCircle, XCircle, Hourglass, ArrowRight, Check, X, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useRegistrarApi } from '../../hooks/useRegistrarApi';

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </td>
    ))}
  </tr>
);

export const RegistrarDashboard: React.FC = () => {
  const { useEnrollmentApplications, useApproveApplicationMutation, useRejectApplicationMutation } =
    useRegistrarApi();

  const { data: applications, isLoading, isError } = useEnrollmentApplications();
  const approveMutation = useApproveApplicationMutation();
  const rejectMutation = useRejectApplicationMutation();

  const counts = useMemo(() => {
    const list = applications ?? [];
    return {
      pending: list.filter((a) => a.status === 'Pending').length,
      approved: list.filter((a) => a.status === 'Approved').length,
      rejected: list.filter((a) => a.status === 'Rejected').length,
      cancelled: list.filter((a) => a.status === 'Cancelled').length,
    };
  }, [applications]);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Registrar Processing Portal
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Enrollment application queue, section assignments, and student document audit.
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Pending Queue"
          value={isLoading ? '…' : `${counts.pending} Applications`}
          description="Awaiting registrar review"
          icon={Hourglass}
          iconBgColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
        <StatCard
          title="Approved"
          value={isLoading ? '…' : `${counts.approved} Applications`}
          description="Cleared for enrollment"
          icon={CheckCircle}
          iconBgColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Rejected"
          value={isLoading ? '…' : `${counts.rejected} Applications`}
          description="Did not meet requirements"
          icon={XCircle}
          iconBgColor="bg-rose-500/10 text-rose-600 dark:text-rose-400"
        />
        <StatCard
          title="Cancelled"
          value={isLoading ? '…' : `${counts.cancelled} Applications`}
          description="Withdrawn by applicant"
          icon={FolderPlus}
          iconBgColor="bg-slate-500/10 text-slate-600 dark:text-slate-400"
        />
      </div>

      {/* Applications Processing Queue Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Enrollment Applications Queue
            </h3>
            <p className="text-xs text-slate-500">
              Quick triage — approve, reject, or open the Applicant Workspace to enroll
            </p>
          </div>
          <Link
            to="/registrar/applicants"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center hover:underline"
          >
            <span>Open Applicant Workspace</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">App Reference</th>
                <th className="px-6 py-3.5">Applicant Name</th>
                <th className="px-6 py-3.5">Grade Applying For</th>
                <th className="px-6 py-3.5">Submission Date</th>
                <th className="px-6 py-3.5">Current Status</th>
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
              {!isLoading && !isError && applications && applications.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-sm text-slate-500">
                    No enrollment applications have been submitted yet.
                  </td>
                </tr>
              )}
              {!isLoading &&
                !isError &&
                applications?.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                      {app.applicationNumber}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{app.fullName}</td>
                    <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{app.gradeApplyingFor}</td>
                    <td className="px-6 py-4 text-slate-500 text-xs">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <StatusChip status={app.status} type="enrollment" />
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      {app.status === 'Pending' && (
                        <>
                          <button
                            onClick={() => approveMutation.mutate(app.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            aria-label={`Approve application from ${app.fullName}`}
                            title="Approve Application"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-md disabled:opacity-50"
                          >
                            {approveMutation.isPending && approveMutation.variables === app.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Check className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate(app.id)}
                            disabled={approveMutation.isPending || rejectMutation.isPending}
                            aria-label={`Reject application from ${app.fullName}`}
                            title="Reject Application"
                            className="p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md disabled:opacity-50"
                          >
                            {rejectMutation.isPending && rejectMutation.variables === app.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <X className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}
                      {app.status === 'Approved' && (
                        <Link
                          to="/registrar/applicants"
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                        >
                          Enroll in Workspace →
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
