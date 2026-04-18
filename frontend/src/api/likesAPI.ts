import axiosClient from './axiosClient';
import type { Like } from '../types';

export interface ToggleLikeRequest {
  postId: number;
}

const likesAPI = {
  getLikesByPostId: async (postId: number): Promise<Like[]> => {
    const { data } = await axiosClient.get<Like[]>(`/likes/post/${postId}`);
    return data;
  },

  toggleLike: async (payload: ToggleLikeRequest): Promise<{ message: string; success: boolean }> => {
    const { data } = await axiosClient.post<{ message: string; success: boolean }>('/likes/toggle', payload);
    return data;
  },

  deleteLike: async (id: number): Promise<void> => {
    await axiosClient.delete(`/likes/${id}`);
  },
};

export default likesAPI;