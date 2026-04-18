import axiosClient from './axiosClient';
import type { Comment } from '../types';

export interface CreateCommentRequest {
  content: string;
  postId: number;
}

export interface UpdateCommentRequest {
  content?: string;
}

const commentsAPI = {
  getCommentsByPostId: async (postId: number): Promise<Comment[]> => {
    const { data } = await axiosClient.get<Comment[]>(`/comments/post/${postId}`);
    return data;
  },

  getCommentById: async (id: number): Promise<Comment> => {
    const { data } = await axiosClient.get<Comment>(`/comments/${id}`);
    return data;
  },

  createComment: async (payload: CreateCommentRequest): Promise<Comment> => {
    const { data } = await axiosClient.post<Comment>('/comments', payload);
    return data;
  },

  updateComment: async (id: number, payload: UpdateCommentRequest): Promise<Comment> => {
    const { data } = await axiosClient.put<Comment>(`/comments/${id}`, payload);
    return data;
  },

  deleteComment: async (id: number): Promise<void> => {
    await axiosClient.delete(`/comments/${id}`);
  },
};

export default commentsAPI;