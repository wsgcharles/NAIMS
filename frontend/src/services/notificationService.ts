import { apiClient } from './apiClient';

export interface AppNotification {
  id: number;
  userId: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export const notificationService = {
  getNotifications: async (): Promise<AppNotification[]> => {
    const response = await apiClient.get('/Notifications');
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get('/Notifications/unread-count');
    return response.data.unreadCount ?? 0;
  },

  markAsRead: async (id: number): Promise<void> => {
    await apiClient.post(`/Notifications/${id}/mark-read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.post('/Notifications/mark-all-read');
  },
};
