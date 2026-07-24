import React, { useState } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, X } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'info' | 'warning' | 'success';
}

const mockNotifications: NotificationItem[] = [
  {
    id: 'n1',
    title: 'New Enrollment Submitted',
    message: 'Application #2026-891 (Juan Dela Cruz) requires document audit.',
    timestamp: '10m ago',
    read: false,
    type: 'info',
  },
  {
    id: 'n2',
    title: 'Quarterly Gradebook Lock',
    message: 'Q1 Grade submission for Section 10-A closes in 24 hours.',
    timestamp: '1h ago',
    read: false,
    type: 'warning',
  },
  {
    id: 'n3',
    title: 'Payment Received',
    message: 'Receipt #OR-9912 generated for $450.00 tuition fee.',
    timestamp: '3h ago',
    read: true,
    type: 'success',
  },
];

export const NotificationCenter: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const [items, setItems] = useState<NotificationItem[]>(mockNotifications);

  if (!isOpen) return null;

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () => {
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      default:
        return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl z-50 overflow-hidden animate-in fade-in duration-100">
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-slate-500" />
          <span className="font-semibold text-sm text-slate-900 dark:text-white">
            Notifications
          </span>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-bold bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-400 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 font-medium"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
        {items.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-500">
            No notifications available
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className={`p-4 flex items-start space-x-3 transition-colors ${
                item.read
                  ? 'bg-transparent'
                  : 'bg-blue-50/40 dark:bg-blue-950/20 font-medium'
              }`}
            >
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 shrink-0 mt-0.5">
                {getIcon(item.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                    {item.title}
                  </h4>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    {item.timestamp}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {item.message}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="p-2 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 text-center">
        <span className="text-xs text-slate-500">EduCore System Alert Engine</span>
      </div>
    </div>
  );
};
