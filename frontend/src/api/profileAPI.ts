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

  updateProfile: async (data: Partial<UserProfile>) => {
    const response = await axiosClient.put('/userprofile/update', data);
    return response.data;
  }
};

export default profileAPI;