import axiosClient from './axiosClient';

export interface NotificationData {
  id: number;
  userId: number;
  senderId?: number;
  senderUserName: string;
  senderAvatarUrl?: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const notificationAPI = {
  getNotifications: async (unreadOnly = false): Promise<NotificationData[]> => {
    const { data } = await axiosClient.get<NotificationData[]>('/notifications', {
      params: { unreadOnly },
    });
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await axiosClient.get<number>('/notifications/unread-count');
    return data;
  },

  markAsRead: async (id: number): Promise<void> => {
    await axiosClient.put(`/notifications/${id}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await axiosClient.put('/notifications/mark-all-read');
  },
};

export default notificationAPI;
