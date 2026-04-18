import axiosClient from './axiosClient';
import type { Post } from '../types';

export interface CreatePostRequest {
  content: string;
  image?: File;
}

export interface UpdatePostRequest {
  content?: string;
  imageUrl?: string;
}

const postsAPI = {
  getAllPosts: async (): Promise<Post[]> => {
    const { data } = await axiosClient.get<Post[]>('/posts');
    return data;
  },

  getPostById: async (id: number): Promise<Post> => {
    const { data } = await axiosClient.get<Post>(`/posts/${id}`);
    return data;
  },

  getPostsByUserId: async (userId: number): Promise<Post[]> => {
    const { data } = await axiosClient.get<Post[]>(`/posts/user/${userId}`);
    return data;
  },

  createPost: async (payload: CreatePostRequest): Promise<Post> => {
    const formData = new FormData();
    formData.append('content', payload.content);
    if (payload.image) {
      formData.append('image', payload.image);
    }
    const { data } = await axiosClient.post<Post>('/posts', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return data;
  },

  updatePost: async (id: number, payload: UpdatePostRequest): Promise<Post> => {
    const { data } = await axiosClient.put<Post>(`/posts/${id}`, payload);
    return data;
  },

  deletePost: async (id: number): Promise<void> => {
    await axiosClient.delete(`/posts/${id}`);
  },
};

export default postsAPI;