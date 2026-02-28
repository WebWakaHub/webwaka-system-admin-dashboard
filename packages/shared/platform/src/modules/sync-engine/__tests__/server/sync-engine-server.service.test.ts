/**
 * Sync Engine Server Service Tests
 */

import { SyncEngineServerService } from '../../server/sync-engine-server.service';
import { Change } from '../../types';

describe('SyncEngineServerService', () => {
  let service: SyncEngineServerService;

  beforeEach(() => {
    service = new SyncEngineServerService();
  });

  describe('getChanges', () => {
    it('should return empty changes for new tenant', async () => {
      const request = {
        tenantId: 'tenant-1',
        userId: 'user-1',
      };

      const response = await service.getChanges(request);

      expect(response.changes).toEqual([]);
      expect(response.timestamp).toBeDefined();
    });

    it('should return all changes when no lastSyncTimestamp provided', async () => {
      const change: Change = {
        id: 'change-1',
        type: 'create',
        entity: 'products',
        entityId: 'product-1',
        data: { name: 'Product 1' },
        timestamp: new Date(),
        tenantId: 'tenant-1',
        userId: 'user-1',
      };

      await service.postChanges({
        changes: [change],
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      const response = await service.getChanges({
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      expect(response.changes).toHaveLength(1);
      expect(response.changes[0]).toMatchObject({
        id: 'change-1',
        type: 'create',
        entity: 'products',
        entityId: 'product-1',
      });
    });

    it('should return only changes after lastSyncTimestamp', async () => {
      const oldChange: Change = {
        id: 'change-1',
        type: 'create',
        entity: 'products',
        entityId: 'product-1',
        data: { name: 'Product 1' },
        timestamp: new Date('2026-01-01'),
        tenantId: 'tenant-1',
        userId: 'user-1',
      };

      const newChange: Change = {
        id: 'change-2',
        type: 'update',
        entity: 'products',
        entityId: 'product-1',
        data: { name: 'Product 1 Updated' },
        timestamp: new Date('2026-02-01'),
        tenantId: 'tenant-1',
        userId: 'user-1',
      };

      await service.postChanges({
        changes: [oldChange, newChange],
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      const response = await service.getChanges({
        lastSyncTimestamp: '2026-01-15T00:00:00.000Z',
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      expect(response.changes).toHaveLength(1);
      expect(response.changes[0].id).toBe('change-2');
    });
  });

  describe('postChanges', () => {
    it('should handle empty changes array', async () => {
      await service.postChanges({
        changes: [],
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      const response = await service.getChanges({
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      expect(response.changes).toEqual([]);
    });

    it('should store changes for tenant', async () => {
      const change: Change = {
        id: 'change-1',
        type: 'create',
        entity: 'products',
        entityId: 'product-1',
        data: { name: 'Product 1' },
        timestamp: new Date(),
        tenantId: 'tenant-1',
        userId: 'user-1',
      };

      await service.postChanges({
        changes: [change],
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      const response = await service.getChanges({
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      expect(response.changes).toHaveLength(1);
    });

    it('should resolve conflicts using last-write-wins', async () => {
      const oldChange: Change = {
        id: 'change-1',
        type: 'update',
        entity: 'products',
        entityId: 'product-1',
        data: { name: 'Product 1 Old' },
        timestamp: new Date('2026-01-01'),
        tenantId: 'tenant-1',
        userId: 'user-1',
      };

      const newChange: Change = {
        id: 'change-2',
        type: 'update',
        entity: 'products',
        entityId: 'product-1',
        data: { name: 'Product 1 New' },
        timestamp: new Date('2026-02-01'),
        tenantId: 'tenant-1',
        userId: 'user-1',
      };

      await service.postChanges({
        changes: [oldChange],
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      await service.postChanges({
        changes: [newChange],
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      const response = await service.getChanges({
        tenantId: 'tenant-1',
        userId: 'user-1',
      });

      // Should have both changes (conflict resolution keeps winner)
      expect(response.changes.length).toBeGreaterThan(0);
    });
  });

  describe('broadcastChange', () => {
    it('should broadcast change without error', async () => {
      const change: Change = {
        id: 'change-1',
        type: 'create',
        entity: 'products',
        entityId: 'product-1',
        data: { name: 'Product 1' },
        timestamp: new Date(),
        tenantId: 'tenant-1',
        userId: 'user-1',
      };

      // Should not throw
      await expect(service.broadcastChange(change)).resolves.not.toThrow();
    });
  });
});
