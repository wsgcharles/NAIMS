import React from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { Shield, Lock, Eye, Download, Search } from 'lucide-react';
import { toast } from 'sonner';

export const AuditLogsPage: React.FC = () => {
  const auditEvents = [
    { id: 'LOG-9901', action: 'User Authentication Success', user: 'admin@noahsacademy.edu', ip: '192.168.1.45', timestamp: '2026-07-22 21:42:01', severity: 'Info' },
    { id: 'LOG-9902', action: 'Permission Matrix Updated', user: 'superadmin', ip: '192.168.1.10', timestamp: '2026-07-22 20:15:22', severity: 'Warning' },
    { id: 'LOG-9903', action: 'Batch Grade Lockdown Triggered', user: 'Dr. Robert Vance', ip: '192.168.1.88', timestamp: '2026-07-22 18:30:00', severity: 'Critical' },
    { id: 'LOG-9904', action: 'Student Record Exported (CSV)', user: 'Marcus Sterling', ip: '192.168.1.12', timestamp: '2026-07-22 16:10:45', severity: 'Info' },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Security & Audit Log Stream</h1>
          <p className="text-sm text-slate-500 mt-1">Immutable security event records, user authentication trails, and system modifications.</p>
        </div>

        <button onClick={() => toast.success('Exporting Audit Log Stream (CSV)...')} className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50">
          <Download className="w-4 h-4 mr-2 text-emerald-500 inline" /> Export Security Audit CSV
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Total Events Logged" value="14,250" icon={Shield} />
        <StatCard title="Security Alerts (24h)" value="0 Incidents" icon={Lock} iconBgColor="bg-emerald-500/10 text-emerald-500" />
        <StatCard title="Active Sessions" value="48 Users" icon={Eye} iconBgColor="bg-purple-500/10 text-purple-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="relative w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Filter audit stream by IP or user..." className="w-full pl-9 pr-3 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs" />
          </div>
        </div>

        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">Log ID</th>
              <th className="px-6 py-3.5">Action Performed</th>
              <th className="px-6 py-3.5">Authenticated User</th>
              <th className="px-6 py-3.5">IP Address</th>
              <th className="px-6 py-3.5">Timestamp</th>
              <th className="px-6 py-3.5 text-right">Severity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {auditEvents.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{log.id}</td>
                <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{log.action}</td>
                <td className="px-6 py-4 text-xs text-slate-500">{log.user}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-400">{log.ip}</td>
                <td className="px-6 py-4 font-mono text-xs text-slate-500">{log.timestamp}</td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full ${
                    log.severity === 'Critical' ? 'bg-rose-100 text-rose-800' : log.severity === 'Warning' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {log.severity}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
