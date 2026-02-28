import { CommunityPlatform } from '../CommunityPlatform';

describe('CommunityPlatform', () => {
  let platform: CommunityPlatform;
  let mockEventBus: any;

  beforeEach(() => {
    mockEventBus = { emit: jest.fn() };
    platform = new CommunityPlatform({ database: {}, eventBus: mockEventBus });
  });

  it('should create forum', async () => {
    const forum = await platform.forumService.createForum('tenant-1', { name: 'General' });
    expect(forum.name).toBe('General');
  });

  it('should send message', async () => {
    const message = await platform.messagingService.sendMessage('user-1', 'user-2', 'Hello');
    expect(message.content).toBe('Hello');
  });

  it('should create notification', async () => {
    const notif = await platform.notificationService.createNotification('user-1', 'post', 'New post');
    expect(notif.type).toBe('post');
  });
});
