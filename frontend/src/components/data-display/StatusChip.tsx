import React from 'react';
import { EnrollmentStatus, BillStatus, PaymentStatus } from '../../types';

interface StatusChipProps {
  status: EnrollmentStatus | BillStatus | PaymentStatus | string;
  type?: 'enrollment' | 'bill' | 'payment' | 'generic';
}

export const StatusChip: React.FC<StatusChipProps> = ({ status, type = 'generic' }) => {
  let label = String(status);
  let styleClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';

  if (type === 'enrollment' && typeof status === 'string' && Number.isNaN(Number(status))) {
    // Real backend value (EnrollmentApplicationStatus, returned as a string by
    // GET /Enrollment): Pending | Approved | Rejected | Cancelled.
    switch (status) {
      case 'Pending':
        label = 'Pending Review';
        styleClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400';
        break;
      case 'Approved':
        label = 'Approved';
        styleClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
        break;
      case 'Rejected':
        label = 'Rejected';
        styleClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400';
        break;
      case 'Cancelled':
        label = 'Cancelled';
        styleClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        break;
    }
  } else if (type === 'enrollment') {
    switch (Number(status)) {
      case EnrollmentStatus.Draft:
        label = 'Draft';
        styleClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        break;
      case EnrollmentStatus.Submitted:
        label = 'Submitted';
        styleClass = 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400';
        break;
      case EnrollmentStatus.UnderReview:
        label = 'Under Review';
        styleClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400';
        break;
      case EnrollmentStatus.Verified:
        label = 'Verified';
        styleClass = 'bg-purple-50 text-purple-700 dark:bg-purple-950/50 dark:text-purple-400';
        break;
      case EnrollmentStatus.Approved:
        label = 'Approved / Enrolled';
        styleClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
        break;
      case EnrollmentStatus.Rejected:
        label = 'Rejected';
        styleClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400';
        break;
    }
  } else if (type === 'bill' && typeof status === 'string' && Number.isNaN(Number(status))) {
    // Real backend value (BillStatus, returned as a string by AccountingController):
    // Pending | PartiallyPaid | Paid | Overdue | Cancelled.
    switch (status) {
      case 'Pending':
        label = 'Unpaid';
        styleClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400';
        break;
      case 'PartiallyPaid':
        label = 'Partially Paid';
        styleClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400';
        break;
      case 'Paid':
        label = 'Paid';
        styleClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
        break;
      case 'Overdue':
        label = 'Overdue';
        styleClass = 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold';
        break;
      case 'Cancelled':
        label = 'Cancelled';
        styleClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        break;
    }
  } else if (type === 'bill') {
    switch (Number(status)) {
      case BillStatus.Unpaid:
        label = 'Unpaid';
        styleClass = 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400';
        break;
      case BillStatus.PartiallyPaid:
        label = 'Partially Paid';
        styleClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400';
        break;
      case BillStatus.Paid:
        label = 'Paid';
        styleClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
        break;
      case BillStatus.Overdue:
        label = 'Overdue';
        styleClass = 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 font-bold';
        break;
    }
  } else if (type === 'payment') {
    // Real backend value (PaymentStatus, returned as a string by AccountingController):
    // Pending | PartiallyPaid | Paid | Completed | Refunded | Cancelled.
    switch (status) {
      case 'Completed':
      case 'Paid':
        label = status;
        styleClass = 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400';
        break;
      case 'Pending':
      case 'PartiallyPaid':
        label = status === 'PartiallyPaid' ? 'Partially Paid' : 'Pending';
        styleClass = 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400';
        break;
      case 'Refunded':
        label = 'Refunded';
        styleClass = 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400';
        break;
      case 'Cancelled':
        label = 'Cancelled';
        styleClass = 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
        break;
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border border-transparent ${styleClass}`}
    >
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75" />
      {label}
    </span>
  );
};
