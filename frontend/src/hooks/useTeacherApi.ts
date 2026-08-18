import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/queryKeys';
import apiClient from '../services/apiClient';
import type { TeacherClass, TeacherGrade } from '../types';
import { toast } from 'sonner';

export const useTeacherApi = () => {
  const queryClient = useQueryClient();

  const useTeacherClasses = () =>
    useQuery({
      queryKey: queryKeys.teacherPortal.classes,
      queryFn: async (): Promise<TeacherClass[]> => {
        const response = await apiClient.get<TeacherClass[]>('/TeacherDashboard/MyClasses');
        return response.data;
      },
    });

  const useTeacherGrades = (teachingAssignmentId: number | null) =>
    useQuery({
      queryKey: queryKeys.teacherPortal.grades(teachingAssignmentId ?? 0),
      queryFn: async (): Promise<TeacherGrade[]> => {
        const response = await apiClient.get<TeacherGrade[]>(
          `/TeacherDashboard/MyClasses/${teachingAssignmentId}/Grades`
        );
        return response.data;
      },
      enabled: teachingAssignmentId != null,
    });

  const useUpdateGradeMutation = (teachingAssignmentId: number | null) =>
    useMutation({
      mutationFn: async (payload: {
        gradeId: number;
        prelimGrade: number | null;
        midtermGrade: number | null;
        finalGrade: number | null;
      }) => {
        await apiClient.put(`/TeacherDashboard/Grades/${payload.gradeId}`, {
          prelimGrade: payload.prelimGrade,
          midtermGrade: payload.midtermGrade,
          finalGrade: payload.finalGrade,
        });
      },
      onSuccess: () => {
        if (teachingAssignmentId != null) {
          queryClient.invalidateQueries({ queryKey: queryKeys.teacherPortal.grades(teachingAssignmentId) });
        }
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message || err?.response?.data || 'Unable to update grade.';
        toast.error(typeof message === 'string' ? message : 'Unable to update grade.');
      },
    });

  const useReleaseGradesMutation = (teachingAssignmentId: number | null) =>
    useMutation({
      mutationFn: async (isReleased: boolean) => {
        await apiClient.put(`/TeacherDashboard/MyClasses/${teachingAssignmentId}/ReleaseGrades`, {
          isReleased,
        });
      },
      onSuccess: (_data, isReleased) => {
        toast.success(isReleased ? 'Grades released to students.' : 'Grades unpublished.');
        if (teachingAssignmentId != null) {
          queryClient.invalidateQueries({ queryKey: queryKeys.teacherPortal.grades(teachingAssignmentId) });
        }
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message || err?.response?.data || 'Unable to update release status.';
        toast.error(typeof message === 'string' ? message : 'Unable to update release status.');
      },
    });

  const useSubmitGradesForApprovalMutation = (teachingAssignmentId: number | null) =>
    useMutation({
      mutationFn: async () => {
        await apiClient.post(`/TeacherDashboard/MyClasses/${teachingAssignmentId}/SubmitForApproval`);
      },
      onSuccess: () => {
        toast.success('Grades submitted for approval to Academic Head / Vice Principal.');
        if (teachingAssignmentId != null) {
          queryClient.invalidateQueries({ queryKey: queryKeys.teacherPortal.grades(teachingAssignmentId) });
        }
      },
      onError: (err: any) => {
        const message = err?.response?.data?.message || err?.response?.data || 'Unable to submit grades for approval.';
        toast.error(typeof message === 'string' ? message : 'Unable to submit grades for approval.');
      },
    });

  return {
    useTeacherClasses,
    useTeacherGrades,
    useUpdateGradeMutation,
    useSubmitGradesForApprovalMutation,
    useReleaseGradesMutation,
  };
};
