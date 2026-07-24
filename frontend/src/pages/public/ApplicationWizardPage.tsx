import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  CheckCircle2,
  Upload,
  FileText,
  Download,
  Save,
  ChevronRight,
  ShieldCheck,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';

export const ApplicationWizardPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [appNumber, setAppNumber] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    firstName: 'John Mark',
    middleName: 'Alexander',
    lastName: 'Doe',
    birthdate: '2009-05-14',
    gender: 'Male',
    email: 'johnmark.doe@example.com',
    phone: '+1 555-0192',
    address: '742 Evergreen Terrace',
    city: 'Springfield',
    fatherName: 'Robert Doe',
    motherName: 'Elena Reyes Doe',
    emergencyPhone: '+1 555-0144',
    applicantType: 'NewStudent',
    gradeLevel: 'Grade 11',
    track: 'STEM (Science & Technology)',
    previousSchool: 'Springfield Junior High',
    gpa: '94.5',
    bloodType: 'O+',
    allergies: 'None',
    psaUploaded: true,
    cardUploaded: true,
    goodMoralUploaded: true,
    consentAgreed: false,
  });

  const handleNext = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    toast.success('Application draft saved successfully! You can resume anytime.');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consentAgreed) {
      toast.error('Please accept the consent declaration before submitting.');
      return;
    }
    const generatedRef = `NAI-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    setAppNumber(generatedRef);
    setIsSubmitted(true);
    toast.success(`Application ${generatedRef} submitted successfully!`);
  };

  const steps = [
    { num: 1, title: 'Personal Info' },
    { num: 2, title: 'Contact Info' },
    { num: 3, title: 'Guardian Details' },
    { num: 4, title: 'Academic Track' },
    { num: 5, title: 'Medical Info' },
    { num: 6, title: 'Document Uploads' },
    { num: 7, title: 'Review & Submit' },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-6 font-sans relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-3xl" />
        </div>

        <div className="max-w-xl w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 lg:p-12 text-center space-y-6 shadow-2xl backdrop-blur-xl relative z-10">
          <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-full w-20 h-20 mx-auto flex items-center justify-center border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              Application Submitted
            </span>
            <h1 className="text-3xl font-extrabold text-white pt-2">Application Received!</h1>
            <p className="text-xs text-slate-400 leading-relaxed">
              Your application has been registered into the Noah's Academy Registrar Queue for AY 2026–2027.
            </p>
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Official Application Reference Number</span>
            <div className="font-mono text-2xl font-extrabold text-blue-400">{appNumber}</div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => navigate('/applicant/dashboard')}
              className="flex-1 py-3.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2"
            >
              <span>Go to Applicant Portal</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => toast.success('Downloading Application PDF Summary...')}
              className="flex-1 py-3.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>Download Summary</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8 space-y-8 font-sans relative overflow-hidden">
      {/* Glow */}
      <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/8 rounded-full blur-3xl" />

      {/* Header */}
      <div className="max-w-5xl mx-auto flex items-center justify-between relative z-10">
        <Link to="/admissions" className="inline-flex items-center text-xs text-slate-400 hover:text-white transition-colors">
          <ArrowLeft className="w-4 h-4 mr-1.5" />
          <span>Back to Admissions Overview</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-bold text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
            <GraduationCap className="w-4 h-4" />
            <span>AY 2026–2027 Admissions</span>
          </div>
          <button
            onClick={handleSaveDraft}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold text-slate-300 rounded-xl transition-all"
          >
            <Save className="w-4 h-4 text-blue-400" />
            <span>Save Draft</span>
          </button>
        </div>
      </div>

      {/* Stepper Navigation Bar */}
      <div className="max-w-5xl mx-auto bg-slate-900/80 border border-slate-800 rounded-2xl p-4 overflow-x-auto relative z-10 backdrop-blur-xl">
        <div className="flex items-center justify-between min-w-[700px]">
          {steps.map((s) => (
            <div key={s.num} className="flex items-center gap-2.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                  currentStep === s.num
                    ? 'bg-blue-600 text-white ring-4 ring-blue-500/20 shadow-md shadow-blue-500/30'
                    : currentStep > s.num
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-slate-950 text-slate-500 border border-slate-800'
                }`}
              >
                {currentStep > s.num ? '✓' : s.num}
              </div>
              <span
                className={`text-xs font-semibold ${
                  currentStep === s.num ? 'text-white font-bold' : 'text-slate-500'
                }`}
              >
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Wizard Form Box */}
      <div className="max-w-3xl mx-auto bg-slate-900/80 border border-slate-800 rounded-3xl p-8 lg:p-10 shadow-2xl backdrop-blur-xl relative z-10">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* STEP 1: PERSONAL INFO */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-400" />
                Step 1: Personal Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Middle Name</label>
                  <input
                    type="text"
                    value={formData.middleName}
                    onChange={(e) => setFormData({ ...formData, middleName: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.birthdate}
                    onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
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
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Step 2: Contact Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Email Address</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Mobile Phone Number</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
              <div className="text-xs pt-2">
                <label className="block font-semibold text-slate-400 mb-1">Home Address</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          {/* STEP 3: GUARDIAN */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Step 3: Parent &amp; Guardian Details</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Father's Full Name</label>
                  <input
                    type="text"
                    value={formData.fatherName}
                    onChange={(e) => setFormData({ ...formData, fatherName: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Mother's Full Name</label>
                  <input
                    type="text"
                    value={formData.motherName}
                    onChange={(e) => setFormData({ ...formData, motherName: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: ACADEMIC */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Step 4: Academic Background &amp; Track</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Applying For Grade Level</label>
                  <select
                    value={formData.gradeLevel}
                    onChange={(e) => setFormData({ ...formData, gradeLevel: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="Grade 11">Grade 11 (Senior High)</option>
                    <option value="Grade 12">Grade 12 (Senior High)</option>
                    <option value="Grade 7">Grade 7 (Junior High)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Desired Senior High Strand</label>
                  <select
                    value={formData.track}
                    onChange={(e) => setFormData({ ...formData, track: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  >
                    <option value="STEM (Science & Technology)">STEM (Science & Technology)</option>
                    <option value="ABM (Accountancy & Business)">ABM (Accountancy & Business)</option>
                    <option value="HUMSS (Humanities & Social Sciences)">HUMSS (Humanities & Social Sciences)</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: MEDICAL */}
          {currentStep === 5 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Step 5: Medical Information</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Blood Type</label>
                  <input
                    type="text"
                    value={formData.bloodType}
                    onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-400 mb-1">Known Allergies / Medical Notes</label>
                  <input
                    type="text"
                    value={formData.allergies}
                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                    className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: DOCUMENTS */}
          {currentStep === 6 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-white">Step 6: Digital Document Uploads</h2>
              <div className="space-y-3 text-xs">
                {[
                  { name: 'PSA Birth Certificate', uploaded: formData.psaUploaded },
                  { name: 'Report Card (Form 138)', uploaded: formData.cardUploaded },
                  { name: 'Certificate of Good Moral Character', uploaded: formData.goodMoralUploaded },
                ].map((doc, idx) => (
                  <div key={idx} className="p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between hover:border-slate-700 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-xl">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-sm">{doc.name}</div>
                        <div className="text-[10px] text-slate-500">PDF, PNG or JPG up to 10MB</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toast.success(`Uploaded digital document: ${doc.name}`)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-200 border border-slate-800 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>{doc.uploaded ? 'Replace' : 'Upload'}</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 7: REVIEW */}
          {currentStep === 7 && (
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-white">Step 7: Final Application Review</h2>
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-xs space-y-2.5">
                <div><span className="text-slate-500">Applicant Name:</span> <strong className="text-white ml-2">{formData.firstName} {formData.middleName} {formData.lastName}</strong></div>
                <div><span className="text-slate-500">Grade &amp; Track:</span> <strong className="text-blue-400 ml-2">{formData.gradeLevel} — {formData.track}</strong></div>
                <div><span className="text-slate-500">Contact Email:</span> <strong className="text-white ml-2">{formData.email}</strong></div>
                <div><span className="text-slate-500">Previous School:</span> <strong className="text-white ml-2">{formData.previousSchool}</strong></div>
              </div>

              <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl space-y-2 text-xs">
                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.consentAgreed}
                    onChange={(e) => setFormData({ ...formData, consentAgreed: e.target.checked })}
                    className="w-4 h-4 mt-0.5 rounded border-slate-800 bg-slate-950 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-slate-300 leading-relaxed">
                    I certify that all information provided is accurate and complete, and I agree to Noah's Academy data privacy &amp; admissions terms.
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-white rounded-xl transition-all"
              >
                Previous Step
              </button>
            ) : <div />}

            {currentStep < 7 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white rounded-xl shadow-lg shadow-blue-500/20 transition-all flex items-center gap-1.5"
              >
                <span>Next Step</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-xs font-extrabold text-white rounded-xl shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Submit Official Application</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
