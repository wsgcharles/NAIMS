import React from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { StatCard } from '../../components/data-display/StatCard';
import { StatusChip } from '../../components/data-display/StatusChip';
import {
  Award,
  BookOpen,
  Clock,
  CreditCard,
  Download,
  Calendar,
  User,
  Settings,
  Bell,
  FileText,
  Lock,
  History as HistoryIcon,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useStudentApi } from '../../hooks/useStudentApi';
import { toast } from 'sonner';

type StudentTab =
  | 'dashboard'
  | 'grades'
  | 'attendance'
  | 'subjects'
  | 'schedule'
  | 'payments'
  | 'profile'
  | 'history'
  | 'settings';

const TAB_PATHS: Record<StudentTab, string> = {
  dashboard: '/student/dashboard',
  grades: '/student/grades',
  attendance: '/student/attendance',
  subjects: '/student/subjects',
  schedule: '/student/schedule',
  payments: '/student/ledger',
  profile: '/student/profile',
  history: '/student/history',
  settings: '/student/settings',
};

const PATH_TO_TAB: Record<string, StudentTab> = Object.fromEntries(
  Object.entries(TAB_PATHS).map(([tab, path]) => [path, tab])
) as Record<string, StudentTab>;

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 });

const InlineEmpty: React.FC<{ message: string }> = ({ message }) => (
  <div className="p-8 text-center text-xs text-slate-400 bg-slate-950 border border-slate-800 rounded-2xl">
    {message}
  </div>
);

const Unavailable: React.FC<{ title: string; message: string }> = ({ title, message }) => (
  <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-8 sm:p-10 flex flex-col items-center text-center gap-3">
    <div className="p-3 bg-amber-500/10 rounded-2xl border border-amber-500/20">
      <AlertCircle className="w-6 h-6 text-amber-400" />
    </div>
    <h3 className="text-base font-bold text-white">{title}</h3>
    <p className="text-xs text-slate-400 max-w-md leading-relaxed">{message}</p>
  </div>
);

const SkeletonBlock: React.FC = () => (
  <div className="h-24 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse" />
);

