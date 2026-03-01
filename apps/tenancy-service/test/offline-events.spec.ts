import { Test, TestingModule } from '@nestjs/testing';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { OfflineQueueService } from '../src/offline/offline-queue.service';
import { EventsService } from '../src/events/events.service';
import { TenantEvent } from '../src/common/enums/tenant-status.enum';

// ===== OFFLINE QUEUE SERVICE TESTS =====

describe('OfflineQueueService', () => {
  let service: OfflineQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OfflineQueueService],
    }).compile();
    service = module.get<OfflineQueueService>(OfflineQueueService);
  });

  afterEach(() => {
    service.clear();
  });

  it('should enqueue an operation', async () => {
    await service.enqueue({ operation: 'emit_event', payload: { test: true } });
    expect(service.getStatus().size).toBe(1);
  });

  it('should report correct queue status', async () => {
    const status = service.getStatus();
    expect(status.size).toBe(0);
    expect(status.maxSize).toBe(100);
    expect(status.oldestEntry).toBeNull();

    await service.enqueue({ operation: 'test', payload: {} });
    expect(service.getStatus().size).toBe(1);
    expect(service.getStatus().oldestEntry).not.toBeNull();
  });

  it('should evict oldest entry when queue is full', async () => {
    // Fill queue to max (100)
    for (let i = 0; i < 100; i++) {
      await service.enqueue({ operation: `op-${i}`, payload: { i } });
    }
    expect(service.getStatus().size).toBe(100);

    // Adding one more should evict the oldest
    await service.enqueue({ operation: 'op-overflow', payload: {} });
    expect(service.getStatus().size).toBe(100);
  });

  it('should process queued operations successfully', async () => {
    await service.enqueue({ operation: 'op1', payload: { a: 1 } });
    await service.enqueue({ operation: 'op2', payload: { b: 2 } });

    const processor = jest.fn().mockResolvedValue(undefined);
    const result = await service.processQueue(processor);

    expect(processor).toHaveBeenCalledTimes(2);
    expect(result.processed).toBe(2);
    expect(result.failed).toBe(0);
    expect(service.getStatus().size).toBe(0);
  });

  it('should drop entries that exceed maxRetries', async () => {
    await service.enqueue({ operation: 'failing-op', payload: {}, maxRetries: 2 });

    const failingProcessor = jest.fn().mockRejectedValue(new Error('Network error'));

    // First attempt
    await service.processQueue(failingProcessor);
    expect(service.getStatus().size).toBe(1); // Still in queue

    // Second attempt
    await service.processQueue(failingProcessor);
    expect(service.getStatus().size).toBe(0); // Dropped after maxRetries
  });

  it('should clear the queue', async () => {
    await service.enqueue({ operation: 'op1', payload: {} });
    await service.enqueue({ operation: 'op2', payload: {} });
    service.clear();
    expect(service.getStatus().size).toBe(0);
  });
});

// ===== EVENTS SERVICE TESTS =====

describe('EventsService', () => {
  let service: EventsService;
  let eventEmitter: jest.Mocked<EventEmitter2>;
  let offlineQueue: jest.Mocked<OfflineQueueService>;

  beforeEach(async () => {
    eventEmitter = { emit: jest.fn() } as any;
    offlineQueue = { enqueue: jest.fn() } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EventsService,
        { provide: EventEmitter2, useValue: eventEmitter },
        { provide: OfflineQueueService, useValue: offlineQueue },
      ],
    }).compile();

    service = module.get<EventsService>(EventsService);
  });

  it('should emit a tenant event with correlationId and timestamp', async () => {
    await service.emit(TenantEvent.TENANT_CREATED, { tenantId: 'uuid-1' });

    expect(eventEmitter.emit).toHaveBeenCalledWith(
      TenantEvent.TENANT_CREATED,
      expect.objectContaining({
        eventType: TenantEvent.TENANT_CREATED,
        correlationId: expect.stringMatching(/^ww-/),
        timestamp: expect.any(String),
        payload: { tenantId: 'uuid-1' },
      }),
    );
  });

  it('should queue event in offline queue if emission fails', async () => {
    eventEmitter.emit.mockImplementation(() => {
      throw new Error('Event bus unavailable');
    });

    await service.emit(TenantEvent.TENANT_SUSPENDED, { tenantId: 'uuid-1', reason: 'test' });

    expect(offlineQueue.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({
        operation: 'emit_event',
        payload: expect.objectContaining({
          eventType: TenantEvent.TENANT_SUSPENDED,
        }),
      }),
    );
  });

  it('should generate unique correlation IDs', async () => {
    const ids = new Set<string>();
    for (let i = 0; i < 10; i++) {
      await service.emit(TenantEvent.TENANT_UPDATED, { tenantId: `uuid-${i}` });
    }
    // All 10 calls should have been made
    expect(eventEmitter.emit).toHaveBeenCalledTimes(10);
  });
});
