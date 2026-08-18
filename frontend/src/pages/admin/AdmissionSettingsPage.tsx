import React, { useEffect, useState } from 'react';
import { Save, Calendar, Layers, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { useAdminApi } from '../../hooks/useAdminApi';
import type { SchoolSettings } from '../../types';

export const AdmissionSettingsPage: React.FC = () => {
  const {
    useActiveSchoolYear,
    useUpdateSchoolYearMutation,
    useSchoolSettings,
    useUpdateSchoolSettingsMutation,
  } = useAdminApi();

  const { data: activeYear, isLoading: isAyLoading, isError: isAyError } = useActiveSchoolYear();
  const { data: settings, isLoading: isSettingsLoading, isError: isSettingsError } = useSchoolSettings();

  const updateAyMutation = useUpdateSchoolYearMutation();
  const updateSettingsMutation = useUpdateSchoolSettingsMutation();

  // Form states for Admission & Enrollment Gate (persisted to active AcademicYear)
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isPublicOpen, setIsPublicOpen] = useState(false);
  const [isReturningOpen, setIsReturningOpen] = useState(false);

  // Form states for Student Number & Institutional Prefixes (persisted to SchoolSettings)
  const [studentPrefix, setStudentPrefix] = useState('NAI');
  const [counterLength, setCounterLength] = useState<number>(6);
  const [fullSettingsDraft, setFullSettingsDraft] = useState<SchoolSettings | null>(null);

  useEffect(() => {
    if (activeYear) {
      setStartDate(activeYear.enrollmentStartDate ? activeYear.enrollmentStartDate.split('T')[0] : '');
      setEndDate(activeYear.enrollmentEndDate ? activeYear.enrollmentEndDate.split('T')[0] : '');
      setIsPublicOpen(activeYear.isEnrollmentOpen ?? false);
      setIsReturningOpen(activeYear.isReturningEnrollmentOpen ?? false);
    }
  }, [activeYear]);

  useEffect(() => {
    if (settings) {
      setFullSettingsDraft(settings);
      setStudentPrefix(settings.studentNumberPrefix || 'NAI');
      setCounterLength(settings.studentNumberCounterLength || 6);
    }
  }, [settings]);

  const handleSaveAll = () => {
    if (activeYear) {
      updateAyMutation.mutate({
        id: activeYear.id,
        data: {
          schoolYear: activeYear.schoolYear,
          startDate: activeYear.startDate,
          endDate: activeYear.endDate,
          currentSemester: activeYear.currentSemester,
          enrollmentStartDate: startDate || null,
          enrollmentEndDate: endDate || null,
          isEnrollmentOpen: isPublicOpen,
          isReturningEnrollmentOpen: isReturningOpen,
        },
      });
    }

    if (fullSettingsDraft) {
      updateSettingsMutation.mutate({
        ...fullSettingsDraft,
        studentNumberPrefix: studentPrefix,
        studentNumberCounterLength: Number(counterLength),
      });
    }
  };

  const isSaving = updateAyMutation.isPending || updateSettingsMutation.isPending;
  const currentYearNum = new Date().getFullYear();
  const previewStudentNumber = `${studentPrefix.trim().replace(/-$/, '')}-${currentYearNum}-${'1'.padStart(Number(counterLength) || 6, '0')}`;

  return (
    <div className="space-y-8 pb-12 font-sans">
      {/* Page Title & Save Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-purple-950 dark:text-white tracking-tight">
            Master Admission Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure public admission gates, returning student re-enrollment schedules, and student number rules.
          </p>
        </div>

        <button
          onClick={handleSaveAll}
          disabled={isSaving || isAyLoading || isSettingsLoading}
          className="inline-flex items-center px-5 py-2.5 text-xs font-bold text-white bg-purple-700 hover:bg-purple-600 rounded-xl shadow-lg shadow-purple-600/25 transition-all hover:scale-[1.01] disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Admission Settings
        </button>
      </div>

      {(isAyError || isSettingsError) && (
        <div className="p-4 bg-rose-50 border border-rose-200 dark:bg-rose-950/40 dark:border-rose-900 rounded-2xl text-xs text-rose-700 dark:text-rose-300 flex items-center">
          <AlertCircle className="w-4 h-4 mr-2 shrink-0" />
          Unable to fetch settings from server. Please verify system connection.
        </div>
      )}

      {/* Target Active School Year Banner */}
      <div className="p-6 bg-gradient-to-r from-purple-900 via-indigo-900 to-purple-950 rounded-3xl text-white shadow-xl flex items-center justify-between border border-purple-800/40">
        <div className="space-y-1">
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
            Target Active School Year
          </span>
          <h2 className="text-xl font-black">{activeYear?.schoolYear || 'SY 2026–2027'}</h2>
          <p className="text-xs text-purple-200">
            Current Semester:{' '}
            <strong className="text-white">{activeYear?.currentSemester || '1st Semester'}</strong>
          </p>
        </div>

        <div className="hidden md:flex items-center space-x-2 text-xs bg-purple-950/60 px-4 py-2 rounded-2xl border border-purple-700/50">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>All gate &amp; date rules apply to this active period.</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Section 1: Enrollment Schedule & Dual Gates */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <Calendar className="w-4 h-4 mr-2 text-purple-700 dark:text-purple-400" />
            Enrollment Schedule &amp; Gates
          </h3>

          {isAyLoading ? (
            <div className="space-y-3">
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Enrollment Opening Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Enrollment Closing Date</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-medium"
                  />
                </div>
              </div>

              {/* Public Admissions Switch */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Public Admissions (New &amp; Transferees)
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Controls whether new applicants can access `/admissions/apply`
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPublicOpen(!isPublicOpen)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isPublicOpen ? 'bg-purple-700' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isPublicOpen ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* Returning Student Re-enrollment Switch */}
              <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white block">
                    Returning Student Re-enrollment
                  </span>
                  <p className="text-[11px] text-slate-500">
                    Controls whether existing students can submit re-enrollment from Student Portal
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsReturningOpen(!isReturningOpen)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    isReturningOpen ? 'bg-purple-700' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      isReturningOpen ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Section 2: Student Number Generation Rules */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-6 space-y-5 shadow-xs">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center border-b border-slate-100 dark:border-slate-800 pb-3">
            <Layers className="w-4 h-4 mr-2 text-purple-700 dark:text-purple-400" />
            Student Number Generation Rule
          </h3>

          {isSettingsLoading ? (
            <div className="space-y-3">
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
              <div className="h-10 bg-slate-100 dark:bg-slate-800 rounded-xl animate-pulse" />
            </div>
          ) : (
            <div className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">
                  Dynamic Student Number Format Preview
                </label>
                <div className="font-mono text-base font-bold text-emerald-600 dark:text-emerald-400 p-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-between">
                  <span>{previewStudentNumber}</span>
                  <span className="text-[10px] font-sans font-semibold text-slate-400 bg-white dark:bg-slate-900 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-800">
                    Format: Prefix - Year - Counter
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Institutional Prefix</label>
                  <input
                    type="text"
                    value={studentPrefix}
                    onChange={(e) => setStudentPrefix(e.target.value)}
                    placeholder="e.g. NAI"
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-500 mb-1">Running Counter Length</label>
                  <input
                    type="number"
                    min={4}
                    max={8}
                    value={counterLength}
                    onChange={(e) => setCounterLength(Number(e.target.value))}
                    className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white font-semibold"
                  />
                </div>
              </div>

              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 rounded-xl border border-purple-100 dark:border-purple-900/50 text-[11px] text-purple-900 dark:text-purple-300">
                <strong>Permanent Identification Rule:</strong> Student Numbers do not include grade levels because students progress every year. A permanent student number is maintained throughout their stay at Noah&apos;s Academy.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
