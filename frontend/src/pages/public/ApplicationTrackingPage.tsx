import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Download,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { toast } from 'sonner';
import { admissionService, type TrackApplicationResponse } from '../../services/admissionService';
import { receiptPdfService } from '../../services/receiptPdfService';
import { verificationSlipPdfService } from '../../services/verificationSlipPdfService';
import { Printer, Calendar, Check, X, Clock as ClockIcon } from 'lucide-react';
import { getApiUrl } from '../../services/apiClient';

const STAGES = [
  { key: 'Submitted', title: 'Submitted', desc: 'Application lodged' },
  { key: 'UnderReview', title: 'Under Review', desc: 'Preliminary screening' },
  { key: 'DocumentsRequired', title: 'Docs Required', desc: 'Digital upload needed' },
  { key: 'DocumentsSubmitted', title: 'Digital Uploaded', desc: 'Digital review' },
  { key: 'DigitalDocumentsVerified', title: 'Digital Verified', desc: 'Bring originals' },
  { key: 'OriginalDocumentsPending', title: 'Originals Pending', desc: 'In-person verification' },
  { key: 'Approved', title: 'Originals Verified', desc: 'Approved for Assessment' },
  { key: 'AccountingAssessment', title: 'Assessment', desc: 'Tuition assessed' },
  { key: 'PaymentConfirmed', title: 'Payment Confirmed', desc: 'Receipt issued' },
  { key: 'Enrolled', title: 'Enrollment Complete', desc: 'Officially enrolled!' },
];

