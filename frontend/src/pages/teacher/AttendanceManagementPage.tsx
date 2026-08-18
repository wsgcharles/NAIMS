import React, { useEffect, useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { CheckSquare, Clock, UserX, Save, Loader2, BookOpen } from 'lucide-react';
import { toast } from 'sonner';
import {
  teacherAttendanceService,
  type TeacherClass,
  type TeacherStudentRosterEntry,
  type TeacherAttendanceDashboardSummary,
} from '../../services/teacherAttendanceService';

export const AttendanceManagementPage: React.FC = () => {
  const [classes, setClasses] = useState<TeacherClass[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);
  const [roster, setRoster] = useState<TeacherStudentRosterEntry[]>([]);
  const [, setSummary] = useState<TeacherAttendanceDashboardSummary>({
    presentCount: 0,
    tardyCount: 0,
    absentCount: 0,
    totalStudents: 0,
    date: new Date().toISOString(),
  });

  const [statuses, setStatuses] = useState<Record<number, 'Present' | 'Tardy' | 'Absent'>>({});
  const [remarks, setRemarks] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);

  // 1. Fetch assigned classes for the authenticated teacher on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        const assignedClasses = await teacherAttendanceService.getClasses();
        setClasses(assignedClasses);
        if (assignedClasses.length > 0) {
          setSelectedClassId(assignedClasses[0].classId);
        }
      } catch (err) {
        console.error('Failed to load teacher classes:', err);
        toast.error('Failed to load assigned classes from server.');
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // 2. Fetch roster and summary when selected class changes
  useEffect(() => {
    if (!selectedClassId) return;

    const loadRosterAndSummary = async () => {
      try {
        setLoading(true);
        const [students, dashboardData] = await Promise.all([
          teacherAttendanceService.getStudentRoster(selectedClassId),
          teacherAttendanceService.getDashboardSummary(selectedClassId),
        ]);

        setRoster(students);
        setSummary(dashboardData);

        const initialStatuses: Record<number, 'Present' | 'Tardy' | 'Absent'> = {};
        const initialRemarks: Record<number, string> = {};

        students.forEach((s) => {
          initialStatuses[s.studentId] = (s.status as any) || 'Present';
          if (s.remarks) initialRemarks[s.studentId] = s.remarks;
        });

        setStatuses(initialStatuses);
        setRemarks(initialRemarks);
      } catch (err) {
        console.error('Failed to load attendance roster:', err);
        toast.error('Failed to load student roster for selected class.');
      } finally {
        setLoading(false);
      }
    };

    loadRosterAndSummary();
  }, [selectedClassId]);

  // Recalculate local stats dynamically based on statuses
  const presentCount = Object.values(statuses).filter((s) => s === 'Present').length;
  const tardyCount = Object.values(statuses).filter((s) => s === 'Tardy').length;
  const absentCount = Object.values(statuses).filter((s) => s === 'Absent').length;

  const handleSave = async () => {
    if (!selectedClassId) return;

    try {
      setSaving(true);
      const entries = Object.entries(statuses).map(([studentIdStr, status]) => ({
        studentId: parseInt(studentIdStr, 10),
        status,
        remarks: remarks[parseInt(studentIdStr, 10)] || undefined,
      }));

      const response = await teacherAttendanceService.saveAttendance({
        classId: selectedClassId,
        entries,
      });

      if (response.summary) {
        setSummary(response.summary);
      }

      toast.success('Attendance records saved successfully to PostgreSQL database.');
    } catch (err) {
      console.error('Failed to save attendance:', err);
      toast.error('Failed to save attendance records to backend API.');
    } finally {
      setSaving(false);
    }
  };

  const selectedClass = classes.find((c) => c.classId === selectedClassId);

  return (
    <div className="space-y-6 pb-8">
      {/* Header & Class Selector */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Daily Attendance Tracker</h1>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Record and manage live attendance logs for your assigned sections.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {classes.length > 0 && (
            <div className="relative">
              <select
                value={selectedClassId || ''}
                onChange={(e) => setSelectedClassId(Number(e.target.value))}
                className="pl-3 pr-8 py-2.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-bold text-slate-900 dark:text-white shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-600/20"
              >
                {classes.map((c) => (
                  <option key={c.classId} value={c.classId}>
                    {c.className} ({c.studentCount} Students)
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            onClick={handleSave}
            disabled={saving || loading || roster.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Attendance</span>
          </button>
        </div>
      </div>

      {/* Dynamic Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Present" value={`${presentCount}`} description="On time today" icon={CheckSquare} iconBgColor="bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400" />
        <StatCard title="Tardy" value={`${tardyCount}`} description="Late arrival" icon={Clock} iconBgColor="bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400" />
        <StatCard title="Absent" value={`${absentCount}`} description="Unexcused / excused" icon={UserX} iconBgColor="bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400" />
      </div>

      {/* Student Roster */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-4 h-4 text-purple-600" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Student Roster — {selectedClass ? selectedClass.className : 'Assigned Section'}
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {roster.length} Enrolled Students
          </span>
        </div>

        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3 text-slate-400">
            <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
            <span className="text-xs font-medium">Loading live student roster from database...</span>
          </div>
        ) : roster.length === 0 ? (
          <div className="py-12 text-center text-xs font-semibold text-slate-500">
            No students are assigned to this class yet.
          </div>
        ) : (
          <div className="space-y-3">
            {roster.map((student) => (
              <div key={student.studentId} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{student.studentName}</p>
                  <p className="text-[11px] text-slate-500 font-mono">LRN: {student.lrn}</p>
                </div>

                <div className="flex items-center gap-2">
                  {(['Present', 'Tardy', 'Absent'] as const).map((status) => (
                    <button
                      key={status}
                      onClick={() => setStatuses((prev) => ({ ...prev, [student.studentId]: status }))}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                        statuses[student.studentId] === status
                          ? status === 'Present'
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : status === 'Tardy'
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'bg-rose-600 text-white shadow-xs'
                          : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-purple-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
