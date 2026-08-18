import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { StatCard } from '../../components/data-display/StatCard';
import {
  Award,
  CreditCard,
  Clock,
  FileText,
  Download,
  Users,
  MessageSquare,
  Bell,
  Settings,
  CheckCircle,
  Send,
  Lock,
  ShieldCheck,
  Phone,
} from 'lucide-react';
import { toast } from 'sonner';
import { useParentApi } from '../../hooks/useParentApi';

const formatCurrency = (amount: number | undefined | null): string =>
  `₱${(amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatGrade = (value: number | null | undefined): string =>
  value === null || value === undefined ? '—' : value.toFixed(1);

const honorsLabel = (average: number | null): string => {
  if (average === null) return 'Grades Pending';
  if (average >= 98) return 'With Highest Honors';
  if (average >= 95) return 'With High Honors';
  if (average >= 90) return 'With Honors';
  return 'Regular Standing';
};

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-4 py-3.5">
        <div className="h-3 rounded bg-slate-800 animate-pulse" />
      </td>
    ))}
  </tr>
);

const InlineEmpty: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-dashed border-slate-800">
    {message}
  </div>
);

const announcements = [
  { title: 'Parent-Teacher Orientation Conference', date: 'August 05, 2026', author: 'School Administration', desc: 'Mandatory online and physical orientation for all Grade 7 and Grade 11 guardians.' },
  { title: 'AY 2026–2027 First Quarter Exam Schedule', date: 'August 20, 2026', author: 'Academic Office', desc: 'First quarterly examinations will be conducted across all tracks.' },
];

type ParentTab =
  | 'dashboard'
  | 'child-overview'
  | 'attendance'
  | 'grades'
  | 'billing'
  | 'messages'
  | 'announcements'
  | 'settings';

const TAB_PATHS: Record<ParentTab, string> = {
  dashboard: '/parent/dashboard',
  'child-overview': '/parent/children',
  attendance: '/parent/attendance',
  grades: '/parent/progress',
  billing: '/parent/ledger',
  messages: '/parent/messages',
  announcements: '/parent/announcements',
  settings: '/parent/settings',
};

const PATH_TO_TAB: Record<string, ParentTab> = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([tab, path]) => [path, tab])
) as Record<string, ParentTab>;

export const ParentDashboard: React.FC = () => {
  const {
    useChildren,
    useChildDetails,
    useCurrentAcademicYear,
    useChildGrades,
    useChildLedger,
    useChildAttendance,
    useChildAttendanceSummary,
  } = useParentApi();

  const location = useLocation();
  const navigate = useNavigate();
  const activeTab: ParentTab = PATH_TO_TAB[location.pathname] ?? 'dashboard';
  const goToTab = (tab: ParentTab) => navigate(TAB_PATHS[tab]);

  const [selectedChildId, setSelectedChildId] = useState<number | null>(null);

  const { data: children, isLoading: childrenLoading, isError: childrenError } = useChildren();
  const { data: academicYear } = useCurrentAcademicYear();
  const { data: childDetails, isLoading: detailsLoading } = useChildDetails(selectedChildId);
  const { data: grades, isLoading: gradesLoading, isError: gradesError } = useChildGrades(
    selectedChildId,
    academicYear?.id ?? null
  );
  const { data: ledger, isLoading: ledgerLoading, isError: ledgerError } = useChildLedger(selectedChildId);
  const { data: attendanceData, isLoading: attendanceLoading } = useChildAttendance(selectedChildId);
  const { data: attendanceSummary } = useChildAttendanceSummary(selectedChildId);

  useEffect(() => {
    if (!selectedChildId && children && children.length > 0) {
      setSelectedChildId(children[0].studentId);
    }
  }, [children, selectedChildId]);

  const [messages, setMessages] = useState<
    { id: number; sender: string; role: string; text: string; date: string }[]
  >([]);
  const [newMessage, setNewMessage] = useState('');

  const adviserName = grades && grades.length > 0 ? grades[0].teacherName : 'Class Adviser';

  useEffect(() => {
    setMessages([
      {
        id: 1,
        sender: adviserName,
        role: 'Class Adviser',
        text: `Greetings! Please reach out here with any questions about ${childDetails?.fullName ?? 'your ward'}'s progress.`,
        date: 'July 20, 2026',
      },
      {
        id: 2,
        sender: 'Accounting Office',
        role: 'Finance',
        text: 'Tuition clearance confirmation: current balance and receipts are available under Billing & Receipts.',
        date: 'July 15, 2026',
      },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChildId, adviserName]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      { id: Date.now(), sender: 'Guardian (You)', role: 'Parent', text: newMessage, date: 'Just now' },
    ]);
    setNewMessage('');
    toast.success('Message sent to Class Adviser.');
  };

  const overallAverage =
    grades && grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.finalAverage ?? 0), 0) /
        grades.filter((g) => g.finalAverage !== null).length || null
      : null;

  const hasChildren = !childrenLoading && !childrenError && children && children.length > 0;
  const noChildren = !childrenLoading && !childrenError && (!children || children.length === 0);

  return (
    <div className="space-y-8 font-sans">
      {/* Header Banner & Child Selector */}
      <div className="relative bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -bottom-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-purple-500/15 text-purple-400 text-[11px] font-bold uppercase tracking-wider rounded-full border border-purple-500/30">
                Parent &amp; Guardian Portal
              </span>
              <span className="text-xs font-mono text-slate-400">Guardian SSO</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">Academic &amp; Financial Oversight</h1>
            <p className="text-slate-300 text-xs">
              {childDetails ? (
                <>
                  Monitoring enrolled ward: <strong className="text-white">{childDetails.fullName}</strong> (
                  {childDetails.currentGradeLevel} - {childDetails.currentSection})
                </>
              ) : (
                'Loading enrolled ward information…'
              )}
            </p>
          </div>

          {/* Ward Selector Dropdown */}
          {hasChildren && (
            <div className="flex items-center gap-3 bg-slate-950 p-2.5 rounded-2xl border border-slate-800 shrink-0">
              <Users className="w-4 h-4 text-purple-400" />
              <select
                aria-label="Select ward"
                value={selectedChildId ?? ''}
                onChange={(e) => setSelectedChildId(Number(e.target.value))}
                className="bg-transparent text-xs font-bold text-white outline-none cursor-pointer pr-2"
              >
                {children!.map((c) => (
                  <option key={c.studentId} value={c.studentId} className="bg-slate-900 text-white">
                    {c.fullName} ({c.currentGradeLevel})
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {childrenLoading && <InlineEmpty message="Loading your enrolled wards…" />}
      {childrenError && (
        <InlineEmpty message="Unable to reach the EduCore server to load your wards. Please check your connection and try again." />
      )}
      {noChildren && (
        <InlineEmpty message="No enrolled children are currently linked to this guardian account." />
      )}

      {hasChildren && (
        <>
          {/* Subnav Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: ShieldCheck },
              { id: 'child-overview', label: 'Child Overview', icon: Users },
              { id: 'attendance', label: 'Attendance Log', icon: Clock },
              { id: 'grades', label: 'Quarterly Grades', icon: Award },
              { id: 'billing', label: 'Billing & Receipts', icon: CreditCard },
              { id: 'messages', label: 'Adviser Messages', icon: MessageSquare },
              { id: 'announcements', label: 'Bulletins', icon: Bell },
              { id: 'settings', label: 'Portal Settings', icon: Settings },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => goToTab(tab.id as ParentTab)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-purple-700 text-white shadow-md shadow-purple-600/25'
                      : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-slate-950 dark:hover:text-white border border-slate-200 dark:border-slate-800 hover:bg-purple-50 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                <StatCard
                  title="Overall Average"
                  value={overallAverage ? `${overallAverage.toFixed(1)}%` : '—'}
                  description={honorsLabel(overallAverage)}
                  icon={Award}
                  iconBgColor="bg-amber-500/10 text-amber-500"
                />
                <StatCard
                  title="Attendance Rate"
                  value={`${attendanceSummary?.attendanceRate ?? 100}%`}
                  description={`${attendanceSummary?.absentDays ?? 0} Absences Logged`}
                  icon={Clock}
                  iconBgColor="bg-emerald-500/10 text-emerald-500"
                />
                <StatCard
                  title="Total Tuition Billed"
                  value={ledgerLoading ? '…' : formatCurrency(ledger?.totalBilled)}
                  description={academicYear?.schoolYear ?? 'Current Academic Year'}
                  icon={CreditCard}
                  iconBgColor="bg-blue-500/10 text-blue-500"
                />
                <StatCard
                  title="Ledger Status"
                  value={ledgerLoading ? '…' : (ledger?.currentBalance ?? 0) > 0 ? 'Balance Due' : 'Fully Paid'}
                  description={ledgerLoading ? 'Loading…' : `Balance: ${formatCurrency(ledger?.currentBalance)}`}
                  icon={FileText}
                  iconBgColor="bg-purple-500/10 text-purple-500"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <h3 className="text-base font-bold text-white">
                      Recent Grades Highlights — {childDetails?.fullName ?? '…'}
                    </h3>
                    <button onClick={() => goToTab('grades')} className="text-xs text-purple-400 hover:underline">
                      View Full Gradebook →
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                        <tr>
                          <th className="px-3 py-2.5">Code</th>
                          <th className="px-3 py-2.5">Subject Description</th>
                          <th className="px-3 py-2.5 text-center">Prelim</th>
                          <th className="px-3 py-2.5 text-center">Midterm</th>
                          <th className="px-3 py-2.5 text-center">Final</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {gradesLoading && <SkeletonRow cols={5} />}
                        {!gradesLoading && gradesError && (
                          <tr>
                            <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                              Unable to load grades right now.
                            </td>
                          </tr>
                        )}
                        {!gradesLoading && !gradesError && grades && grades.length === 0 && (
                          <tr>
                            <td colSpan={5} className="px-3 py-6 text-center text-slate-500">
                              No grades released yet for this term.
                            </td>
                          </tr>
                        )}
                        {!gradesLoading &&
                          grades?.slice(0, 4).map((row) => (
                            <tr key={row.subjectCode} className="hover:bg-slate-800/40">
                              <td className="px-3 py-3 font-mono font-bold text-purple-400">{row.subjectCode}</td>
                              <td className="px-3 py-3 font-medium text-white">{row.subjectName}</td>
                              <td className="px-3 py-3 text-center text-slate-300 font-semibold">{formatGrade(row.prelimGrade)}</td>
                              <td className="px-3 py-3 text-center text-slate-300 font-semibold">{formatGrade(row.midtermGrade)}</td>
                              <td className="px-3 py-3 text-center font-bold text-emerald-400">{formatGrade(row.finalAverage)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <div className="flex items-center gap-2 text-white font-bold text-sm">
                    <Bell className="w-4 h-4 text-purple-400" />
                    <span>Recent Bulletins</span>
                  </div>
                  <div className="space-y-3 text-xs">
                    {announcements.map((a, i) => (
                      <div key={i} className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1">
                        <div className="font-bold text-white">{a.title}</div>
                        <div className="text-[10px] text-purple-400 font-mono">{a.date}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CHILD OVERVIEW */}
          {activeTab === 'child-overview' && (
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-white">Enrolled Wards Overview</h3>
                    <p className="text-xs text-slate-400">Registered dependents linked to this guardian account</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {children!.map((w) => (
                    <div
                      key={w.studentId}
                      onClick={() => setSelectedChildId(w.studentId)}
                      className={`p-6 rounded-3xl border cursor-pointer transition-all space-y-4 ${
                        selectedChildId === w.studentId
                          ? 'bg-slate-900 border-purple-500 shadow-xl ring-2 ring-purple-500/20'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs font-bold text-purple-400 bg-purple-500/10 px-2.5 py-1 rounded-md border border-purple-500/20">
                          ID: {w.studentNumber}
                        </span>
                        <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                          {w.status}
                        </span>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-white">{w.fullName}</h4>
                        <p className="text-xs text-slate-400 mt-1">
                          {w.currentGradeLevel} · {w.currentSection}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {detailsLoading && <InlineEmpty message="Loading ward details…" />}
              {!detailsLoading && childDetails && (
                <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                  <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">
                    Official Record — {childDetails.fullName}
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-slate-500 font-semibold uppercase text-[10px]">Student ID</span>
                      <div className="font-mono font-bold text-purple-400 text-sm">{childDetails.studentNumber}</div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-slate-500 font-semibold uppercase text-[10px]">Gender</span>
                      <div className="font-bold text-white text-sm">{childDetails.gender}</div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-slate-500 font-semibold uppercase text-[10px]">Birth Date</span>
                      <div className="font-bold text-white text-sm">{childDetails.birthDate}</div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                      <span className="text-slate-500 font-semibold uppercase text-[10px]">Grade &amp; Section</span>
                      <div className="font-bold text-white text-sm">
                        {childDetails.currentGradeLevel} — {childDetails.currentSection}
                      </div>
                    </div>
                    <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1 sm:col-span-2 lg:col-span-1">
                      <span className="text-slate-500 font-semibold uppercase text-[10px]">Registered Address</span>
                      <div className="font-bold text-white text-sm">{childDetails.address}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: ATTENDANCE LOG */}
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard title="Ward Attendance Rate" value={`${attendanceSummary?.attendanceRate ?? 100}%`} icon={Clock} iconBgColor="bg-emerald-500/10 text-emerald-500" />
                <StatCard title="Absences Logged" value={`${attendanceSummary?.absentDays ?? 0} Days`} icon={CheckCircle} iconBgColor="bg-blue-500/10 text-blue-500" />
                <StatCard title="Total Days Tracked" value={`${attendanceSummary?.totalDaysRecorded ?? 0} Days`} icon={Bell} iconBgColor="bg-purple-500/10 text-purple-500" />
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
                <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Official Attendance Log — {childDetails?.fullName ?? 'Ward'}</h3>
                {attendanceLoading ? (
                  <InlineEmpty message="Loading attendance records from database…" />
                ) : !attendanceData || attendanceData.length === 0 ? (
                  <InlineEmpty message="No attendance logs recorded yet for this student." />
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                        <tr>
                          <th className="px-4 py-3">Date</th>
                          <th className="px-4 py-3">Subject / Course</th>
                          <th className="px-4 py-3">Recorded By</th>
                          <th className="px-4 py-3">Remarks</th>
                          <th className="px-4 py-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {attendanceData.map((log: any) => (
                          <tr key={log.id} className="hover:bg-slate-800/40">
                            <td className="px-4 py-3 font-semibold text-white">
                              {new Date(log.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                            </td>
                            <td className="px-4 py-3 text-purple-400 font-medium">{log.subjectName || 'Core Class'}</td>
                            <td className="px-4 py-3 text-slate-300">{log.recordedByName || 'Faculty'}</td>
                            <td className="px-4 py-3 text-slate-400">{log.remarks || '—'}</td>
                            <td className="px-4 py-3 text-center">
                              <span className={`px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                                log.status === 'Present'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                  : log.status === 'Tardy'
                                  ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                  : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                              }`}>
                                {log.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: QUARTERLY GRADES */}
          {activeTab === 'grades' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-white">Quarterly Report Card — {childDetails?.fullName ?? '…'}</h3>
                  <p className="text-xs text-slate-400">
                    {academicYear?.schoolYear ?? 'Current Academic Year'} · {childDetails?.currentSection ?? '…'}
                  </p>
                </div>
                <button
                  onClick={() => toast.success('Downloading Official Grade Card PDF...')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md shadow-purple-500/20"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Report Card</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Code</th>
                      <th className="px-4 py-3">Subject</th>
                      <th className="px-4 py-3">Instructor</th>
                      <th className="px-4 py-3 text-center">Prelim</th>
                      <th className="px-4 py-3 text-center">Midterm</th>
                      <th className="px-4 py-3 text-center">Final</th>
                      <th className="px-4 py-3 text-center">Average</th>
                      <th className="px-4 py-3 text-center">Remarks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {gradesLoading && <SkeletonRow cols={8} />}
                    {!gradesLoading && gradesError && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                          Unable to load grades right now. Please try again later.
                        </td>
                      </tr>
                    )}
                    {!gradesLoading && !gradesError && grades && grades.length === 0 && (
                      <tr>
                        <td colSpan={8} className="px-4 py-8 text-center text-slate-500">
                          No grades have been released yet for this academic year.
                        </td>
                      </tr>
                    )}
                    {!gradesLoading &&
                      grades?.map((row) => (
                        <tr key={row.subjectCode} className="hover:bg-slate-800/40">
                          <td className="px-4 py-3.5 font-mono font-bold text-purple-400">{row.subjectCode}</td>
                          <td className="px-4 py-3.5 font-semibold text-white">{row.subjectName}</td>
                          <td className="px-4 py-3.5 text-slate-400">{row.teacherName}</td>
                          <td className="px-4 py-3.5 text-center text-slate-300 font-semibold">{formatGrade(row.prelimGrade)}</td>
                          <td className="px-4 py-3.5 text-center text-slate-300 font-semibold">{formatGrade(row.midtermGrade)}</td>
                          <td className="px-4 py-3.5 text-center text-slate-300 font-semibold">{formatGrade(row.finalGrade)}</td>
                          <td className="px-4 py-3.5 text-center font-bold text-emerald-400">{formatGrade(row.finalAverage)}</td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="px-2.5 py-0.5 text-[10px] font-bold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20">
                              {row.remarks || 'Pending'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: BILLING & RECEIPTS */}
          {activeTab === 'billing' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <StatCard title="Total Billed" value={ledgerLoading ? '…' : formatCurrency(ledger?.totalBilled)} icon={FileText} iconBgColor="bg-blue-500/10 text-blue-500" />
                <StatCard title="Total Paid" value={ledgerLoading ? '…' : formatCurrency(ledger?.totalPaid)} icon={CheckCircle} iconBgColor="bg-emerald-500/10 text-emerald-500" />
                <StatCard title="Current Balance" value={ledgerLoading ? '…' : formatCurrency(ledger?.currentBalance)} icon={CreditCard} iconBgColor="bg-purple-500/10 text-purple-500" />
              </div>

              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-white">Financial Statement &amp; Ledger</h3>
                    <p className="text-xs text-slate-400">Verified by Accounting Office for {childDetails?.fullName ?? '…'}</p>
                  </div>
                  <button
                    onClick={() => toast.success('Downloading Statement of Account PDF...')}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 rounded-xl hover:bg-emerald-500 transition-colors shadow-md shadow-emerald-600/20"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download Statement PDF</span>
                  </button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-4 py-3">Reference #</th>
                        <th className="px-4 py-3">Description</th>
                        <th className="px-4 py-3">Date</th>
                        <th className="px-4 py-3 text-right">Debit</th>
                        <th className="px-4 py-3 text-right">Credit</th>
                        <th className="px-4 py-3 text-right">Running Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {ledgerLoading && <SkeletonRow cols={6} />}
                      {!ledgerLoading && ledgerError && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                            Unable to load the billing ledger right now. Please try again later.
                          </td>
                        </tr>
                      )}
                      {!ledgerLoading && !ledgerError && ledger && ledger.transactions.length === 0 && (
                        <tr>
                          <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                            No billing transactions on record yet.
                          </td>
                        </tr>
                      )}
                      {!ledgerLoading &&
                        ledger?.transactions.map((tx, idx) => (
                          <tr key={idx} className="hover:bg-slate-800/40">
                            <td className="px-4 py-3 font-mono font-bold text-purple-400">{tx.referenceNo}</td>
                            <td className="px-4 py-3 font-medium text-white">{tx.description}</td>
                            <td className="px-4 py-3 text-slate-400">{new Date(tx.date).toLocaleDateString()}</td>
                            <td className="px-4 py-3 text-right font-mono text-rose-400">{tx.debit ? formatCurrency(tx.debit) : '—'}</td>
                            <td className="px-4 py-3 text-right font-mono text-emerald-400">{tx.credit ? formatCurrency(tx.credit) : '—'}</td>
                            <td className="px-4 py-3 text-right font-mono font-bold text-white">{formatCurrency(tx.runningBalance)}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MESSAGES */}
          {activeTab === 'messages' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">Adviser &amp; Faculty Communications</h3>
                <p className="text-xs text-slate-400">Direct message channel with {adviserName}</p>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={`p-4 rounded-2xl border space-y-1.5 ${
                      m.role === 'Parent' ? 'bg-purple-950/40 border-purple-800/60 ml-8' : 'bg-slate-950 border-slate-800 mr-8'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{m.sender} <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">{m.role}</span></span>
                      <span className="text-[11px] text-slate-500">{m.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">{m.text}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSendMessage} className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={`Type your inquiry for ${adviserName}...`}
                  className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all"
                />
                <button
                  type="submit"
                  className="inline-flex items-center gap-2 px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-500/20 shrink-0"
                >
                  <Send className="w-4 h-4" />
                  <span>Send Message</span>
                </button>
              </form>
            </div>
          )}

          {/* TAB 7: ANNOUNCEMENTS */}
          {activeTab === 'announcements' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">Institutional Guardian Bulletins</h3>
                <p className="text-xs text-slate-400">Official school circulars</p>
              </div>

              <div className="space-y-4">
                {announcements.map((a, i) => (
                  <div key={i} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 space-y-2 hover:border-slate-700 transition-colors">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white text-sm">{a.title}</span>
                      <span className="text-purple-400 font-mono text-[11px]">{a.date}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{a.desc}</p>
                    <div className="text-[10px] text-slate-500 pt-1">Issued by: {a.author}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 8: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">Guardian Portal Preferences</h3>
                <p className="text-xs text-slate-400">Manage alerts &amp; contact channels</p>
              </div>

              <div className="space-y-6 max-w-xl text-xs">
                <div className="space-y-3">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Phone className="w-4 h-4 text-purple-400" /> SMS Gate Alert Settings
                  </h4>
                  <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 cursor-pointer">
                    <span>Instant SMS alert when ward enters or leaves gate terminal</span>
                    <input type="checkbox" defaultChecked className="w-4 h-4 text-purple-600 rounded" />
                  </label>
                </div>

                <div className="space-y-3 pt-4 border-t border-slate-800">
                  <h4 className="font-bold text-white text-sm flex items-center gap-2">
                    <Lock className="w-4 h-4 text-purple-400" /> Guardian Security
                  </h4>
                  <button
                    onClick={() => toast.info('Redirecting to password change...')}
                    className="w-full py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-xl text-left px-4"
                  >
                    Update Guardian Account Password
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
