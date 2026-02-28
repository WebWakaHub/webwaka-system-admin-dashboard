/**
 * Unit tests for AuditDataStore
 */

import { AuditDataStore } from '../../../src/audit-system/store/AuditDataStore';
import { AuditLog, AuditLogQuery } from '../../../src/audit-system/types/AuditLog';

describe('AuditDataStore', () => {
  let store: AuditDataStore;

  beforeEach(() => {
    store = new AuditDataStore();
  });

  describe('storeAuditLog', () => {
    it('should successfully store an audit log', async () => {
      const auditLog: AuditLog = {
        logId: 'log-123',
        timestamp: new Date(),
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'CREATE', entityType: 'Product', entityId: 'product-456' },
      };

      await store.storeAuditLog(auditLog, 'hash-123');

      const count = await store.getTotalAuditLogCount();
      expect(count).toBe(1);
    });

    it('should store multiple audit logs', async () => {
      const auditLog1: AuditLog = {
        logId: 'log-123',
        timestamp: new Date(),
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'CREATE', entityType: 'Product', entityId: 'product-456' },
      };

      const auditLog2: AuditLog = {
        logId: 'log-124',
        timestamp: new Date(),
        tenantId: 'tenant-123',
        actor: { userId: 'user-124', role: 'user' },
        action: { type: 'READ', entityType: 'Product', entityId: 'product-457' },
      };

      await store.storeAuditLog(auditLog1, 'hash-123');
      await store.storeAuditLog(auditLog2, 'hash-124');

      const count = await store.getTotalAuditLogCount();
      expect(count).toBe(2);
    });
  });

  describe('queryAuditLogs', () => {
    beforeEach(async () => {
      const auditLog1: AuditLog = {
        logId: 'log-123',
        timestamp: new Date('2026-02-10T10:00:00Z'),
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'CREATE', entityType: 'Product', entityId: 'product-456' },
      };

      const auditLog2: AuditLog = {
        logId: 'log-124',
        timestamp: new Date('2026-02-10T11:00:00Z'),
        tenantId: 'tenant-123',
        actor: { userId: 'user-124', role: 'user' },
        action: { type: 'UPDATE', entityType: 'Product', entityId: 'product-456' },
      };

      const auditLog3: AuditLog = {
        logId: 'log-125',
        timestamp: new Date('2026-02-10T12:00:00Z'),
        tenantId: 'tenant-124',
        actor: { userId: 'user-125', role: 'admin' },
        action: { type: 'DELETE', entityType: 'Order', entityId: 'order-789' },
      };

      await store.storeAuditLog(auditLog1, 'hash-123');
      await store.storeAuditLog(auditLog2, 'hash-124');
      await store.storeAuditLog(auditLog3, 'hash-125');
    });

    it('should query all audit logs for a tenant', async () => {
      const query: AuditLogQuery = {
        tenantId: 'tenant-123',
      };

      const result = await store.queryAuditLogs(query);

      expect(result.logs.length).toBe(2);
      expect(result.pagination.total).toBe(2);
    });

    it('should filter audit logs by user ID', async () => {
      const query: AuditLogQuery = {
        tenantId: 'tenant-123',
        userId: 'user-123',
      };

      const result = await store.queryAuditLogs(query);

      expect(result.logs.length).toBe(1);
      expect(result.logs[0].actor.userId).toBe('user-123');
    });

    it('should filter audit logs by entity type', async () => {
      const query: AuditLogQuery = {
        tenantId: 'tenant-123',
        entityType: 'Product',
      };

      const result = await store.queryAuditLogs(query);

      expect(result.logs.length).toBe(2);
      expect(result.logs[0].action.entityType).toBe('Product');
    });

    it('should filter audit logs by action type', async () => {
      const query: AuditLogQuery = {
        tenantId: 'tenant-123',
        actionType: 'CREATE',
      };

      const result = await store.queryAuditLogs(query);

      expect(result.logs.length).toBe(1);
      expect(result.logs[0].action.type).toBe('CREATE');
    });

    it('should apply pagination', async () => {
      const query: AuditLogQuery = {
        tenantId: 'tenant-123',
        page: 1,
        limit: 1,
      };

      const result = await store.queryAuditLogs(query);

      expect(result.logs.length).toBe(1);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.limit).toBe(1);
      expect(result.pagination.total).toBe(2);
    });

    it('should return empty results for non-existent tenant', async () => {
      const query: AuditLogQuery = {
        tenantId: 'non-existent-tenant',
      };

      const result = await store.queryAuditLogs(query);

      expect(result.logs.length).toBe(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe('getAuditLogById', () => {
    it('should retrieve an audit log by ID', async () => {
      const auditLog: AuditLog = {
        logId: 'log-123',
        timestamp: new Date(),
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'CREATE', entityType: 'Product', entityId: 'product-456' },
      };

      await store.storeAuditLog(auditLog, 'hash-123');

      const retrieved = await store.getAuditLogById('log-123');

      expect(retrieved).toBeDefined();
      expect(retrieved?.logId).toBe('log-123');
      expect(retrieved?.tenantId).toBe('tenant-123');
    });

    it('should return undefined for non-existent log ID', async () => {
      const retrieved = await store.getAuditLogById('non-existent-log');

      expect(retrieved).toBeUndefined();
    });
  });

  describe('verifyAuditLogIntegrity', () => {
    it('should verify integrity of a stored audit log', async () => {
      const auditLog: AuditLog = {
        logId: 'log-123',
        timestamp: new Date(),
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'CREATE', entityType: 'Product', entityId: 'product-456' },
      };

      const hash = 'correct-hash-123';
      await store.storeAuditLog(auditLog, hash);

      const isValid = await store.verifyAuditLogIntegrity('log-123', hash);

      expect(isValid).toBe(true);
    });

    it('should detect hash mismatch', async () => {
      const auditLog: AuditLog = {
        logId: 'log-123',
        timestamp: new Date(),
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'CREATE', entityType: 'Product', entityId: 'product-456' },
      };

      await store.storeAuditLog(auditLog, 'correct-hash');

      const isValid = await store.verifyAuditLogIntegrity('log-123', 'wrong-hash');

      expect(isValid).toBe(false);
    });

    it('should return false for non-existent log ID', async () => {
      const isValid = await store.verifyAuditLogIntegrity('non-existent-log', 'hash-123');

      expect(isValid).toBe(false);
    });
  });

  describe('getTenantAuditLogCount', () => {
    it('should return the count of audit logs for a tenant', async () => {
      const auditLog1: AuditLog = {
        logId: 'log-123',
        timestamp: new Date(),
        tenantId: 'tenant-123',
        actor: { userId: 'user-123', role: 'admin' },
        action: { type: 'CREATE', entityType: 'Product', entityId: 'product-456' },
      };

      const auditLog2: AuditLog = {
        logId: 'log-124',
        timestamp: new Date(),
        tenantId: 'tenant-123',
        actor: { userId: 'user-124', role: 'user' },
        action: { type: 'READ', entityType: 'Product', entityId: 'product-457' },
      };

      await store.storeAuditLog(auditLog1, 'hash-123');
      await store.storeAuditLog(auditLog2, 'hash-124');

      const count = await store.getTenantAuditLogCount('tenant-123');

      expect(count).toBe(2);
    });

    it('should return 0 for non-existent tenant', async () => {
      const count = await store.getTenantAuditLogCount('non-existent-tenant');

      expect(count).toBe(0);
    });
  });
});
