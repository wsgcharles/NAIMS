import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../services/queryKeys';
import apiClient from '../services/apiClient';
import { useAuth } from '../contexts/AuthContext';
import type {
  AccountingDashboard,
  SchoolFee,
  SchoolFeeFormPayload,
  RegistrarStudent,
  StudentLedger,
  StudentBill,
  OfficialReceipt,
  ProcessPaymentPayload,
  EmployeeDirectoryEntry,
  AcademicYearRecord,
  AdminGradeLevel,
  AccountingQueueItem,
  GenerateAssessmentPayload,
  PaymentAdjustmentPayload,
} from '../types';
import { toast } from 'sonner';

const mutationError = (fallback: string) => (err: any) => {
  const message = err?.response?.data?.message || err?.response?.data || fallback;
  toast.error(typeof message === 'string' ? message : fallback);
};

export const useAccountingApi = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  // ---------- Dashboard ----------
  const useDashboard = () =>
    useQuery({
      queryKey: queryKeys.finance.dashboard,
      queryFn: async (): Promise<AccountingDashboard> => {
        const response = await apiClient.get<AccountingDashboard>('/Accounting/Dashboard');
        return response.data;
      },
    });

  // ---------- Fee Categories Catalog ----------
  const useFees = () =>
    useQuery({
      queryKey: queryKeys.finance.fees,
      queryFn: async (): Promise<SchoolFee[]> => {
        const response = await apiClient.get<SchoolFee[]>('/Accounting/Fees');
        return response.data;
      },
    });

  const useCreateFeeMutation = () =>
    useMutation({
      mutationFn: async (payload: SchoolFeeFormPayload) => {
        const { isActive: _isActive, ...createPayload } = payload;
        await apiClient.post('/Accounting/Fees', createPayload);
      },
      onSuccess: () => {
        toast.success('Fee category created.');
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.fees });
      },
      onError: mutationError('Unable to create fee category.'),
    });

  const useUpdateFeeMutation = () =>
    useMutation({
      mutationFn: async (payload: { id: number; data: SchoolFeeFormPayload }) => {
        await apiClient.put(`/Accounting/Fees/${payload.id}`, { ...payload.data, isActive: payload.data.isActive ?? true });
      },
      onSuccess: () => {
        toast.success('Fee category updated.');
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.fees });
      },
      onError: mutationError('Unable to update fee category.'),
    });

  const useDeleteFeeMutation = () =>
    useMutation({
      mutationFn: async (id: number) => {
        await apiClient.delete(`/Accounting/Fees/${id}`);
      },
      onSuccess: () => {
        toast.success('Fee category deleted.');
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.fees });
      },
      onError: mutationError('Unable to delete fee category.'),
    });

  // ---------- Acting Employee Resolution ----------
  // ProcessPaymentRequest.ProcessedByEmployeeId is [Required] and not derived from the
  // JWT server-side — resolved by matching the current user's email against the real
  // employee directory, same pattern already established in useRegistrarApi.ts.
  const useCurrentEmployeeId = () =>
    useQuery({
      queryKey: queryKeys.finance.currentEmployee,
      queryFn: async (): Promise<number | null> => {
        const response = await apiClient.get<EmployeeDirectoryEntry[]>('/Employees');
        const match = response.data.find((e) => {
          if (user?.id && (e as any).userId != null) {
            return Number((e as any).userId) === Number(user.id);
          }
          return e.email.toLowerCase() === (user?.email ?? '').toLowerCase();
        });
        return match?.id ?? null;
      },
      enabled: !!user?.id || !!user?.email,
    });


  // ---------- Student Lookup ----------
  const useStudentsLookup = () =>
    useQuery({
      queryKey: queryKeys.registrar.students,
      queryFn: async (): Promise<RegistrarStudent[]> => {
        const response = await apiClient.get<RegistrarStudent[]>('/Registrar/Students');
        return response.data;
      },
    });

  // ---------- Fee Form Lookups ----------
  const useAcademicYearsLookup = () =>
    useQuery({
      queryKey: queryKeys.admin.academicYears,
      queryFn: async (): Promise<AcademicYearRecord[]> => {
        const response = await apiClient.get<AcademicYearRecord[]>('/AcademicYears');
        return response.data;
      },
    });

  const useGradeLevelsLookup = () =>
    useQuery({
      queryKey: queryKeys.admin.gradeLevels,
      queryFn: async (): Promise<AdminGradeLevel[]> => {
        const response = await apiClient.get<AdminGradeLevel[]>('/GradeLevels');
        return response.data;
      },
    });

  // ---------- Per-Student Financial Records ----------
  const useStudentLedger = (studentId: number | null) =>
    useQuery({
      queryKey: queryKeys.finance.ledger(studentId ?? 0),
      queryFn: async (): Promise<StudentLedger> => {
        const response = await apiClient.get<StudentLedger>(`/Accounting/Ledger/${studentId}`);
        return response.data;
      },
      enabled: studentId != null,
    });

  const useStudentBills = (studentId: number | null) =>
    useQuery({
      queryKey: queryKeys.finance.bills(studentId ?? 0),
      queryFn: async (): Promise<StudentBill[]> => {
        const response = await apiClient.get<StudentBill[]>(`/Accounting/Bills/Student/${studentId}`);
        return response.data;
      },
      enabled: studentId != null,
    });

  const useStudentReceipts = (studentId: number | null) =>
    useQuery({
      queryKey: queryKeys.finance.receipts(studentId ?? 0),
      queryFn: async (): Promise<OfficialReceipt[]> => {
        const response = await apiClient.get<OfficialReceipt[]>(`/Accounting/Receipts/Student/${studentId}`);
        return response.data;
      },
      enabled: studentId != null,
    });

  // ---------- Payment Processing ----------
  const useProcessPaymentMutation = (studentId: number | null) =>
    useMutation({
      mutationFn: async (payload: ProcessPaymentPayload) => {
        await apiClient.post('/Accounting/Payments', payload);
      },
      onSuccess: () => {
        toast.success('Payment recorded and official receipt generated.');
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.dashboard });
        queryClient.invalidateQueries({ queryKey: ['finance', 'queue'] });
        if (studentId != null) {
          queryClient.invalidateQueries({ queryKey: queryKeys.finance.bills(studentId) });
          queryClient.invalidateQueries({ queryKey: queryKeys.finance.ledger(studentId) });
          queryClient.invalidateQueries({ queryKey: queryKeys.finance.receipts(studentId) });
        }
      },
      onError: mutationError('Unable to process this payment.'),
    });

  // ---------- Accounting Queue & Applicant Assessment ----------
  const useAccountingQueue = (stage?: string) =>
    useQuery({
      queryKey: ['finance', 'queue', stage ?? 'All'],
      queryFn: async (): Promise<AccountingQueueItem[]> => {
        const response = await apiClient.get<AccountingQueueItem[]>('/Accounting/Queue', {
          params: { stage },
        });
        return response.data;
      },
    });

  const useGenerateAssessmentMutation = () =>
    useMutation({
      mutationFn: async (payload: GenerateAssessmentPayload) => {
        const response = await apiClient.post('/Accounting/Assessment/Generate', payload);
        return response.data;
      },
      onSuccess: () => {
        toast.success('Financial assessment bill generated and applicant moved to Accounting Assessment stage.');
        queryClient.invalidateQueries({ queryKey: ['finance', 'queue'] });
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.dashboard });
      },
      onError: mutationError('Unable to generate assessment bill.'),
    });

  const useApplicationFinancialAccount = (applicationId: number | null) =>
    useQuery({
      queryKey: ['finance', 'application-ledger', applicationId],
      queryFn: async (): Promise<StudentLedger> => {
        const response = await apiClient.get<StudentLedger>(`/Accounting/Ledger/Application/${applicationId}`);
        return response.data;
      },
      enabled: applicationId != null,
    });

  const useAdjustPaymentMutation = () =>
    useMutation({
      mutationFn: async (payload: PaymentAdjustmentPayload) => {
        const response = await apiClient.post('/Accounting/Payments/Adjust', payload);
        return response.data;
      },
      onSuccess: () => {
        toast.success('Payment record adjusted.');
        queryClient.invalidateQueries({ queryKey: queryKeys.finance.dashboard });
        queryClient.invalidateQueries({ queryKey: ['finance', 'queue'] });
      },
      onError: mutationError('Unable to adjust payment.'),
    });

  return {
    useDashboard,
    useFees,
    useCreateFeeMutation,
    useUpdateFeeMutation,
    useDeleteFeeMutation,
    useCurrentEmployeeId,
    useStudentsLookup,
    useAcademicYearsLookup,
    useGradeLevelsLookup,
    useStudentLedger,
    useStudentBills,
    useStudentReceipts,
    useProcessPaymentMutation,
    useAccountingQueue,
    useGenerateAssessmentMutation,
    useApplicationFinancialAccount,
    useAdjustPaymentMutation,
  };
};
