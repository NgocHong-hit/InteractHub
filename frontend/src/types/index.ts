// src/types/index.ts
export interface User {
  id: number;
  userName: string;
  avatarUrl?: string;
  bio?: string;
}

export interface Post {
  id: number;
  content: string;
  imageUrl?: string;
  createdAt: string;
  user: User;
  likesCount: number;
  commentsCount: number;
}
