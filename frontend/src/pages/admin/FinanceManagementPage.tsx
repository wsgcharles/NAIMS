import React, { useMemo, useState } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { StatusChip } from '../../components/data-display/StatusChip';
import {
  DollarSign,
  CreditCard,
  FileText,
  Download,
  Plus,
  Search,
  X,
  Loader2,
  Tag,
  Pencil,
  Trash2,
  Receipt,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { useAccountingApi } from '../../hooks/useAccountingApi';
import { useAuth } from '../../contexts/AuthContext';
import type { SchoolFeeFormPayload, StudentBill } from '../../types';
import { toast } from 'sonner';

const FEE_TYPES = ['Tuition', 'Miscellaneous', 'Laboratory', 'Library', 'Graduation', 'Registration', 'Other'];
const PAYMENT_METHODS = ['Cash', 'BankTransfer', 'OnlinePayment', 'Check', 'CreditCard'];

const emptyFeeForm: SchoolFeeFormPayload = {
  feeName: '',
  feeType: 'Tuition',
  amount: 0,
  academicYearId: 0,
  gradeLevelId: null,
  isMandatory: true,
  isActive: true,
};

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 });

const SkeletonRow: React.FC<{ cols: number }> = ({ cols }) => (
  <tr>
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="px-6 py-4">
        <div className="h-3 rounded bg-slate-200 dark:bg-slate-800 animate-pulse" />
      </td>
    ))}
  </tr>
);

