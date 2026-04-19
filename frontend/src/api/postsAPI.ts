import axiosClient from './axiosClient';
import type { Post } from '../types';

export interface CreatePostRequest {
  content: string;
  image?: File;
}

export interface UpdatePostRequest {
  content?: string;
  image?: File;
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
    formData.append('Content', payload.content);
    if (payload.image) {
      formData.append('Image', payload.image);
    }
    const { data } = await axiosClient.post<Post>('/posts', formData);
    return data;
  },

  updatePost: async (id: number, payload: UpdatePostRequest): Promise<Post> => {
    const formData = new FormData();
    if (payload.content !== undefined) {
      formData.append('Content', payload.content);
    }
    if (payload.image) {
      formData.append('Image', payload.image);
    }
    const { data } = await axiosClient.put<Post>(`/posts/${id}`, formData);
    return data;
  },

  deletePost: async (id: number): Promise<void> => {
    await axiosClient.delete(`/posts/${id}`);
  },
};

export default postsAPI;