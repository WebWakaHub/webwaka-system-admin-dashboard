import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { OfflineQueueService } from '../src/offline/offline-queue.service';

describe('OfflineQueueService', () => {
  let service: OfflineQueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OfflineQueueService,
        {
          provide: ConfigService,
          useValue: {
            get: (key: string) => {
              const config: Record<string, any> = {
                'offlineFirst.queueMaxSize': 5,
                'offlineFirst.maxRetries': 3,
                'offlineFirst.syncRetryInterval': 1000,
              };
              return config[key];
            },
          },
        },
      ],
    }).compile();

    service = module.get<OfflineQueueService>(OfflineQueueService);
  });

  afterEach(() => {
    service.stopAutoSync();
  });

  describe('enqueue', () => {
    it('should add an entry to the queue', () => {
      const entry = service.enqueue('auth.login.failed', { email: 'test@example.com' });
      expect(entry.id).toBeDefined();
      expect(entry.operation).toBe('auth.login.failed');
      expect(entry.status).toBe('pending');
      expect(entry.retryCount).toBe(0);
    });

    it('should evict oldest entry when queue is full', () => {
      // Queue max size is 5
      for (let i = 0; i < 5; i++) {
        service.enqueue(`operation-${i}`, { index: i });
      }

      const status = service.getQueueStatus();
      expect(status.total).toBe(5);

      // Adding one more should evict the oldest
      service.enqueue('operation-5', { index: 5 });
      const newStatus = service.getQueueStatus();
      expect(newStatus.total).toBe(5);
    });

    it('should set correct maxRetries from config', () => {
      const entry = service.enqueue('test', {});
      expect(entry.maxRetries).toBe(3);
    });
  });

  describe('getQueueStatus', () => {
    it('should return correct counts', () => {
      service.enqueue('op1', {});
      service.enqueue('op2', {});

      const status = service.getQueueStatus();
      expect(status.total).toBe(2);
      expect(status.pending).toBe(2);
      expect(status.processing).toBe(0);
      expect(status.failed).toBe(0);
      expect(status.synced).toBe(0);
      expect(status.oldestEntry).toBeDefined();
    });

    it('should return null oldestEntry for empty queue', () => {
      const status = service.getQueueStatus();
      expect(status.total).toBe(0);
      expect(status.oldestEntry).toBeNull();
    });
  });

  describe('getPendingEntries', () => {
    it('should return only pending entries', () => {
      service.enqueue('op1', {});
      service.enqueue('op2', {});

      const pending = service.getPendingEntries();
      expect(pending).toHaveLength(2);
      expect(pending.every((e) => e.status === 'pending')).toBe(true);
    });
  });

  describe('processQueue', () => {
    it('should sync entries when syncFn returns true', async () => {
      service.enqueue('op1', {});
      service.enqueue('op2', {});

      const result = await service.processQueue(async () => true);
      expect(result.synced).toBe(2);
      expect(result.failed).toBe(0);

      const status = service.getQueueStatus();
      expect(status.total).toBe(0); // Synced entries are removed
    });

    it('should retry entries when syncFn returns false', async () => {
      service.enqueue('op1', {});

      const result = await service.processQueue(async () => false);
      expect(result.synced).toBe(0);
      expect(result.failed).toBe(0); // Not failed yet, still has retries

      const status = service.getQueueStatus();
      expect(status.pending).toBe(1);
    });

    it('should mark entries as failed after max retries', async () => {
      service.enqueue('op1', {});

      // Retry 3 times (maxRetries = 3)
      await service.processQueue(async () => false);
      await service.processQueue(async () => false);
      const result = await service.processQueue(async () => false);

      expect(result.failed).toBe(1);
      const status = service.getQueueStatus();
      expect(status.failed).toBe(1);
    });

    it('should handle syncFn exceptions', async () => {
      service.enqueue('op1', {});

      await service.processQueue(async () => {
        throw new Error('Network error');
      });

      const pending = service.getPendingEntries();
      expect(pending).toHaveLength(1);
      expect(pending[0].errorMessage).toBe('Network error');
    });
  });

  describe('clearQueue', () => {
    it('should remove all entries', () => {
      service.enqueue('op1', {});
      service.enqueue('op2', {});

      service.clearQueue();
      const status = service.getQueueStatus();
      expect(status.total).toBe(0);
    });
  });
});
