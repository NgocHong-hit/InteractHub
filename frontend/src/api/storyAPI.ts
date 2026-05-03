// src/api/storyAPI.ts
import axiosClient from './axiosClient';

export interface CreateStoryRequest {
  content?: string;
  mediaUrl?: string; // Link ảnh
}

export interface StoryResponse {
  id: number;
  content?: string;
  mediaUrl?: string;
  createdAt: string;
  expiresAt: string;
  userId: number;
  userName: string;
  fullName?: string;
  avatarUrl?: string;
  isActive?: boolean;
}

const storyAPI = {
  // POST api/stories
  createStory: async (data: FormData) => {
    const response = await axiosClient.post('/stories', data, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // GET api/stories/friends
  getFriendsStories: async (): Promise<StoryResponse[]> => {
    const response = await axiosClient.get('/stories/friends');
    return response.data || [];
  },

  // GET api/stories/my
  getMyStories: async (): Promise<StoryResponse[]> => {
    const response = await axiosClient.get('/stories/my');
    return response.data || [];
  },

  // DELETE api/stories/{id}
  deleteStory: async (storyId: number) => {
    const response = await axiosClient.delete(`/stories/${storyId}`);
    return response.data;
  }
};

export default storyAPI;