export interface CommunityConfig {
  database: any;
  eventBus: any;
}

export interface Forum {
  id: string;
  tenantId: string;
  name: string;
  description: string;
}

export interface Thread {
  id: string;
  forumId: string;
  authorId: string;
  title: string;
}

export interface Post {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
}

export interface Message {
  id: string;
  senderId: string;
  recipientId: string;
  content: string;
  isRead: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  type: string;
  content: string;
  isRead: boolean;
}
