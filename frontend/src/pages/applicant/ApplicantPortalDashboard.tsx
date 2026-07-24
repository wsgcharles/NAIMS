import React, { useState } from 'react';
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
  Upload,
  ShieldAlert,
  Send,
  Sparkles,
} from 'lucide-react';
import { EnrollmentStatus } from '../../types';
import { toast } from 'sonner';

export const ApplicantPortalDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'messages' | 'profile'>('overview');

  const applicantInfo = {
    refNumber: 'NAI-2026-000154',
    name: 'John Mark Doe',
    email: 'johnmark.doe@example.com',
    phone: '+1 555-0192',
    grade: 'Grade 11 (STEM Track)',
    submissionDate: 'July 22, 2026',
    status: EnrollmentStatus.Verified,
    interviewDate: 'August 03, 2026 — 10:00 AM (Room 204)',
    previousSchool: 'Springfield Junior High School',
    gpa: '94.5',
    fatherName: 'Robert Doe',
    motherName: 'Elena Reyes Doe',
    emergencyPhone: '+1 555-0144',
  };

  const timelineSteps = [
    { title: 'Draft Created', date: 'July 22, 2026', done: true, desc: 'Application draft initialized by applicant.' },
    { title: 'Application Submitted', date: 'July 22, 2026', done: true, desc: 'Digital form and initial attachments submitted.' },
    { title: 'Document Verification', date: 'July 22, 2026', done: true, desc: 'Registrar validated Form 138 & Birth Certificate.' },
    { title: 'Guidance Interview', date: 'Aug 03, 2026 (Scheduled)', active: true, desc: 'Consultation with Senior High Guidance Counselor.' },
    { title: 'Official Approval', date: 'Pending Interview', done: false, desc: 'Final sign-off by Admissions Committee.' },
    { title: 'Convert to Student', date: 'Pending Approval', done: false, desc: 'Registrar issues Student ID & Section allocation.' },
  ];

  const documents = [
    { name: 'PSA Birth Certificate', type: 'PDF Document', status: 'Verified', date: 'July 22, 2026' },
    { name: 'Report Card (Form 138)', type: 'PDF Document', status: 'Verified', date: 'July 22, 2026' },
    { name: 'Certificate of Good Moral Character', type: 'PDF Document', status: 'Verified', date: 'July 22, 2026' },
    { name: 'Recent 2x2 ID Photo', type: 'PNG Image', status: 'Action Required', date: 'Pending Re-upload' },
  ];

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'Registrar Admissions Office',
      role: 'Registrar',
      text: 'Your document verification has been completed. Please bring original physical copies of your Form 138 to your scheduled interview.',
      date: 'July 22, 2026 — 2:15 PM',
    },
    {
      id: 2,
      sender: 'Guidance Office',
      role: 'Counselor',
      text: 'Reminder: Your Senior High STEM orientation interview is scheduled for August 3, 2026 at 10:00 AM in Room 204.',
      date: 'July 23, 2026 — 9:00 AM',
    },
  ]);

  const [newMessage, setNewMessage] = useState('');

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages([
      ...messages,
      {
        id: Date.now(),
        sender: applicantInfo.name,
        role: 'Applicant',
        text: newMessage,
        date: 'Just now',
      },
    ]);
    setNewMessage('');
    toast.success('Message sent to Admissions Office.');
  };

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
          Ref: {applicantInfo.refNumber}
        </span>
      </div>

      {/* Top Banner */}
      <div className="relative bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 border border-slate-800 rounded-3xl p-6 sm:p-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6 shadow-2xl overflow-hidden">
        <div className="pointer-events-none absolute -right-10 -bottom-10 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="space-y-2 relative z-10">
          <div className="flex items-center gap-3">
            <span className="px-3 py-1 bg-blue-500/15 text-blue-400 text-[11px] font-bold uppercase tracking-wider rounded-full border border-blue-500/30">
              AY 2026–2027 Admissions
            </span>
            <StatusChip status={applicantInfo.status} type="enrollment" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Welcome, {applicantInfo.name}!</h1>
          <p className="text-xs text-slate-400">
            Applying for <strong className="text-white">{applicantInfo.grade}</strong> · Submitted on {applicantInfo.submissionDate}
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10 shrink-0">
          <button
            onClick={() => toast.success('Downloading Official Application Summary PDF...')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 transition-all"
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
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
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
            <StatCard title="Application Ref #" value={applicantInfo.refNumber} icon={FileText} />
            <StatCard title="Document Status" value="3 Verified / 1 Action" icon={CheckCircle2} iconBgColor="bg-emerald-500/10 text-emerald-400" />
            <StatCard title="Scheduled Interview" value="Aug 03, 2026" icon={Calendar} iconBgColor="bg-amber-500/10 text-amber-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Timeline Progress Tracker */}
            <div className="lg:col-span-2 bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-bold text-lg text-white">Admissions Workflow Progress</h3>
                  <p className="text-xs text-slate-400">Step-by-step verification pipeline</p>
                </div>
                <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
                  Step 4 of 6 Active
                </span>
              </div>

              <div className="space-y-8 relative pl-6 border-l-2 border-slate-800">
                {timelineSteps.map((step, idx) => (
                  <div key={idx} className="relative space-y-1 group">
                    <div
                      className={`absolute -left-[31px] top-0 w-4 h-4 rounded-full border-2 transition-all ${
                        step.done
                          ? 'bg-emerald-500 border-emerald-400 shadow-sm shadow-emerald-500/50'
                          : step.active
                          ? 'bg-blue-600 border-blue-400 ring-4 ring-blue-500/20'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    />
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-bold text-white group-hover:text-blue-300 transition-colors">
                        {step.title}
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{step.date}</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{step.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Side Widgets */}
            <div className="space-y-6">
              {/* Scheduled Interview Card */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                  <Calendar className="w-4 h-4" />
                  <span>Guidance Interview Details</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
                  <div className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Date &amp; Venue</div>
                  <div className="font-bold text-amber-300">{applicantInfo.interviewDate}</div>
                  <p className="text-[11px] text-slate-400 pt-1 leading-relaxed">
                    Please arrive 15 minutes prior. Bring physical original Form 138 &amp; PSA Birth Certificate for final verification.
                  </p>
                </div>
              </div>

              {/* Registrar Advisories */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 space-y-4">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>Admissions Advisory</span>
                </div>
                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 text-xs space-y-2">
                  <div className="font-semibold text-white">Enrollment Clearance</div>
                  <p className="text-slate-400 leading-relaxed">
                    Once interview evaluation is submitted, the Registrar Office will issue your tuition fee ledger and class section assignment.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: REQUIREMENTS & DOCUMENTS */}
      {activeTab === 'requirements' && (
        <div className="space-y-6">
          <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-white">Digital Document Requirements</h3>
                <p className="text-xs text-slate-400">Required credentials for official enrollment verification</p>
              </div>
              <button
                onClick={() => toast.info('Select a document slot below to upload or replace file.')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload New File</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {documents.map((doc, idx) => (
                <div key={idx} className="p-5 bg-slate-950 rounded-2xl border border-slate-800 flex flex-col justify-between space-y-4 hover:border-slate-700 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">{doc.name}</h4>
                        <span className="text-[11px] text-slate-400">{doc.type} · {doc.date}</span>
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                        doc.status === 'Verified'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                      }`}
                    >
                      {doc.status}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <span className="text-[11px] text-slate-500">Max size 10MB (PDF/PNG)</span>
                    <button
                      onClick={() => toast.success(`Re-uploading ${doc.name}...`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-lg border border-slate-800"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{doc.status === 'Verified' ? 'Replace' : 'Upload File'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: ADMISSIONS DESK / MESSAGES */}
      {activeTab === 'messages' && (
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-4">
            <h3 className="font-bold text-lg text-white">Admissions Help Desk &amp; Messaging</h3>
            <p className="text-xs text-slate-400">Direct channel with the Registrar and Guidance Officers</p>
          </div>

          <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`p-4 rounded-2xl border space-y-1.5 ${
                  m.role === 'Applicant'
                    ? 'bg-blue-950/40 border-blue-800/60 ml-8'
                    : 'bg-slate-950 border-slate-800 mr-8'
                }`}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-white flex items-center gap-2">
                    {m.sender}
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-mono">
                      {m.role}
                    </span>
                  </span>
                  <span className="text-[11px] text-slate-500">{m.date}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{m.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={handleSendMessage} className="flex items-center gap-3 pt-4 border-t border-slate-800">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your inquiry or message for the Admissions Office..."
              className="flex-1 px-4 py-3 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span>Send</span>
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
              <p className="text-xs text-slate-400">Pre-enrollment profile details</p>
            </div>
            <button
              onClick={() => toast.info('Contact Registrar to request profile modifications.')}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700"
            >
              Request Changes
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-xs">
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Full Name</span>
              <div className="font-bold text-white text-sm">{applicantInfo.name}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Email Address</span>
              <div className="font-bold text-white text-sm">{applicantInfo.email}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Mobile Contact</span>
              <div className="font-bold text-white text-sm">{applicantInfo.phone}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Desired Track</span>
              <div className="font-bold text-blue-400 text-sm">{applicantInfo.grade}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Previous School</span>
              <div className="font-bold text-white text-sm">{applicantInfo.previousSchool}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Junior High GPA</span>
              <div className="font-bold text-emerald-400 text-sm">{applicantInfo.gpa}%</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Father's Name</span>
              <div className="font-bold text-white text-sm">{applicantInfo.fatherName}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Mother's Name</span>
              <div className="font-bold text-white text-sm">{applicantInfo.motherName}</div>
            </div>
            <div className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Emergency Hotline</span>
              <div className="font-bold text-white text-sm">{applicantInfo.emergencyPhone}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
