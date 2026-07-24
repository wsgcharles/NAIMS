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
      }): Promise<ApproveAndEnrollResult> => {
        const response = await apiClient.put<ApproveAndEnrollResult>(
          `/Enrollment/${payload.applicationId}/approve-and-enroll`,
          {
            lrn: payload.lrn,
            employeeId: payload.employeeId,
            sectionId: payload.sectionId,
            enrollmentType: payload.enrollmentType,
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
        const match = response.data.find(
          (e) => e.email.toLowerCase() === (user?.email ?? '').toLowerCase()
        );
        return match?.id ?? null;
      },
      enabled: !!user?.email,
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

  return {
    useEnrollmentApplications,
    useApproveApplicationMutation,
    useRejectApplicationMutation,
    useApproveAndEnrollMutation,
    useSections,
    useAcademicYears,
    useCurrentEmployeeId,
    useStudents,
    useStudentHistory,
    usePromoteStudentMutation,
    useTransferStudentMutation,
    useGraduateStudentMutation,
  };
};
