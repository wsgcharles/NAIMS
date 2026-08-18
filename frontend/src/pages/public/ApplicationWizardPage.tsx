import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Upload,
  FileText,
  Download,
  Save,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ChevronUp,
  ShieldCheck,
  GraduationCap,
  Clock,
  Check,
  Copy,
  Home,
  User,
  Phone,
  BookOpen,
  HeartPulse,
  FolderCheck,
  ClipboardList,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { admissionService, type AdmissionDocumentType } from '../../services/admissionService';
import { receiptPdfService } from '../../services/receiptPdfService';
import apiClient from '../../services/apiClient';
import { NoahLogo } from '../../components/brand/NoahLogo';

export const ApplicationWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [appNumber, setAppNumber] = useState('');
  const [isGateOpen, setIsGateOpen] = useState<boolean | null>(null);
  const [gateMessage, setGateMessage] = useState('');
  const [activeSyName, setActiveSyName] = useState('AY 2026–2027');
  const [lastSavedTime, setLastSavedTime] = useState<string>('Just now');
  const [isSaving, setIsSaving] = useState(false);

  // Accordion open state for Review Step
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({
    1: true,
    2: true,
    3: true,
    4: true,
    5: true,
    6: true,
  });

  const toggleSection = (stepNum: number) => {
    setExpandedSections((prev) => ({ ...prev, [stepNum]: !prev[stepNum] }));
  };

  useEffect(() => {
    apiClient
      .get('/AcademicYears/active')
      .then((res) => {
        const ay = res.data;
        if (ay?.yearName) {
          setActiveSyName(ay.yearName);
        }
        if (!ay || ay.isEnrollmentOpen === false) {
          setIsGateOpen(false);
          setGateMessage(
            "Online admissions are currently closed. Please check the official enrollment schedule or contact the Registrar's Office."
          );
          return;
        }

        const now = new Date();
        if (ay.enrollmentStartDate && new Date(ay.enrollmentStartDate) > now) {
          setIsGateOpen(false);
          setGateMessage(
            "Online admissions are currently closed. Please check the official enrollment schedule or contact the Registrar's Office."
          );
          return;
        }

        if (ay.enrollmentEndDate && new Date(ay.enrollmentEndDate) < now) {
          setIsGateOpen(false);
          setGateMessage(
            "Online admissions are currently closed. Please check the official enrollment schedule or contact the Registrar's Office."
          );
          return;
        }

        setIsGateOpen(true);
      })
      .catch(() => {
        setIsGateOpen(true);
      });

    admissionService.getDocumentTypes().then((types) => setDocTypes(types)).catch(() => {});
  }, []);

  const [docTypes, setDocTypes] = useState<AdmissionDocumentType[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Record<number, File>>({});
  const [uploadStatusMsg, setUploadStatusMsg] = useState<string>('');

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    middleName: '',
    lastName: '',
    birthdate: '',
    gender: 'Male',
    email: '',
    phone: '',
    address: '',
    city: '',
    fatherName: '',
    motherName: '',
    emergencyPhone: '',
    parentEmail: '',
    applicantType: 'NewStudent',

    gradeLevel: 'Grade 11',
    track: '',
    previousSchool: '',
    gpa: '',
    bloodType: '',
    allergies: '',
    consentAgreed: false,
  });

  const handleFileSelect = (typeId: number, file: File) => {
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File size exceeds the 10MB limit.');
      return;
    }
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!['.pdf', '.png', '.jpg', '.jpeg'].includes(ext)) {
      toast.error('Invalid file format. Allowed formats: PDF, PNG, JPG, JPEG.');
      return;
    }
    setSelectedFiles((prev) => ({ ...prev, [typeId]: file }));
    toast.success(`Selected file for upload: ${file.name}`);
  };

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSaveDraft = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setLastSavedTime('Just now');
      toast.success('Application draft saved successfully! You can resume anytime.');
    }, 400);
  };

  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentAgreed) {
      toast.error('Please accept the consent declaration before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      setUploadStatusMsg('Creating application record…');
      const response = await admissionService.submitApplication({
        firstName: formData.firstName,
        middleName: formData.middleName || '',
        lastName: formData.lastName,
        suffix: '',
        birthDate: formData.birthdate || '2009-05-14',
        gender: formData.gender || 'Male',
        email: formData.email,
        phoneNumber: formData.phone,
        address: formData.address || 'Arca South, Taguig City',
        barangay: 'Arca South',
        city: formData.city || 'Taguig',
        province: 'Metro Manila',
        parentName: formData.fatherName || formData.motherName || 'Parent/Guardian',
        parentContact: formData.emergencyPhone || formData.phone,
        parentEmail: formData.parentEmail || undefined,
        relationship: 'Parent',

        previousSchool: formData.previousSchool || 'N/A',
        gradeApplyingFor: formData.gradeLevel || 'Grade 11',
        track: formData.track || undefined,
        strand: formData.track || undefined,
      });


      const fileEntries = Object.entries(selectedFiles);
      if (fileEntries.length > 0) {
        setUploadStatusMsg(`Uploading ${fileEntries.length} digital document credential(s)…`);
        for (const [typeIdStr, file] of fileEntries) {
          try {
            await admissionService.uploadDocument(response.id, Number(typeIdStr), file);
          } catch (err: any) {
            console.error('Failed uploading document file:', file.name, err);
          }
        }
      }

      setAppNumber(response.applicationNumber);
      setIsSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      toast.success(`Application ${response.applicationNumber} submitted successfully!`);
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err.message ||
        'Failed to submit application. Please try again.';
      toast.error(msg);
    } finally {
      setSubmitting(false);
      setUploadStatusMsg('');
    }
  };

  // Step definitions
  const steps = [
    { num: 1, title: 'Personal', icon: User },
    { num: 2, title: 'Contact', icon: Phone },
    { num: 3, title: 'Guardian', icon: ShieldCheck },
    { num: 4, title: 'Academic', icon: BookOpen },
    { num: 5, title: 'Medical', icon: HeartPulse },
    { num: 6, title: 'Documents', icon: FolderCheck },
    { num: 7, title: 'Review', icon: ClipboardList },
  ];

  const progressPercent = Math.round((currentStep / steps.length) * 100);

  // Closed Gate View
  if (isGateOpen === false) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6 text-center font-sans">
        <div className="max-w-md w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="w-16 h-16 bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Online Admissions Closed</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 leading-relaxed font-medium">
              {gateMessage ||
                "Online admissions are currently closed. Please check the official enrollment schedule or contact the Registrar's Office."}
            </p>
          </div>
          <Link
            to="/admissions"
            className="inline-flex items-center justify-center w-full py-3 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-xl shadow-lg transition-all"
          >
            Return to Admissions Info
          </Link>
        </div>
      </div>
    );
  }

  // Submitted / Success Confirmation Screen
  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6 font-sans flex flex-col items-center justify-center">
        <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 sm:p-10 shadow-2xl space-y-8 animate-in fade-in zoom-in-95 duration-200">
          {/* Header Seal */}
          <div className="flex flex-col items-center text-center space-y-3">
            <NoahLogo size="lg" showText={false} />
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-700 dark:text-purple-400 px-3 py-1 bg-purple-100 dark:bg-purple-950/80 rounded-full border border-purple-200 dark:border-purple-800">
              NAISIS Admission Portal
            </span>
          </div>

          {/* Success Badge */}
          <div className="text-center space-y-3">
            <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-200 dark:border-emerald-800 shadow-lg shadow-emerald-500/10">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Application Submitted Successfully!
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
              Your admission application has been registered into the Noah's Academy Registrar Queue for {activeSyName}.
            </p>
          </div>

          {/* Reference Card */}
          <div className="bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 rounded-2xl p-6 text-center space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-800 dark:text-purple-300">
              Official Application Reference Number
            </span>
            <div className="flex items-center justify-center space-x-2">
              <span className="font-mono text-3xl font-black text-purple-900 dark:text-purple-200 tracking-wider">
                {appNumber}
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(appNumber);
                  toast.success('Reference number copied to clipboard!');
                }}
                className="p-1.5 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 rounded-lg transition-colors"
                title="Copy Reference Number"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[11px] text-purple-700 dark:text-purple-300">
              Please save this reference number for checking your admission status.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3 pt-2">
            <button
              onClick={() =>
                navigate(
                  `/admissions/track?appNum=${appNumber}&email=${encodeURIComponent(
                    formData.email
                  )}`
                )
              }
              className="w-full py-3.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-purple-700/20 transition-all flex items-center justify-center space-x-2"
            >
              <span>Track Application Status</span>
              <ChevronRight className="w-4 h-4" />
            </button>

            <button
              onClick={() =>
                receiptPdfService.downloadConfirmationReceipt({
                  applicationNumber: appNumber,
                  fullName: `${formData.firstName} ${formData.middleName} ${formData.lastName}`,
                  gradeApplyingFor: formData.gradeLevel,
                  email: formData.email,
                  createdAt: new Date().toISOString(),
                  status: 'Submitted',
                  estimatedNextStep: 'Under Review by Registrar Office',
                })
              }
              className="w-full py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs rounded-xl border border-slate-200 dark:border-slate-700 transition-all flex items-center justify-center space-x-2"
            >
              <Download className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              <span>Download PDF Receipt</span>
            </button>

            <Link
              to="/"
              className="w-full py-2.5 text-center text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center justify-center space-x-1.5"
            >
              <Home className="w-3.5 h-3.5" />
              <span>Return to NAISIS Homepage</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 font-sans py-8 sm:py-12 px-4 sm:px-6">
      {/* Top Header Navigation */}
      <div className="max-w-3xl mx-auto mb-6 flex items-center justify-between">
        <Link
          to="/admissions"
          className="inline-flex items-center text-xs font-bold text-purple-700 dark:text-purple-400 hover:text-purple-900 dark:hover:text-purple-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Admissions</span>
        </Link>

        <div className="flex items-center space-x-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400">
          <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
          <span>Estimated time: 15–20 minutes</span>
        </div>
      </div>

      {/* Main Centered Portrait Card Form Container */}
      <div className="max-w-3xl mx-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl overflow-hidden border-t-4 border-t-purple-700 dark:border-t-purple-500">
        
        {/* Card Header & Branding */}
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-b from-purple-50/50 to-transparent dark:from-purple-950/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-3.5">
              <NoahLogo size="md" showText={false} />
              <div>
                <span className="text-[10px] font-black uppercase tracking-widest text-purple-800 dark:text-purple-300">
                  Noah's Academy Student Information System
                </span>
                <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  Official Student Admission Application
                </h1>
              </div>
            </div>

            <div className="inline-flex items-center space-x-1.5 px-3 py-1 bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-full text-xs font-bold shrink-0 self-start sm:self-center border border-purple-200 dark:border-purple-800">
              <GraduationCap className="w-4 h-4 text-purple-700 dark:text-purple-400" />
              <span>{activeSyName}</span>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mt-6 pt-6 border-t border-slate-200/60 dark:border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
              <span>Step {currentStep} of 7 · {steps[currentStep - 1].title}</span>
              <span className="text-purple-700 dark:text-purple-400 font-extrabold">{progressPercent}% Complete</span>
            </div>

            <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-300 ease-out rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>

            {/* Compact Step Chips Navigation */}
            <div className="pt-2 flex items-center justify-between overflow-x-auto gap-1.5 no-scrollbar">
              {steps.map((s) => {
                const isActive = currentStep === s.num;
                const isDone = currentStep > s.num;
                const StepIcon = s.icon;

                return (
                  <button
                    key={s.num}
                    type="button"
                    onClick={() => {
                      if (s.num <= currentStep) setCurrentStep(s.num);
                    }}
                    disabled={s.num > currentStep}
                    className={`flex items-center space-x-1 px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 ${
                      isActive
                        ? 'bg-purple-700 text-white shadow-md shadow-purple-700/20'
                        : isDone
                        ? 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                        : 'bg-slate-50 dark:bg-slate-800/50 text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-3 h-3 text-purple-700 dark:text-purple-400 shrink-0" />
                    ) : (
                      <StepIcon className="w-3 h-3 shrink-0" />
                    )}
                    <span className="hidden sm:inline">{s.title}</span>
                    <span className="sm:hidden">{s.num}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Form Body Container */}
        <div className="p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* STEP 1: PERSONAL INFO */}
            {currentStep === 1 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <User className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Personal Information</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Provide the applicant's official legal name and birth details as they appear on official documents.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        First Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                        placeholder="e.g. John Mark"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Middle Name
                      </label>
                      <input
                        type="text"
                        value={formData.middleName}
                        onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                        placeholder="e.g. Alexander"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Last Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="e.g. Doe"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Date of Birth <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.birthdate}
                      onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Sex / Gender <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.gender}
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: CONTACT INFO */}
            {currentStep === 2 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <Phone className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Contact Information</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Enter valid contact details for receiving admission status updates and official notifications.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Email Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="e.g. johnmark.doe@example.com"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mobile Phone Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="e.g. +63 917 555 0192"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Home Street Address <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="e.g. 31 DBP Avenue, Arca South"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      City / Municipality <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="e.g. Taguig City"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: GUARDIAN */}
            {currentStep === 3 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <ShieldCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Parent &amp; Guardian Information</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Provide contact information for parents or legal guardians for emergency and portal access matching.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Father's Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.fatherName}
                      onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="e.g. Robert Doe"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Mother's Full Name
                    </label>
                    <input
                      type="text"
                      value={formData.motherName}
                      onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="e.g. Elena Reyes Doe"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Emergency Contact Number <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.emergencyPhone}
                      onChange={(e) => setFormData({ ...formData, emergencyPhone: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="e.g. +63 917 555 0144"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Parent / Guardian Email Address <span className="text-slate-400 text-xs font-normal">(Used for official Parent Portal access)</span>
                    </label>
                    <input
                      type="email"
                      value={formData.parentEmail}
                      onChange={(e) => setFormData({ ...formData, parentEmail: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="e.g. parent@gmail.com"
                    />
                  </div>
                </div>
              </div>
            )}


            {/* STEP 4: ACADEMIC */}
            {currentStep === 4 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Academic Background &amp; Track</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Select the target grade level, Senior High specialization track, and details from previous schooling.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Applying For Grade Level <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.gradeLevel}
                      onChange={(e) => {
                        const nextGrade = e.target.value;
                        const isShs = nextGrade === 'Grade 11' || nextGrade === 'Grade 12';
                        setFormData({
                          ...formData,
                          gradeLevel: nextGrade,
                          track: isShs ? (formData.track || 'ICT') : '',
                        });
                      }}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                    >
                      <option value="Grade 11">Grade 11 (Senior High)</option>
                      <option value="Grade 12">Grade 12 (Senior High)</option>
                      <option value="Grade 7">Grade 7 (Junior High)</option>
                      <option value="Grade 8">Grade 8 (Junior High)</option>
                      <option value="Grade 9">Grade 9 (Junior High)</option>
                      <option value="Grade 10">Grade 10 (Junior High)</option>
                    </select>
                  </div>

                  {(formData.gradeLevel === 'Grade 11' || formData.gradeLevel === 'Grade 12') && (
                    <div>
                      <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                        Senior High Strand <span className="text-rose-500">*</span>
                      </label>
                      <select
                        required
                        value={formData.track}
                        onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                        className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      >
                        <option value="ICT">Information and Communications Technology (ICT)</option>
                        <option value="ABM">Accountancy, Business and Management (ABM)</option>
                        <option value="STEM">Science, Technology, Engineering and Mathematics (STEM)</option>
                        <option value="HUMSS">Humanities and Social Sciences (HUMSS)</option>
                        <option value="GAS">General Academic Strand (GAS)</option>
                      </select>
                    </div>
                  )}

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Name of Last School Attended <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.previousSchool}
                      onChange={(e) => setFormData({ ...formData, previousSchool: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="e.g. Springfield Junior High School"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: MEDICAL */}
            {currentStep === 5 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <HeartPulse className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Medical Information</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Provide relevant medical conditions or emergency health records for the School Clinic.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Blood Type
                    </label>
                    <input
                      type="text"
                      value={formData.bloodType}
                      onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="e.g. O+"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      Known Allergies / Medical Notes
                    </label>
                    <input
                      type="text"
                      value={formData.allergies}
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                      className="w-full p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all font-medium"
                      placeholder="e.g. None"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: DOCUMENTS */}
            {currentStep === 6 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <FolderCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Digital Document Upload Cards</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Upload scanned digital copies of your required credentials. High-resolution PDF, JPG, or PNG files are accepted.
                  </p>
                </div>

                <div className="space-y-4 text-xs">
                  {(docTypes.length > 0
                    ? docTypes.map((dt) => ({
                        id: dt.id,
                        title: dt.name,
                        desc: dt.isRequired ? 'Mandatory admission requirement' : 'Optional submission',
                      }))
                    : [
                        { id: 1, title: 'PSA Birth Certificate', desc: 'Official birth certificate issued by the Philippine Statistics Authority' },
                        { id: 2, title: 'Report Card (Form 138 / SF9)', desc: 'Copy of previous grade level report card showing general average' },
                        { id: 3, title: 'Certificate of Good Moral Character', desc: 'Issued by the Principal or Guidance Counselor of last school attended' },
                        { id: 4, title: '2x2 Recent ID Photo', desc: 'White background with formal attire, digital photograph file' },
                      ]
                  ).map((doc) => {
                    const selectedFile = selectedFiles[doc.id];
                    return (
                      <div
                        key={doc.id}
                        className="p-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-purple-300 dark:hover:border-purple-800 shadow-xs"
                      >
                        <div className="flex items-start space-x-3.5">
                          <div
                            className={`p-3 rounded-xl shrink-0 mt-0.5 ${
                              selectedFile
                                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400'
                                : 'bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400'
                            }`}
                          >
                            <FileText className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <h3 className="font-extrabold text-slate-900 dark:text-white text-sm">
                                {doc.title}
                              </h3>
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                                  selectedFile
                                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                }`}
                              >
                                {selectedFile ? 'Selected for Upload' : 'Pending Selection'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                              {doc.desc}
                            </p>
                            {selectedFile ? (
                              <p className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 mt-1 font-bold">
                                📄 {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                              </p>
                            ) : (
                              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                                Supported: PDF, JPG, PNG · Max 10MB
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                          <label className="cursor-pointer px-4 py-2 bg-purple-700 hover:bg-purple-600 text-white text-xs font-bold rounded-xl shadow-md transition-colors inline-flex items-center space-x-1.5">
                            <Upload className="w-3.5 h-3.5" />
                            <span>{selectedFile ? 'Change File' : 'Browse & Upload'}</span>
                            <input
                              type="file"
                              accept=".pdf,.png,.jpg,.jpeg"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleFileSelect(doc.id, file);
                              }}
                            />
                          </label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* STEP 7: REVIEW & SUBMIT */}
            {currentStep === 7 && (
              <div className="space-y-6 animate-in fade-in duration-200">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
                  <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center space-x-2">
                    <ClipboardList className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    <span>Final Application Summary &amp; Verification</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Review all encoded details below before submitting your official application to the Registrar Office.
                  </p>
                </div>

                {/* Expandable Accordion Summary Cards */}
                <div className="space-y-3.5 text-xs">
                  
                  {/* Card 1: Personal Info */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div
                      onClick={() => toggleSection(1)}
                      className="p-4 flex items-center justify-between cursor-pointer bg-slate-100/70 dark:bg-slate-900 select-none"
                    >
                      <div className="flex items-center space-x-2.5">
                        <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          Personal Information
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentStep(1);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        {expandedSections[1] ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    {expandedSections[1] && (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        <div><span className="text-slate-400 font-semibold">Full Name:</span> <strong className="ml-1.5">{formData.firstName} {formData.middleName} {formData.lastName}</strong></div>
                        <div><span className="text-slate-400 font-semibold">Birthdate:</span> <strong className="ml-1.5">{formData.birthdate}</strong></div>
                        <div><span className="text-slate-400 font-semibold">Gender:</span> <strong className="ml-1.5">{formData.gender}</strong></div>
                      </div>
                    )}
                  </div>

                  {/* Card 2: Contact Info */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div
                      onClick={() => toggleSection(2)}
                      className="p-4 flex items-center justify-between cursor-pointer bg-slate-100/70 dark:bg-slate-900 select-none"
                    >
                      <div className="flex items-center space-x-2.5">
                        <Phone className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          Contact Information
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentStep(2);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        {expandedSections[2] ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    {expandedSections[2] && (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        <div><span className="text-slate-400 font-semibold">Email:</span> <strong className="ml-1.5">{formData.email}</strong></div>
                        <div><span className="text-slate-400 font-semibold">Phone:</span> <strong className="ml-1.5">{formData.phone}</strong></div>
                        <div className="sm:col-span-2"><span className="text-slate-400 font-semibold">Address:</span> <strong className="ml-1.5">{formData.address}, {formData.city}</strong></div>
                      </div>
                    )}
                  </div>

                  {/* Card 3: Guardian Info */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div
                      onClick={() => toggleSection(3)}
                      className="p-4 flex items-center justify-between cursor-pointer bg-slate-100/70 dark:bg-slate-900 select-none"
                    >
                      <div className="flex items-center space-x-2.5">
                        <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          Guardian Information
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentStep(3);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        {expandedSections[3] ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    {expandedSections[3] && (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        <div><span className="text-slate-400 font-semibold">Father:</span> <strong className="ml-1.5">{formData.fatherName}</strong></div>
                        <div><span className="text-slate-400 font-semibold">Mother:</span> <strong className="ml-1.5">{formData.motherName}</strong></div>
                        <div className="sm:col-span-2"><span className="text-slate-400 font-semibold">Emergency Phone:</span> <strong className="ml-1.5">{formData.emergencyPhone}</strong></div>
                      </div>
                    )}
                  </div>

                  {/* Card 4: Academic Info */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div
                      onClick={() => toggleSection(4)}
                      className="p-4 flex items-center justify-between cursor-pointer bg-slate-100/70 dark:bg-slate-900 select-none"
                    >
                      <div className="flex items-center space-x-2.5">
                        <BookOpen className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          Academic Background &amp; Track
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentStep(4);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        {expandedSections[4] ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    {expandedSections[4] && (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        <div><span className="text-slate-400 font-semibold">Grade Applying For:</span> <strong className="ml-1.5 text-purple-700 dark:text-purple-400">{formData.gradeLevel}</strong></div>
                        <div><span className="text-slate-400 font-semibold">Senior High Strand:</span> <strong className="ml-1.5 text-purple-700 dark:text-purple-400">{formData.track}</strong></div>
                        <div className="sm:col-span-2"><span className="text-slate-400 font-semibold">Last School:</span> <strong className="ml-1.5">{formData.previousSchool}</strong></div>
                      </div>
                    )}
                  </div>

                  {/* Card 5: Medical Info */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div
                      onClick={() => toggleSection(5)}
                      className="p-4 flex items-center justify-between cursor-pointer bg-slate-100/70 dark:bg-slate-900 select-none"
                    >
                      <div className="flex items-center space-x-2.5">
                        <HeartPulse className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          Medical Information
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentStep(5);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        {expandedSections[5] ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    {expandedSections[5] && (
                      <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 border-t border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        <div><span className="text-slate-400 font-semibold">Blood Type:</span> <strong className="ml-1.5">{formData.bloodType}</strong></div>
                        <div><span className="text-slate-400 font-semibold">Known Allergies:</span> <strong className="ml-1.5">{formData.allergies}</strong></div>
                      </div>
                    )}
                  </div>

                  {/* Card 6: Documents */}
                  <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950">
                    <div
                      onClick={() => toggleSection(6)}
                      className="p-4 flex items-center justify-between cursor-pointer bg-slate-100/70 dark:bg-slate-900 select-none"
                    >
                      <div className="flex items-center space-x-2.5">
                        <FolderCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        <span className="font-bold text-slate-900 dark:text-white text-sm">
                          Uploaded Documents
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentStep(6);
                          }}
                          className="px-2.5 py-1 text-[11px] font-bold text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-950 rounded-lg transition-colors"
                        >
                          Edit
                        </button>
                        {expandedSections[6] ? (
                          <ChevronUp className="w-4 h-4 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        )}
                      </div>
                    </div>
                    {expandedSections[6] && (
                      <div className="p-4 space-y-2 border-t border-slate-200/60 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Check className="w-4 h-4" />
                          <span>PSA Birth Certificate Attached</span>
                        </div>
                        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Check className="w-4 h-4" />
                          <span>Report Card (Form 138) Attached</span>
                        </div>
                        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Check className="w-4 h-4" />
                          <span>Good Moral Certificate Attached</span>
                        </div>
                        <div className="flex items-center space-x-2 text-emerald-600 dark:text-emerald-400 font-bold">
                          <Check className="w-4 h-4" />
                          <span>2x2 Recent ID Photo Attached</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Privacy Consent Checkbox Declaration */}
                <div className="p-4 bg-purple-50 dark:bg-purple-950/40 border border-purple-200/80 dark:border-purple-900/60 rounded-2xl text-xs space-y-2">
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.consentAgreed}
                      onChange={(e) => setFormData({ ...formData, consentAgreed: e.target.checked })}
                      className="w-4 h-4 mt-0.5 rounded border-slate-300 text-purple-700 focus:ring-purple-500"
                    />
                    <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                      I hereby certify that all information provided in this admission application is true, correct, and complete to the best of my knowledge. I understand and agree to the Data Privacy Policy and Admission Regulations of Noah's Academy Incorporated.
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Bottom Actions Bar & Save Draft Indicator */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Draft Status Indicator */}
              <div className="flex items-center space-x-2 text-slate-500 dark:text-slate-400 text-xs">
                <Save className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                <span>
                  {isSaving ? (
                    <span className="text-purple-600 font-bold">Saving draft...</span>
                  ) : (
                    <>✓ Draft Saved Automatically <span className="text-slate-400 font-normal">({lastSavedTime})</span></>
                  )}
                </span>
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center space-x-2.5 w-full sm:w-auto justify-end">
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300 rounded-xl transition-all inline-flex items-center space-x-1"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleSaveDraft}
                  disabled={isSaving}
                  className="px-4 py-2.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs font-bold text-purple-700 dark:text-purple-300 rounded-xl border border-purple-200 dark:border-purple-800 transition-all inline-flex items-center space-x-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Draft</span>
                </button>

                {currentStep < 7 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="px-6 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 text-xs font-bold text-white rounded-xl shadow-md shadow-purple-700/20 transition-all inline-flex items-center space-x-1.5"
                  >
                    <span>Next Step</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-7 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-600 hover:to-indigo-600 disabled:opacity-50 text-xs font-extrabold text-white rounded-xl shadow-lg shadow-purple-700/25 transition-all inline-flex items-center space-x-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>{submitting ? uploadStatusMsg || 'Submitting Application...' : 'Submit Application'}</span>
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
