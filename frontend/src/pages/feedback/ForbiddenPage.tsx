import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldX, ArrowLeft } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-rose-500/10 text-rose-500 rounded-full mb-4">
        <ShieldX className="w-12 h-12" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-rose-500">
        403 Access Forbidden
      </span>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
        Restricted Portal Access
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
        Your current user account and assigned role do not hold the required authorization claims to view this module.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Return to Safe Dashboard
      </Link>
    </div>
  );
};
