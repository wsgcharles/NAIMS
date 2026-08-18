import React, { useState, useEffect } from 'react';
import { Search, X, User, BookOpen, Layers, FileText, ArrowRight, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../../services/apiClient';
import { useAuth } from '../../contexts/AuthContext';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Student' | 'Employee' | 'Subject' | 'Section' | 'Bill';
  url: string;
}

const defaultModuleNavigation: SearchResultItem[] = [
  { id: 'nav-1', title: 'Student Directory & Roster Lookup', subtitle: 'Grade 1 to Grade 12 Senior High Track Roster', category: 'Student', url: '/registrar/students' },
  { id: 'nav-2', title: 'Faculty & Employee Directory', subtitle: 'Arca South Campus Faculty Roster', category: 'Employee', url: '/admin/employees' },
  { id: 'nav-3', title: 'Subject & Curriculum Allocations', subtitle: 'Units & Grade Level Core Subjects', category: 'Subject', url: '/admin/subjects' },
  { id: 'nav-4', title: 'Section Allocations & Class Roster', subtitle: 'Capacity & Track Roster Allocation', category: 'Section', url: '/admin/sections' },
  { id: 'nav-5', title: 'Student Financial Ledger & Statements', subtitle: 'Tuition Fee Accounts & Official Receipts', category: 'Bill', url: '/admin/accounting' },
];

export const GlobalSearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const [liveResults, setLiveResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        isOpen ? onClose() : null;
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Perform dynamic live search query against live backend records
  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setLiveResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      const results: SearchResultItem[] = [];
      const q = query.toLowerCase();

      try {
        // 1. Search Students
        if (['SuperAdministrator', 'Administrator', 'Registrar', 'Accountant', 'Teacher'].includes(user?.role ?? '')) {
          const res = await apiClient.get<any[]>('/Registrar/Students');
          const matches = res.data.filter(
            (s) =>
              s.fullName?.toLowerCase().includes(q) ||
              s.studentNumber?.toLowerCase().includes(q) ||
              s.lrn?.toLowerCase().includes(q)
          ).slice(0, 4);

          matches.forEach((s) => {
            results.push({
              id: `stu-${s.studentId}`,
              title: s.fullName,
              subtitle: `Student #${s.studentNumber} • LRN: ${s.lrn} • ${s.status}`,
              category: 'Student',
              url: '/registrar/students',
            });
          });
        }

        // 2. Search Sections
        if (['SuperAdministrator', 'Administrator', 'Registrar', 'Teacher'].includes(user?.role ?? '')) {
          const res = await apiClient.get<any[]>('/Sections');
          const matches = res.data.filter(
            (sec) => sec.sectionName?.toLowerCase().includes(q) || sec.programOfferingName?.toLowerCase().includes(q)
          ).slice(0, 3);

          matches.forEach((sec) => {
            results.push({
              id: `sec-${sec.id}`,
              title: sec.sectionName,
              subtitle: `Section • Capacity: ${sec.capacity} • ${sec.programOfferingName}`,
              category: 'Section',
              url: '/admin/sections',
            });
          });
        }

        // 3. Search Subjects
        const subRes = await apiClient.get<any[]>('/Subjects');
        const subMatches = subRes.data.filter(
          (sub) => sub.subjectName?.toLowerCase().includes(q) || sub.subjectCode?.toLowerCase().includes(q)
        ).slice(0, 3);

        subMatches.forEach((sub) => {
          results.push({
            id: `sub-${sub.id}`,
            title: `${sub.subjectCode} - ${sub.subjectName}`,
            subtitle: `${sub.units} Units • ${sub.gradeLevelName ?? 'Core Subject'}`,
            category: 'Subject',
            url: '/admin/subjects',
          });
        });
      } catch {
        // Search API fallback
      } finally {
        setLiveResults(results);
        setIsSearching(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, user?.role]);

  if (!isOpen) return null;

  const displayResults = query.trim().length >= 2
    ? liveResults
    : defaultModuleNavigation.filter(
        (item) =>
          !query.trim() ||
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
      );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Student':
      case 'Employee':
        return <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />;
      case 'Subject':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'Section':
        return <Layers className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-purple-500" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-start justify-center pt-20 px-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full overflow-hidden space-y-2">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3 flex-1">
            {isSearching ? (
              <Loader2 className="w-5 h-5 text-purple-600 animate-spin" />
            ) : (
              <Search className="w-5 h-5 text-purple-600" />
            )}
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search live student numbers, names, subjects, or sections..."
              className="w-full text-sm font-medium bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {displayResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No live records found for "{query}".
            </div>
          ) : (
            displayResults.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onClose();
                  navigate(item.url);
                }}
                className="w-full flex items-center justify-between p-3 rounded-2xl hover:bg-purple-50 dark:hover:bg-slate-800/80 transition-all group text-left"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-purple-100 dark:bg-slate-800">
                    {getCategoryIcon(item.category)}
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-700 transition-colors">
                      {item.title}
                    </p>
                    <p className="text-[11px] text-slate-500">{item.subtitle}</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 transition-colors" />
              </button>
            ))
          )}
        </div>

        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Noah's Academy Dynamic Search</span>
          <span className="text-[10px] font-bold">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
