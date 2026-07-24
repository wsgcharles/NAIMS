import React, { useEffect, useState } from 'react';
import { Settings, Shield, Save, Loader2 } from 'lucide-react';
import { useAdminApi } from '../../hooks/useAdminApi';
import type { SchoolSettings } from '../../types';

export const SystemSettingsPage: React.FC = () => {
  const { useSchoolSettings, useUpdateSchoolSettingsMutation, useAcademicYearsLookup } = useAdminApi();
  const { data: settings, isLoading, isError } = useSchoolSettings();
  const { data: academicYears } = useAcademicYearsLookup();
  const updateMutation = useUpdateSchoolSettingsMutation();

  // Seeded from the real GET response, kept in full so every other real field
  // (receipt/student/bill/payment prefixes, currency, address, contact info)
  // rides along unchanged in the PUT payload instead of being blanked out.
  const [draft, setDraft] = useState<SchoolSettings | null>(null);

  useEffect(() => {
    if (settings) setDraft(settings);
  }, [settings]);

  const handleSave = () => {
    if (!draft) return;
    updateMutation.mutate(draft);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Institutional Settings &amp; Security</h1>
          <p className="text-sm text-slate-500 mt-1">Master school configuration and active academic year.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={!draft || updateMutation.isPending}
          className="inline-flex items-center px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-md disabled:opacity-50"
        >
          {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save Changes
        </button>
      </div>

      {isError && (
        <div className="p-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm text-slate-500 text-center">
          Unable to reach the EduCore server to load system settings. Please check your connection and try again.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* School Info */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center">
            <Settings className="w-4 h-4 mr-2 text-blue-500" /> Institution Profile
          </h3>
          {isLoading || !draft ? (
            <div className="space-y-3">
              <div className="h-10 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
              <div className="h-10 rounded bg-slate-100 dark:bg-slate-800 animate-pulse" />
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">School Name</label>
                <input
                  type="text"
                  value={draft.schoolName}
                  onChange={(e) => setDraft({ ...draft, schoolName: e.target.value })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Active Academic Year</label>
                <select
                  value={draft.currentAcademicYearId ?? ''}
                  onChange={(e) => setDraft({ ...draft, currentAcademicYearId: e.target.value ? Number(e.target.value) : null })}
                  className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                >
                  <option value="">None selected</option>
                  {(academicYears ?? []).map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.schoolYear} {y.isActive ? '(Active)' : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Security Policy */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center">
            <Shield className="w-4 h-4 mr-2 text-emerald-500" /> Security &amp; Session Policy
          </h3>
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 opacity-70">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Forced First Login Password Change</span>
                <p className="text-[11px] text-slate-500">Not yet configurable — no backend field exists for this setting.</p>
              </div>
              <input type="checkbox" disabled defaultChecked className="w-4 h-4 text-blue-600 rounded-md cursor-not-allowed" />
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 opacity-70">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">JWT Token Inactivity Expiry</span>
                <p className="text-[11px] text-slate-500">Not yet configurable — no backend field exists for this setting.</p>
              </div>
              <input type="checkbox" disabled defaultChecked className="w-4 h-4 text-blue-600 rounded-md cursor-not-allowed" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
