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

const mockSearchData: SearchResultItem[] = [
  { id: '1', title: 'John Mark Doe', subtitle: 'Student ID: 2026-0001 • Grade 10', category: 'Student', url: '/admin/students' },
  { id: '2', title: 'Maria Santos', subtitle: 'Faculty • Mathematics Dept', category: 'Employee', url: '/admin/employees' },
  { id: '3', title: 'MATH101 - General Mathematics', subtitle: '4 Units • High School', category: 'Subject', url: '/admin/subjects' },
  { id: '4', title: 'Section 10-A (St. Jude)', subtitle: 'Capacity: 45/45', category: 'Section', url: '/admin/subjects' },
  { id: '5', title: 'INV-2026-0089', subtitle: 'Tuition Fee Bill • $1,250.00', category: 'Bill', url: '/admin/accounting' },
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
    ? mockSearchData.filter(
        (item) =>
          item.title.toLowerCase().includes(query.toLowerCase()) ||
          item.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : mockSearchData;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Student':
      case 'Employee':
        return <User className="w-4 h-4 text-blue-500" />;
      case 'Subject':
        return <BookOpen className="w-4 h-4 text-emerald-500" />;
      case 'Section':
        return <Layers className="w-4 h-4 text-purple-500" />;
      case 'Bill':
        return <FileText className="w-4 h-4 text-amber-500" />;
      default:
        return <Search className="w-4 h-4 text-slate-400" />;
    }
  };

  const handleSelect = (url: string) => {
    navigate(url);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-slate-950/60 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center px-4 border-b border-slate-200 dark:border-slate-800">
          <Search className="w-5 h-5 text-slate-400 mr-3" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search students, staff, subjects, bills... (Cmd+K)"
            autoFocus
            className="w-full py-4 text-sm bg-transparent border-0 outline-hidden text-slate-900 dark:text-white placeholder-slate-400"
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-md"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {filteredResults.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No matching results found for "{query}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredResults.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleSelect(item.url)}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 cursor-pointer transition-colors group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-md bg-slate-100 dark:bg-slate-800">
                      {getCategoryIcon(item.category)}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-white">
                        {item.title}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500">
          <span>Navigate with arrows</span>
          <span>ESC to close</span>
        </div>
      </div>
    </div>
  );
};
