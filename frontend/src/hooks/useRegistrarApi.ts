import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/queryKeys';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import type {
  EnrollmentApplication,
  RegistrarStudent,
  StudentHistoryEntry,
  SectionOption,
  EmployeeDirectoryEntry,
  AcademicYearRecord,
  ApproveAndEnrollResult,
  FrontendEnrollmentType,
  AvailableSection,
} from '../types';
import { toast } from 'sonner';

export const useRegistrarApi = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const useEnrollmentApplications = () =>
    useQuery({
      queryKey: queryKeys.registrar.applications,
      queryFn: async (): Promise<EnrollmentApplication[]> => {
        const response = await apiClient.get<EnrollmentApplication[]>('/Enrollment');
        return response.data;
      },
    });

  const useApproveApplicationMutation = () =>
    useMutation({
      mutationFn: async (applicationId: number) => {
        await apiClient.put(`/Enrollment/${applicationId}/approve`);
      },
      onSuccess: () => {
        toast.success('Application approved.');
        queryClient.invalidateQueries({ queryKey: queryKeys.registrar.applications });
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message || err?.response?.data || 'Unable to approve application.';
        toast.error(typeof message === 'string' ? message : 'Unable to approve application.');
      },
    });

  const useRejectApplicationMutation = () =>
    useMutation({
      mutationFn: async (applicationId: number) => {
        await apiClient.put(`/Enrollment/${applicationId}/reject`);
      },
      onSuccess: () => {
        toast.success('Application rejected.');
        queryClient.invalidateQueries({ queryKey: queryKeys.registrar.applications });
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message || err?.response?.data || 'Unable to reject application.';
        toast.error(typeof message === 'string' ? message : 'Unable to reject application.');
      },
    });

  const useApproveAndEnrollMutation = () =>
    useMutation({
      mutationFn: async (payload: {
        applicationId: number;
        lrn: string;
        employeeId: number;
        sectionId: number;
        enrollmentType: FrontendEnrollmentType;
        createParentPortal?: boolean;
      }): Promise<ApproveAndEnrollResult> => {
        const response = await apiClient.put<ApproveAndEnrollResult>(
          `/Enrollment/${payload.applicationId}/assign-section`,
          {
            lrn: payload.lrn,
            employeeId: payload.employeeId,
            sectionId: payload.sectionId,
            enrollmentType: payload.enrollmentType,
            createParentPortal: payload.createParentPortal ?? true,
          }
        );
        return response.data;
      },



      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.registrar.applications });
        queryClient.invalidateQueries({ queryKey: queryKeys.registrar.students });
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message || err?.response?.data || 'Unable to enroll this applicant.';
        toast.error(typeof message === 'string' ? message : 'Unable to enroll this applicant.');
      },
    });

  const useSections = () =>
    useQuery({
      queryKey: queryKeys.registrar.sections,
      queryFn: async (): Promise<SectionOption[]> => {
        const response = await apiClient.get<SectionOption[]>('/Sections');
        return response.data;
      },
    });

  const useAcademicYears = () =>
    useQuery({
      queryKey: queryKeys.registrar.academicYears,
      queryFn: async (): Promise<AcademicYearRecord[]> => {
        const response = await apiClient.get<AcademicYearRecord[]>('/AcademicYears');
        return response.data;
      },
    });

  // ApproveAndEnroll/Promote/Transfer/Graduate all require an explicit EmployeeId
  // that the JWT/`/auth/me` doesn't carry. Resolved by matching the current
  // user's email against the real employee directory — no endpoint invented.
  const useCurrentEmployeeId = () =>
    useQuery({
      queryKey: queryKeys.registrar.currentEmployee,
      queryFn: async (): Promise<number | null> => {
        const response = await apiClient.get<EmployeeDirectoryEntry[]>('/Employees');
        if (!response.data || response.data.length === 0) return null;

        // 1. Primary match by UserId (User.Id -> Employee.UserId)
        let match = response.data.find(
          (e) => user?.id && (e as any).userId != null && Number((e as any).userId) === Number(user.id)
        );

        // 2. Secondary match by Email
        if (!match && user?.email) {
          match = response.data.find(
            (e) => e.email.toLowerCase().trim() === user.email.toLowerCase().trim()
          );
        }

        // 3. Staff Role match (Find active employee record corresponding to the authenticated staff role)
        if (!match && user?.role) {
          const userRoleStr = (user.role || '').toString().toLowerCase();
          match = response.data.find(
            (e) =>
              (e as any).isActive !== false &&
              (((e as any).role || '').toString().toLowerCase() === userRoleStr ||
                ((e as any).role || '').toString().toLowerCase() === 'registrar' ||
                ((e as any).role || '').toString().toLowerCase() === 'administrator' ||
                ((e as any).role || '').toString().toLowerCase() === 'superadministrator')
          );
        }

        return match?.id ?? null;
      },
      enabled: !!user?.id || !!user?.email || !!user?.role,
    });





  const useStudents = () =>
    useQuery({
      queryKey: queryKeys.registrar.students,
      queryFn: async (): Promise<RegistrarStudent[]> => {
        const response = await apiClient.get<RegistrarStudent[]>('/Registrar/Students');
        return response.data;
      },
    });

  const useStudentHistory = (studentId: number | null) =>
    useQuery({
      queryKey: queryKeys.registrar.studentHistory(studentId ?? 0),
      queryFn: async (): Promise<StudentHistoryEntry[]> => {
        const response = await apiClient.get<StudentHistoryEntry[]>(`/StudentHistory/${studentId}`);
        return response.data;
      },
      enabled: studentId != null,
    });

  const usePromoteStudentMutation = () =>
    useMutation({
      mutationFn: async (payload: { studentId: number; academicYearId: number; employeeId: number; notes?: string }) => {
        await apiClient.put(`/Registrar/Students/${payload.studentId}/promote`, {
          studentId: payload.studentId,
          academicYearId: payload.academicYearId,
          employeeId: payload.employeeId,
          notes: payload.notes,
        });
      },
      onSuccess: () => {
        toast.success('Student promoted successfully.');
        queryClient.invalidateQueries({ queryKey: queryKeys.registrar.students });
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message || err?.response?.data || 'Unable to promote student.';
        toast.error(typeof message === 'string' ? message : 'Unable to promote student.');
      },
    });

  const useTransferStudentMutation = () =>
    useMutation({
      mutationFn: async (payload: { studentId: number; destinationSchool: string; employeeId: number; reason?: string }) => {
        await apiClient.put(`/Registrar/Students/${payload.studentId}/transfer`, {
          studentId: payload.studentId,
          destinationSchool: payload.destinationSchool,
          employeeId: payload.employeeId,
          reason: payload.reason,
        });
      },
      onSuccess: () => {
        toast.success('Student transferred out successfully.');
        queryClient.invalidateQueries({ queryKey: queryKeys.registrar.students });
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message || err?.response?.data || 'Unable to transfer student.';
        toast.error(typeof message === 'string' ? message : 'Unable to transfer student.');
      },
    });

  const useGraduateStudentMutation = () =>
    useMutation({
      mutationFn: async (payload: { studentId: number; schoolYear: string; employeeId: number; notes?: string }) => {
        await apiClient.put(`/Registrar/Students/${payload.studentId}/graduate`, {
          studentId: payload.studentId,
          schoolYear: payload.schoolYear,
          employeeId: payload.employeeId,
          notes: payload.notes,
        });
      },
      onSuccess: () => {
        toast.success('Student graduated successfully.');
        queryClient.invalidateQueries({ queryKey: queryKeys.registrar.students });
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message || err?.response?.data || 'Unable to graduate student.';
        toast.error(typeof message === 'string' ? message : 'Unable to graduate student.');
      },
    });

  const usePendingSectionAssignmentQueue = () =>
    useQuery({
      queryKey: ['registrar', 'pending-section-assignment'],
      queryFn: async (): Promise<EnrollmentApplication[]> => {
        const response = await apiClient.get<EnrollmentApplication[]>('/Enrollment/pending-section-assignment');
        return response.data;
      },
    });

  const useAvailableSectionsForEnrollment = (applicationId: number | null) =>
    useQuery({
      queryKey: ['sections', 'available-for-enrollment', applicationId],
      queryFn: async (): Promise<AvailableSection[]> => {
        if (!applicationId) return [];
        const response = await apiClient.get<AvailableSection[]>(`/Sections/available-for-enrollment/${applicationId}`);
        return response.data;
      },
      enabled: !!applicationId,
    });

  return {
    useEnrollmentApplications,
    usePendingSectionAssignmentQueue,
    useApproveApplicationMutation,
    useRejectApplicationMutation,
    useApproveAndEnrollMutation,
    useSections,
    useAvailableSectionsForEnrollment,
    useAcademicYears,
    useCurrentEmployeeId,
    useStudents,
    useStudentHistory,
    usePromoteStudentMutation,
    useTransferStudentMutation,
    useGraduateStudentMutation,
  };
};
