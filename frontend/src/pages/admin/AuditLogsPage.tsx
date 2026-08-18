import React, { useMemo, useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { Shield, Lock, Eye, Download, Search } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminApi } from '../../hooks/useAdminApi';

export const AuditLogsPage: React.FC = () => {
  const { useAuditLogs } = useAdminApi();
  const { data: auditData, isLoading, isError, refetch } = useAuditLogs();

  const [search, setSearch] = useState('');

  const auditEvents = auditData?.items ?? [];
  const totalCount = auditData?.totalCount ?? auditEvents.length;

  const filteredEvents = useMemo(() => {
    if (!search.trim()) return auditEvents;
    const q = search.toLowerCase();
    return auditEvents.filter(
      (log) =>
        (log.userEmail?.toLowerCase() || '').includes(q) ||
        log.action.toLowerCase().includes(q) ||
        (log.entityType?.toLowerCase() || '').includes(q) ||
        (log.ipAddress?.toLowerCase() || '').includes(q)
    );
  }, [auditEvents, search]);

  const handleExportCSV = () => {
    if (auditEvents.length === 0) {
      toast.error('No audit log entries available to export.');
      return;
    }
    const headers = ['Log ID', 'Action', 'User Email', 'Entity Type', 'IP Address', 'Timestamp'];
    const rows = auditEvents.map((l) => [
      l.id,
      `"${l.action}"`,
      `"${l.userEmail || 'System'}"`,
      `"${l.entityType || 'N/A'}"`,
      l.ipAddress || '127.0.0.1',
      l.timestamp,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `NoahsAcademy_SecurityAuditLogs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Security audit log exported to CSV.');
  };

  return (
    <div className="space-y-8 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-purple-950 dark:text-white tracking-tight">
            Security & Audit Log Stream
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Immutable security event records, user authentication trails, and system modifications in Arca South Campus.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center px-4 py-2.5 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-purple-50 transition-colors shadow-xs"
        >
          <Download className="w-4 h-4 mr-2 text-emerald-600 inline" />
          Export Security Audit CSV
        </button>
      </div>

      {isError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between">
          <span>Failed to load security audit log stream from EduCore API server.</span>
          <button onClick={() => refetch()} className="underline hover:text-rose-700">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Total Events Logged"
          value={isLoading ? '…' : `${totalCount}`}
          description="System Audit Events"
          icon={Shield}
          iconBgColor="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
        />
        <StatCard
          title="Security Alerts (24h)"
          value="0 Incidents"
          description="Clean Health Status"
          icon={Lock}
          iconBgColor="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
        />
        <StatCard
          title="Active Sessions"
          value={isLoading ? '…' : 'Active'}
          description="Authenticated Tokens"
          icon={Eye}
          iconBgColor="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
        />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter audit stream by IP, action, or user..."
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-medium text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-600/20 focus:border-purple-600"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold tracking-wider border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">Log ID</th>
                <th className="px-6 py-3.5">Action Performed</th>
                <th className="px-6 py-3.5">Authenticated User</th>
                <th className="px-6 py-3.5">IP Address</th>
                <th className="px-6 py-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-400 font-medium">
                    Loading audit stream from backend database…
                  </td>
                </tr>
              ) : filteredEvents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-xs text-slate-400 font-medium">
                    {search ? `No audit events found matching "${search}".` : 'No audit log entries found in database.'}
                  </td>
                </tr>
              ) : (
                filteredEvents.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-purple-700 dark:text-purple-400">
                      LOG-{log.id.toString().padStart(4, '0')}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                      {log.action}
                      {log.details && <div className="text-[11px] text-slate-400 font-mono mt-0.5">{log.details}</div>}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">{log.userEmail || 'System / Anonymous'}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-400">{log.ipAddress || '127.0.0.1'}</td>
                    <td className="px-6 py-4 font-mono text-xs text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
