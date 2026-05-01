// src/types/index.ts
export interface User {
  id: number;
  userName: string;
  fullName?: string;
  avatarUrl?: string;
  bio?: string;
}

export interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  userId: number;
  user: User;
  likes?: Like[];
  comments?: Comment[];
  postHashtags?: Array<{ hashtag: { name: string } }>;
  likesCount: number;
  commentsCount: number;
}

export interface Comment {
  id: number;
  content: string;
  createdAt: string;
  postId: number;
  userId: number;
  user: User;
}

export interface Like {
  id: number;
  postId: number;
  userId: number;
  user: User;
  createdAt: string;
}

export interface Notification {
  id: number;
  userId: number;
  senderId?: number;
  senderUserName: string;
  senderAvatarUrl?: string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}
