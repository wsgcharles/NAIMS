import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { UserRoleString } from '../types';

export type Permission =
  | 'Employee.Read' | 'Employee.Create' | 'Employee.Edit' | 'Employee.Delete'
  | 'Enrollment.Read' | 'Enrollment.Approve' | 'Enrollment.Reject'
  | 'Grade.Read' | 'Grade.Input' | 'Grade.Lock'
  | 'Accounting.Read' | 'Accounting.Payment' | 'Accounting.Receipt'
  | 'System.Settings' | 'System.AuditLogs';

// Permission mapping table based on roles
const rolePermissionMap: Record<UserRoleString, Permission[]> = {
  SuperAdministrator: [
    'Employee.Read', 'Employee.Create', 'Employee.Edit', 'Employee.Delete',
    'Enrollment.Read', 'Enrollment.Approve', 'Enrollment.Reject',
    'Grade.Read', 'Grade.Input', 'Grade.Lock',
    'Accounting.Read', 'Accounting.Payment', 'Accounting.Receipt',
    'System.Settings', 'System.AuditLogs',
  ],
  Administrator: [
    'Employee.Read', 'Employee.Create', 'Employee.Edit',
    'Enrollment.Read', 'Enrollment.Approve',
    'Grade.Read',
    'Accounting.Read',
    'System.Settings',
  ],
  Principal: ['Employee.Read', 'Enrollment.Read', 'Grade.Read', 'System.AuditLogs'],
  Registrar: ['Enrollment.Read', 'Enrollment.Approve', 'Enrollment.Reject', 'Employee.Read'],
  Teacher: ['Grade.Read', 'Grade.Input'],
  Accountant: ['Accounting.Read', 'Accounting.Payment', 'Accounting.Receipt'],
  Student: ['Grade.Read', 'Accounting.Receipt'],
  Parent: ['Grade.Read', 'Accounting.Receipt'],
};

interface PermissionGuardProps {
  permission: Permission;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  fallback = null,
  children,
}) => {
  const { user } = useAuth();
  const userRole = user?.role || 'Student';
  const userPermissions = rolePermissionMap[userRole] || [];

  if (!userPermissions.includes(permission)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};
