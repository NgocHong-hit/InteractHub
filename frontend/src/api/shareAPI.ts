import axiosClient from './axiosClient';
import type { SharedPost } from '../types';

export interface SharePostRequest {
  postId: number;
  content?: string;
}

const shareAPI = {
  getAllSharedPosts: async (): Promise<SharedPost[]> => {
    const { data } = await axiosClient.get<SharedPost[]>('/sharedposts');
    return data;
  },

  getSharedPostsByUserId: async (userId: number): Promise<SharedPost[]> => {
    const { data } = await axiosClient.get<SharedPost[]>(`/sharedposts/user/${userId}`);
    return data;
  },

  sharePost: async (payload: SharePostRequest): Promise<SharedPost> => {
    const { data } = await axiosClient.post<SharedPost>('/sharedposts', payload);
    return data;
  },

  updateSharedPost: async (id: number, content?: string): Promise<SharedPost> => {
    const { data } = await axiosClient.put<SharedPost>(`/sharedposts/${id}`, { content });
    return data;
  },

  deleteSharedPost: async (id: number): Promise<void> => {
    await axiosClient.delete(`/sharedposts/${id}`);
  },
};

export default shareAPI;
