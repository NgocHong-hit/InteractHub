import axiosClient from './axiosClient';

export interface UserProfile {
  id: number;
  userName: string;
  email: string;
  fullName: string;
  bio?: string;
  phoneNumber?: string;
  gender?: string;
  dateOfBirth?: string;
  address?: string;
  avatarUrl?: string;
}

const profileAPI = {
  getMe: async (): Promise<UserProfile> => {
    const response = await axiosClient.get<UserProfile>('/userprofile/me');
    return response.data;
  },

  getUserById: async (userId: number): Promise<UserProfile> => {
    const response = await axiosClient.get<UserProfile>(`/userprofile/${userId}`);
    return response.data;
  },

  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await axiosClient.put('/userprofile/update', data);
    return response.data;
  },

  uploadAvatar: async (file: File): Promise<{ avatarUrl: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosClient.post<{ avatarUrl: string }>('/userprofile/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};

export default profileAPI;