import type { Notification } from '../types';

export class NotificationService {
  constructor(private db: any, private eventBus: any) {}
  
  async createNotification(userId: string, type: string, content: string): Promise<Notification> {
    const notification = { id: 'notif-1', userId, type, content, isRead: false };
    this.eventBus.emit('notification.created', notification);
    return notification;
  }
  
  async getNotifications(userId: string): Promise<Notification[]> {
    return [{ id: 'notif-1', userId, type: 'post', content: 'New post', isRead: false }];
  }
}
