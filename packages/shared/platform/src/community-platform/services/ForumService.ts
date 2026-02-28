import type { Forum, Thread, Post } from '../types';

export class ForumService {
  constructor(private db: any, private eventBus: any) {}
  
  async createForum(tenantId: string, data: Partial<Forum>): Promise<Forum> {
    const forum = { id: 'forum-1', tenantId, ...data } as Forum;
    this.eventBus.emit('forum.created', forum);
    return forum;
  }
  
  async getThreads(forumId: string): Promise<Thread[]> {
    return [{ id: 'thread-1', forumId, authorId: 'user-1', title: 'Welcome' }];
  }
  
  async createPost(threadId: string, authorId: string, content: string): Promise<Post> {
    const post = { id: 'post-1', threadId, authorId, content };
    this.eventBus.emit('post.created', post);
    return post;
  }
}
