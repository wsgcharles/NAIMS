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
  SectionStats,
  CreateSectionPayload,
  UpdateSectionPayload,
  AssignSectionTeacherPayload,
  RegistrarStudent,
  AcademicYearRecord,
  AdminAnnouncement,
  CreateAnnouncementPayload,
  PagedAuditLogResponse,
  ReportsOverview,
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

  const useActiveSchoolYear = () =>
    useQuery({
      queryKey: queryKeys.admin.activeAcademicYear,
      queryFn: async (): Promise<AcademicYearRecord> => {
        const response = await apiClient.get<AcademicYearRecord>('/AcademicYears/active');
        return response.data;
      },
      staleTime: 60 * 1000,
    });

  const useAcademicYearsLookup = () =>
    useQuery({
      queryKey: queryKeys.admin.academicYears,
      queryFn: async (): Promise<AcademicYearRecord[]> => {
        const response = await apiClient.get<AcademicYearRecord[]>('/AcademicYears');
        return response.data;
      },
    });

  const useCreateSchoolYearMutation = () =>
    useMutation({
      mutationFn: async (payload: Partial<AcademicYearRecord>) => {
        const response = await apiClient.post<AcademicYearRecord>('/AcademicYears', payload);
        return response.data;
      },
      onSuccess: () => {
        toast.success('School Year created successfully.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.academicYears });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.activeAcademicYear });
      },
      onError: mutationError('Unable to create School Year.'),
    });

  const useUpdateSchoolYearMutation = () =>
    useMutation({
      mutationFn: async ({ id, data }: { id: number; data: Partial<AcademicYearRecord> }) => {
        const response = await apiClient.put<AcademicYearRecord>(`/AcademicYears/${id}`, data);
        return response.data;
      },
      onSuccess: () => {
        toast.success('School Year updated successfully.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.academicYears });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.activeAcademicYear });
      },
      onError: mutationError('Unable to update School Year.'),
    });

  const useDeleteSchoolYearMutation = () =>
    useMutation({
      mutationFn: async (id: number) => {
        await apiClient.delete(`/AcademicYears/${id}`);
      },
      onSuccess: () => {
        toast.success('School Year deleted.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.academicYears });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.activeAcademicYear });
      },
      onError: mutationError('Unable to delete School Year.'),
    });

  const useSetActiveSchoolYearMutation = () =>
    useMutation({
      mutationFn: async (id: number) => {
        await apiClient.put(`/AcademicYears/${id}/set-active`);
      },
      onSuccess: () => {
        toast.success('Active School Year updated.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.academicYears });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.activeAcademicYear });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.systemSettings });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
      },
      onError: mutationError('Unable to set active School Year.'),
    });

  const useSetSemesterMutation = () =>
    useMutation({
      mutationFn: async ({ id, semester }: { id: number; semester: string }) => {
        await apiClient.put(`/AcademicYears/${id}/set-semester`, { semester });
      },
      onSuccess: () => {
        toast.success('Semester updated.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.academicYears });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.activeAcademicYear });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.dashboard });
      },
      onError: mutationError('Unable to update semester.'),
    });

  const useArchiveSchoolYearMutation = () =>
    useMutation({
      mutationFn: async (id: number) => {
        await apiClient.put(`/AcademicYears/${id}/archive`);
      },
      onSuccess: () => {
        toast.success('School Year archived.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.academicYears });
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.activeAcademicYear });
      },
      onError: mutationError('Unable to archive School Year.'),
    });

  // ---------- Grade Approval & Release Workflow (Academic Head / Vice Principal) ----------
  const usePendingGradeApprovals = () =>
    useQuery({
      queryKey: queryKeys.admin.gradeApprovals,
      queryFn: async (): Promise<any[]> => {
        const response = await apiClient.get('/GradeApproval/pending');
        return response.data;
      },
    });

  const useAllGradesForApproval = (academicYearId?: number, statusFilter?: string) =>
    useQuery({
      queryKey: [...queryKeys.admin.gradeApprovals, academicYearId, statusFilter],
      queryFn: async (): Promise<any[]> => {
        const response = await apiClient.get('/GradeApproval/all', {
          params: { academicYearId, status: statusFilter },
        });
        return response.data;
      },
    });

  const useApproveGradeMutation = () =>
    useMutation({
      mutationFn: async ({ gradeId, remarks }: { gradeId: number; remarks?: string }) => {
        await apiClient.put(`/GradeApproval/${gradeId}/approve`, { remarks });
      },
      onSuccess: () => {
        toast.success('Grade officially approved.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.gradeApprovals });
      },
      onError: mutationError('Unable to approve grade.'),
    });

  const useApproveClassGradesMutation = () =>
    useMutation({
      mutationFn: async ({ teachingAssignmentId, remarks }: { teachingAssignmentId: number; remarks?: string }) => {
        await apiClient.put(`/GradeApproval/class/${teachingAssignmentId}/approve`, { remarks });
      },
      onSuccess: () => {
        toast.success('Class grades officially approved.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.gradeApprovals });
      },
      onError: mutationError('Unable to approve class grades.'),
    });

  const useRejectGradeMutation = () =>
    useMutation({
      mutationFn: async ({ gradeId, remarks }: { gradeId: number; remarks: string }) => {
        await apiClient.put(`/GradeApproval/${gradeId}/reject`, { remarks });
      },
      onSuccess: () => {
        toast.success('Grade returned to teacher for revision.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.gradeApprovals });
      },
      onError: mutationError('Unable to reject grade.'),
    });

  const useRejectClassGradesMutation = () =>
    useMutation({
      mutationFn: async ({ teachingAssignmentId, remarks }: { teachingAssignmentId: number; remarks: string }) => {
        await apiClient.put(`/GradeApproval/class/${teachingAssignmentId}/reject`, { remarks });
      },
      onSuccess: () => {
        toast.success('Class grades returned to teacher for revision.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.gradeApprovals });
      },
      onError: mutationError('Unable to reject class grades.'),
    });

  const useReleaseClassGradesMutation = () =>
    useMutation({
      mutationFn: async (teachingAssignmentId: number) => {
        await apiClient.put(`/GradeApproval/class/${teachingAssignmentId}/release`);
      },
      onSuccess: () => {
        toast.success('Grades officially released to Student & Parent Portals.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.gradeApprovals });
      },
      onError: mutationError('Unable to release class grades.'),
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

  // ---------- Announcements ----------
  const useAnnouncements = () =>
    useQuery({
      queryKey: queryKeys.admin.announcements,
      queryFn: async (): Promise<AdminAnnouncement[]> => {
        const response = await apiClient.get<AdminAnnouncement[]>('/Announcements');
        return response.data;
      },
    });

  const useCreateAnnouncementMutation = () =>
    useMutation({
      mutationFn: async (payload: CreateAnnouncementPayload): Promise<AdminAnnouncement> => {
        const response = await apiClient.post<AdminAnnouncement>('/Announcements', payload);
        return response.data;
      },
      onSuccess: () => {
        toast.success('Announcement published successfully.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.announcements });
      },
      onError: mutationError('Unable to publish announcement.'),
    });

  // ---------- Audit Logs ----------
  const useAuditLogs = () =>
    useQuery({
      queryKey: queryKeys.admin.auditLogs,
      queryFn: async (): Promise<PagedAuditLogResponse> => {
        const response = await apiClient.get<PagedAuditLogResponse>('/AuditLogs');
        return response.data;
      },
    });

  // ---------- Reports Overview ----------
  const useReportsOverview = () =>
    useQuery({
      queryKey: queryKeys.admin.reportsOverview,
      queryFn: async (): Promise<ReportsOverview> => {
        const response = await apiClient.get<ReportsOverview>('/Reports/overview');
        return response.data;
      },
    });

  const useAcademicPrograms = () =>
    useQuery({
      queryKey: ['admin', 'academicPrograms'],
      queryFn: async (): Promise<any[]> => {
        const response = await apiClient.get('/AcademicPrograms');
        return response.data;
      },
    });

  const useSectionStats = () =>
    useQuery({
      queryKey: ['admin', 'sectionStats'],
      queryFn: async (): Promise<SectionStats> => {
        const response = await apiClient.get<SectionStats>('/Sections/stats');
        return response.data;
      },
    });

  const useCreateSectionMutation = () =>
    useMutation({
      mutationFn: async (payload: CreateSectionPayload) => {
        const response = await apiClient.post<SectionOption>('/Sections', payload);
        return response.data;
      },
      onSuccess: () => {
        toast.success('Section created successfully.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.sections });
        queryClient.invalidateQueries({ queryKey: ['admin', 'sectionStats'] });
      },
      onError: mutationError('Unable to create section.'),
    });

  const useUpdateSectionMutation = () =>
    useMutation({
      mutationFn: async ({ id, data }: { id: number; data: UpdateSectionPayload }) => {
        const response = await apiClient.put<SectionOption>(`/Sections/${id}`, data);
        return response.data;
      },
      onSuccess: () => {
        toast.success('Section updated successfully.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.sections });
        queryClient.invalidateQueries({ queryKey: ['admin', 'sectionStats'] });
      },
      onError: mutationError('Unable to update section.'),
    });

  const useDeleteSectionMutation = () =>
    useMutation({
      mutationFn: async (id: number) => {
        await apiClient.delete(`/Sections/${id}`);
      },
      onSuccess: () => {
        toast.success('Section archived / removed.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.sections });
        queryClient.invalidateQueries({ queryKey: ['admin', 'sectionStats'] });
      },
      onError: mutationError('Unable to archive section.'),
    });

  const useToggleSectionStatusMutation = () =>
    useMutation({
      mutationFn: async (id: number) => {
        await apiClient.put(`/Sections/${id}/toggle-status`);
      },
      onSuccess: () => {
        toast.success('Section status toggled.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.sections });
        queryClient.invalidateQueries({ queryKey: ['admin', 'sectionStats'] });
      },
      onError: mutationError('Unable to update section status.'),
    });

  const useAssignSectionTeacherMutation = () =>
    useMutation({
      mutationFn: async ({ sectionId, payload }: { sectionId: number; payload: AssignSectionTeacherPayload }) => {
        await apiClient.post(`/Sections/${sectionId}/assign-teacher`, payload);
      },
      onSuccess: () => {
        toast.success('Teacher assigned to subject successfully.');
        queryClient.invalidateQueries({ queryKey: queryKeys.admin.sections });
        queryClient.invalidateQueries({ queryKey: ['admin', 'sectionStats'] });
      },
      onError: mutationError('Unable to assign teacher.'),
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
    useAcademicPrograms,
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
    useActiveSchoolYear,
    useCreateSchoolYearMutation,
    useUpdateSchoolYearMutation,
    useDeleteSchoolYearMutation,
    useSetActiveSchoolYearMutation,
    useSetSemesterMutation,
    useArchiveSchoolYearMutation,
    usePendingGradeApprovals,
    useAllGradesForApproval,
    useApproveGradeMutation,
    useApproveClassGradesMutation,
    useRejectGradeMutation,
    useRejectClassGradesMutation,
    useReleaseClassGradesMutation,
    useSectionAssignments,
    useSectionsLookup,
    useSectionStats,
    useCreateSectionMutation,
    useUpdateSectionMutation,
    useDeleteSectionMutation,
    useToggleSectionStatusMutation,
    useAssignSectionTeacherMutation,
    useStudentsLookup,
    useCreateSectionAssignmentMutation,
    useDeleteSectionAssignmentMutation,
    useAnnouncements,
    useCreateAnnouncementMutation,
    useAuditLogs,
    useReportsOverview,
  };
};


