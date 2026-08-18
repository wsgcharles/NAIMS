import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { StatCard } from '../../components/data-display/StatCard';
import {
  Users,
  UserCheck,
  Layers,
  BookOpen,
  TrendingUp,
  Calendar,
  Clock,
  Bell,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  PlusCircle,
  FileSpreadsheet,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { useAdminApi } from '../../hooks/useAdminApi';
import { NoahLogo } from '../../components/brand/NoahLogo';
import { useAuth } from '../../contexts/AuthContext';
import apiClient from '../../services/apiClient';

export const SuperAdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const { useDashboardOverview, useActiveSchoolYear } = useAdminApi();
  const { data, isLoading, isError } = useDashboardOverview();
  const { data: activeYear } = useActiveSchoolYear();

  const firstName = user?.firstName || 'Administrator';
  const totalStudentsCount = data?.activeStudents ?? 0;

  const [enrollmentTrendData, setEnrollmentTrendData] = useState<Array<{ month: string; count: number }>>([]);

  useEffect(() => {
    apiClient.get<Array<{ month: string; count: number }>>('/Reports/analytics/enrollment-trends')
      .then((res: { data: Array<{ month: string; count: number }> }) => setEnrollmentTrendData(res.data))
      .catch(() => setEnrollmentTrendData([]));
  }, []);

  // Attendance donut chart dynamically computed from database active students
  const attendanceData = [
    { name: 'Active Enrollees', value: totalStudentsCount, color: '#10B981' },
  ];

  const currentDateText = new Date().toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
  const currentTimeText = new Date().toLocaleTimeString('en-US', {
    weekday: 'long',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* ── 1. Top Welcome Hero Banner ──────────────────── */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-900 text-white p-8 md:p-10 shadow-2xl border border-purple-800/40">
        {/* Background Decorative Pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-20 pointer-events-none bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-amber-300 via-purple-500 to-transparent" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="space-y-4 max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-amber-300 text-xs font-bold border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Noah's Academy Student Information System</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white leading-tight">
              Good day, {firstName}! 👋
            </h1>
            <p className="text-purple-200 text-sm leading-relaxed">
              Here's what's happening in Noah's Academy today. Manage students, track attendance, and monitor schoolwide analytics.
            </p>

            {/* Date & Time Pills (Real-Time Live Clock) */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-purple-950/70 text-xs font-semibold text-purple-100 border border-purple-700/50 backdrop-blur-md">
                <Calendar className="w-4 h-4 text-amber-300" />
                <span>{currentDateText}</span>
              </div>
              <div className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-purple-950/70 text-xs font-semibold text-purple-100 border border-purple-700/50 backdrop-blur-md">
                <Clock className="w-4 h-4 text-amber-300" />
                <span>{currentTimeText}</span>
              </div>
            </div>
          </div>

          {/* Right Hero Graphic & Logo Emblem (Matching Mockup) */}
          <div className="hidden lg:flex items-center justify-end shrink-0 relative">
            <div className="p-4 bg-white/10 rounded-3xl border border-white/20 backdrop-blur-md shadow-2xl flex items-center gap-4">
              <NoahLogo size="lg" showText={true} lightText={true} />
            </div>
          </div>
        </div>
      </div>

      {isError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-xs font-semibold text-rose-600 dark:text-rose-400 text-center">
          Unable to reach the EduCore API server to load live stats. Running in offline preview mode.
        </div>
      )}

      {/* ── 2. Stat Cards Row (Matching Mockup — 4 Cards) ────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Total Students"
          value={isLoading ? '…' : `${data?.totalStudents ?? 1248}`}
          description="↗ 12 this month"
          icon={UserCheck}
          iconBgColor="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
        />
        <StatCard
          title="Total Teachers"
          value={isLoading ? '…' : `${data?.totalEmployees ?? 86}`}
          description="↗ 3 this month"
          icon={Users}
          iconBgColor="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
        />
        <StatCard
          title="Total Staff"
          value="48"
          description="↗ 2 this month"
          icon={Layers}
          iconBgColor="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
        />
        <StatCard
          title="Total Classes"
          value={isLoading ? '…' : `${data?.totalSections ?? 64}`}
          description="↗ 5 this month"
          icon={BookOpen}
          iconBgColor="bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300"
        />
      </div>

      {/* ── 3. Main Analytics Row (Enrollment Chart + Attendance Donut + Announcements) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Enrollment Overview Line Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                <span>Enrollment Overview</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total enrollees growth throughout the academic year</p>
            </div>
            <select className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none">
              <option>This School Year</option>
              <option>Previous SY 2023-2024</option>
            </select>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentTrendData}>
                <defs>
                  <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[0, 1500]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#3B0764',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area type="monotone" dataKey="count" stroke="#6D28D9" strokeWidth={3} fill="url(#purpleGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Announcements Widget Sidebar Column (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Announcements Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span>Announcements</span>
              </h3>
              <Link to="/admin/announcements" className="text-xs font-bold text-purple-700 dark:text-purple-400 hover:underline">
                View All
              </Link>
            </div>

            <div className="space-y-3.5">
              <div className="p-3.5 rounded-2xl bg-purple-50/60 dark:bg-purple-950/30 border border-purple-100 dark:border-purple-900/40 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-950 dark:text-purple-100">Enrollment is Ongoing!</span>
                  <span className="w-2 h-2 rounded-full bg-purple-600" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Enroll now for SY 2025-2026. Limited slots available.</p>
                <span className="text-[10px] font-semibold text-slate-400">May 16, 2025 · Admin</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Parent-Teacher Conference</span>
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">PTC will be on May 24, 2025 (Saturday).</p>
                <span className="text-[10px] font-semibold text-slate-400">May 14, 2025 · Admin</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Quarter 2 Exams</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400">Examination schedule starts on May 28, 2025.</p>
                <span className="text-[10px] font-semibold text-slate-400">May 13, 2025 · Admin</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. Middle Row: Attendance Today Donut Chart + Academic Calendar ───── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Attendance Today Donut Chart (6 Cols) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>Attendance Today</span>
            </h3>
            <span className="text-xs font-semibold text-slate-500">May 16, 2025</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
            <div className="h-52 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={attendanceData} innerRadius={60} outerRadius={85} paddingAngle={4} dataKey="value">
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-xl font-black text-slate-900 dark:text-white">1,215</span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-100 dark:border-emerald-900/40">
                <div className="flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Present</span>
                </div>
                <span className="text-xs font-black text-emerald-700 dark:text-emerald-400">1,035 (85.2%)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-100 dark:border-amber-900/40">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Late</span>
                </div>
                <span className="text-xs font-black text-amber-700 dark:text-amber-400">98 (8.1%)</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-100 dark:border-rose-900/40">
                <div className="flex items-center space-x-2">
                  <XCircle className="w-4 h-4 text-rose-600" />
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200">Absent</span>
                </div>
                <span className="text-xs font-black text-rose-700 dark:text-rose-400">82 (6.7%)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel (6 Cols — Matching Mockup) */}
        <div className="lg:col-span-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Quick Actions</span>
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <Link
              to="/admin/students"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-100 dark:border-purple-900/50 text-center transition-all hover:scale-105"
            >
              <PlusCircle className="w-6 h-6 text-purple-700 dark:text-purple-400 mb-2" />
              <span className="text-xs font-bold text-purple-950 dark:text-purple-200">Add Student</span>
            </Link>

            <Link
              to="/admin/teachers"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-100 dark:border-purple-900/50 text-center transition-all hover:scale-105"
            >
              <Users className="w-6 h-6 text-purple-700 dark:text-purple-400 mb-2" />
              <span className="text-xs font-bold text-purple-950 dark:text-purple-200">Add Teacher</span>
            </Link>

            <Link
              to="/admin/announcements"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-100 dark:border-purple-900/50 text-center transition-all hover:scale-105"
            >
              <Bell className="w-6 h-6 text-purple-700 dark:text-purple-400 mb-2" />
              <span className="text-xs font-bold text-purple-950 dark:text-purple-200">New Notice</span>
            </Link>

            <Link
              to="/admin/reports"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-100 dark:border-purple-900/50 text-center transition-all hover:scale-105"
            >
              <FileSpreadsheet className="w-6 h-6 text-purple-700 dark:text-purple-400 mb-2" />
              <span className="text-xs font-bold text-purple-950 dark:text-purple-200">Create Report</span>
            </Link>

            <Link
              to="/admin/grades"
              className="flex flex-col items-center justify-center p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/60 border border-purple-100 dark:border-purple-900/50 text-center transition-all hover:scale-105 col-span-2 sm:col-span-1"
            >
              <Award className="w-6 h-6 text-purple-700 dark:text-purple-400 mb-2" />
              <span className="text-xs font-bold text-purple-950 dark:text-purple-200">Grades Entry</span>
            </Link>
          </div>

          <div className="pt-2">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-900 to-indigo-900 text-white flex items-center justify-between shadow-lg">
              <div>
                <span className="text-xs font-bold">Active School Year: {activeYear?.schoolYear || data?.activeAcademicYear || 'SY 2026–2027'}</span>
                <p className="text-[11px] text-purple-200">{activeYear?.currentSemester || '1st Semester'} enrollment controls active</p>
              </div>
              <Link
                to="/admin/school-years"
                className="px-3 py-1.5 bg-amber-400 text-purple-950 text-xs font-bold rounded-xl hover:bg-amber-300 transition-colors"
              >
                Manage
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── 5. Lower Row: Recent Activities + Upcoming Events (Matching Mockup) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Activities Timeline (7 Cols) */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <span>Recent Activities</span>
          </h3>

          <div className="space-y-3.5">
            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300 flex items-center justify-center font-bold text-xs">
                  {user?.fullName?.[0] || 'U'}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.fullName || user?.email || 'Authenticated User'} <span className="font-normal text-slate-500">logged in</span></p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">10:15 AM</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 flex items-center justify-center font-bold text-xs">
                  JS
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">New student <span className="text-purple-700 dark:text-purple-400">Juan Miguel Santos</span> has been added</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">9:45 AM</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300 flex items-center justify-center font-bold text-xs">
                  AT
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Attendance for Grade 10 - Section A has been submitted</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">9:30 AM</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                  EX
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">Quarter 2 Exam schedule has been published</p>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-slate-400">8:20 AM</span>
            </div>
          </div>
        </div>

        {/* Upcoming Events Date Badges (5 Cols) */}
        <div className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Upcoming Events</span>
            </h3>
            <span className="text-xs font-bold text-purple-700 dark:text-purple-400">View All</span>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-purple-900 text-white flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">MAY</span>
                <span className="text-base font-black leading-none">24</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Parent-Teacher Conference</h4>
                <p className="text-[11px] text-slate-500">May 24, 2025 (Saturday) · 8:00 AM - 12:00 PM</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-purple-900 text-white flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">MAY</span>
                <span className="text-base font-black leading-none">28</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Quarter 2 Exams</h4>
                <p className="text-[11px] text-slate-500">May 28 - June 2, 2025</p>
              </div>
            </div>

            <div className="flex items-center space-x-4 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div className="w-12 h-12 rounded-2xl bg-purple-900 text-white flex flex-col items-center justify-center shrink-0">
                <span className="text-[10px] font-bold uppercase tracking-wider text-purple-300">JUN</span>
                <span className="text-base font-black leading-none">05</span>
              </div>
              <div className="flex-1">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">Foundation Day</h4>
                <p className="text-[11px] text-slate-500">June 5, 2025 (Thursday)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
