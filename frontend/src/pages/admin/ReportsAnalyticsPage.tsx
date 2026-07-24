import React from 'react';
import { StatCard } from '../../components/data-display/StatCard';
import { FileText, Download, TrendingUp, BarChart2 } from 'lucide-react';
import { toast } from 'sonner';

export const ReportsAnalyticsPage: React.FC = () => {
  const reportTemplates = [
    { title: 'Official Student Directory & Roster', format: 'PDF / Excel', cat: 'Registrar', desc: 'Complete enrolled student demographic breakdown by grade & track.' },
    { title: 'Faculty Workload & Class Assignment Report', format: 'Excel / CSV', cat: 'Academic', desc: 'Teacher unit distributions, subjects, and advisory sections.' },
    { title: 'Institutional Financial Ledger & OR Collection', format: 'PDF / Excel', cat: 'Finance', desc: 'Summary of paid tuition fees, balances, and official receipts.' },
    { title: 'Quarterly GPA & Academic Performance Summary', format: 'PDF / Excel', cat: 'Academic', desc: 'School-wide quarterly grade averages, pass rates, and honors roster.' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Reports & Executive Analytics Center</h1>
        <p className="text-sm text-slate-500 mt-1">Generate official institutional reports, export data ledgers, and audit metrics.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <StatCard title="Available Report Templates" value="12 Reports" icon={FileText} />
        <StatCard title="Generated This Month" value="148 Reports" icon={TrendingUp} iconBgColor="bg-emerald-500/10 text-emerald-500" />
        <StatCard title="Export Formats Supported" value="PDF, Excel, CSV" icon={BarChart2} iconBgColor="bg-purple-500/10 text-purple-500" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reportTemplates.map((rep, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-4 shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-500 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800">
                  {rep.cat}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400">{rep.format}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-3">{rep.title}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{rep.desc}</p>
            </div>

            <button
              onClick={() => toast.success(`Generating ${rep.title}...`)}
              className="inline-flex items-center justify-center px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Generate & Download Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
