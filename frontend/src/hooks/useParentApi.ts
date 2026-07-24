import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/queryKeys';
import apiClient from '../services/apiClient';
import type {
  AcademicYearRecord,
  ChildDetails,
  ChildGrade,
  ChildSummary,
  ParentProfile,
  StudentLedger,
} from '../types';

export const useParentApi = () => {
  const useParentProfile = () =>
    useQuery({
      queryKey: queryKeys.parentPortal.profile,
      queryFn: async (): Promise<ParentProfile> => {
        const response = await apiClient.get<ParentProfile>('/ParentPortal/Profile');
        return response.data;
      },
    });

  const useChildren = () =>
    useQuery({
      queryKey: queryKeys.parentPortal.children,
      queryFn: async (): Promise<ChildSummary[]> => {
        const response = await apiClient.get<ChildSummary[]>('/ParentPortal/Children');
        return response.data;
      },
    });

  const useChildDetails = (studentId: number | null) =>
    useQuery({
      queryKey: queryKeys.parentPortal.childDetails(studentId ?? 0),
      queryFn: async (): Promise<ChildDetails> => {
        const response = await apiClient.get<ChildDetails>(`/ParentPortal/Children/${studentId}`);
        return response.data;
      },
      enabled: studentId != null,
    });

  const useCurrentAcademicYear = () =>
    useQuery({
      queryKey: queryKeys.parentPortal.currentAcademicYear,
      queryFn: async (): Promise<AcademicYearRecord | null> => {
        const response = await apiClient.get<AcademicYearRecord[]>('/AcademicYears');
        return response.data.find((year) => year.isActive) ?? response.data[0] ?? null;
      },
    });

  const useChildGrades = (studentId: number | null, academicYearId: number | null) =>
    useQuery({
      queryKey: queryKeys.parentPortal.childGrades(studentId ?? 0, academicYearId ?? 0),
      queryFn: async (): Promise<ChildGrade[]> => {
        const response = await apiClient.get<ChildGrade[]>(
          `/ParentPortal/Children/${studentId}/Grades`,
          { params: { academicYearId } }
        );
        return response.data;
      },
      enabled: studentId != null && academicYearId != null,
    });

  const useChildLedger = (studentId: number | null) =>
    useQuery({
      queryKey: queryKeys.parentPortal.childLedger(studentId ?? 0),
      queryFn: async (): Promise<StudentLedger> => {
        const response = await apiClient.get<StudentLedger>(
          `/ParentPortal/Children/${studentId}/Ledger`
        );
        return response.data;
      },
      enabled: studentId != null,
    });

  return {
    useParentProfile,
    useChildren,
    useChildDetails,
    useCurrentAcademicYear,
    useChildGrades,
    useChildLedger,
  };
};