export const ApplicationTrackingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [appNum, setAppNum] = useState(searchParams.get('appNum') || '');
  const [email, setEmail] = useState(searchParams.get('email') || '');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TrackApplicationResponse | null>(null);
  const [notFound, setNotFound] = useState(false);

  const [uploadingDocId, setUploadingDocId] = useState<number | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [aptDate, setAptDate] = useState('2026-08-12');
  const [aptTime, setAptTime] = useState('9:00 AM');
  const [isScheduling, setIsScheduling] = useState(false);

  const handleConfirmSchedule = async () => {
    if (!data) return;
    try {
      setIsScheduling(true);
      await admissionService.scheduleAppointment(data.id, {
        appointmentDate: aptDate,
        appointmentTime: aptTime,
        remarks: 'Original document physical verification appointment',
      });
      toast.success(`Appointment scheduled for ${aptDate} at ${aptTime}!`);
      setIsScheduleModalOpen(false);
      fetchTracking(data.applicationNumber, data.email);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to schedule appointment.');
    } finally {
      setIsScheduling(false);
    }
  };

  const handlePrintVerificationSlip = async () => {
    if (!data) return;
    try {
      const slip = await admissionService.getVerificationSlip(data.id);
      if (slip) {
        verificationSlipPdfService.printVerificationSlip(slip);
      } else {
        toast.error('Registrar Verification Slip not found.');
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to load verification slip.');
    }
  };

  const handleUploadReplacement = async (docTypeId: number, file: File) => {
    if (!data) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds maximum allowed limit of 10 MB.');
      return;
    }

    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.png', '.jpg', '.jpeg'].includes(ext)) {
      toast.error('Invalid file format. Allowed formats: PDF, PNG, JPG, JPEG.');
      return;
    }

    try {
      setUploadingDocId(docTypeId);
      await admissionService.uploadDocument(data.id, docTypeId, file);
      toast.success(`Successfully uploaded replacement document: ${file.name}`);
      fetchTracking(data.applicationNumber, data.email);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to upload document file.');
    } finally {
      setUploadingDocId(null);
    }
  };

  const fetchTracking = async (numberToUse?: string, emailToUse?: string) => {
    const qNum = numberToUse || appNum;
    const qEmail = emailToUse || email;

    if (!qNum || !qEmail) {
      toast.error('Please enter both Application Reference Code and Email Address.');
      return;
    }

    setLoading(true);
    setNotFound(false);
    try {
      const res = await admissionService.trackApplication(qNum, qEmail);
      setData(res);
    } catch (err: any) {
      setData(null);
      setNotFound(true);
      toast.error('No matching application found. Please verify your reference code and email.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const paramNum = searchParams.get('appNum');
    const paramEmail = searchParams.get('email');
    if (paramNum && paramEmail) {
      setAppNum(paramNum);
      setEmail(paramEmail);
      fetchTracking(paramNum, paramEmail);
    }
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTracking();
  };

  return (
    <div className="bg-[#FAF8FF] min-h-screen text-slate-900 py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-purple-100 pb-6">
          <div>
            <Link to="/admissions" className="inline-flex items-center text-xs font-bold text-purple-700 hover:text-purple-900 mb-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back to Admissions Gateway</span>
            </Link>
            <h1 className="text-3xl font-black text-purple-950 tracking-tight">Application Progress Tracker</h1>
            <p className="text-xs text-slate-600">Track your real-time admission status, document verification, and enrollment stage.</p>
          </div>

          <div className="flex items-center gap-2 text-xs font-bold text-purple-800 bg-purple-100/70 px-4 py-2 rounded-2xl border border-purple-200 shrink-0">
            <ShieldCheck className="w-4 h-4 text-purple-700" />
            <span>Noah's Academy Verification Portal</span>
          </div>
        </div>

        {/* Search Form Card */}
        <div className="bg-white border border-purple-100 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
          <div className="space-y-1">
            <h2 className="text-lg font-black text-purple-950">Look Up Your Application</h2>
            <p className="text-xs text-slate-600">Enter your Application Reference Number (e.g., APP-2026-000001) and your registered email address.</p>
          </div>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Application Reference Code *</label>
              <input
                type="text"
                required
                placeholder="APP-2026-000001"
                value={appNum}
                onChange={(e) => setAppNum(e.target.value)}
                className="w-full px-4 py-3 bg-purple-50/50 border border-purple-200 rounded-2xl text-xs font-mono font-bold text-purple-950 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-5 space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Applicant Email Address *</label>
              <input
                type="email"
                required
                placeholder="student@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-purple-50/50 border border-purple-200 rounded-2xl text-xs font-medium text-slate-900 focus:ring-2 focus:ring-purple-600 focus:outline-none"
              />
            </div>

            <div className="md:col-span-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-purple-800 hover:bg-purple-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
              >
                <Search className="w-4 h-4" />
                <span>{loading ? 'Searching...' : 'Track'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Not Found State */}
        {notFound && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center space-y-3">
            <AlertCircle className="w-10 h-10 text-amber-600 mx-auto" />
            <h3 className="text-lg font-black text-amber-950">Application Not Found</h3>
            <p className="text-xs text-amber-800 max-w-md mx-auto">
              We could not find an admission record matching <strong>"{appNum}"</strong> and <strong>"{email}"</strong>. Please check your reference code and email spelling.
            </p>
          </div>
        )}

        {/* Loaded Results Display */}
        {data && (
          <div className="space-y-10">
            {/* Overview Summary Bar */}
            <div className="bg-white border border-purple-100 rounded-3xl p-6 lg:p-8 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700 px-3 py-1 bg-purple-50 rounded-full border border-purple-200">
                    Official Record
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-500">
                    Submitted: {new Date(data.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
                <h2 className="text-2xl font-black text-purple-950">{data.fullName}</h2>
                <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
                  <span>Applying For: <strong className="text-purple-900">{data.gradeApplyingFor}</strong></span>
                  <span>•</span>
                  <span>Reference #: <strong className="font-mono text-purple-900">{data.applicationNumber}</strong></span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto">
                <div className="px-5 py-3 bg-purple-50 border border-purple-200 rounded-2xl text-center">
                  <span className="text-[10px] font-extrabold uppercase text-purple-700 tracking-wider block">Current Status</span>
                  <span className="text-sm font-black text-purple-950">{data.status}</span>
                </div>

                <button
                  onClick={() => receiptPdfService.downloadConfirmationReceipt(data)}
                  className="px-5 py-3 bg-purple-800 hover:bg-purple-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF Receipt</span>
                </button>
              </div>
            </div>

            {/* Public Registrar Remarks Banner */}
            {data.applicantRemarks && (
              <div className="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-3xl p-6 lg:p-8 shadow-md space-y-2">
                <div className="flex items-center gap-2 text-amber-300 font-extrabold text-xs uppercase tracking-wider">
                  <FileText className="w-4 h-4" />
                  <span>Registrar Office Notice to Applicant</span>
                </div>
                <p className="text-sm font-medium leading-relaxed">{data.applicantRemarks}</p>
              </div>
            )}

            {/* Progress Stepper Timeline */}
            <div className="bg-white border border-purple-100 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-black text-purple-950">Admission Progress Pipeline</h3>
                <span className="text-xs font-extrabold text-purple-700 bg-purple-50 px-3 py-1 rounded-full border border-purple-200">
                  Stage {data.stageIndex >= 99 ? 'Declined' : `${data.stageIndex + 1} of 10`}
                </span>
              </div>

              {/* Stepper Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {STAGES.map((st, idx) => {
                  const isCompleted = data.stageIndex > idx;
                  const isCurrent = data.stageIndex === idx;

                  return (
                    <div
                      key={st.key}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3 ${
                        isCurrent
                          ? 'bg-purple-950 text-white border-purple-800 shadow-lg ring-2 ring-purple-400/30'
                          : isCompleted
                          ? 'bg-emerald-50 text-emerald-950 border-emerald-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-xs font-black font-mono ${isCurrent ? 'text-amber-300' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
                          0{idx + 1}
                        </span>
                        {isCompleted ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        ) : isCurrent ? (
                          <Clock className="w-4 h-4 text-amber-300 animate-pulse" />
                        ) : null}
                      </div>

                      <div>
                        <h4 className={`text-xs font-extrabold ${isCurrent ? 'text-white' : isCompleted ? 'text-emerald-950' : 'text-slate-500'}`}>
                          {st.title}
                        </h4>
                        <p className={`text-[10px] leading-tight mt-0.5 ${isCurrent ? 'text-purple-200' : isCompleted ? 'text-emerald-700' : 'text-slate-400'}`}>
                          {st.desc}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Next Step Box */}
              <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-2xl flex items-center justify-between text-xs">
                <span className="font-bold text-purple-900">Estimated Next Action:</span>
                <span className="font-extrabold text-purple-950">{data.estimatedNextStep}</span>
              </div>

              {/* Appointment Scheduling & Verification Slip Action Banner */}
              <div className="p-5 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 text-white rounded-2xl shadow-lg space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="font-extrabold text-sm text-amber-300 flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>In-Person Original Document Submission Appointment</span>
                    </h4>
                    <p className="text-xs text-purple-200 mt-1">
                      {data.appointment
                        ? `Appointment Scheduled: ${new Date(data.appointment.appointmentDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })} at ${data.appointment.appointmentTime}`
                        : 'After digital verification, schedule an appointment to submit original physical documents to the Registrar Office.'}
                    </p>
                  </div>

                  {!data.appointment ? (
                    <button
                      type="button"
                      onClick={() => setIsScheduleModalOpen(true)}
                      className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-purple-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
                    >
                      <Calendar className="w-4 h-4" />
                      <span>Schedule Appointment</span>
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/40 rounded-lg text-xs font-bold uppercase tracking-wider">
                        ✓ {data.appointment.status}
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsScheduleModalOpen(true)}
                        className="px-3 py-1.5 bg-purple-800 hover:bg-purple-700 text-purple-100 text-xs font-semibold rounded-lg border border-purple-600"
                      >
                        Reschedule
                      </button>
                    </div>
                  )}
                </div>

                {/* Verification Slip Section */}
                {data.hasRegistrarVerificationSlip && (
                  <div className="pt-3 border-t border-purple-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Printer className="w-4 h-4 text-emerald-400" />
                      <span className="text-xs font-bold text-emerald-300">
                        Official Registrar Verification Slip Issued ({data.verificationSlipNumber})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={handlePrintVerificationSlip}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-purple-950 font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-sm transition-all flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4" />
                      <span>Print / Download Slip</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Document Checklist & History Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Configurable Document Checklist */}
              <div className="lg:col-span-7 bg-white border border-purple-100 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-black text-purple-950 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-purple-700" />
                    <span>Admission Credentials Dual Verification</span>
                  </h3>
                </div>

                {/* Important Notice Banner */}
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start space-x-3 text-xs text-amber-900 shadow-2xs">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-amber-950 text-sm">Important Notice — Physical Original Required</h4>
                    <p className="mt-1 leading-relaxed text-amber-800">
                      The documents uploaded through NAISIS are used only for preliminary evaluation. Applicants are still required to present the original copies of all required documents to the Registrar's Office for final verification before enrollment can proceed.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {data.documents.length === 0 ? (
                    <p className="text-xs text-slate-500">No specific document verification entries initialized.</p>
                  ) : (
                    data.documents.map((doc) => {
                      const digStatus = doc.digitalStatus || (doc.status === 'Verified' ? 'Verified' : doc.status === 'Uploaded' ? 'Uploaded' : 'PendingUpload');
                      const origStatus = doc.originalStatus || 'NotSubmitted';

                      return (
                        <div
                          key={doc.id}
                          className="p-4 bg-purple-50/40 border border-purple-100 rounded-2xl space-y-3 text-xs shadow-2xs"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-extrabold text-purple-950 text-sm">{doc.documentName}</span>
                                {doc.version > 1 && (
                                  <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-800 font-mono text-[10px] font-bold">
                                    V{doc.version}
                                  </span>
                                )}
                              </div>

                              {doc.originalFilename ? (
                                <div className="text-[11px] text-slate-600 font-mono flex items-center gap-2">
                                  <span>📄 {doc.originalFilename}</span>
                                  {doc.fileSize && <span>({(doc.fileSize / 1024).toFixed(1)} KB)</span>}
                                  {doc.uploadedAt && <span>• {new Date(doc.uploadedAt).toLocaleDateString()}</span>}
                                </div>
                              ) : (
                                <div className="text-[11px] text-slate-400 italic">No document file uploaded yet</div>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex items-center gap-2 shrink-0">
                              {doc.previewUrl && (
                                <a
                                  href={getApiUrl(doc.previewUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 font-bold text-[11px] bg-white border border-purple-200 text-purple-800 hover:bg-purple-50 rounded-xl flex items-center gap-1 shadow-2xs"
                                >
                                  Preview
                                </a>
                              )}

                              {doc.downloadUrl && (
                                <a
                                  href={getApiUrl(doc.downloadUrl)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="px-3 py-1.5 font-bold text-[11px] bg-white border border-purple-200 text-purple-800 hover:bg-purple-50 rounded-xl flex items-center gap-1 shadow-2xs"
                                >
                                  Download
                                </a>
                              )}

                              {(digStatus === 'Rejected' || digStatus === 'PendingUpload') && doc.admissionDocumentTypeId && (
                                <label className="cursor-pointer px-3 py-1.5 font-extrabold text-[11px] bg-purple-700 hover:bg-purple-800 text-white rounded-xl flex items-center gap-1 shadow-xs transition-colors">
                                  <span>{uploadingDocId === doc.admissionDocumentTypeId ? 'Uploading…' : digStatus === 'Rejected' ? 'Upload Replacement' : 'Upload File'}</span>
                                  <input
                                    type="file"
                                    accept=".pdf,.png,.jpg,.jpeg"
                                    className="hidden"
                                    disabled={uploadingDocId === doc.admissionDocumentTypeId}
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file && doc.admissionDocumentTypeId) {
                                        handleUploadReplacement(doc.admissionDocumentTypeId, file);
                                      }
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          </div>

                          {/* Dual Status Badges */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1 border-t border-purple-100/80">
                            {/* Digital Status Badge */}
                            <div className="p-2.5 bg-white border border-purple-100 rounded-xl flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Digital Copy</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  digStatus === 'Verified'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : digStatus === 'Uploaded'
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : digStatus === 'Rejected'
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : 'bg-amber-100 text-amber-800 border-amber-300'
                                }`}
                              >
                                {digStatus === 'Verified' ? '✓ Verified' : digStatus}
                              </span>
                            </div>

                            {/* Original Physical Status Badge */}
                            <div className="p-2.5 bg-white border border-purple-100 rounded-xl flex items-center justify-between">
                              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Original Physical</span>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                                  origStatus === 'Verified'
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : origStatus === 'Submitted'
                                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                                    : origStatus === 'Rejected'
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : 'bg-orange-100 text-orange-800 border-orange-300'
                                }`}
                              >
                                {origStatus === 'Verified'
                                  ? '✓ Verified'
                                  : origStatus === 'Submitted'
                                  ? 'Submitted'
                                  : origStatus === 'Rejected'
                                  ? 'Rejected'
                                  : 'Pending Submission'}
                              </span>
                            </div>
                          </div>

                          {/* Rejection / Status Remarks Banner */}
                          {digStatus === 'Rejected' && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                              <div className="font-extrabold flex items-center gap-1.5 text-rose-700">
                                <AlertCircle className="w-4 h-4" />
                                <span>Action Required — Digital Document Rejected</span>
                              </div>
                              <p className="text-[11px] text-rose-800 leading-snug">
                                <strong>Reason / Instruction:</strong> {doc.remarks || 'Please upload a clearer scanned copy.'}
                              </p>
                            </div>
                          )}

                          {origStatus === 'Rejected' && (
                            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-900 space-y-1">
                              <div className="font-extrabold flex items-center gap-1.5 text-rose-700">
                                <AlertCircle className="w-4 h-4" />
                                <span>Action Required — Physical Original Document Rejected</span>
                              </div>
                              <p className="text-[11px] text-rose-800 leading-snug">
                                <strong>Reason / Instruction:</strong> {doc.originalRemarks || 'Please submit a valid original document at the Registrar Office.'}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Status History Timeline */}
              <div className="lg:col-span-5 bg-white border border-purple-100 rounded-3xl p-6 lg:p-8 shadow-sm space-y-6">
                <h3 className="text-lg font-black text-purple-950 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-purple-700" />
                  <span>Activity & Status Log</span>
                </h3>

                <div className="space-y-4 relative pl-4 border-l-2 border-purple-100">
                  {data.statusHistory.map((h, idx) => (
                    <div key={idx} className="relative space-y-1">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-purple-700 ring-4 ring-purple-100" />
                      <div className="text-xs font-extrabold text-purple-950">
                        {h.fromStatus} → <span className="text-purple-700">{h.toStatus}</span>
                      </div>
                      <p className="text-[11px] text-slate-600 leading-snug">{h.remarks}</p>
                      <div className="text-[10px] font-mono text-slate-400">
                        {new Date(h.timestamp).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Schedule Appointment Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 bg-purple-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 lg:p-8 max-w-md w-full shadow-2xl border border-purple-100 space-y-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-purple-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-purple-100 text-purple-800 rounded-2xl">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-purple-950">Schedule In-Person Submission</h3>
                  <p className="text-xs text-purple-600 font-medium">Select date & time to submit physical originals</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-2">
                  Appointment Date
                </label>
                <input
                  type="date"
                  value={aptDate}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setAptDate(e.target.value)}
                  className="w-full px-4 py-3 bg-purple-50/50 border border-purple-200 rounded-xl text-sm font-semibold text-purple-950 focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>

              <div>
                <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider mb-2">
                  Preferred Time Slot
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {['9:00 AM', '9:30 AM', '10:00 AM', '1:00 PM', '2:00 PM', '3:00 PM'].map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setAptTime(slot)}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        aptTime === slot
                          ? 'bg-purple-900 text-white border-purple-900 shadow-md'
                          : 'bg-white text-purple-900 border-purple-200 hover:bg-purple-50'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-[11px] text-amber-900">
                <strong>Reminder:</strong> Please bring all original physical copies of your PSA Birth Certificate, Form 138 / Report Card, Good Moral Certificate, and 2x2 Photo to the Registrar's Office on your appointment date.
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="px-5 py-2.5 text-xs font-extrabold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmSchedule}
                disabled={isScheduling}
                className="px-5 py-2.5 text-xs font-extrabold text-white bg-purple-800 hover:bg-purple-700 rounded-xl shadow-md flex items-center gap-2"
              >
                {isScheduling ? <ClockIcon className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                <span>Confirm Appointment</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
