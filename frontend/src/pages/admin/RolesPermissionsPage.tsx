import React, { useMemo, useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { Shield, Users, X, Power, Loader2 } from 'lucide-react';
import { useAdminApi } from '../../hooks/useAdminApi';
import type { UserRoleString } from '../../types';

const ROLE_ACCESS_SUMMARY: Record<UserRoleString, string> = {
  SuperAdministrator: 'Full unrestricted root access',
  Administrator: 'Staff, academic & system setup',
  Principal: 'School-wide oversight & reporting',
  Registrar: 'Applications, student roster & sections',
  Teacher: 'Roster, attendance & gradebook entry',
  Accountant: 'Tuition billing, payments & receipts',
  Student: 'Self-service academic portal',
  Parent: 'Guardian academic & billing portal',
};

const ROLES: UserRoleString[] = [
  'SuperAdministrator',
  'Administrator',
  'Principal',
  'Registrar',
  'Teacher',
  'Accountant',
  'Student',
  'Parent',
];

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </td>
    ))}
  </tr>
);

export const RolesPermissionsPage: React.FC = () => {
  const { useUsers, useToggleUserStatusMutation } = useAdminApi();
  const { data: users, isLoading, isError } = useUsers();
  const toggleMutation = useToggleUserStatusMutation();

  const [drillDownRole, setDrillDownRole] = useState<UserRoleString | null>(null);

  const countsByRole = useMemo(() => {
    const map = new Map<string, number>();
    for (const u of users ?? []) map.set(u.role, (map.get(u.role) ?? 0) + 1);
    return map;
  }, [users]);

  const usersInDrillDown = useMemo(() => {
    if (!drillDownRole) return [];
    return (users ?? []).filter((u) => u.role === drillDownRole);
  }, [users, drillDownRole]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">User Roles Directory</h1>
        <p className="text-sm text-slate-500 mt-1">
          Real account counts per role. Fine-grained permission editing isn't backed by the API yet — role
          assignment itself is fixed per employee position (see Employee Directory).
        </p>
      </div>

      {isError && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 text-center">
          Unable to reach the EduCore server to load user accounts. Please check your connection and try again.
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <StatCard title="Total User Roles" value="8 Defined Roles" icon={Shield} />
        <StatCard title="Total User Accounts" value={isLoading ? '…' : `${(users ?? []).length}`} icon={Users} iconBgColor="bg-purple-500/10 text-purple-500" />
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
            <tr>
              <th className="px-6 py-3.5">User Role</th>
              <th className="px-6 py-3.5">Active Accounts</th>
              <th className="px-6 py-3.5">Access Summary</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {isLoading && <SkeletonRow cols={4} />}
            {!isLoading &&
              ROLES.map((role) => (
                <tr key={role} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                  <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{role}</td>
                  <td className="px-6 py-4 font-mono text-xs font-bold text-purple-700 dark:text-purple-400">{countsByRole.get(role) ?? 0} Assigned</td>
                  <td className="px-6 py-4 text-xs text-slate-500">{ROLE_ACCESS_SUMMARY[role]}</td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setDrillDownRole(role)}
                      disabled={!(countsByRole.get(role) ?? 0)}
                      className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 disabled:opacity-40"
                    >
                      View Users
                    </button>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>

      {drillDownRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">{drillDownRole} Accounts</h3>
              <button onClick={() => setDrillDownRole(null)} aria-label="Close" className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="max-h-80 overflow-y-auto space-y-2">
              {usersInDrillDown.map((u) => (
                <div key={u.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{u.email}</div>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-[10px] font-bold rounded-full ${u.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <button
                    onClick={() => toggleMutation.mutate(u.id)}
                    disabled={toggleMutation.isPending}
                    title={u.isActive ? 'Deactivate' : 'Activate'}
                    aria-label={`Toggle status for ${u.email}`}
                    className="p-1.5 text-slate-400 hover:text-amber-500 rounded-md disabled:opacity-50"
                  >
                    {toggleMutation.isPending && toggleMutation.variables === u.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Power className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
            <div className="pt-2 flex justify-end">
              <button onClick={() => setDrillDownRole(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
