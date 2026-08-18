import React, { useState, useEffect } from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { StatusChip } from '../../components/data-display/StatusChip';
import {
  CheckCircle2,
  FileText,
  Download,
  Calendar,
  Clock,
  MessageSquare,
  User,
  ShieldAlert,
  Send,
  Loader2,
  AlertCircle,
  FileCheck,
  Printer,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { admissionService, type TrackApplicationResponse } from '../../services/admissionService';
import { verificationSlipPdfService } from '../../services/verificationSlipPdfService';
import { receiptPdfService } from '../../services/receiptPdfService';
import { toast } from 'sonner';

export const ApplicantPortalDashboard: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'messages' | 'profile'>('overview');
  const [loading, setLoading] = useState(true);
  const [appData, setAppData] = useState<TrackApplicationResponse | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [localMessages, setLocalMessages] = useState<Array<{ id: number; sender: string; role: string; text: string; date: string }>>([]);

  useEffect(() => {
    const fetchApplicantData = async () => {
      if (!user?.email) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // Search by user email
        const res = await admissionService.trackApplication('', user.email);
        setAppData(res);
      } catch {
        setAppData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicantData();
  }, [user]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setLocalMessages((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: appData?.fullName || user?.fullName || 'Applicant',
        role: 'Applicant',
        text: newMessage,
        date: 'Just now',
      },
    ]);
    setNewMessage('');
    toast.success('Message sent to Admissions Office.');
  };

  const handlePrintSlip = async () => {
    if (!appData) return;
    try {
      const slip = await admissionService.getVerificationSlip(appData.id);
      if (slip) {
        verificationSlipPdfService.printVerificationSlip(slip);
      } else {
        toast.error('Registrar Verification Slip has not been generated yet.');
      }
    } catch {
      toast.error('Failed to load Registrar Verification Slip.');
    }
  };

  const handleDownloadReceipt = () => {
    if (!appData) return;
    receiptPdfService.downloadConfirmationReceipt({
      applicationNumber: appData.applicationNumber,
      fullName: appData.fullName,
      gradeApplyingFor: appData.gradeApplyingFor,
      email: appData.email,
      createdAt: appData.createdAt,
      status: appData.status,
      estimatedNextStep: appData.estimatedNextStep,
    });
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex items-center justify-center p-8 bg-slate-950 text-slate-100">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
          <p className="text-xs font-semibold text-slate-400">Loading your admissions record...</p>
        </div>
      </div>
    );
  }

  if (!appData) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 max-w-4xl mx-auto font-sans flex items-center justify-center">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 sm:p-12 text-center space-y-6 max-w-lg shadow-2xl">
          <div className="w-16 h-16 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">No Application Record Found</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              We could not find an active admissions application associated with <strong className="text-purple-300">{user?.email}</strong>.
            </p>
          </div>
          <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs text-slate-400 text-left space-y-1">
            <p className="font-bold text-slate-200">Next Steps:</p>
            <p>1. If you are a new student, please complete the Public Admissions Application Wizard.</p>
            <p>2. If you already submitted an application, verify that your login email matches your application email.</p>
          </div>
          <a
            href="/apply"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-700 hover:bg-purple-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-600/25 transition-all"
          >
            Go to Admission Application
          </a>
        </div>
      </div>
    );
  }

  const verifiedDocsCount = appData.documents.filter((d) => d.digitalStatus === 'Verified' || d.originalStatus === 'Verified').length;
  const totalDocsCount = appData.documents.length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 space-y-8 max-w-7xl mx-auto font-sans">
      {/* Domain Separation Notice */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between gap-4 text-amber-300 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            <strong>Applicant Status:</strong> You are currently in the pre-enrollment pipeline. Your record will become an active <strong>Enrolled Student</strong> once official Registrar approval &amp; sectioning are complete.
          </span>
        </div>
        <span className="font-mono font-bold px-2.5 py-1 bg-amber-500/20 rounded-md border border-amber-500/30 shrink-0">
          Ref: {appData.applicationNumber}
        </span>
      </div>

      {/* Top Banner */}
      <div className="relative bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -bottom-10 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-purple-500/15 text-purple-300 text-[11px] font-bold uppercase tracking-wider rounded-full border border-purple-500/30">
              {appData.currentStageTitle}
            </span>
            <StatusChip status={appData.status as any} type="enrollment" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome, {appData.fullName}!</h1>
          <p className="text-xs text-slate-400">
            Applying for <strong className="text-white">{appData.gradeApplyingFor}</strong> · Submitted on {new Date(appData.createdAt).toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 relative z-10 shrink-0">
          {appData.hasRegistrarVerificationSlip && (
            <button
              type="button"
              onClick={handlePrintSlip}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/25 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Verification Slip</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleDownloadReceipt}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 transition-all"
          >
            <Download className="w-4 h-4" />
            <span>Download Summary PDF</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-4">
        {[
          { id: 'overview', label: 'Status & Timeline', icon: Clock },
          { id: 'requirements', label: 'Requirements & Docs', icon: FileText },
          { id: 'messages', label: 'Admissions Desk', icon: MessageSquare },
          { id: 'profile', label: 'Applicant Profile', icon: User },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-purple-700 text-white shadow-md shadow-purple-600/25'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: OVERVIEW & STATUS TRACKING */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <StatCard title="Application Ref #" value={appData.applicationNumber} icon={FileText} />
            <StatCard title="Document Progress" value={`${verifiedDocsCount} Verified / ${totalDocsCount} Total`} icon={CheckCircle2} iconBgColor="bg-emerald-500/10 text-emerald-400" />
            <StatCard
              title="In-Person Appointment"
              value={appData.appointment ? `${new Date(appData.appointment.appointmentDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (${appData.appointment.appointmentTime})` : 'Not Scheduled'}
              icon={Calendar}
              iconBgColor="bg-amber-500/10 text-amber-400"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline Progress Tracker */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-white">Admissions Workflow Progress</h3>
                  <p className="text-xs text-slate-400">Next Action: {appData.estimatedNextStep}</p>
                </div>
                <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/15 px-3 py-1 rounded-full border border-purple-500/30">
                  Stage {appData.stageIndex + 1} of 10
                </span>
              </div>

              {/* Status Log */}
              <div className="space-y-6 relative pl-6 border-l-2 border-slate-800">
                {appData.statusHistory.map((h, idx) => (
                  <div key={idx} className="relative space-y-1">
                    <div className="absolute -left-[31px] top-0.5 w-4 h-4 rounded-full border-2 bg-purple-600 border-purple-400 ring-4 ring-purple-500/20" />
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-white">{h.fromStatus} → <span className="text-purple-300">{h.toStatus}</span></div>
                      <span className="text-[11px] font-mono text-slate-400">{new Date(h.timestamp).toLocaleString()}</span>
                    </div>
                    <p className="text-xs text-slate-400">{h.remarks}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions / Notices */}
            <div className="space-y-6">
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                <h3 className="font-bold text-white text-base flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-purple-400" />
                  <span>Admissions Notice</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {appData.applicantRemarks || 'Your application is under evaluation. Please keep your required documents ready for physical verification at the Registrar Office.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REQUIREMENTS & DOCUMENTS */}
      {activeTab === 'requirements' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-white">Dual Verification Checklist</h3>
              <p className="text-xs text-slate-400">Digital Upload &amp; Physical Original Statuses</p>
            </div>
          </div>

          <div className="space-y-4">
            {appData.documents.map((doc) => (
              <div key={doc.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="font-bold text-sm text-white">{doc.documentName}</h4>
                  <p className="text-[11px] text-slate-400">Filename: {doc.originalFilename || 'Not uploaded'}</p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                  <div className="px-3 py-1 bg-purple-950 border border-purple-800 text-purple-300 rounded-lg font-semibold">
                    Digital: {doc.digitalStatus}
                  </div>
                  <div className="px-3 py-1 bg-indigo-950 border border-indigo-800 text-indigo-300 rounded-lg font-semibold">
                    Original: {doc.originalStatus}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ADMISSIONS DESK */}
      {activeTab === 'messages' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-lg text-white">Registrar Helpdesk</h3>
            <p className="text-xs text-slate-400">Direct channel with Noah's Academy Admissions</p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {localMessages.length === 0 ? (
              <div className="p-8 text-center text-xs text-slate-500 bg-slate-950 rounded-2xl border border-slate-800">
                No previous messages. Type a inquiry below to send to the Admissions Desk.
              </div>
            ) : (
              localMessages.map((msg) => (
                <div key={msg.id} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-purple-300">{msg.sender} ({msg.role})</span>
                    <span className="text-[10px] text-slate-500">{msg.date}</span>
                  </div>
                  <p className="text-xs text-slate-300">{msg.text}</p>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-3 pt-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message to the Admissions Office..."
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-3 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-purple-600/25 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Send Inquiry</span>
            </button>
          </form>
        </div>
      )}

      {/* TAB 4: APPLICANT PROFILE */}
      {activeTab === 'profile' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div>
              <h3 className="font-bold text-lg text-white">Applicant Record</h3>
              <p className="text-xs text-slate-400">Submitted profile details</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Full Name</span>
              <div className="font-bold text-white text-sm">{appData.fullName}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Email Address</span>
              <div className="font-bold text-white text-sm">{appData.email}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Application Number</span>
              <div className="font-bold text-purple-400 font-mono text-sm">{appData.applicationNumber}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Grade Applying For</span>
              <div className="font-bold text-blue-400 text-sm">{appData.gradeApplyingFor}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Current Status</span>
              <div className="font-bold text-emerald-400 text-sm">{appData.currentStageTitle}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Submission Date</span>
              <div className="font-bold text-white text-sm">{new Date(appData.createdAt).toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
