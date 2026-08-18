import React, { useEffect, useState } from 'react';
import { Bell, Info, AlertTriangle, CheckCircle, X, Loader2 } from 'lucide-react';
import { notificationService, type AppNotification } from '../../services/notificationService';

export const NotificationCenter: React.FC<{ isOpen: boolean; onClose: () => void; onUnreadCountChange?: (count: number) => void }> = ({
  isOpen,
  onClose,
  onUnreadCountChange,
}) => {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;

    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const list = await notificationService.getNotifications();
        setItems(list);
        const unread = list.filter((n) => !n.isRead).length;
        if (onUnreadCountChange) onUnreadCountChange(unread);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [isOpen]);

  if (!isOpen) return null;

  const unreadCount = items.filter((n) => !n.isRead).length;

  const handleMarkAsRead = async (id: number) => {
    try {
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
      const newUnread = Math.max(0, unreadCount - 1);
      if (onUnreadCountChange) onUnreadCountChange(newUnread);
      await notificationService.markAsRead(id);
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
      if (onUnreadCountChange) onUnreadCountChange(0);
      await notificationService.markAllAsRead();
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const getIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />;
      case 'error':
        return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />;
      case 'info':
      default:
        return <Info className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />;
    }
  };

  const formatTimestamp = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      const now = new Date();
      const diffMin = Math.floor((now.getTime() - d.getTime()) / (1000 * 60));
      if (diffMin < 1) return 'Just now';
      if (diffMin < 60) return `${diffMin}m ago`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      return d.toLocaleDateString();
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Bell className="w-4 h-4 text-purple-600" />
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">System Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-2 py-0.5 text-[10px] font-bold bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 hover:underline"
            >
              Mark all read
            </button>
          )}
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
        {loading ? (
          <div className="p-8 flex items-center justify-center space-x-2 text-xs text-slate-400">
            <Loader2 className="w-4 h-4 animate-spin text-purple-600" />
            <span>Loading notifications...</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400">No notifications.</div>
        ) : (
          items.map((n) => (
            <div
              key={n.id}
              onClick={() => !n.isRead && handleMarkAsRead(n.id)}
              className={`p-3.5 flex items-start space-x-3 transition-colors cursor-pointer ${
                !n.isRead ? 'bg-purple-50/50 dark:bg-purple-950/20' : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
              }`}
            >
              <div className="mt-0.5">{getIcon(n.type)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className={`text-xs ${!n.isRead ? 'font-bold text-slate-900 dark:text-white' : 'font-medium text-slate-700 dark:text-slate-300'}`}>
                    {n.title}
                  </p>
                  <span className="text-[10px] text-slate-400 shrink-0 ml-2">{formatTimestamp(n.createdAt)}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {n.message}
                </p>
              </div>
              {!n.isRead && (
                <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0 self-center" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
