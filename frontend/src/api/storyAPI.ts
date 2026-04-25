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
  createStory: async (data: CreateStoryRequest) => {
    const response = await axiosClient.post('/stories', data);
    return response.data;
  },

  // GET api/stories/friends
  getFriendsStories: async (): Promise<StoryResponse[]> => {
    try {
      const response = await axiosClient.get('/stories/friends');
      console.log('Fetched friend stories response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Error in getFriendsStories:', error);
      throw error;
    }
  },

  // GET api/stories/my
  getMyStories: async (): Promise<StoryResponse[]> => {
    try {
      const response = await axiosClient.get('/stories/my');
      console.log('Fetched my stories response:', response.data);
      return response.data || [];
    } catch (error) {
      console.error('Error in getMyStories:', error);
      throw error;
    }
  },

  // DELETE api/stories/{id}
  deleteStory: async (storyId: number) => {
    const response = await axiosClient.delete(`/stories/${storyId}`);
    return response.data;
  }
};

export default storyAPI;