export const StudentDashboard: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const activeTab: StudentTab = PATH_TO_TAB[location.pathname] ?? 'dashboard';
  const goToTab = (tab: StudentTab) => navigate(TAB_PATHS[tab]);

  const { useProfile, useSubjects, useGrades, useFinancials, useLedger, useAcademicHistory } = useStudentApi();

  const profile = useProfile();
  const subjects = useSubjects();
  const grades = useGrades();
  const financials = useFinancials();
  const ledger = useLedger();
  const history = useAcademicHistory();

  const displayName = profile.data ? `${profile.data.firstName} ${profile.data.lastName}` : `${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim();

  return (
    <div className="space-y-8 font-sans">
      {/* Welcome Banner */}
      <div className="relative bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 md:p-8 text-white shadow-2xl overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -bottom-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-[11px] font-bold uppercase tracking-wider rounded-full border border-emerald-500/20">
                Enrolled
              </span>
              {profile.data && <span className="text-xs font-mono text-slate-400">Student No: {profile.data.studentNumber}</span>}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
              Welcome back{displayName ? `, ${displayName}` : ''}!
            </h1>
            <p className="text-slate-300 text-xs">
              {profile.isLoading
                ? 'Loading your enrollment details…'
                : profile.isError
                ? 'Unable to load enrollment details right now.'
                : `${profile.data?.gradeLevel ?? ''} · ${profile.data?.section ?? ''} · ${profile.data?.academicYear ?? ''}`}
            </p>
          </div>

          <button
            onClick={() => toast.info('Grade slip export is not yet available from the backend.')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl text-xs transition-all shadow-lg shadow-blue-500/20 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Download Official Grade Slip</span>
          </button>
        </div>
      </div>

      {/* Navigation Subnav Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: BookOpen },
          { id: 'grades', label: 'Grades', icon: Award },
          { id: 'attendance', label: 'Attendance Log', icon: Clock },
          { id: 'subjects', label: 'Enrolled Subjects', icon: FileText },
          { id: 'schedule', label: 'Class Timetable', icon: Calendar },
          { id: 'payments', label: 'Tuition & Ledger', icon: CreditCard },
          { id: 'profile', label: 'Student Profile', icon: User },
          { id: 'history', label: 'Academic History', icon: HistoryIcon },
          { id: 'settings', label: 'Portal Settings', icon: Settings },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => goToTab(tab.id as StudentTab)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: DASHBOARD OVERVIEW */}
      {activeTab === 'dashboard' && (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Enrolled Subjects"
              value={subjects.isLoading ? '…' : `${(subjects.data ?? []).length}`}
              icon={BookOpen}
              iconBgColor="bg-blue-500/10 text-blue-500"
            />
            <StatCard
              title="Graded Subjects"
              value={grades.isLoading ? '…' : `${(grades.data ?? []).length}`}
              icon={Award}
              iconBgColor="bg-amber-500/10 text-amber-500"
            />
            <StatCard
              title="Attendance"
              value="Unavailable"
              description="No backend support yet"
              icon={Clock}
              iconBgColor="bg-slate-500/10 text-slate-400"
            />
            <StatCard
              title="Account Balance"
              value={ledger.isLoading ? '…' : currency(ledger.data?.currentBalance ?? 0)}
              icon={CreditCard}
              iconBgColor="bg-purple-500/10 text-purple-500"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">Current Grades Overview</h3>
                <button onClick={() => goToTab('grades')} className="text-xs text-blue-400 hover:underline">
                  View Full Gradebook →
                </button>
              </div>

              {grades.isLoading && <SkeletonBlock />}
              {!grades.isLoading && grades.isError && (
                <InlineEmpty message="Unable to load your grades right now. Please check your connection and try again." />
              )}
              {!grades.isLoading && !grades.isError && (grades.data ?? []).length === 0 && (
                <InlineEmpty message="No grades have been released yet." />
              )}
              {!grades.isLoading && !grades.isError && (grades.data?.length ?? 0) > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                      <tr>
                        <th className="px-3 py-2.5">Subject</th>
                        <th className="px-3 py-2.5 text-center">Prelim</th>
                        <th className="px-3 py-2.5 text-center">Midterm</th>
                        <th className="px-3 py-2.5 text-center">Final</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {(grades.data ?? []).slice(0, 4).map((row, i) => (
                        <tr key={i} className="hover:bg-slate-800/40">
                          <td className="px-3 py-3 font-medium text-white">{row.subject}</td>
                          <td className="px-3 py-3 text-center font-semibold text-slate-300">{row.prelimGrade ?? '—'}</td>
                          <td className="px-3 py-3 text-center font-semibold text-slate-300">{row.midtermGrade ?? '—'}</td>
                          <td className="px-3 py-3 text-center font-bold text-emerald-400">{row.finalGrade ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Bell className="w-4 h-4 text-blue-400" />
                <span>Class Announcements</span>
              </div>
              <InlineEmpty message="An announcements/bulletin board is not yet available from the backend." />
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: GRADES */}
      {activeTab === 'grades' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="text-lg font-bold text-white">Official Academic Gradebook</h3>
            <p className="text-xs text-slate-400">{profile.data ? `${profile.data.academicYear} · ${profile.data.section}` : ''}</p>
          </div>

          {grades.isLoading && <SkeletonBlock />}
          {!grades.isLoading && grades.isError && (
            <InlineEmpty message="Unable to reach the EduCore server to load your grades. Please check your connection and try again." />
          )}
          {!grades.isLoading && !grades.isError && (grades.data ?? []).length === 0 && (
            <InlineEmpty message="No grades have been released for this term yet." />
          )}
          {!grades.isLoading && !grades.isError && (grades.data?.length ?? 0) > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Subject</th>
                    <th className="px-4 py-3">Faculty Instructor</th>
                    <th className="px-4 py-3 text-center">Prelim</th>
                    <th className="px-4 py-3 text-center">Midterm</th>
                    <th className="px-4 py-3 text-center">Final</th>
                    <th className="px-4 py-3">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {(grades.data ?? []).map((row, i) => (
                    <tr key={i} className="hover:bg-slate-800/40 transition-colors">
                      <td className="px-4 py-3.5 font-semibold text-white">{row.subject}</td>
                      <td className="px-4 py-3.5 text-slate-400">{row.teacher}</td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-300">{row.prelimGrade ?? '—'}</td>
                      <td className="px-4 py-3.5 text-center font-semibold text-slate-300">{row.midtermGrade ?? '—'}</td>
                      <td className="px-4 py-3.5 text-center font-extrabold text-emerald-400">{row.finalGrade ?? '—'}</td>
                      <td className="px-4 py-3.5 text-slate-400">{row.remarks || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ATTENDANCE LOG */}
      {activeTab === 'attendance' && (
        <Unavailable
          title="Attendance Log Unavailable"
          message="Gate attendance tracking has no backing API in EduCore yet. Once an Attendance module is added to the backend, your daily time-in/time-out history will appear here."
        />
      )}

      {/* TAB 4: ENROLLED SUBJECTS */}
      {activeTab === 'subjects' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white">Enrolled Course Catalog</h3>
            <p className="text-xs text-slate-400">{subjects.isLoading ? 'Loading…' : `${(subjects.data ?? []).length} Subjects`}</p>
          </div>

          {subjects.isLoading && <SkeletonBlock />}
          {!subjects.isLoading && subjects.isError && (
            <InlineEmpty message="Unable to load your enrolled subjects right now." />
          )}
          {!subjects.isLoading && !subjects.isError && (subjects.data ?? []).length === 0 && (
            <InlineEmpty message="No subjects are currently assigned to your section." />
          )}
          {!subjects.isLoading && !subjects.isError && (subjects.data?.length ?? 0) > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(subjects.data ?? []).map((subj) => (
                <div key={subj.subjectId} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 hover:border-slate-700 transition-colors space-y-2">
                  <h4 className="font-bold text-white text-sm">{subj.subjectName}</h4>
                  <p className="text-xs text-slate-400">Instructor: {subj.teacher}</p>
                  <p className="text-[11px] text-blue-400 font-semibold">{subj.section}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CLASS TIMETABLE */}
      {activeTab === 'schedule' && (
        <Unavailable
          title="Class Timetable Unavailable"
          message="A room/period scheduling system has no backing API in EduCore yet. Once a Schedule module is added to the backend, your weekly class timetable will appear here."
        />
      )}

      {/* TAB 6: TUITION & LEDGER */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard title="Total Billed" value={ledger.isLoading ? '…' : currency(ledger.data?.totalBilled ?? 0)} icon={FileText} iconBgColor="bg-blue-500/10 text-blue-400" />
            <StatCard title="Total Paid" value={ledger.isLoading ? '…' : currency(ledger.data?.totalPaid ?? 0)} icon={CreditCard} iconBgColor="bg-emerald-500/10 text-emerald-400" />
            <StatCard title="Current Balance" value={ledger.isLoading ? '…' : currency(ledger.data?.currentBalance ?? 0)} icon={CreditCard} iconBgColor="bg-purple-500/10 text-purple-400" />
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Bills</h3>
            {financials.isLoading && <SkeletonBlock />}
            {!financials.isLoading && financials.isError && (
              <InlineEmpty message="Unable to load your bills right now." />
            )}
            {!financials.isLoading && !financials.isError && (financials.data ?? []).length === 0 && (
              <InlineEmpty message="No bills have been issued to your account yet." />
            )}
            {!financials.isLoading && !financials.isError && (financials.data?.length ?? 0) > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Bill #</th>
                      <th className="px-4 py-3 text-right">Total</th>
                      <th className="px-4 py-3 text-right">Paid</th>
                      <th className="px-4 py-3 text-right">Balance</th>
                      <th className="px-4 py-3 text-center">Status</th>
                      <th className="px-4 py-3">Due Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(financials.data ?? []).map((b) => (
                      <tr key={b.id} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 font-mono font-bold text-blue-400">{b.billNumber}</td>
                        <td className="px-4 py-3 text-right font-mono text-white">{currency(b.totalAmount)}</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-400">{currency(b.amountPaid)}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-white">{currency(b.balance)}</td>
                        <td className="px-4 py-3 text-center"><StatusChip status={b.status} type="bill" /></td>
                        <td className="px-4 py-3 text-slate-400">{new Date(b.dueDate).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-4">
            <h3 className="text-lg font-bold text-white border-b border-slate-800 pb-3">Ledger Transactions</h3>
            {ledger.isLoading && <SkeletonBlock />}
            {!ledger.isLoading && ledger.isError && (
              <InlineEmpty message="Unable to load your ledger right now." />
            )}
            {!ledger.isLoading && !ledger.isError && (ledger.data?.transactions.length ?? 0) === 0 && (
              <InlineEmpty message="No transactions recorded yet." />
            )}
            {!ledger.isLoading && !ledger.isError && (ledger.data?.transactions.length ?? 0) > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] font-semibold border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Date</th>
                      <th className="px-4 py-3">Reference</th>
                      <th className="px-4 py-3">Description</th>
                      <th className="px-4 py-3 text-right">Debit</th>
                      <th className="px-4 py-3 text-right">Credit</th>
                      <th className="px-4 py-3 text-right">Running Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {(ledger.data?.transactions ?? []).map((t, i) => (
                      <tr key={i} className="hover:bg-slate-800/40">
                        <td className="px-4 py-3 text-slate-400">{new Date(t.date).toLocaleDateString()}</td>
                        <td className="px-4 py-3 font-mono text-slate-400">{t.referenceNo}</td>
                        <td className="px-4 py-3 text-white">{t.description}</td>
                        <td className="px-4 py-3 text-right font-mono text-rose-400">{t.debit > 0 ? currency(t.debit) : '—'}</td>
                        <td className="px-4 py-3 text-right font-mono text-emerald-400">{t.credit > 0 ? currency(t.credit) : '—'}</td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-white">{currency(t.runningBalance)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 7: STUDENT PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white">Official Enrolled Student Profile</h3>
            <p className="text-xs text-slate-400">Institutional record registered in EduCore</p>
          </div>

          {profile.isLoading && <SkeletonBlock />}
          {!profile.isLoading && profile.isError && (
            <InlineEmpty message="Unable to load your profile right now." />
          )}
          {!profile.isLoading && !profile.isError && profile.data && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 text-xs">
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Student Name</span>
                <div className="font-bold text-white text-sm">{profile.data.firstName} {profile.data.lastName}</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Student Number</span>
                <div className="font-mono font-bold text-blue-400 text-sm">{profile.data.studentNumber}</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Email</span>
                <div className="font-bold text-white text-sm">{profile.data.email}</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Grade Level</span>
                <div className="font-bold text-white text-sm">{profile.data.gradeLevel}</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Assigned Section</span>
                <div className="font-bold text-white text-sm">{profile.data.section}</div>
              </div>
              <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-slate-500 font-semibold uppercase text-[10px]">Academic Year</span>
                <div className="font-bold text-white text-sm">{profile.data.academicYear}</div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 8: ACADEMIC HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white">Academic History Timeline</h3>
            <p className="text-xs text-slate-400">Institutional events recorded against your record</p>
          </div>

          {history.isLoading && <SkeletonBlock />}
          {!history.isLoading && history.isError && (
            <InlineEmpty message="Unable to load your academic history right now." />
          )}
          {!history.isLoading && !history.isError && (history.data ?? []).length === 0 && (
            <InlineEmpty message="No history events recorded for your account yet." />
          )}
          {!history.isLoading && !history.isError && (history.data?.length ?? 0) > 0 && (
            <div className="space-y-2">
              {(history.data ?? []).map((h) => (
                <div key={h.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{h.action}</span>
                    <span className="text-slate-400">{new Date(h.dateOccurred).toLocaleDateString()}</span>
                  </div>
                  <p className="text-slate-400 mt-1">{h.description}</p>
                  {h.performedBy && <p className="text-[10px] text-slate-500 mt-1">By {h.performedBy}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 9: PORTAL SETTINGS */}
      {activeTab === 'settings' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-3">
            <h3 className="text-lg font-bold text-white">Student Portal Settings</h3>
            <p className="text-xs text-slate-400">Account security &amp; notification preferences</p>
          </div>

          <div className="space-y-6 max-w-xl text-xs">
            <div className="space-y-3">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Bell className="w-4 h-4 text-blue-400" /> Notification Preferences
              </h4>
              <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 opacity-60 cursor-not-allowed">
                <span>Email alerts for grade releases &amp; advisories</span>
                <input type="checkbox" disabled className="w-4 h-4" />
              </label>
              <label className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800 opacity-60 cursor-not-allowed">
                <span>SMS gate attendance alerts to parent guardian</span>
                <input type="checkbox" disabled className="w-4 h-4" />
              </label>
              <p className="text-[11px] text-slate-500">Not yet configurable — no backend field exists for these settings.</p>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800">
              <h4 className="font-bold text-white text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-blue-400" /> Security
              </h4>
              <Link
                to="/change-password"
                className="block w-full py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-semibold rounded-xl text-left px-4"
              >
                Change EduCore Account Password
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
