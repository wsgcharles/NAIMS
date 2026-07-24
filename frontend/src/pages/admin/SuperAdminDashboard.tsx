import React from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/data-display/StatCard';
import { Users, UserCheck, Layers, BookOpen, Plus, Shield, TrendingUp } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';
import { toast } from 'sonner';
import { useAdminApi } from '../../hooks/useAdminApi';

export const SuperAdminDashboard: React.FC = () => {
  const { useDashboardOverview } = useAdminApi();
  const { data, isLoading, isError } = useDashboardOverview();

  const pipelineData = data
    ? [
        { name: 'Pending', count: data.pendingApplications },
        { name: 'Approved', count: data.approvedApplications },
        { name: 'Rejected', count: data.rejectedApplications },
      ]
    : [];

  const roleData = (data?.employeesByRole ?? []).map((r) => ({ name: r.role, count: r.count }));

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Super Administrator Portal
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time operational metrics and school performance indicators.
            {data?.activeAcademicYear && ` · ${data.activeAcademicYear}`}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() =>
              toast.info('Audit log export requires the Audit Logs module, which has no backend support yet.')
            }
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <Shield className="w-4 h-4 mr-2 text-emerald-600" />
            Export Audit Report
          </button>
          <Link
            to="/admin/employees"
            className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 transition-colors shadow-md shadow-blue-500/20"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Employee
          </Link>
        </div>
      </div>

      {isError && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 text-center">
          Unable to reach the EduCore server to load dashboard metrics. Please check your connection and try again.
        </div>
      )}

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={isLoading ? '…' : `${data?.totalStudents ?? 0}`}
          description={isLoading ? '' : `${data?.activeStudents ?? 0} active`}
          icon={UserCheck}
          iconBgColor="bg-blue-500/10 text-blue-600 dark:text-blue-400"
        />
        <StatCard
          title="Total Employees"
          value={isLoading ? '…' : `${data?.totalEmployees ?? 0}`}
          description={isLoading ? '' : `${data?.activeEmployees ?? 0} active`}
          icon={Users}
          iconBgColor="bg-purple-500/10 text-purple-600 dark:text-purple-400"
        />
        <StatCard
          title="Active Sections"
          value={isLoading ? '…' : `${data?.totalSections ?? 0}`}
          description="Across all grade levels"
          icon={Layers}
          iconBgColor="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        />
        <StatCard
          title="Active Subjects"
          value={isLoading ? '…' : `${data?.totalSubjects ?? 0}`}
          description="In the curriculum catalog"
          icon={BookOpen}
          iconBgColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
        />
      </div>

      {/* Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Enrollment Pipeline</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Applications by current status</p>
            </div>
            <TrendingUp className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="h-64 w-full">
            {isLoading ? (
              <div className="h-full w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pipelineData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#2563eb" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-1">Employees by Role</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">Current staffing breakdown</p>
          <div className="h-64 w-full">
            {isLoading ? (
              <div className="h-full w-full rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleData}>
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} interval={0} angle={-20} textAnchor="end" height={50} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Activity Log — no backend module exists yet */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center mb-2">
          <Shield className="w-4 h-4 mr-2 text-blue-500" />
          Recent System Activity Logs
        </h3>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-6">
          An institutional audit log is not yet available from the backend — this section will populate once that
          module is built.
        </p>
      </div>
    </div>
  );
};
