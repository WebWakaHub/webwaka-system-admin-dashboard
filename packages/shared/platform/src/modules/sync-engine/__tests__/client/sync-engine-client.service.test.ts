/**
 * Sync Engine Client Service Tests
 */

import { SyncEngineClientService } from '../../client/sync-engine-client.service';
import { OfflineStorageService } from '../../client/offline-storage.service';

// Mock OfflineStorageService
jest.mock('../../client/offline-storage.service');

// Mock fetch
(global as any).fetch = jest.fn();

describe('SyncEngineClientService', () => {
  let service: SyncEngineClientService;
  let mockStorage: jest.Mocked<OfflineStorageService>;

  const config = {
    syncIntervalMs: 30000,
    maxRetries: 3,
    conflictResolutionStrategy: 'last-write-wins' as const,
    enableRealTimeSync: false, // Disable for testing
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock storage
    mockStorage = new OfflineStorageService() as jest.Mocked<OfflineStorageService>;
    mockStorage.initialize = jest.fn().mockResolvedValue(undefined);
    mockStorage.get = jest.fn().mockResolvedValue(null);
    mockStorage.set = jest.fn().mockResolvedValue(undefined);
    mockStorage.delete = jest.fn().mockResolvedValue(undefined);
    mockStorage.getAll = jest.fn().mockResolvedValue([]);

    service = new SyncEngineClientService(config, 'tenant-1', 'user-1');
    (service as any).storage = mockStorage;
  });

  describe('initialize', () => {
    it('should initialize successfully', async () => {
      await service.initialize();

      expect(mockStorage.initialize).toHaveBeenCalled();
      expect(mockStorage.get).toHaveBeenCalledWith('_sync', 'pending-changes');
      expect(mockStorage.get).toHaveBeenCalledWith('_sync', 'last-sync-timestamp');
    });

    it('should load pending changes from storage', async () => {
      const pendingChanges = [
        {
          id: 'change-1',
          type: 'create' as const,
          entity: 'products',
          entityId: 'product-1',
          data: { name: 'Product 1' },
          timestamp: new Date(),
          tenantId: 'tenant-1',
          userId: 'user-1',
        },
      ];

      mockStorage.get.mockImplementation((entity, id) => {
        if (entity === '_sync' && id === 'pending-changes') {
          return Promise.resolve(pendingChanges);
        }
        return Promise.resolve(null);
      });

      await service.initialize();

      expect((service as any).pendingChanges).toEqual(pendingChanges);
    });
  });

  describe('create', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should create an item and queue change', async () => {
      const data = { name: 'Product 1', price: 1000 };

      const id = await service.create('products', data);

      expect(id).toBeDefined();
      expect(mockStorage.set).toHaveBeenCalledWith('products', id, data);
      expect(mockStorage.set).toHaveBeenCalledWith('_sync', 'pending-changes', expect.any(Array));
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should update an item and queue change', async () => {
      const data = { name: 'Product 1 Updated', price: 1200 };

      await service.update('products', 'product-1', data);

      expect(mockStorage.set).toHaveBeenCalledWith('products', 'product-1', data);
      expect(mockStorage.set).toHaveBeenCalledWith('_sync', 'pending-changes', expect.any(Array));
    });
  });

  describe('delete', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should delete an item and queue change', async () => {
      await service.delete('products', 'product-1');

      expect(mockStorage.delete).toHaveBeenCalledWith('products', 'product-1');
      expect(mockStorage.set).toHaveBeenCalledWith('_sync', 'pending-changes', expect.any(Array));
    });
  });

  describe('get', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should get an item from storage', async () => {
      const mockData = { id: 'product-1', name: 'Product 1' };
      mockStorage.get.mockResolvedValue(mockData);

      const result = await service.get('products', 'product-1');

      expect(result).toEqual(mockData);
      expect(mockStorage.get).toHaveBeenCalledWith('products', 'product-1');
    });
  });

  describe('getAll', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should get all items of an entity type', async () => {
      const mockData = [
        { id: 'product-1', name: 'Product 1' },
        { id: 'product-2', name: 'Product 2' },
      ];
      mockStorage.getAll.mockResolvedValue(mockData);

      const result = await service.getAll('products');

      expect(result).toEqual(mockData);
      expect(mockStorage.getAll).toHaveBeenCalledWith('products');
    });
  });

  describe('getSyncStatus', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should return idle status initially', () => {
      expect(service.getSyncStatus()).toBe('idle');
    });
  });

  describe('sync', () => {
    beforeEach(async () => {
      await service.initialize();
      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ changes: [], timestamp: new Date().toISOString() }),
      });
    });

    it('should not sync if already syncing', async () => {
      // Set status to syncing
      (service as any).syncStatus = 'syncing';

      await service.sync();

      expect(global.fetch).not.toHaveBeenCalled();
    });

    it('should pull changes from server when no pending changes', async () => {
      const mockChanges = [
        {
          id: 'change-1',
          type: 'create' as const,
          entity: 'products',
          entityId: 'product-1',
          data: { name: 'Product 1' },
          timestamp: new Date(),
          tenantId: 'tenant-1',
          userId: 'user-1',
        },
      ];

      (global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ changes: mockChanges, timestamp: new Date().toISOString() }),
      });

      await service.sync();

      expect(global.fetch).toHaveBeenCalled();
      expect(mockStorage.set).toHaveBeenCalledWith('products', 'product-1', { name: 'Product 1' });
    });
  });

  describe('sync - error handling', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should handle fetch errors gracefully', async () => {
      (global as any).fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      await expect(service.sync()).rejects.toThrow('Network error');
      expect(service.getSyncStatus()).toBe('error');
    });

    it('should handle server errors', async () => {
      (global as any).fetch = jest.fn().mockResolvedValue({
        ok: false,
        statusText: 'Internal Server Error',
      });

      await expect(service.sync()).rejects.toThrow('Failed to pull changes');
    });

    it('should push pending changes to server', async () => {
      // Add a pending change
      await service.create('products', { name: 'Product 1' });

      (global as any).fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ changes: [], timestamp: new Date().toISOString() }),
        });

      await service.sync();

      expect((global as any).fetch).toHaveBeenCalledTimes(2);
      expect((global as any).fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: expect.any(String),
        })
      );
    });
  });

  describe('applyChange', () => {
    beforeEach(async () => {
      await service.initialize();
    });

    it('should apply create change', async () => {
      const change = {
        id: 'change-1',
        type: 'create' as const,
        entity: 'products',
        entityId: 'product-1',
        data: { name: 'Product 1' },
        timestamp: new Date(),
        tenantId: 'tenant-1',
        userId: 'user-1',
      };

      await (service as any).applyChange(change);

      expect(mockStorage.set).toHaveBeenCalledWith('products', 'product-1', { name: 'Product 1' });
    });

    it('should apply update change', async () => {
      const change = {
        id: 'change-2',
        type: 'update' as const,
        entity: 'products',
        entityId: 'product-1',
        data: { name: 'Product 1 Updated' },
        timestamp: new Date(),
        tenantId: 'tenant-1',
        userId: 'user-1',
      };

      await (service as any).applyChange(change);

      expect(mockStorage.set).toHaveBeenCalledWith('products', 'product-1', { name: 'Product 1 Updated' });
    });

    it('should apply delete change', async () => {
      const change = {
        id: 'change-3',
        type: 'delete' as const,
        entity: 'products',
        entityId: 'product-1',
        data: null,
        timestamp: new Date(),
        tenantId: 'tenant-1',
        userId: 'user-1',
      };

      await (service as any).applyChange(change);

      expect(mockStorage.delete).toHaveBeenCalledWith('products', 'product-1');
    });
  });

});
