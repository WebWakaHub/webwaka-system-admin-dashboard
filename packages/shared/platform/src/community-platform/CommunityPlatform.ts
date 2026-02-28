import type { CommunityConfig } from './types';
import { ForumService } from './services/ForumService';
import { MessagingService } from './services/MessagingService';
import { NotificationService } from './services/NotificationService';

export class CommunityPlatform {
  public forumService: ForumService;
  public messagingService: MessagingService;
  public notificationService: NotificationService;

  constructor(config: CommunityConfig) {
    this.forumService = new ForumService(config.database, config.eventBus);
    this.messagingService = new MessagingService(config.database, config.eventBus);
    this.notificationService = new NotificationService(config.database, config.eventBus);
  }

  async initialize(): Promise<void> {}
  async shutdown(): Promise<void> {}
}
