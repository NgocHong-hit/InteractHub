import axiosClient from './axiosClient';

export interface Hashtag {
  id: number;
  name: string;
  postCount: number;
  postHashtags?: any[];
}

export interface HashtagPost {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  user: {
    id: number;
    userName: string;
    fullName: string;
    avatarUrl?: string;
  };
  comments: any[];
  likes: any[];
  postHashtags?: any[];
}

export const hashtagAPI = {
  // Get all hashtags
  getAllHashtags: async (): Promise<Hashtag[]> => {
    const response = await axiosClient.get('/hashtags');
    return response.data;
  },

  // Get trending hashtags
  getTrendingHashtags: async (limit: number = 10): Promise<Hashtag[]> => {
    const response = await axiosClient.get(`/hashtags/trending/${limit}`);
    return response.data;
  },

  // Search posts by hashtag name
  searchPostsByHashtag: async (name: string, skip: number = 0, take: number = 20): Promise<HashtagPost[]> => {
    const response = await axiosClient.get('/post-hashtags/search', {
      params: { name, skip, take }
    });
    return response.data;
  },

  // Get hashtags for a specific post
  getHashtagsForPost: async (postId: number): Promise<Hashtag[]> => {
    const response = await axiosClient.get(`/post-hashtags/post/${postId}`);
    return response.data;
  },

  // Add hashtag to post by name
  addHashtagToPostByName: async (postId: number, name: string) => {
    const response = await axiosClient.post(`/post-hashtags/post/${postId}/by-name`, { name });
    return response.data;
  },

  // Remove hashtag from post
  removeHashtagFromPost: async (postId: number, hashtagId: number) => {
    const response = await axiosClient.delete(`/post-hashtags/post/${postId}/hashtag/${hashtagId}`);
    return response.data;
  },

  // Create new hashtag
  createHashtag: async (name: string) => {
    const response = await axiosClient.post('/hashtags', { name });
    return response.data;
  }
};
