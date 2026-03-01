import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { EventsService } from '../src/events/events.service';
import { OfflineQueueService } from '../src/offline/offline-queue.service';
import { IdentityEvent } from '../src/common/enums/identity-event.enum';

describe('EventsService', () => {
  let service: EventsService;
  let eventEmitter: EventEmitter2;
  let offlineQueueService: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        {
          provide: EventEmitter2,
          useValue: {
            emit: jest.fn(),
            on: jest.fn(),
            removeListener: jest.fn(),
          },
        },
        {
          provide: OfflineQueueService,
          useValue: {
            enqueue: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
    eventEmitter = module.get(EventEmitter2);
    offlineQueueService = module.get(OfflineQueueService);
  });

  describe('emit', () => {
    it('should emit event via EventEmitter2', async () => {
      await service.emit(IdentityEvent.USER_CREATED, {
        userId: 'user-1',
        email: 'test@example.com',
      });

      expect(eventEmitter.emit).toHaveBeenCalledWith(
        IdentityEvent.USER_CREATED,
        expect.objectContaining({
          eventType: IdentityEvent.USER_CREATED,
          data: expect.objectContaining({ userId: 'user-1' }),
          metadata: expect.objectContaining({
            source: 'identity-service',
            version: '1.0.0',
          }),
        }),
      );
    });

    it('should include correlation ID in metadata', async () => {
      await service.emit(IdentityEvent.AUTH_LOGIN_SUCCESS, { userId: 'user-1' });

      const emittedPayload = (eventEmitter.emit as jest.Mock).mock.calls[0][1];
      expect(emittedPayload.metadata.correlationId).toBeDefined();
      expect(emittedPayload.metadata.correlationId).toMatch(/^evt-/);
    });

    it('should include timestamp in ISO format', async () => {
      await service.emit(IdentityEvent.AUTH_LOGOUT, { userId: 'user-1' });

      const emittedPayload = (eventEmitter.emit as jest.Mock).mock.calls[0][1];
      expect(emittedPayload.timestamp).toBeDefined();
      expect(new Date(emittedPayload.timestamp).toISOString()).toBe(emittedPayload.timestamp);
    });

    it('should queue event offline when emission fails', async () => {
      (eventEmitter.emit as jest.Mock).mockImplementation(() => {
        throw new Error('Event bus unavailable');
      });

      await service.emit(IdentityEvent.USER_CREATED, { userId: 'user-1' });

      expect(offlineQueueService.enqueue).toHaveBeenCalledWith(
        IdentityEvent.USER_CREATED,
        expect.objectContaining({
          failureReason: 'Event bus unavailable',
        }),
      );
    });

    it('should include tenantId in metadata when provided', async () => {
      await service.emit(
        IdentityEvent.USER_CREATED,
        { userId: 'user-1' },
        'tenant-uuid-1',
      );

      const emittedPayload = (eventEmitter.emit as jest.Mock).mock.calls[0][1];
      expect(emittedPayload.metadata.tenantId).toBe('tenant-uuid-1');
    });
  });

  describe('on', () => {
    it('should subscribe to events and return unsubscribe function', () => {
      const handler = jest.fn();
      const unsubscribe = service.on(IdentityEvent.USER_CREATED, handler);

      expect(eventEmitter.on).toHaveBeenCalledWith(IdentityEvent.USER_CREATED, handler);
      expect(typeof unsubscribe).toBe('function');
    });
  });
});
