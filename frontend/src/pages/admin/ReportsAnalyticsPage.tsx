import React from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { Download, TrendingUp, Users, DollarSign } from 'lucide-react';
import { toast } from 'sonner';
import { useAdminApi } from '../../hooks/useAdminApi';
import apiClient from '../../services/apiClient';
import type { StudentReportItem, TeacherReportItem, FinanceReportItem, GradeReportItem } from '../../types';

export const ReportsAnalyticsPage: React.FC = () => {
  const { useReportsOverview } = useAdminApi();
  const { data: overview, isLoading, isError, refetch } = useReportsOverview();

  const handleDownloadStudentReport = async () => {
    try {
      toast.info('Generating Official Student Directory & Roster report from PostgreSQL...');
      const response = await apiClient.get<StudentReportItem[]>('/Reports/students');
      const students = response.data;
      if (!students.length) {
        toast.warning('No student records found in database to export.');
        return;
      }
      const headers = ['Student ID', 'Student Number / LRN', 'Full Name', 'Grade Level', 'Section', 'Status'];
      const rows = students.map((s) => [
        s.studentId,
        s.studentNumber,
        `"${s.fullName}"`,
        `"${s.gradeLevel}"`,
        `"${s.section}"`,
        s.status,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `NoahsAcademy_StudentRoster_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Official Student Directory report downloaded.');
    } catch {
      toast.error('Failed to generate student report.');
    }
  };

  const handleDownloadTeacherReport = async () => {
    try {
      toast.info('Generating Faculty Workload & Assignment report from PostgreSQL...');
      const response = await apiClient.get<TeacherReportItem[]>('/Reports/teachers');
      const teachers = response.data;
      if (!teachers.length) {
        toast.warning('No faculty records found in database to export.');
        return;
      }
      const headers = ['Employee ID', 'Faculty Number', 'Full Name', 'Position', 'Department', 'Email', 'Status'];
      const rows = teachers.map((t) => [
        t.employeeId,
        t.employeeNumber,
        `"${t.fullName}"`,
        `"${t.position}"`,
        `"${t.department}"`,
        t.email,
        t.isActive ? 'Active' : 'Inactive',
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `NoahsAcademy_FacultyWorkload_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Faculty Workload report downloaded.');
    } catch {
      toast.error('Failed to generate faculty report.');
    }
  };

  const handleDownloadFinanceReport = async () => {
    try {
      toast.info('Generating Financial Ledger & OR Collection report from PostgreSQL...');
      const response = await apiClient.get<FinanceReportItem[]>('/Reports/finance');
      const transactions = response.data;
      if (!transactions.length) {
        toast.warning('No financial transaction records found in database to export.');
        return;
      }
      const headers = ['Transaction ID', 'OR Reference Number', 'Student Name', 'Amount (PHP)', 'Payment Method', 'Payment Date'];
      const rows = transactions.map((t) => [
        t.transactionId,
        t.referenceNumber,
        `"${t.studentName}"`,
        t.amount.toFixed(2),
        t.paymentMethod,
        new Date(t.paymentDate).toLocaleDateString(),
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `NoahsAcademy_FinancialLedger_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Financial Ledger report downloaded.');
    } catch {
      toast.error('Failed to generate financial report.');
    }
  };

  const handleDownloadGradeReport = async () => {
    try {
      toast.info('Generating Quarterly Academic Performance report from PostgreSQL...');
      const response = await apiClient.get<GradeReportItem[]>('/Reports/grades');
      const grades = response.data;
      if (!grades.length) {
        toast.warning('No grade records found in database to export.');
        return;
      }
      const headers = ['Subject Code', 'Subject Name', 'Average Grade', 'Passing Rate (%)', 'Enrolled Students'];
      const rows = grades.map((g) => [
        g.subjectCode,
        `"${g.subjectName}"`,
        g.averageGrade.toFixed(2),
        `${g.passingRate}%`,
        g.enrolledStudentsCount,
      ]);
      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `NoahsAcademy_AcademicPerformance_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Quarterly Academic Performance report downloaded.');
    } catch {
      toast.error('Failed to generate academic report.');
    }
  };

  const reportTemplates = [
    {
      title: 'Official Student Directory & Roster',
      format: 'CSV / Data Ledger',
      cat: 'Registrar',
      desc: 'Complete enrolled student demographic breakdown by grade & track directly from PostgreSQL.',
      action: handleDownloadStudentReport,
    },
    {
      title: 'Faculty Workload & Class Assignment Report',
      format: 'CSV / Data Ledger',
      cat: 'Academic',
      desc: 'Teacher unit distributions, subjects, and advisory sections backed by live employee records.',
      action: handleDownloadTeacherReport,
    },
    {
      title: 'Institutional Financial Ledger & OR Collection',
      format: 'CSV / Data Ledger',
      cat: 'Finance',
      desc: 'Summary of paid tuition fees, balances, and official receipts in Philippine Pesos (₱).',
      action: handleDownloadFinanceReport,
    },
    {
      title: 'Quarterly GPA & Academic Performance Summary',
      format: 'CSV / Data Ledger',
      cat: 'Academic',
      desc: 'School-wide quarterly grade averages, subject pass rates, and performance statistics.',
      action: handleDownloadGradeReport,
    },
  ];

  return (
    <div className="space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-black text-purple-950 dark:text-white tracking-tight">
          Reports & Executive Analytics Center
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Generate official institutional reports, export data ledgers, and audit metrics directly from PostgreSQL.
        </p>
      </div>

      {isError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 flex items-center justify-between">
          <span>Failed to load reporting overview from EduCore API server.</span>
          <button onClick={() => refetch()} className="underline hover:text-rose-700">
            Retry
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard
          title="Active Students"
          value={isLoading ? '…' : `${overview?.totalActiveStudents ?? 0} Enrolled`}
          icon={Users}
          iconBgColor="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
        />
        <StatCard
          title="Active Faculty"
          value={isLoading ? '…' : `${overview?.totalActiveEmployees ?? 0} Educators`}
          icon={TrendingUp}
          iconBgColor="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
        />
        <StatCard
          title="Revenue Collected"
          value={isLoading ? '…' : `₱${(overview?.totalRevenueCollected ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          iconBgColor="bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTemplates.map((rep, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 flex flex-col justify-between space-y-4 shadow-xs"
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 px-2.5 py-0.5 rounded-full bg-purple-50 dark:bg-purple-950 border border-purple-200 dark:border-purple-800">
                  {rep.cat}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">{rep.format}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">{rep.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{rep.desc}</p>
            </div>

            <button
              onClick={rep.action}
              className="inline-flex items-center justify-center px-4 py-2.5 bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.01]"
            >
              <Download className="w-4 h-4 mr-2 text-amber-300" />
              Generate & Download Live Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
