import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '../services/queryKeys';
import apiClient from '../services/apiClient';
import type {
  StudentPortalProfile,
  StudentPortalSubject,
  StudentPortalGrade,
  StudentBill,
  StudentLedger,
  StudentHistoryEntry,
} from '../types';

export const useStudentApi = () => {
  const useProfile = () =>
    useQuery({
      queryKey: queryKeys.studentPortal.profile,
      queryFn: async (): Promise<StudentPortalProfile> => {
        const response = await apiClient.get<StudentPortalProfile>('/StudentDashboard/Profile');
        return response.data;
      },
    });

  const useSubjects = () =>
    useQuery({
      queryKey: queryKeys.studentPortal.subjects,
      queryFn: async (): Promise<StudentPortalSubject[]> => {
        const response = await apiClient.get<StudentPortalSubject[]>('/StudentDashboard/Subjects');
        return response.data;
      },
    });

  const useGrades = () =>
    useQuery({
      queryKey: queryKeys.studentPortal.grades,
      queryFn: async (): Promise<StudentPortalGrade[]> => {
        const response = await apiClient.get<StudentPortalGrade[]>('/StudentDashboard/Grades');
        return response.data;
      },
    });

  const useFinancials = () =>
    useQuery({
      queryKey: queryKeys.studentPortal.financials,
      queryFn: async (): Promise<StudentBill[]> => {
        const response = await apiClient.get<StudentBill[]>('/StudentDashboard/Financials');
        return response.data;
      },
    });

  const useLedger = () =>
    useQuery({
      queryKey: queryKeys.studentPortal.ledger,
      queryFn: async (): Promise<StudentLedger> => {
        const response = await apiClient.get<StudentLedger>('/StudentDashboard/Ledger');
        return response.data;
      },
    });

  const useAcademicHistory = () =>
    useQuery({
      queryKey: queryKeys.studentPortal.history,
      queryFn: async (): Promise<StudentHistoryEntry[]> => {
        const response = await apiClient.get<StudentHistoryEntry[]>('/StudentHistory/my');
        return response.data;
      },
    });

  return {
    useProfile,
    useSubjects,
    useGrades,
    useFinancials,
    useLedger,
    useAcademicHistory,
  };
};
