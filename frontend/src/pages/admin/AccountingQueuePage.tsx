import React, { useMemo, useState } from 'react';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  Wallet,
  FileText,
  ChevronDown,
  ChevronUp,
  X,
  Loader2,
  AlertTriangle,
} from 'lucide-react';
import { useAccountingApi } from '../../hooks/useAccountingApi';
import type { AccountingQueueItem, GenerateAssessmentPayload } from '../../types';
import { toast } from 'sonner';

// ── helpers ──────────────────────────────────────────────────────────────────

const currency = (n: number) =>
  n.toLocaleString('en-US', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 });

const STAGE_LABELS: Record<string, string> = {
  ReadyForAssessment: 'Ready for Assessment',
  AssessmentInProgress: 'Assessment In Progress',
  Paid: 'Paid / Cleared',
};

const STAGE_COLORS: Record<string, string> = {
  ReadyForAssessment:
    'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  AssessmentInProgress:
    'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  Paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
};

const STAGE_ICON: Record<string, React.ReactNode> = {
  ReadyForAssessment: <Clock className="h-3 w-3" />,
  AssessmentInProgress: <FileText className="h-3 w-3" />,
  Paid: <CheckCircle2 className="h-3 w-3" />,
};

// ── empty form helper ─────────────────────────────────────────────────────────

const emptyForm = (): Omit<GenerateAssessmentPayload, 'applicationId'> => ({
  tuitionFee: 0,
  miscellaneousFee: 0,
  laboratoryFee: 0,
  booksFee: 0,
  voucherAmount: 0,
  discountAmount: 0,
  discountRemarks: '',
  dueDate: '',
});

// ── component ─────────────────────────────────────────────────────────────────

