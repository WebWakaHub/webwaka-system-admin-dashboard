/**
 * Unit tests for AuditQueryAPI
 */

import { AuditQueryAPI, PermissionChecker } from '../../../src/audit-system/api/AuditQueryAPI';
import { AuditDataStore } from '../../../src/audit-system/store/AuditDataStore';
import { AuditLog } from '../../../src/audit-system/types/AuditLog';
import { UnauthorizedAuditAccessError } from '../../../src/audit-system/errors/AuditSystemError';

describe('AuditQueryAPI', () => {
  let api: AuditQueryAPI;
  let dataStore: AuditDataStore;
  let permissionChecker: PermissionChecker;

  beforeEach(async () => {
    dataStore = new AuditDataStore();
    permissionChecker = {
      hasPermission: jest.fn().mockResolvedValue(true),
    };

    api = new AuditQueryAPI(dataStore, permissionChecker);

    // Store some test data
    const auditLog: AuditLog = {
      logId: 'log-123',
      timestamp: new Date(),
      tenantId: 'tenant-123',
      actor: { userId: 'user-123', role: 'admin' },
      action: { type: 'CREATE', entityType: 'Product', entityId: 'product-456' },
    };

    await dataStore.storeAuditLog(auditLog, 'hash-123');
  });

  describe('queryAuditLogs', () => {
    it('should query audit logs when user has permission', async () => {
      const result = await api.queryAuditLogs('user-123', {
        tenantId: 'tenant-123',
      });

      expect(result.logs.length).toBe(1);
      expect(permissionChecker.hasPermission).toHaveBeenCalledWith('user-123', 'audit:read', 'tenant-123');
    });

    it('should throw UnauthorizedAuditAccessError when user does not have permission', async () => {
      (permissionChecker.hasPermission as jest.Mock).mockResolvedValue(false);

      await expect(api.queryAuditLogs('user-456', { tenantId: 'tenant-123' })).rejects.toThrow(UnauthorizedAuditAccessError);
    });
  });

  describe('getAuditLogById', () => {
    it('should retrieve an audit log by ID when user has permission', async () => {
      const log = await api.getAuditLogById('user-123', 'log-123', 'tenant-123');

      expect(log).toBeDefined();
      expect(log?.logId).toBe('log-123');
    });

    it('should throw UnauthorizedAuditAccessError when user does not have permission', async () => {
      (permissionChecker.hasPermission as jest.Mock).mockResolvedValue(false);

      await expect(api.getAuditLogById('user-456', 'log-123', 'tenant-123')).rejects.toThrow(UnauthorizedAuditAccessError);
    });

    it('should return undefined for non-existent log ID', async () => {
      const log = await api.getAuditLogById('user-123', 'non-existent-log', 'tenant-123');

      expect(log).toBeUndefined();
    });
  });

  describe('verifyAuditLogIntegrity', () => {
    it('should verify audit log integrity when user has permission', async () => {
      const isValid = await api.verifyAuditLogIntegrity('user-123', 'log-123', 'hash-123', 'tenant-123');

      expect(isValid).toBe(true);
    });

    it('should throw UnauthorizedAuditAccessError when user does not have permission', async () => {
      (permissionChecker.hasPermission as jest.Mock).mockResolvedValue(false);

      await expect(api.verifyAuditLogIntegrity('user-456', 'log-123', 'hash-123', 'tenant-123')).rejects.toThrow(UnauthorizedAuditAccessError);
    });

    it('should return false for invalid hash', async () => {
      const isValid = await api.verifyAuditLogIntegrity('user-123', 'log-123', 'wrong-hash', 'tenant-123');

      expect(isValid).toBe(false);
    });
  });
});
