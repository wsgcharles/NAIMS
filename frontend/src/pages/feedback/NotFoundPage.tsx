import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6">
      <div className="p-4 bg-purple-500/15 text-purple-600 dark:text-purple-400 rounded-full mb-4">
        <Compass className="w-10 h-10 animate-spin-slow" />
      </div>
      <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
        404 — Page Not Found
      </span>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
        This Page Doesn't Exist
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md">
        The page you're looking for may have been moved, renamed, or is not yet available in EduCore.
      </p>

      <Link
        to="/"
        className="mt-6 inline-flex items-center px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl text-xs transition-all shadow-md"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Return to Home
      </Link>
    </div>
  );
};
