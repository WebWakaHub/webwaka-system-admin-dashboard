import type { Message } from '../types';

export class MessagingService {
  constructor(private db: any, private eventBus: any) {}
  
  async sendMessage(senderId: string, recipientId: string, content: string): Promise<Message> {
    const message = { id: 'msg-1', senderId, recipientId, content, isRead: false };
    this.eventBus.emit('message.sent', message);
    return message;
  }
  
  async getMessages(userId: string): Promise<Message[]> {
    return [{ id: 'msg-1', senderId: 'user-2', recipientId: userId, content: 'Hello', isRead: false }];
  }
}
