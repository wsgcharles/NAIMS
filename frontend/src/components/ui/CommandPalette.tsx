import React, { useEffect, useRef, useState } from 'react';
import { Search, X } from 'lucide-react';

interface CommandOption {
  id: string;
  label: string;
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  commands: CommandOption[];
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  commands,
}) => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = commands.filter((cmd) =>
    cmd.label.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div className="relative z-10 w-full max-w-md bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Search className="w-5 h-5 text-slate-500 shrink-0" />
          <input
            ref={inputRef}
            placeholder="Search commands…"
            className="flex-1 bg-transparent text-sm text-slate-900 dark:text-white outline-none placeholder:text-slate-400 dark:placeholder:text-slate-600"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button
            onClick={onClose}
            className="p-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 rounded transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <ul className="max-h-64 overflow-y-auto space-y-1" role="listbox">
          {filtered.map((cmd) => (
            <li
              key={cmd.id}
              role="option"
              aria-selected="false"
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              onClick={() => {
                cmd.onSelect();
                onClose();
              }}
            >
              <span className="text-slate-800 dark:text-slate-200">{cmd.label}</span>
              {cmd.shortcut && (
                <span className="text-xs text-slate-400">{cmd.shortcut}</span>
              )}
            </li>
          ))}
          {filtered.length === 0 && (
            <li className="text-center text-xs text-slate-500 dark:text-slate-400 py-4">
              No matches found.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};
