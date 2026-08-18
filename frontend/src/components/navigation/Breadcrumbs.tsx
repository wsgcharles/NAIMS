import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const routeLabels: Record<string, string> = {
  admin: 'Administration',
  dashboard: 'Dashboard',
  students: 'Student Roster',
  employees: 'Faculty & Staff',
  sections: 'Sections & Classes',
  subjects: 'Curriculum & Subjects',
  accounting: 'Accounting & Fees',
  reports: 'Reports & Analytics',
  settings: 'System Settings',
  registrar: 'Registrar Office',
  applications: 'Applicant Management',
  verification: 'Document Verification',
  teacher: 'Teacher Portal',
  attendance: 'Attendance Management',
  grades: 'Grade Encoding & Approval',
  student: 'Student Portal',
  parent: 'Parent Portal',
  payments: 'Payment History',
};

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter((x) => x);

  if (pathnames.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-[11px] font-medium text-slate-500 dark:text-slate-400 space-x-1.5 py-1">
      <Link to="/" className="hover:text-purple-600 dark:hover:text-purple-400 flex items-center gap-1 transition-colors">
        <Home className="w-3.5 h-3.5" />
        <span className="sr-only">Home</span>
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`;
        const isLast = index === pathnames.length - 1;
        const label = routeLabels[value.toLowerCase()] || value.replace(/-/g, ' ');

        return (
          <React.Fragment key={to}>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-slate-700 shrink-0" />
            {isLast ? (
              <span className="font-bold text-slate-900 dark:text-white capitalize">{label}</span>
            ) : (
              <Link to={to} className="hover:text-purple-600 dark:hover:text-purple-400 capitalize transition-colors">
                {label}
              </Link>
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
};
