import React from 'react';
import { Save, Calendar, Layers } from 'lucide-react';
import { toast } from 'sonner';

export const AdmissionSettingsPage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Master Admission Settings</h1>
          <p className="text-sm text-slate-500 mt-1">Configure enrollment schedules, grade capacities, document requirements, and student number rules.</p>
        </div>
        <button onClick={() => toast.success('Admission settings updated successfully!')} className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-500 shadow-md">
          <Save className="w-4 h-4 mr-2 inline" /> Save Settings
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Enrollment Period Schedule */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center">
            <Calendar className="w-4 h-4 mr-2 text-blue-500" /> Enrollment Period Schedule
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Target Academic Year</label>
              <input type="text" defaultValue="AY 2026–2027" className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Start Date</label>
                <input type="date" defaultValue="2026-06-01" className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold text-slate-500 mb-1">End Date</label>
                <input type="date" defaultValue="2026-08-31" className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
              </div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800">
              <div>
                <span className="font-bold text-slate-900 dark:text-white">Online Application Gate</span>
                <p className="text-[11px] text-slate-500">Allow public online applications</p>
              </div>
              <input type="checkbox" defaultChecked className="w-4 h-4 text-blue-600 rounded-md" />
            </div>
          </div>
        </div>

        {/* Student Number Auto Generation Rules */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-xs">
          <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center">
            <Layers className="w-4 h-4 mr-2 text-purple-500" /> Student Number Generation Rule
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-500 mb-1">Student Number Format Preview</label>
              <div className="font-mono text-sm font-bold text-emerald-500 p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg">
                2026-11-000231
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Year Prefix</label>
                <input type="text" defaultValue="2026" className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
              </div>
              <div>
                <label className="block font-semibold text-slate-500 mb-1">Running Counter Length</label>
                <input type="number" defaultValue={6} className="w-full p-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