export const AccountingQueuePage: React.FC = () => {
  const { useAccountingQueue, useGenerateAssessmentMutation, useApplicationFinancialAccount } =
    useAccountingApi();

  const [stageFilter, setStageFilter] = useState<string>('All');
  const [search, setSearch] = useState('');
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // Assessment modal state
  const [assessmentTarget, setAssessmentTarget] = useState<AccountingQueueItem | null>(null);
  const [form, setForm] = useState(emptyForm());

  const queue = useAccountingQueue(stageFilter === 'All' ? undefined : stageFilter);
  const generateMutation = useGenerateAssessmentMutation();

  // Ledger for the expanded row
  const ledger = useApplicationFinancialAccount(
    expandedId !== null ? expandedId : null,
  );

  // ── derived ────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return (queue.data ?? []).filter(
      (item) =>
        !q ||
        item.applicantName.toLowerCase().includes(q) ||
        item.applicationNumber.toLowerCase().includes(q) ||
        item.verificationSlipNumber.toLowerCase().includes(q),
    );
  }, [queue.data, search]);

  const totalAmount = useMemo(
    () =>
      form.tuitionFee +
      form.miscellaneousFee +
      form.laboratoryFee +
      form.booksFee -
      form.voucherAmount -
      form.discountAmount,
    [form],
  );

  // ── handlers ───────────────────────────────────────────────────────────────

  const openAssessment = (item: AccountingQueueItem) => {
    setAssessmentTarget(item);
    setForm(emptyForm());
  };

  const closeAssessment = () => {
    setAssessmentTarget(null);
    setForm(emptyForm());
  };

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({
      ...prev,
      [field]:
        field === 'discountRemarks' || field === 'dueDate'
          ? value
          : parseFloat(value) || 0,
    }));
  };

  const handleGenerateAssessment = async () => {
    if (!assessmentTarget) return;

    if (totalAmount < 0) {
      toast.error('Total amount cannot be negative. Check your voucher and discount values.');
      return;
    }

    const payload: GenerateAssessmentPayload = {
      applicationId: assessmentTarget.applicationId,
      tuitionFee: form.tuitionFee,
      miscellaneousFee: form.miscellaneousFee,
      laboratoryFee: form.laboratoryFee,
      booksFee: form.booksFee,
      voucherAmount: form.voucherAmount,
      discountAmount: form.discountAmount,
      discountRemarks: form.discountRemarks,
      dueDate: form.dueDate || undefined,
    };

    try {
      await generateMutation.mutateAsync(payload);
      closeAssessment();
    } catch {
      // error already surfaced by mutation onError
    }
  };

  // ── stats ──────────────────────────────────────────────────────────────────

  const all = queue.data ?? [];
  const readyCount = all.filter((i) => i.queueStage === 'ReadyForAssessment').length;
  const inProgressCount = all.filter((i) => i.queueStage === 'AssessmentInProgress').length;
  const paidCount = all.filter((i) => i.queueStage === 'Paid').length;

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6 pb-10">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-black text-purple-950 dark:text-white tracking-tight">
          Accounting Assessment Queue
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Review applicants cleared by the Registrar, enter fee breakdown, and generate the
          assessment bill to persist the StudentBill record in the database.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Ready for Assessment', value: readyCount, color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800' },
          { label: 'Assessment In Progress', value: inProgressCount, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800' },
          { label: 'Paid / Cleared', value: paidCount, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' },
        ].map((card) => (
          <div key={card.label} className={`rounded-xl border p-5 flex items-center gap-4 ${card.bg}`}>
            <Wallet className={`h-8 w-8 ${card.color}`} />
            <div>
              <p className={`text-3xl font-black ${card.color}`}>{card.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filter & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, application number, or slip number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'ReadyForAssessment', 'AssessmentInProgress', 'Paid'].map((stage) => (
            <button
              key={stage}
              onClick={() => setStageFilter(stage)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                stageFilter === stage
                  ? 'bg-purple-700 text-white'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {stage === 'All' ? 'All' : STAGE_LABELS[stage]}
            </button>
          ))}
        </div>
      </div>

      {/* Queue Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-white dark:bg-slate-900">
        {queue.isLoading ? (
          <div className="flex items-center justify-center py-20 gap-2 text-slate-400">
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-sm">Loading accounting queue…</span>
          </div>
        ) : queue.isError ? (
          <div className="flex items-center justify-center py-20 gap-2 text-rose-500">
            <AlertTriangle className="h-5 w-5" />
            <span className="text-sm">Unable to load accounting queue. Check your connection.</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <ClipboardList className="h-10 w-10 mb-3" />
            <p className="text-sm font-medium">No applicants in this queue.</p>
            <p className="text-xs mt-1">Applicants appear here once the Registrar issues a verification slip.</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                {['Applicant', 'Grade', 'Slip Number', 'Stage', 'Total Billed', 'Balance', 'Action'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => (
                <React.Fragment key={item.applicationId}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Applicant */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-slate-900 dark:text-white">{item.applicantName}</p>
                      <p className="text-xs text-slate-400">{item.applicationNumber}</p>
                    </td>
                    {/* Grade */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 whitespace-nowrap">{item.gradeApplyingFor}</td>
                    {/* Slip */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-300 font-mono text-xs">{item.verificationSlipNumber}</td>
                    {/* Stage */}
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${STAGE_COLORS[item.queueStage] ?? 'bg-slate-100 text-slate-600'}`}>
                        {STAGE_ICON[item.queueStage]}
                        {STAGE_LABELS[item.queueStage] ?? item.queueStage}
                      </span>
                    </td>
                    {/* Total Billed */}
                    <td className="px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                      {item.totalBilled > 0 ? currency(item.totalBilled) : <span className="text-slate-400 text-xs">—</span>}
                    </td>
                    {/* Balance */}
                    <td className="px-4 py-3 whitespace-nowrap">
                      {item.remainingBalance > 0 ? (
                        <span className="font-semibold text-rose-600 dark:text-rose-400">{currency(item.remainingBalance)}</span>
                      ) : item.totalBilled > 0 ? (
                        <span className="font-semibold text-green-600 dark:text-green-400">Cleared</span>
                      ) : (
                        <span className="text-slate-400 text-xs">—</span>
                      )}
                    </td>
                    {/* Action */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {item.queueStage === 'ReadyForAssessment' ? (
                          <button
                            onClick={() => openAssessment(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-purple-700 hover:bg-purple-800 text-white text-xs font-semibold transition-colors"
                          >
                            <FileText className="h-3 w-3" />
                            Generate Assessment
                          </button>
                        ) : item.queueStage === 'AssessmentInProgress' ? (
                          <button
                            onClick={() => openAssessment(item)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
                          >
                            <FileText className="h-3 w-3" />
                            Edit Assessment
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 text-xs font-semibold">
                            <CheckCircle2 className="h-3 w-3" />
                            Paid
                          </span>
                        )}
                        <button
                          onClick={() => setExpandedId(expandedId === item.applicationId ? null : item.applicationId)}
                          className="p-1 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          title="View ledger"
                        >
                          {expandedId === item.applicationId ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Expanded Ledger Row */}
                  {expandedId === item.applicationId && (
                    <tr className="bg-slate-50 dark:bg-slate-800/50">
                      <td colSpan={7} className="px-6 py-4">
                        {ledger.isLoading ? (
                          <div className="flex items-center gap-2 text-slate-400 text-sm">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Loading ledger…
                          </div>
                        ) : ledger.data?.transactions?.length ? (
                          <div className="space-y-2">
                            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">
                              Application Ledger
                            </p>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-slate-400">
                                  {['Date', 'Reference', 'Type', 'Description', 'Debit', 'Credit', 'Balance'].map((h) => (
                                    <th key={h} className="text-left py-1 pr-4 font-semibold uppercase tracking-wider">{h}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                                {ledger.data.transactions.map((tx, i) => (
                                  <tr key={i}>
                                    <td className="py-1 pr-4 text-slate-600 dark:text-slate-300">{tx.date ? new Date(tx.date).toLocaleDateString() : '—'}</td>
                                    <td className="py-1 pr-4 font-mono text-slate-600 dark:text-slate-300">{tx.referenceNo ?? '—'}</td>
                                    <td className="py-1 pr-4">
                                      <span className={`inline-block px-1.5 py-0.5 rounded text-xs font-semibold ${tx.type === 'Debit' ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300' : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'}`}>
                                        {tx.type}
                                      </span>
                                    </td>
                                    <td className="py-1 pr-4 text-slate-700 dark:text-slate-300">{tx.description}</td>
                                    <td className="py-1 pr-4 text-rose-600 dark:text-rose-400 font-semibold">{tx.debit > 0 ? currency(tx.debit) : '—'}</td>
                                    <td className="py-1 pr-4 text-green-600 dark:text-green-400 font-semibold">{tx.credit > 0 ? currency(tx.credit) : '—'}</td>
                                    <td className="py-1 font-semibold text-slate-800 dark:text-slate-200">{currency(tx.runningBalance)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <p className="text-sm text-slate-400">No ledger transactions yet for this application.</p>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Generate Assessment Modal */}
      {assessmentTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-700">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-purple-900 to-indigo-900">
              <div>
                <h2 className="text-lg font-bold text-white">Generate Assessment Bill</h2>
                <p className="text-xs text-purple-300 mt-0.5">
                  {assessmentTarget.applicantName} — {assessmentTarget.applicationNumber}
                </p>
              </div>
              <button onClick={closeAssessment} className="p-1 rounded-lg text-purple-300 hover:text-white transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 px-4 py-3 text-xs text-amber-800 dark:text-amber-300">
                <strong>Note:</strong> Clicking "Generate Assessment Bill" will create a persistent{' '}
                <code className="mx-1 font-mono">StudentBill</code> record in the database.
                The Registrar cannot proceed with official enrollment until this bill is generated.
              </div>

              {/* Fee Fields */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { key: 'tuitionFee', label: 'Tuition Fee' },
                  { key: 'miscellaneousFee', label: 'Miscellaneous Fee' },
                  { key: 'laboratoryFee', label: 'Laboratory Fee' },
                  { key: 'booksFee', label: 'Books & Learning Materials' },
                  { key: 'voucherAmount', label: 'ESC / QVR Voucher (deduction)' },
                  { key: 'discountAmount', label: 'Tuition Discount (deduction)' },
                ].map(({ key, label }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">{label}</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">₱</span>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={form[key as keyof typeof form] as number}
                        onChange={(e) => handleFieldChange(key as keyof typeof form, e.target.value)}
                        className="w-full pl-6 pr-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Remarks */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Discount Remarks (optional)</label>
                <input
                  type="text"
                  value={form.discountRemarks ?? ''}
                  onChange={(e) => handleFieldChange('discountRemarks', e.target.value)}
                  placeholder="e.g. Sibling discount, Loyalty award…"
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Due Date */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Payment Due Date (optional — defaults to 30 days)</label>
                <input
                  type="date"
                  value={form.dueDate ?? ''}
                  onChange={(e) => handleFieldChange('dueDate', e.target.value)}
                  className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              {/* Total Summary */}
              <div className="rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-5 py-4 space-y-2">
                <div className="flex justify-between text-sm text-slate-600 dark:text-slate-300">
                  <span>Subtotal</span>
                  <span>{currency(form.tuitionFee + form.miscellaneousFee + form.laboratoryFee + form.booksFee)}</span>
                </div>
                {(form.voucherAmount > 0 || form.discountAmount > 0) && (
                  <div className="flex justify-between text-sm text-green-600 dark:text-green-400">
                    <span>Total Deductions</span>
                    <span>− {currency(form.voucherAmount + form.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-purple-900 dark:text-purple-300 border-t border-slate-200 dark:border-slate-700 pt-2">
                  <span>Total Amount Due</span>
                  <span>{currency(Math.max(0, totalAmount))}</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
              <button
                onClick={closeAssessment}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleGenerateAssessment}
                disabled={generateMutation.isPending}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-purple-700 hover:bg-purple-800 disabled:opacity-60 text-white text-sm font-bold transition-colors"
              >
                {generateMutation.isPending ? (
                  <><Loader2 className="h-4 w-4 animate-spin" />Generating…</>
                ) : (
                  <><FileText className="h-4 w-4" />Generate Assessment Bill</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
