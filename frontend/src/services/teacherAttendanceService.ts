import { apiClient } from './apiClient';

export interface TeacherClass {
  classId: number;
  teachingAssignmentId: number;
  className: string;
  sectionName: string;
  subjectName: string;
  gradeLevel: string;
  studentCount: number;
}

export interface TeacherAttendanceDashboardSummary {
  presentCount: number;
  tardyCount: number;
  absentCount: number;
  totalStudents: number;
  date: string;
}

export interface TeacherStudentRosterEntry {
  studentId: number;
  lrn: string;
  studentName: string;
  status: 'Present' | 'Tardy' | 'Absent';
  remarks?: string;
}

export interface SaveTeacherAttendancePayload {
  classId: number;
  date?: string;
  entries: {
    studentId: number;
    status: string;
    remarks?: string;
  }[];
}

export const teacherAttendanceService = {
  getClasses: async (): Promise<TeacherClass[]> => {
    const response = await apiClient.get('/TeacherAttendance/classes');
    return response.data;
  },

  getDashboardSummary: async (classId?: number, date?: string): Promise<TeacherAttendanceDashboardSummary> => {
    const params = new URLSearchParams();
    if (classId) params.append('classId', classId.toString());
    if (date) params.append('date', date);
    const response = await apiClient.get(`/TeacherAttendance/dashboard?${params.toString()}`);
    return response.data;
  },

  getStudentRoster: async (classId: number, date?: string): Promise<TeacherStudentRosterEntry[]> => {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    const response = await apiClient.get(`/TeacherAttendance/students/${classId}?${params.toString()}`);
    return response.data;
  },

  saveAttendance: async (payload: SaveTeacherAttendancePayload) => {
    const response = await apiClient.post('/TeacherAttendance/save', payload);
    return response.data;
  },
};
