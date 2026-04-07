import axiosClient from './axiosClient';

interface AdminStatistics {
  totalUsers: number;
  totalPosts: number;
  totalComments: number;
  pendingReports: number;
}

interface User {
  id: number;
  userName: string;
  email: string;
  fullName: string;
  createdAt: string;
  postCount: number;
  isActive: boolean;
}

interface Report {
  id: number;
  reason: string;
  status: string;
  createdAt: string;
  postId: number;
  postContent: string;
  postAuthor: string;
  reporterId: number;
  reporterName: string;
}

interface Post {
  id: number;
  content: string;
  imageUrl: string;
  createdAt: string;
  authorId: number;
  author: string;
  commentCount: number;
  likeCount: number;
}

export const adminAPI = {
  // Statistics
  getStatistics: async (): Promise<AdminStatistics> => {
    const { data } = await axiosClient.get('/admin/statistics');
    return data;
  },

  // User Management
  getAllUsers: async (page: number = 1, pageSize: number = 20) => {
    const { data } = await axiosClient.get('/admin/users', {
      params: { page, pageSize }
    });
    return data;
  },

  getUserDetails: async (id: number) => {
    const { data } = await axiosClient.get(`/admin/users/${id}`);
    return data;
  },

  blockUser: async (id: number) => {
    const { data } = await axiosClient.post(`/admin/users/${id}/block`);
    return data;
  },

  unblockUser: async (id: number) => {
    const { data } = await axiosClient.post(`/admin/users/${id}/unblock`);
    return data;
  },

  deleteUser: async (id: number) => {
    const { data } = await axiosClient.delete(`/admin/users/${id}`);
    return data;
  },

  // Report Management
  getReports: async (status?: string, page: number = 1, pageSize: number = 20) => {
    const { data } = await axiosClient.get('/admin/reports', {
      params: { status, page, pageSize }
    });
    return data;
  },

  approveReport: async (id: number) => {
    const { data } = await axiosClient.post(`/admin/reports/${id}/approve`);
    return data;
  },

  rejectReport: async (id: number) => {
    const { data } = await axiosClient.post(`/admin/reports/${id}/reject`);
    return data;
  },

  // Content Moderation
  getAllPosts: async (page: number = 1, pageSize: number = 20) => {
    const { data } = await axiosClient.get('/admin/posts', {
      params: { page, pageSize }
    });
    return data;
  },

  deletePost: async (id: number) => {
    const { data } = await axiosClient.delete(`/admin/posts/${id}`);
    return data;
  },

  deleteComment: async (id: number) => {
    const { data } = await axiosClient.delete(`/admin/comments/${id}`);
    return data;
  },

  // Role Management
  assignRole: async (userId: number, role: string) => {
    const { data } = await axiosClient.post(`/admin/users/${userId}/assign-role`, {
      role
    });
    return data;
  },

  // Activity Logs
  getActivityLogs: async (page: number = 1, pageSize: number = 20) => {
    const { data } = await axiosClient.get('/admin/logs', {
      params: { page, pageSize }
    });
    return data;
  }
};

export type { AdminStatistics, User, Report, Post };
