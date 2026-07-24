import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/queryKeys';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import type {
  AdminDashboardOverview,
  RoleCountStat,
  AdminStudent,
  StudentFormPayload,
  AdminEmployee,
  EmployeeFormPayload,
  AdminSubject,
  SubjectFormPayload,
  AdminGradeLevel,
  AdminGradeRecord,
  AdminUser,
  SchoolSettings,
  StudentSectionAssignment,
  SectionOption,
  RegistrarStudent,
  AcademicYearRecord,
} from '../types';
import { toast } from 'sonner';

const mutationError = (fallback: string) => (err: any) => {
  const message = err?.response?.data?.message || err?.response?.data || fallback;
  toast.error(typeof message === 'string' ? message : fallback);
};

export const useAdminApi = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // ---------- Dashboard ----------
  const useDashboardOverview = () =>
    useQuery({
      queryKey: queryKeys.admin.dashboard,
      queryFn: async (): Promise<AdminDashboardOverview> => {
        if (user?.role === 'Principal') {
          const response = await apiClient.get<{
            overview: {
              totalActiveStudents: number;
              totalActiveEmployees: number;
              totalSections: number;
              totalSubjects: number;
              currentAcademicYear: string | null;
            };
            enrollmentPipeline: { total: number; pending: number; approved: number; rejected: number };
            employeeBreakdown: RoleCountStat[];
          }>('/Dashboard/principal');
          const d = response.data;
          return {
            totalStudents: d.overview.totalActiveStudents,
            activeStudents: d.overview.totalActiveStudents,
            totalEmployees: d.overview.totalActiveEmployees,
            activeEmployees: d.overview.totalActiveEmployees,
            totalSections: d.overview.totalSections,
            totalSubjects: d.overview.totalSubjects,
            pendingApplications: d.enrollmentPipeline.pending,
            approvedApplications: d.enrollmentPipeline.approved,
            rejectedApplications: d.enrollmentPipeline.rejected,
            employeesByRole: d.employeeBreakdown,
            activeAcademicYear: d.overview.currentAcademicYear,
          };
        }
        const response = await apiClient.get<{
          totalStudents: number;
          activeStudents: number;
          inactiveStudents: number;
          totalEmployees: number;
          activeEmployees: number;
          employeesByRole: RoleCountStat[];
          totalSections: number;
          totalSubjects: number;
          totalEnrollmentApplications: number;
          pendingApplications: number;
          approvedApplications: number;
          rejectedApplications: number;
          activeAcademicYear: string | null;
        }>('/Dashboard/admin');
        const d = response.data;
        return {
          totalStudents: d.totalStudents,
          activeStudents: d.activeStudents,
          totalEmployees: d.totalEmployees,
          activeEmployees: d.activeEmployees,
          totalSections: d.totalSections,
          totalSubjects: d.totalSubjects,
          pendingApplications: d.pendingApplications,
          approvedApplications: d.approvedApplications,
          rejectedApplications: d.rejectedApplications,
          employeesByRole: d.employeesByRole,
          activeAcademicYear: d.activeAcademicYear,
        };
      },
      enabled: !!user?.role,
    });

  // ---------- Students ----------
  const useStudents = () =>
    useQuery({
      queryKey: queryKeys.admin.students,
      queryFn: async (): Promise<AdminStudent[]> => {
        const response = await apiClient.get<AdminStudent[]>('/Students');
        return response.data;
      },
    });

  const useCreateStudentMutation = () =>
    useMutation({
      mutationFn: async (payload: StudentFormPayload): Promise<AdminStudent> => {
        const response = await apiClient.post<AdminStudent>('/Students', payload);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.students });
      },
      onError: mutationError('Unable to create student.'),
    });

  const useUpdateStudentMutation = () =>
    useMutation({
      mutationFn: async (payload: { id: number; data: StudentFormPayload }) => {
        await apiClient.put(`/Students/${payload.id}`, payload.data);
      },
      onSuccess: () => {
        toast.success('Student record updated.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.students });
      },
      onError: mutationError('Unable to update student.'),
    });

  const useToggleStudentStatusMutation = () =>
    useMutation({
      mutationFn: async (id: number) => {
        await apiClient.patch(`/Students/${id}/status`);
      },
      onSuccess: () => {
        toast.success('Student status updated.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.students });
      },
      onError: mutationError('Unable to update student status.'),
    });

  const useDeleteStudentMutation = () =>
    useMutation({
      mutationFn: async (id: number) => {
        await apiClient.delete(`/Students/${id}`);
      },
      onSuccess: () => {
        toast.success('Student record deleted.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.students });
      },
      onError: mutationError('Unable to delete student.'),
    });

  // ---------- Employees ----------
  const useEmployees = () =>
    useQuery({
      queryKey: queryKeys.admin.employees,
      queryFn: async (): Promise<AdminEmployee[]> => {
        const response = await apiClient.get<AdminEmployee[]>('/Employees');
        return response.data;
      },
    });

  const useCreateEmployeeMutation = () =>
    useMutation({
      mutationFn: async (payload: EmployeeFormPayload): Promise<AdminEmployee> => {
        const response = await apiClient.post<AdminEmployee>('/Employees', payload);
        return response.data;
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.employees });
      },
      onError: mutationError('Unable to create employee.'),
    });

  const useUpdateEmployeeMutation = () =>
    useMutation({
      mutationFn: async (payload: { id: number; data: EmployeeFormPayload }) => {
        await apiClient.put(`/Employees/${payload.id}`, payload.data);
      },
      onSuccess: () => {
        toast.success('Employee record updated.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.employees });
      },
      onError: mutationError('Unable to update employee.'),
    });

  const useToggleEmployeeStatusMutation = () =>
    useMutation({
      mutationFn: async (id: number) => {
        await apiClient.patch(`/Employees/${id}/toggle-status`);
      },
      onSuccess: () => {
        toast.success('Employee status updated.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.employees });
      },
      onError: mutationError('Unable to update employee status.'),
    });

  const useDeleteEmployeeMutation = () =>
    useMutation({
      mutationFn: async (id: number) => {
        await apiClient.delete(`/Employees/${id}`);
      },
      onSuccess: () => {
        toast.success('Employee record deleted.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.employees });
      },
      onError: mutationError('Unable to delete employee.'),
    });

  // ---------- Subjects (+ Grade Levels as a read-only lookup) ----------
  const useSubjects = () =>
    useQuery({
      queryKey: queryKeys.admin.subjects,
      queryFn: async (): Promise<AdminSubject[]> => {
        const response = await apiClient.get<AdminSubject[]>('/Subjects');
        return response.data;
      },
    });

  const useGradeLevels = () =>
    useQuery({
      queryKey: queryKeys.admin.gradeLevels,
      queryFn: async (): Promise<AdminGradeLevel[]> => {
        const response = await apiClient.get<AdminGradeLevel[]>('/GradeLevels');
        return response.data;
      },
    });

  const useCreateSubjectMutation = () =>
    useMutation({
      mutationFn: async (payload: SubjectFormPayload) => {
        const { isActive: _isActive, ...createPayload } = payload;
        await apiClient.post('/Subjects', createPayload);
      },
      onSuccess: () => {
        toast.success('Subject created.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.subjects });
      },
      onError: mutationError('Unable to create subject.'),
    });

  const useUpdateSubjectMutation = () =>
    useMutation({
      mutationFn: async (payload: { id: number; data: SubjectFormPayload }) => {
        await apiClient.put(`/Subjects/${payload.id}`, { ...payload.data, isActive: payload.data.isActive ?? true });
      },
      onSuccess: () => {
        toast.success('Subject updated.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.subjects });
      },
      onError: mutationError('Unable to update subject.'),
    });

  const useDeleteSubjectMutation = () =>
    useMutation({
      mutationFn: async (id: number) => {
        await apiClient.delete(`/Subjects/${id}`);
      },
      onSuccess: () => {
        toast.success('Subject deleted.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.subjects });
      },
      onError: mutationError('Unable to delete subject.'),
    });

  // ---------- Grade Management (institutional oversight — complements Teacher's own gradebook) ----------
  const useAdminGrades = () =>
    useQuery({
      queryKey: queryKeys.admin.grades,
      queryFn: async (): Promise<AdminGradeRecord[]> => {
        const response = await apiClient.get<AdminGradeRecord[]>('/Grades');
        return response.data;
      },
    });

  const useMarkGradeCompletedMutation = () =>
    useMutation({
      mutationFn: async (record: AdminGradeRecord) => {
        await apiClient.put(`/Grades/${record.id}`, {
          enrollmentId: record.enrollmentId,
          subjectId: record.subjectId,
          teachingAssignmentId: record.teachingAssignmentId,
          prelimGrade: record.prelimGrade,
          midtermGrade: record.midtermGrade,
          finalGrade: record.finalGrade,
          finalAverage: record.finalAverage,
          isCompleted: true,
        });
      },
      onSuccess: () => {
        toast.success('Gradebook entry marked completed.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.grades });
      },
      onError: mutationError('Unable to update this grade record.'),
    });

  // ---------- Users (SuperAdministrator only) ----------
  const useUsers = () =>
    useQuery({
      queryKey: queryKeys.admin.users,
      queryFn: async (): Promise<AdminUser[]> => {
        const response = await apiClient.get<AdminUser[]>('/Users');
        return response.data;
      },
      enabled: user?.role === 'SuperAdministrator',
    });

  const useToggleUserStatusMutation = () =>
    useMutation({
      mutationFn: async (id: number) => {
        await apiClient.patch(`/Users/${id}/status`);
      },
      onSuccess: () => {
        toast.success('User account status updated.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.users });
      },
      onError: mutationError('Unable to update user status.'),
    });

  // ---------- System Settings ----------
  const useSchoolSettings = () =>
    useQuery({
      queryKey: queryKeys.admin.systemSettings,
      queryFn: async (): Promise<SchoolSettings> => {
        const response = await apiClient.get<SchoolSettings>('/SystemSettings');
        return response.data;
      },
    });

  const useAcademicYearsLookup = () =>
    useQuery({
      queryKey: queryKeys.admin.academicYears,
      queryFn: async (): Promise<AcademicYearRecord[]> => {
        const response = await apiClient.get<AcademicYearRecord[]>('/AcademicYears');
        return response.data;
      },
    });

  const useUpdateSchoolSettingsMutation = () =>
    useMutation({
      mutationFn: async (settings: SchoolSettings) => {
        const { id: _id, currentAcademicYearName: _currentAcademicYearName, ...payload } = settings;
        await apiClient.put('/SystemSettings', payload);
      },
      onSuccess: () => {
        toast.success('System settings saved successfully.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.systemSettings });
      },
      onError: mutationError('Unable to save system settings.'),
    });

  // ---------- Section Allocations ----------
  const useSectionAssignments = () =>
    useQuery({
      queryKey: queryKeys.admin.sectionAssignments,
      queryFn: async (): Promise<StudentSectionAssignment[]> => {
        const response = await apiClient.get<StudentSectionAssignment[]>('/StudentSectionAssignments');
        return response.data;
      },
    });

  const useSectionsLookup = () =>
    useQuery({
      queryKey: queryKeys.admin.sections,
      queryFn: async (): Promise<SectionOption[]> => {
        const response = await apiClient.get<SectionOption[]>('/Sections');
        return response.data;
      },
    });

  const useStudentsLookup = () =>
    useQuery({
      queryKey: queryKeys.registrar.students,
      queryFn: async (): Promise<RegistrarStudent[]> => {
        const response = await apiClient.get<RegistrarStudent[]>('/Registrar/Students');
        return response.data;
      },
    });

  const useCreateSectionAssignmentMutation = () =>
    useMutation({
      mutationFn: async (payload: { studentId: number; sectionId: number }) => {
        await apiClient.post('/StudentSectionAssignments', payload);
      },
      onSuccess: () => {
        toast.success('Student assigned to section.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.sectionAssignments });
      },
      onError: mutationError('Unable to assign student to section.'),
    });

  const useDeleteSectionAssignmentMutation = () =>
    useMutation({
      mutationFn: async (id: number) => {
        await apiClient.delete(`/StudentSectionAssignments/${id}`);
      },
      onSuccess: () => {
        toast.success('Section assignment removed.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.sectionAssignments });
      },
      onError: mutationError('Unable to remove this section assignment.'),
    });

  return {
    useDashboardOverview,
    useStudents,
    useCreateStudentMutation,
    useUpdateStudentMutation,
    useToggleStudentStatusMutation,
    useDeleteStudentMutation,
    useEmployees,
    useCreateEmployeeMutation,
    useUpdateEmployeeMutation,
    useToggleEmployeeStatusMutation,
    useDeleteEmployeeMutation,
    useSubjects,
    useGradeLevels,
    useCreateSubjectMutation,
    useUpdateSubjectMutation,
    useDeleteSubjectMutation,
    useAdminGrades,
    useMarkGradeCompletedMutation,
    useUsers,
    useToggleUserStatusMutation,
    useSchoolSettings,
    useUpdateSchoolSettingsMutation,
    useAcademicYearsLookup,
    useSectionAssignments,
    useSectionsLookup,
    useStudentsLookup,
    useCreateSectionAssignmentMutation,
    useDeleteSectionAssignmentMutation,
  };
};
