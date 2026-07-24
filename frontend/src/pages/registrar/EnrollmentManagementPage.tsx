import React, { useMemo } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { StatusChip } from '../../components/data-display/StatusChip';
import { FolderPlus, CheckCircle, XCircle, Check, X, Loader2 } from 'lucide-react';
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

export const EnrollmentManagementPage: React.FC = () => {
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
    };
  }, [applications]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Enrollment Applications Queue</h1>
        <p className="text-sm text-slate-500 mt-1">Review student admissions applications and process approvals or rejections.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Pending Review" value={isLoading ? '…' : `${counts.pending} Applications`} icon={FolderPlus} />
        <StatCard title="Approved" value={isLoading ? '…' : `${counts.approved} Applications`} icon={CheckCircle} iconBgColor="bg-emerald-500/10 text-emerald-500" />
        <StatCard title="Rejected" value={isLoading ? '…' : `${counts.rejected} Applications`} icon={XCircle} iconBgColor="bg-rose-500/10 text-rose-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">App Ref #</th>
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
                <tr key={app.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{app.applicationNumber}</td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{app.fullName}</td>
                  <td className="px-6 py-4 text-xs text-slate-600 dark:text-slate-300">{app.gradeApplyingFor}</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{new Date(app.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4"><StatusChip status={app.status} type="enrollment" /></td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {app.status === 'Pending' ? (
                      <>
                        <button
                          onClick={() => approveMutation.mutate(app.id)}
                          disabled={approveMutation.isPending || rejectMutation.isPending}
                          aria-label={`Approve application from ${app.fullName}`}
                          title="Approve"
                          className="p-1.5 text-emerald-500 hover:bg-emerald-950/40 rounded-md disabled:opacity-50"
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
                          title="Reject"
                          className="p-1.5 text-rose-500 hover:bg-rose-950/40 rounded-md disabled:opacity-50"
                        >
                          {rejectMutation.isPending && rejectMutation.variables === app.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <X className="w-4 h-4" />
                          )}
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-400">—</span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
