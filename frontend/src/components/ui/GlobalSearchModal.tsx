import React, { useState, useEffect } from 'react';
import { Search, X, User, BookOpen, Layers, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchResultItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Student' | 'Employee' | 'Subject' | 'Section' | 'Bill';
  url: string;
}

const searchRegistry: SearchResultItem[] = [
  { id: '1', title: 'Student Directory & LRN Lookup', subtitle: 'Grade 1 to Grade 12 Senior High Track Roster', category: 'Student', url: '/admin/students' },
  { id: '2', title: 'Faculty & Employee Directory', subtitle: 'Arca South Campus Faculty Roster', category: 'Employee', url: '/admin/employees' },
  { id: '3', title: 'GENMATH - General Mathematics', subtitle: '3 Units • Senior High Core Subject', category: 'Subject', url: '/admin/subjects' },
  { id: '4', title: 'Section 11-ASSH-1 (St. Augustine)', subtitle: 'Capacity: 40/40 • ASSH Track', category: 'Section', url: '/admin/sections' },
  { id: '5', title: 'Student Financial Ledger & Statements', subtitle: 'Tuition Fee Accounts & Receipts', category: 'Bill', url: '/admin/accounting' },
];

export const GlobalSearchModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

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

  if (!isOpen) return null;

  const filteredResults = query.trim()
    ? searchRegistry.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : searchRegistry;

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
            <Search className="w-5 h-5 text-purple-600" />
            <input
              type="text"
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students, subjects, sections, or invoices..."
              className="w-full text-sm font-medium bg-transparent text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
          </div>
          <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No matching records found for "{query}".
            </div>
          ) : (
            filteredResults.map((item) => (
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
          <span>Noah's Academy Arca South Search</span>
          <span className="text-[10px] font-bold">Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
