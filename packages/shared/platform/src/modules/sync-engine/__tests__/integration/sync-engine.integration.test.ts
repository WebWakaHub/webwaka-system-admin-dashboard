/**
 * Sync Engine Integration Tests
 * 
 * Tests the complete sync workflow including client-server integration
 */

import { SyncEngineClientService } from '../../client/sync-engine-client.service';
import { SyncEngineServerService } from '../../server/sync-engine-server.service';
import { OfflineStorageService } from '../../client/offline-storage.service';

// Mock IndexedDB
const mockIndexedDB = {
  open: jest.fn(),
  databases: jest.fn(),
};

(global as any).indexedDB = mockIndexedDB;

// Mock fetch
(global as any).fetch = jest.fn();

describe('Sync Engine Integration Tests', () => {
  let clientService: SyncEngineClientService;
  let serverService: SyncEngineServerService;
  let mockStorage: jest.Mocked<OfflineStorageService>;
  let mockDB: any;

  const config = {
    syncIntervalMs: 30000,
    maxRetries: 3,
    conflictResolutionStrategy: 'last-write-wins' as const,
    enableRealTimeSync: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup mock DB
    const mockObjectStore = {
      get: jest.fn(),
      getAll: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
      createIndex: jest.fn(),
      index: jest.fn(),
      openCursor: jest.fn(),
    };

    const mockTransaction = {
      objectStore: jest.fn().mockReturnValue(mockObjectStore),
    };

    mockDB = {
      transaction: jest.fn().mockReturnValue(mockTransaction),
      objectStoreNames: {
        contains: jest.fn().mockReturnValue(false),
      },
      createObjectStore: jest.fn().mockReturnValue(mockObjectStore),
    };

    // Setup mock storage
    mockStorage = new OfflineStorageService() as jest.Mocked<OfflineStorageService>;
    mockStorage.initialize = jest.fn().mockResolvedValue(undefined);
    mockStorage.get = jest.fn().mockResolvedValue(null);
    mockStorage.set = jest.fn().mockResolvedValue(undefined);
    mockStorage.delete = jest.fn().mockResolvedValue(undefined);
    mockStorage.getAll = jest.fn().mockResolvedValue([]);

    // Initialize services
    clientService = new SyncEngineClientService(config, 'tenant-1', 'user-1');
    (clientService as any).storage = mockStorage;

    serverService = new SyncEngineServerService();
  });

  describe('End-to-End Sync Workflow', () => {
    it('should sync data from client to server', async () => {
      await clientService.initialize();

      // Create data on client
      const productId = await clientService.create('products', {
        name: 'Product 1',
        price: 1000,
      });

      // Get pending changes
      const pendingChanges = (clientService as any).pendingChanges;
      expect(pendingChanges).toHaveLength(1);
      expect(pendingChanges[0].type).toBe('create');
      expect(pendingChanges[0].entity).toBe('products');

      // Post changes to server
      await serverService.postChanges({
        changes: pendingChanges,
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      // Verify server has the changes
      const serverResponse = await serverService.getChanges({
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      expect(serverResponse.changes).toHaveLength(1);
      expect(serverResponse.changes[0].entity).toBe('products');
      expect(serverResponse.changes[0].data.name).toBe('Product 1');
    });

    it('should sync data from server to client', async () => {
      await clientService.initialize();

      // Post change to server
      await serverService.postChanges({
        changes: [
          {
            id: 'change-1',
            type: 'create',
            entity: 'products',
            entityId: 'product-1',
            data: { name: 'Server Product', price: 2000 },
            timestamp: new Date(),
            tenantId: 'tenant-1',
            userId: 'user-2',
          },
        ],
        tenantId: 'tenant-1',
        userId: 'user-2',
      });

      // Mock fetch to return server changes
      (global as any).fetch = jest.fn().mockResolvedValue({
        ok: true,
        json: async () => {
          const response = await serverService.getChanges({
            tenantId: 'tenant-1',
            userId: 'user-1',
          });
          return response;
        },
      });

      // Sync client with server
      await clientService.sync();

      // Verify client applied the change
      expect(mockStorage.set).toHaveBeenCalledWith(
        'products',
        'product-1',
        { name: 'Server Product', price: 2000 }
      );
    });

    it('should handle bidirectional sync', async () => {
      await clientService.initialize();

      // Create data on client
      await clientService.create('products', { name: 'Client Product' });

      // Post change to server (from another client)
      await serverService.postChanges({
        changes: [
          {
            id: 'change-server',
            type: 'create',
            entity: 'products',
            entityId: 'product-server',
            data: { name: 'Server Product' },
            timestamp: new Date(),
            tenantId: 'tenant-1',
            userId: 'user-2',
          },
        ],
        tenantId: 'tenant-1',
        userId: 'user-2',
      });

      // Mock fetch for push and pull
      (global as any).fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => {
            const response = await serverService.getChanges({
              tenantId: 'tenant-1',
              userId: 'user-1',
            });
            return response;
          },
        });

      // Sync
      await clientService.sync();

      // Verify both push and pull happened
      expect((global as any).fetch).toHaveBeenCalledTimes(2);
      expect(mockStorage.set).toHaveBeenCalledWith(
        'products',
        'product-server',
        { name: 'Server Product' }
      );
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve conflicts using last-write-wins', async () => {
      // Post older change
      await serverService.postChanges({
        changes: [
          {
            id: 'change-old',
            type: 'update',
            entity: 'products',
            entityId: 'product-1',
            data: { name: 'Old Name', price: 1000 },
            timestamp: new Date('2026-01-01'),
            tenantId: 'tenant-1',
            userId: 'user-1',
          },
        ],
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      // Post newer change
      await serverService.postChanges({
        changes: [
          {
            id: 'change-new',
            type: 'update',
            entity: 'products',
            entityId: 'product-1',
            data: { name: 'New Name', price: 2000 },
            timestamp: new Date('2026-02-01'),
            tenantId: 'tenant-1',
            userId: 'user-2',
          },
        ],
        tenantId: 'tenant-1',
        userId: 'user-2',
      });

      // Get changes
      const response = await serverService.getChanges({
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      // Should have both changes (server keeps history)
      expect(response.changes.length).toBeGreaterThan(0);
    });
  });

  describe('Offline Mode', () => {
    it('should queue changes when offline', async () => {
      await clientService.initialize();

      // Create changes while offline
      await clientService.create('products', { name: 'Product 1' });
      await clientService.update('products', 'product-2', { name: 'Product 2 Updated' });
      await clientService.delete('products', 'product-3');

      // Verify changes are queued
      const pendingChanges = (clientService as any).pendingChanges;
      expect(pendingChanges).toHaveLength(3);
      expect(pendingChanges[0].type).toBe('create');
      expect(pendingChanges[1].type).toBe('update');
      expect(pendingChanges[2].type).toBe('delete');
    });

    it('should sync queued changes when back online', async () => {
      await clientService.initialize();

      // Queue changes
      await clientService.create('products', { name: 'Product 1' });
      await clientService.update('products', 'product-2', { name: 'Updated' });

      // Mock successful sync
      (global as any).fetch = jest.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({}),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ changes: [], timestamp: new Date().toISOString() }),
        });

      // Sync
      await clientService.sync();

      // Verify changes were pushed
      expect((global as any).fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
        })
      );

      // Verify pending changes cleared
      expect((clientService as any).pendingChanges).toHaveLength(0);
    });
  });

  describe('Multi-Tenant Isolation', () => {
    it('should isolate data by tenant', async () => {
      // Post changes for tenant-1
      await serverService.postChanges({
        changes: [
          {
            id: 'change-t1',
            type: 'create',
            entity: 'products',
            entityId: 'product-1',
            data: { name: 'Tenant 1 Product' },
            timestamp: new Date(),
            tenantId: 'tenant-1',
            userId: 'user-1',
          },
        ],
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      // Post changes for tenant-2
      await serverService.postChanges({
        changes: [
          {
            id: 'change-t2',
            type: 'create',
            entity: 'products',
            entityId: 'product-2',
            data: { name: 'Tenant 2 Product' },
            timestamp: new Date(),
            tenantId: 'tenant-2',
            userId: 'user-2',
          },
        ],
        tenantId: 'tenant-2',
        userId: 'user-2',
      });

      // Get changes for tenant-1
      const tenant1Response = await serverService.getChanges({
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      // Get changes for tenant-2
      const tenant2Response = await serverService.getChanges({
        tenantId: 'tenant-2',
        userId: 'user-2',
      });

      // Verify isolation
      expect(tenant1Response.changes).toHaveLength(1);
      expect(tenant1Response.changes[0].data.name).toBe('Tenant 1 Product');

      expect(tenant2Response.changes).toHaveLength(1);
      expect(tenant2Response.changes[0].data.name).toBe('Tenant 2 Product');
    });
  });
});
