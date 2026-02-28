/**
 * Hospitality Booking Engine - Offline Sync Engine Unit Tests
 * 
 * Unit tests for Offline Sync Engine with exponential backoff.
 * 
 * @module hospitality-booking-engine/__tests__/services/offline-sync-engine.test
 * @author webwakaagent5
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { OfflineSyncEngine } from '../../services/offline-sync-engine';
import { BookingService } from '../../services/booking-service';
import { EventPublisher } from '../../events/event-publisher';
import { SyncStatus } from '../../types';

describe('OfflineSyncEngine', () => {
  let offlineSyncEngine: OfflineSyncEngine;
  let mockBookingService: BookingService;
  let mockEventPublisher: EventPublisher;

  beforeEach(() => {
    mockBookingService = {
      createBooking: vi.fn().mockResolvedValue({
        bookingId: 'booking_123',
        referenceNumber: 'BK123456',
        status: 'pending',
        totalAmount: 100000,
        currency: 'NGN',
        paymentUrl: 'https://paystack.com/pay/test123',
        expiresAt: new Date().toISOString(),
      }),
    } as any;

    mockEventPublisher = {
      publishBookingSynced: vi.fn().mockResolvedValue(undefined),
    } as any;

    offlineSyncEngine = new OfflineSyncEngine(mockBookingService, mockEventPublisher);
  });

  afterEach(() => {
    offlineSyncEngine.stopBackgroundSync();
  });

  describe('queueOfflineBooking', () => {
    it('should queue booking successfully', async () => {
      const bookingData = {
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        adultsCount: 2,
        childrenCount: 0,
        rooms: [],
        guest: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+2348012345678',
          ndprConsent: true,
        },
        paymentGateway: 'paystack' as any,
      };

      const queueItemId = await offlineSyncEngine.queueOfflineBooking('tenant_123', bookingData);

      expect(queueItemId).toBeDefined();
      expect(queueItemId).toMatch(/^offline_/);
    });

    it('should generate unique queue item IDs', async () => {
      const bookingData = {
        tenantId: 'tenant_123',
        propertyId: 'property_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        adultsCount: 2,
        rooms: [],
        guest: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+2348012345678',
          ndprConsent: true,
        },
        paymentGateway: 'paystack' as any,
      };

      const id1 = await offlineSyncEngine.queueOfflineBooking('tenant_123', bookingData);
      const id2 = await offlineSyncEngine.queueOfflineBooking('tenant_123', bookingData);

      expect(id1).not.toBe(id2);
    });
  });

  describe('calculateBackoff', () => {
    it('should calculate exponential backoff correctly', () => {
      const backoff0 = offlineSyncEngine['calculateBackoff'](0);
      const backoff1 = offlineSyncEngine['calculateBackoff'](1);
      const backoff2 = offlineSyncEngine['calculateBackoff'](2);
      const backoff3 = offlineSyncEngine['calculateBackoff'](3);

      expect(backoff0).toBe(1000); // 1s
      expect(backoff1).toBe(2000); // 2s
      expect(backoff2).toBe(4000); // 4s
      expect(backoff3).toBe(8000); // 8s
    });

    it('should cap backoff at maximum delay', () => {
      const backoff10 = offlineSyncEngine['calculateBackoff'](10);

      expect(backoff10).toBeLessThanOrEqual(60000); // Max 60s
    });
  });

  describe('startBackgroundSync', () => {
    it('should start background sync with default interval', () => {
      offlineSyncEngine.startBackgroundSync();

      // Verify sync interval is set (not null)
      expect(offlineSyncEngine['syncInterval']).not.toBeNull();
    });

    it('should start background sync with custom interval', () => {
      offlineSyncEngine.startBackgroundSync(60000);

      expect(offlineSyncEngine['syncInterval']).not.toBeNull();
    });

    it('should not start if already running', () => {
      offlineSyncEngine.startBackgroundSync();
      const firstInterval = offlineSyncEngine['syncInterval'];

      offlineSyncEngine.startBackgroundSync();
      const secondInterval = offlineSyncEngine['syncInterval'];

      expect(firstInterval).toBe(secondInterval);
    });
  });

  describe('stopBackgroundSync', () => {
    it('should stop background sync', () => {
      offlineSyncEngine.startBackgroundSync();
      expect(offlineSyncEngine['syncInterval']).not.toBeNull();

      offlineSyncEngine.stopBackgroundSync();
      expect(offlineSyncEngine['syncInterval']).toBeNull();
    });

    it('should handle stop when not running', () => {
      expect(() => offlineSyncEngine.stopBackgroundSync()).not.toThrow();
    });
  });

  describe('syncQueuedItems', () => {
    it('should return empty array if no pending items', async () => {
      offlineSyncEngine['fetchPendingQueueItems'] = vi.fn().mockResolvedValue([]);

      const results = await offlineSyncEngine.syncQueuedItems();

      expect(results).toEqual([]);
    });

    it('should not sync if already syncing', async () => {
      offlineSyncEngine['isSyncing'] = true;

      const results = await offlineSyncEngine.syncQueuedItems();

      expect(results).toEqual([]);
    });

    it('should sync pending items successfully', async () => {
      const pendingItem = {
        id: 'offline_123',
        tenantId: 'tenant_123',
        itemType: 'booking' as const,
        itemData: {
          propertyId: 'property_123',
          checkInDate: '2026-03-01',
          checkOutDate: '2026-03-05',
          adultsCount: 2,
          rooms: [],
          guest: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+2348012345678',
            ndprConsent: true,
          },
          paymentGateway: 'paystack',
        },
        syncStatus: SyncStatus.PENDING,
        retryCount: 0,
        maxRetries: 5,
        createdAt: new Date(),
      };

      offlineSyncEngine['fetchPendingQueueItems'] = vi.fn().mockResolvedValue([pendingItem]);
      offlineSyncEngine['updateQueueItem'] = vi.fn().mockResolvedValue(undefined);

      const results = await offlineSyncEngine.syncQueuedItems();

      expect(results).toHaveLength(1);
      expect(results[0].success).toBe(true);
      expect(results[0].syncStatus).toBe(SyncStatus.SYNCED);
    });

    it('should skip items with future retry time', async () => {
      const futureDate = new Date();
      futureDate.setHours(futureDate.getHours() + 1);

      const pendingItem = {
        id: 'offline_123',
        tenantId: 'tenant_123',
        itemType: 'booking' as const,
        itemData: {},
        syncStatus: SyncStatus.PENDING,
        retryCount: 1,
        maxRetries: 5,
        nextRetryAt: futureDate,
        createdAt: new Date(),
      };

      offlineSyncEngine['fetchPendingQueueItems'] = vi.fn().mockResolvedValue([pendingItem]);

      const results = await offlineSyncEngine.syncQueuedItems();

      expect(results).toEqual([]);
    });
  });

  describe('syncBooking', () => {
    it('should sync booking without conflicts', async () => {
      const queueItem = {
        id: 'offline_123',
        tenantId: 'tenant_123',
        itemType: 'booking' as const,
        itemData: {
          propertyId: 'property_123',
          checkInDate: '2026-03-01',
          checkOutDate: '2026-03-05',
          adultsCount: 2,
          rooms: [],
          guest: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+2348012345678',
            ndprConsent: true,
          },
          paymentGateway: 'paystack',
        },
        syncStatus: SyncStatus.PENDING,
        retryCount: 0,
        maxRetries: 5,
        createdAt: new Date(),
      };

      offlineSyncEngine['detectBookingConflicts'] = vi.fn().mockResolvedValue([]);

      const result = await offlineSyncEngine['syncBooking'](queueItem);

      expect(result.success).toBe(true);
      expect(result.syncStatus).toBe(SyncStatus.SYNCED);
      expect(mockBookingService.createBooking).toHaveBeenCalledOnce();
      expect(mockEventPublisher.publishBookingSynced).toHaveBeenCalledWith(
        expect.objectContaining({
          syncStatus: SyncStatus.SYNCED,
        })
      );
    });

    it('should handle conflicts', async () => {
      const queueItem = {
        id: 'offline_123',
        tenantId: 'tenant_123',
        itemType: 'booking' as const,
        itemData: {
          propertyId: 'property_123',
          checkInDate: '2026-03-01',
          checkOutDate: '2026-03-05',
          adultsCount: 2,
          rooms: [],
          guest: {
            firstName: 'John',
            lastName: 'Doe',
            email: 'john@example.com',
            phone: '+2348012345678',
            ndprConsent: true,
          },
          paymentGateway: 'paystack',
        },
        syncStatus: SyncStatus.PENDING,
        retryCount: 0,
        maxRetries: 5,
        createdAt: new Date(),
      };

      const conflicts = [
        {
          field: 'totalAmount',
          localValue: 100000,
          serverValue: 110000,
        },
      ];

      offlineSyncEngine['detectBookingConflicts'] = vi.fn().mockResolvedValue(conflicts);

      const result = await offlineSyncEngine['syncBooking'](queueItem);

      expect(result.success).toBe(false);
      expect(result.syncStatus).toBe(SyncStatus.CONFLICT);
      expect(result.conflicts).toEqual(conflicts);
      expect(mockEventPublisher.publishBookingSynced).toHaveBeenCalledWith(
        expect.objectContaining({
          syncStatus: SyncStatus.CONFLICT,
          conflicts,
        })
      );
    });

    it('should handle sync errors', async () => {
      const queueItem = {
        id: 'offline_123',
        tenantId: 'tenant_123',
        itemType: 'booking' as const,
        itemData: {},
        syncStatus: SyncStatus.PENDING,
        retryCount: 0,
        maxRetries: 5,
        createdAt: new Date(),
      };

      offlineSyncEngine['detectBookingConflicts'] = vi.fn().mockResolvedValue([]);
      mockBookingService.createBooking = vi.fn().mockRejectedValue(new Error('Network error'));

      const result = await offlineSyncEngine['syncBooking'](queueItem);

      expect(result.success).toBe(false);
      expect(result.syncStatus).toBe(SyncStatus.FAILED);
      expect(result.error).toContain('Network error');
    });
  });

  describe('generateQueueItemId', () => {
    it('should generate queue item ID with correct prefix', () => {
      const id = offlineSyncEngine['generateQueueItemId']();

      expect(id).toMatch(/^offline_\d+_[a-z0-9]+$/);
    });
  });
});