export const FinanceManagementPage: React.FC = () => {
  const { user } = useAuth();
  const {
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
  } = useAccountingApi();

  const dashboard = useDashboard();
  const fees = useFees();
  const createFeeMutation = useCreateFeeMutation();
  const updateFeeMutation = useUpdateFeeMutation();
  const deleteFeeMutation = useDeleteFeeMutation();
  const currentEmployeeId = useCurrentEmployeeId();
  const students = useStudentsLookup();
  const academicYears = useAcademicYearsLookup();
  const gradeLevels = useGradeLevelsLookup();

  const [studentSearch, setStudentSearch] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);

  const ledger = useStudentLedger(selectedStudentId);
  const bills = useStudentBills(selectedStudentId);
  const receipts = useStudentReceipts(selectedStudentId);
  const processPaymentMutation = useProcessPaymentMutation(selectedStudentId);

  const [isFeesModalOpen, setIsFeesModalOpen] = useState(false);
  const [feeForm, setFeeForm] = useState<SchoolFeeFormPayload>(emptyFeeForm);
  const [editingFeeId, setEditingFeeId] = useState<number | null>(null);
  const [confirmDeleteFeeId, setConfirmDeleteFeeId] = useState<number | null>(null);

  const [paymentBill, setPaymentBill] = useState<StudentBill | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [remarks, setRemarks] = useState('');

  const isAccountantBlocked =
    user?.role === 'Accountant' && dashboard.isError && (dashboard.error as any)?.response?.status === 403;

  const selectedStudent = useMemo(
    () => (students.data ?? []).find((s) => s.studentId === selectedStudentId) ?? null,
    [students.data, selectedStudentId]
  );

  const matchingStudents = useMemo(() => {
    if (!studentSearch.trim() || selectedStudentId != null) return [];
    const q = studentSearch.toLowerCase();
    return (students.data ?? [])
      .filter((s) => s.fullName.toLowerCase().includes(q) || s.studentNumber.toLowerCase().includes(q))
      .slice(0, 8);
  }, [students.data, studentSearch, selectedStudentId]);

  const closeFeeModal = () => {
    setIsFeesModalOpen(false);
    setEditingFeeId(null);
    setFeeForm(emptyFeeForm);
  };

  const openEditFee = (id: number) => {
    const fee = (fees.data ?? []).find((f) => f.id === id);
    if (!fee) return;
    setEditingFeeId(id);
    setFeeForm({
      feeName: fee.feeName,
      feeType: fee.feeType,
      amount: fee.amount,
      academicYearId: fee.academicYearId,
      gradeLevelId: fee.gradeLevelId,
      isMandatory: fee.isMandatory,
      isActive: fee.isActive,
    });
  };

  const handleSaveFee = async () => {
    if (!feeForm.feeName.trim() || !feeForm.academicYearId) {
      toast.error('Fee name and academic year are required.');
      return;
    }
    try {
      if (editingFeeId != null) {
        await updateFeeMutation.mutateAsync({ id: editingFeeId, data: feeForm });
      } else {
        await createFeeMutation.mutateAsync(feeForm);
      }
      setEditingFeeId(null);
      setFeeForm(emptyFeeForm);
    } catch {
      // toast already surfaced by the mutation's onError
    }
  };

  const openPaymentModal = (bill: StudentBill) => {
    setPaymentBill(bill);
    setPaymentAmount(bill.balance);
    setPaymentMethod('Cash');
    setReferenceNumber('');
    setRemarks('');
  };

  const closePaymentModal = () => setPaymentBill(null);

  const handleRecordPayment = async () => {
    if (!paymentBill) return;
    if (paymentAmount <= 0 || paymentAmount > paymentBill.balance) {
      toast.error(`Amount must be between 0.01 and the remaining balance of ${currency(paymentBill.balance)}.`);
      return;
    }
    if (currentEmployeeId.data == null) {
      toast.error('Unable to resolve your employee record for payment processing. Contact your system administrator.');
      return;
    }
    try {
      await processPaymentMutation.mutateAsync({
        studentBillId: paymentBill.id,
        amount: paymentAmount,
        paymentMethod,
        referenceNumber,
        remarks,
        processedByEmployeeId: currentEmployeeId.data,
      });
      closePaymentModal();
    } catch {
      // toast already surfaced by the mutation's onError
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Accounting & Student Financial Ledger</h1>
          <p className="text-sm text-slate-500 mt-1">Tuition billing, payment collection recording, and official electronic receipts.</p>
        </div>

        {!isAccountantBlocked && (
          <div className="flex items-center space-x-3">
            <button
              onClick={() => toast.info('A financial reporting/export endpoint is not yet available from the backend. This module reflects live data on-screen only.')}
              className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <Download className="w-4 h-4 mr-2 text-emerald-500 inline" /> Export Ledger CSV
            </button>
            <button
              onClick={() => setIsFeesModalOpen(true)}
              className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-md shadow-blue-500/20"
            >
              <Tag className="w-4 h-4 mr-2" /> Manage Fee Categories
            </button>
          </div>
        )}
      </div>

      {isAccountantBlocked && (
        <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl text-amber-800 dark:text-amber-300">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="text-xs leading-relaxed">
            <p className="font-bold mb-1">Backend Access Configuration Limitation</p>
            <p>
              The Accounting API currently only grants access to the <strong>Administrator</strong> and{' '}
              <strong>SuperAdministrator</strong> roles — the backend's permission list for this module does not
              include the <strong>Accountant</strong> role string that this account actually carries. This is a
              backend authorization configuration issue, not a frontend bug. Please ask a system administrator to
              use this module until the backend permission list is corrected.
            </p>
          </div>
        </div>
      )}

      {!isAccountantBlocked && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            <StatCard
              title="Today's Collections"
              value={dashboard.isLoading ? '…' : currency(dashboard.data?.todayCollection ?? 0)}
              icon={DollarSign}
              iconBgColor="bg-emerald-500/10 text-emerald-500"
            />
            <StatCard
              title="Month-to-Date Collections"
              value={dashboard.isLoading ? '…' : currency(dashboard.data?.monthlyCollection ?? 0)}
              icon={Wallet}
              iconBgColor="bg-blue-500/10 text-blue-500"
            />
            <StatCard
              title="Outstanding Balances"
              value={dashboard.isLoading ? '…' : currency(dashboard.data?.totalOutstandingBalances ?? 0)}
              icon={CreditCard}
              iconBgColor="bg-amber-500/10 text-amber-500"
            />
            <StatCard
              title="Pending Bills"
              value={dashboard.isLoading ? '…' : `${dashboard.data?.pendingBillsCount ?? 0}`}
              icon={FileText}
            />
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800">
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">Recent Payments</h2>
              <p className="text-xs text-slate-500 mt-0.5">Most recent collections across all students.</p>
            </div>
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3.5">Payment #</th>
                  <th className="px-6 py-3.5">Bill #</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Processed By</th>
                  <th className="px-6 py-3.5">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {dashboard.isLoading && <SkeletonRow cols={7} />}
                {!dashboard.isLoading && dashboard.isError && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                      Unable to reach the EduCore server to load recent payments.
                    </td>
                  </tr>
                )}
                {!dashboard.isLoading && !dashboard.isError && (dashboard.data?.recentPayments.length ?? 0) === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-10 text-center text-sm text-slate-500">
                      No payments have been recorded yet.
                    </td>
                  </tr>
                )}
                {!dashboard.isLoading &&
                  !dashboard.isError &&
                  (dashboard.data?.recentPayments ?? []).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                      <td className="px-6 py-4 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{p.paymentNumber}</td>
                      <td className="px-6 py-4 font-mono text-xs text-slate-500">{p.billNumber}</td>
                      <td className="px-6 py-4 text-xs font-mono font-bold text-slate-900 dark:text-white">{currency(p.amount)}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{p.paymentMethod}</td>
                      <td className="px-6 py-4"><StatusChip status={p.status} type="payment" /></td>
                      <td className="px-6 py-4 text-xs text-slate-500">{p.processedByName}</td>
                      <td className="px-6 py-4 text-xs text-slate-500">{new Date(p.paymentDate).toLocaleString()}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* ---------- Student Financial Lookup ---------- */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-xs space-y-5">
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white">Student Financial Lookup</h2>
              <p className="text-xs text-slate-500 mt-0.5">Search a student to view their ledger, bills, payments, and receipts.</p>
            </div>

            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={selectedStudent ? `${selectedStudent.fullName} (${selectedStudent.studentNumber})` : studentSearch}
                onChange={(e) => {
                  setStudentSearch(e.target.value);
                  setSelectedStudentId(null);
                }}
                placeholder="Search by student name or number..."
                aria-label="Search student"
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-xs text-slate-900 dark:text-white outline-hidden"
              />
              {selectedStudent && (
                <button
                  onClick={() => {
                    setSelectedStudentId(null);
                    setStudentSearch('');
                  }}
                  aria-label="Clear selected student"
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
              {matchingStudents.length > 0 && (
                <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-xl overflow-hidden">
                  {matchingStudents.map((s) => (
                    <button
                      key={s.studentId}
                      onClick={() => {
                        setSelectedStudentId(s.studentId);
                        setStudentSearch('');
                      }}
                      className="w-full text-left px-4 py-2.5 text-xs hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <span className="font-semibold">{s.fullName}</span>{' '}
                      <span className="text-slate-500">({s.studentNumber}) — {s.gradeLevel}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedStudentId != null && (
              <div className="space-y-6 pt-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Billed</p>
                    <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{ledger.isLoading ? '…' : currency(ledger.data?.totalBilled ?? 0)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Total Paid</p>
                    <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400 mt-1">{ledger.isLoading ? '…' : currency(ledger.data?.totalPaid ?? 0)}</p>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <p className="text-[11px] font-semibold text-slate-500 uppercase">Current Balance</p>
                    <p className="text-lg font-bold text-amber-600 dark:text-amber-400 mt-1">{ledger.isLoading ? '…' : currency(ledger.data?.currentBalance ?? 0)}</p>
                  </div>
                </div>

                {/* Bills */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Bills</h3>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-3">Bill #</th>
                          <th className="px-6 py-3">Total</th>
                          <th className="px-6 py-3">Paid</th>
                          <th className="px-6 py-3">Balance</th>
                          <th className="px-6 py-3">Status</th>
                          <th className="px-6 py-3">Due Date</th>
                          <th className="px-6 py-3 text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {bills.isLoading && <SkeletonRow cols={7} />}
                        {!bills.isLoading && bills.isError && (
                          <tr><td colSpan={7} className="px-6 py-8 text-center text-xs text-slate-500">Unable to load bills for this student.</td></tr>
                        )}
                        {!bills.isLoading && !bills.isError && (bills.data ?? []).length === 0 && (
                          <tr>
                            <td colSpan={7} className="px-6 py-8 text-center text-xs text-slate-500">
                              No bills exist yet for this student. Bill generation requires an Enrollment ID that no
                              backend endpoint currently exposes to this module — once a bill has been generated
                              elsewhere in the system, it will appear here for payment recording.
                            </td>
                          </tr>
                        )}
                        {!bills.isLoading &&
                          !bills.isError &&
                          (bills.data ?? []).map((b) => (
                            <tr key={b.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                              <td className="px-6 py-3 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">{b.billNumber}</td>
                              <td className="px-6 py-3 text-xs font-mono text-slate-900 dark:text-white">{currency(b.totalAmount)}</td>
                              <td className="px-6 py-3 text-xs font-mono text-emerald-600 dark:text-emerald-400">{currency(b.amountPaid)}</td>
                              <td className="px-6 py-3 text-xs font-mono font-bold text-slate-900 dark:text-white">{currency(b.balance)}</td>
                              <td className="px-6 py-3"><StatusChip status={b.status} type="bill" /></td>
                              <td className="px-6 py-3 text-xs text-slate-500">{new Date(b.dueDate).toLocaleDateString()}</td>
                              <td className="px-6 py-3 text-right">
                                {b.balance > 0 ? (
                                  <button
                                    onClick={() => openPaymentModal(b)}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-xs font-semibold rounded-lg text-white"
                                  >
                                    Record Payment
                                  </button>
                                ) : (
                                  <span className="text-[11px] text-slate-400">Fully Paid</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Ledger Transactions */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Ledger Transactions</h3>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-3">Date</th>
                          <th className="px-6 py-3">Reference</th>
                          <th className="px-6 py-3">Type</th>
                          <th className="px-6 py-3">Description</th>
                          <th className="px-6 py-3">Debit</th>
                          <th className="px-6 py-3">Credit</th>
                          <th className="px-6 py-3">Running Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {ledger.isLoading && <SkeletonRow cols={7} />}
                        {!ledger.isLoading && ledger.isError && (
                          <tr><td colSpan={7} className="px-6 py-8 text-center text-xs text-slate-500">Unable to load the ledger for this student.</td></tr>
                        )}
                        {!ledger.isLoading && !ledger.isError && (ledger.data?.transactions.length ?? 0) === 0 && (
                          <tr><td colSpan={7} className="px-6 py-8 text-center text-xs text-slate-500">No transactions recorded yet.</td></tr>
                        )}
                        {!ledger.isLoading &&
                          !ledger.isError &&
                          (ledger.data?.transactions ?? []).map((t, i) => (
                            <tr key={i} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                              <td className="px-6 py-3 text-xs text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                              <td className="px-6 py-3 font-mono text-xs text-slate-500">{t.referenceNo}</td>
                              <td className="px-6 py-3 text-xs font-semibold">{t.type}</td>
                              <td className="px-6 py-3 text-xs text-slate-500">{t.description}</td>
                              <td className="px-6 py-3 text-xs font-mono text-rose-600 dark:text-rose-400">{t.debit > 0 ? currency(t.debit) : '—'}</td>
                              <td className="px-6 py-3 text-xs font-mono text-emerald-600 dark:text-emerald-400">{t.credit > 0 ? currency(t.credit) : '—'}</td>
                              <td className="px-6 py-3 text-xs font-mono font-bold text-slate-900 dark:text-white">{currency(t.runningBalance)}</td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Receipts */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase mb-2">Official Receipts</h3>
                  <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                    <table className="w-full text-left text-sm">
                      <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
                        <tr>
                          <th className="px-6 py-3">Receipt #</th>
                          <th className="px-6 py-3">Payer</th>
                          <th className="px-6 py-3">Amount</th>
                          <th className="px-6 py-3">Issued By</th>
                          <th className="px-6 py-3">Issued At</th>
                          <th className="px-6 py-3">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                        {receipts.isLoading && <SkeletonRow cols={6} />}
                        {!receipts.isLoading && receipts.isError && (
                          <tr><td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-500">Unable to load receipts for this student.</td></tr>
                        )}
                        {!receipts.isLoading && !receipts.isError && (receipts.data ?? []).length === 0 && (
                          <tr><td colSpan={6} className="px-6 py-8 text-center text-xs text-slate-500">No official receipts issued yet.</td></tr>
                        )}
                        {!receipts.isLoading &&
                          !receipts.isError &&
                          (receipts.data ?? []).map((r) => (
                            <tr key={r.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                              <td className="px-6 py-3 font-mono text-xs font-bold text-blue-600 dark:text-blue-400">
                                <Receipt className="w-3.5 h-3.5 inline mr-1.5 text-slate-400" />
                                {r.receiptNumber}
                              </td>
                              <td className="px-6 py-3 text-xs text-slate-900 dark:text-white">{r.payerName}</td>
                              <td className="px-6 py-3 text-xs font-mono font-bold text-slate-900 dark:text-white">{currency(r.totalAmountPaid)}</td>
                              <td className="px-6 py-3 text-xs text-slate-500">{r.issuedByName}</td>
                              <td className="px-6 py-3 text-xs text-slate-500">{new Date(r.issuedAt).toLocaleString()}</td>
                              <td className="px-6 py-3">
                                {r.isCancelled ? (
                                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400">Cancelled</span>
                                ) : (
                                  <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">Valid</span>
                                )}
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ---------- Fee Categories Modal ---------- */}
      {isFeesModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-3xl shadow-2xl max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-4">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Fee Categories</h3>
              <button onClick={closeFeeModal} aria-label="Close" className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 space-y-6">
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-950 text-slate-500 uppercase text-[11px] font-semibold border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="px-4 py-2.5">Fee Name</th>
                      <th className="px-4 py-2.5">Type</th>
                      <th className="px-4 py-2.5">Amount</th>
                      <th className="px-4 py-2.5">Academic Year</th>
                      <th className="px-4 py-2.5">Grade Level</th>
                      <th className="px-4 py-2.5">Status</th>
                      <th className="px-4 py-2.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {fees.isLoading && <SkeletonRow cols={7} />}
                    {!fees.isLoading && fees.isError && (
                      <tr><td colSpan={7} className="px-4 py-6 text-center text-xs text-slate-500">Unable to load fee categories.</td></tr>
                    )}
                    {!fees.isLoading && !fees.isError && (fees.data ?? []).length === 0 && (
                      <tr><td colSpan={7} className="px-4 py-6 text-center text-xs text-slate-500">No fee categories defined yet.</td></tr>
                    )}
                    {!fees.isLoading &&
                      !fees.isError &&
                      (fees.data ?? []).map((f) => (
                        <tr key={f.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50">
                          <td className="px-4 py-2.5 font-medium text-xs text-slate-900 dark:text-white">{f.feeName}</td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">{f.feeType}</td>
                          <td className="px-4 py-2.5 text-xs font-mono font-bold text-slate-900 dark:text-white">{currency(f.amount)}</td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">{f.academicYearName}</td>
                          <td className="px-4 py-2.5 text-xs text-slate-500">{f.gradeLevelName ?? 'All Grades'}</td>
                          <td className="px-4 py-2.5">
                            <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${f.isActive ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                              {f.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td className="px-4 py-2.5 text-right space-x-1">
                            <button onClick={() => openEditFee(f.id)} title="Edit" aria-label={`Edit ${f.feeName}`} className="p-1.5 text-slate-400 hover:text-blue-500 rounded-md inline-block">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => setConfirmDeleteFeeId(f.id)} title="Delete" aria-label={`Delete ${f.feeName}`} className="p-1.5 text-slate-400 hover:text-rose-500 rounded-md inline-block">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">{editingFeeId != null ? 'Edit Fee Category' : 'Add Fee Category'}</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="sm:col-span-2">
                    <label htmlFor="fee-name" className="block font-semibold text-slate-500 mb-1">Fee Name *</label>
                    <input
                      id="fee-name"
                      type="text"
                      value={feeForm.feeName}
                      onChange={(e) => setFeeForm({ ...feeForm, feeName: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="fee-type" className="block font-semibold text-slate-500 mb-1">Fee Type</label>
                    <select
                      id="fee-type"
                      value={feeForm.feeType}
                      onChange={(e) => setFeeForm({ ...feeForm, feeType: e.target.value })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    >
                      {FEE_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fee-amount" className="block font-semibold text-slate-500 mb-1">Amount *</label>
                    <input
                      id="fee-amount"
                      type="number"
                      min={0}
                      value={feeForm.amount}
                      onChange={(e) => setFeeForm({ ...feeForm, amount: Number(e.target.value) })}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>
                  <div>
                    <label htmlFor="fee-year" className="block font-semibold text-slate-500 mb-1">Academic Year *</label>
                    <select
                      id="fee-year"
                      value={feeForm.academicYearId || ''}
                      onChange={(e) => setFeeForm({ ...feeForm, academicYearId: e.target.value ? Number(e.target.value) : 0 })}
                      disabled={academicYears.isLoading}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="">{academicYears.isLoading ? 'Loading…' : 'Select academic year'}</option>
                      {(academicYears.data ?? []).map((y) => (
                        <option key={y.id} value={y.id}>{y.schoolYear}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label htmlFor="fee-grade" className="block font-semibold text-slate-500 mb-1">Grade Level</label>
                    <select
                      id="fee-grade"
                      value={feeForm.gradeLevelId ?? ''}
                      onChange={(e) => setFeeForm({ ...feeForm, gradeLevelId: e.target.value ? Number(e.target.value) : null })}
                      disabled={gradeLevels.isLoading}
                      className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    >
                      <option value="">All Grade Levels</option>
                      {(gradeLevels.data ?? []).map((g) => (
                        <option key={g.id} value={g.id}>{g.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex items-center gap-4 pt-1">
                    <label className="flex items-center gap-2 font-semibold text-slate-500">
                      <input
                        type="checkbox"
                        checked={feeForm.isMandatory}
                        onChange={(e) => setFeeForm({ ...feeForm, isMandatory: e.target.checked })}
                      />
                      Mandatory
                    </label>
                    {editingFeeId != null && (
                      <label className="flex items-center gap-2 font-semibold text-slate-500">
                        <input
                          type="checkbox"
                          checked={feeForm.isActive ?? true}
                          onChange={(e) => setFeeForm({ ...feeForm, isActive: e.target.checked })}
                        />
                        Active
                      </label>
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-1">
                  {editingFeeId != null && (
                    <button onClick={() => { setEditingFeeId(null); setFeeForm(emptyFeeForm); }} className="px-4 py-2 text-xs font-semibold text-slate-500">
                      Cancel Edit
                    </button>
                  )}
                  <button
                    onClick={handleSaveFee}
                    disabled={createFeeMutation.isPending || updateFeeMutation.isPending}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md disabled:opacity-50"
                  >
                    {(createFeeMutation.isPending || updateFeeMutation.isPending) && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <Plus className="w-3.5 h-3.5" />
                    {editingFeeId != null ? 'Save Changes' : 'Add Fee Category'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteFeeId != null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Delete Fee Category?</h3>
            <p className="text-xs text-slate-500">This action cannot be undone.</p>
            <div className="pt-2 flex justify-end space-x-2">
              <button onClick={() => setConfirmDeleteFeeId(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">Cancel</button>
              <button
                onClick={async () => {
                  await deleteFeeMutation.mutateAsync(confirmDeleteFeeId);
                  setConfirmDeleteFeeId(null);
                }}
                disabled={deleteFeeMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-md disabled:opacity-50"
              >
                {deleteFeeMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- Record Payment Modal ---------- */}
      {paymentBill && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <h3 className="font-bold text-base text-slate-900 dark:text-white">Record Payment — {paymentBill.billNumber}</h3>
              <button onClick={closePaymentModal} aria-label="Close" className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Remaining balance: <span className="font-bold text-slate-900 dark:text-white">{currency(paymentBill.balance)}</span>
            </p>

            <div className="space-y-3 text-xs">
              <div>
                <label htmlFor="pay-amount" className="block font-semibold text-slate-500 mb-1">Amount *</label>
                <input
                  id="pay-amount"
                  type="number"
                  min={0.01}
                  max={paymentBill.balance}
                  step={0.01}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(Number(e.target.value))}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="pay-method" className="block font-semibold text-slate-500 mb-1">Payment Method</label>
                <select
                  id="pay-method"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                >
                  {PAYMENT_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="pay-ref" className="block font-semibold text-slate-500 mb-1">Reference Number</label>
                <input
                  id="pay-ref"
                  type="text"
                  value={referenceNumber}
                  onChange={(e) => setReferenceNumber(e.target.value)}
                  placeholder="e.g. bank transfer / check reference"
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label htmlFor="pay-remarks" className="block font-semibold text-slate-500 mb-1">Remarks</label>
                <textarea
                  id="pay-remarks"
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  rows={2}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end space-x-2">
              <button onClick={closePaymentModal} className="px-4 py-2 text-xs font-semibold text-slate-500">Cancel</button>
              <button
                onClick={handleRecordPayment}
                disabled={processPaymentMutation.isPending}
                className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-md disabled:opacity-50"
              >
                {processPaymentMutation.isPending && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                Record Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
