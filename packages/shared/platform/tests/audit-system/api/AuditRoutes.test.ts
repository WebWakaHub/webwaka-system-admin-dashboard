/**
 * Unit tests for AuditRoutes
 */

import { AuditRoutes, HttpContext, HttpResponse } from '../../../src/audit-system/api/AuditRoutes';
import { AuditQueryAPI } from '../../../src/audit-system/api/AuditQueryAPI';
import { AuditDataStore } from '../../../src/audit-system/store/AuditDataStore';
import { AuditLog } from '../../../src/audit-system/types/AuditLog';

describe('AuditRoutes', () => {
  let routes: AuditRoutes;
  let queryAPI: AuditQueryAPI;
  let dataStore: AuditDataStore;

  beforeEach(async () => {
    dataStore = new AuditDataStore();
    queryAPI = new AuditQueryAPI(dataStore, {
      hasPermission: jest.fn().mockResolvedValue(true),
    });
    routes = new AuditRoutes(queryAPI);

    // Store test data
    const auditLog: AuditLog = {
      logId: 'log-123',
      timestamp: new Date(),
      tenantId: 'tenant-123',
      actor: { userId: 'user-123', role: 'admin' },
      action: { type: 'CREATE', entityType: 'Product', entityId: 'product-456' },
    };

    await dataStore.storeAuditLog(auditLog, 'hash-123');
  });

  describe('handleQueryLogs', () => {
    it('should query audit logs successfully', async () => {
      const context: HttpContext = {
        userId: 'user-123',
        tenantId: 'tenant-123',
        method: 'GET',
        path: '/api/v1/audit/logs',
        query: { page: '1', limit: '100' },
        body: {},
      };

      const response = await routes.handleQueryLogs(context);

      expect(response.statusCode).toBe(200);
      expect(response.body.logs).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it('should handle query errors', async () => {
      const context: HttpContext = {
        userId: 'user-456',
        tenantId: 'tenant-123',
        method: 'GET',
        path: '/api/v1/audit/logs',
        query: {},
        body: {},
      };

      // Mock permission checker to deny access
      const deniedQueryAPI = new AuditQueryAPI(dataStore, {
        hasPermission: jest.fn().mockResolvedValue(false),
      });
      const deniedRoutes = new AuditRoutes(deniedQueryAPI);

      const response = await deniedRoutes.handleQueryLogs(context);

      expect(response.statusCode).toBe(403);
    });
  });

  describe('handleGetLog', () => {
    it('should get a log by ID successfully', async () => {
      const context: HttpContext = {
        userId: 'user-123',
        tenantId: 'tenant-123',
        method: 'GET',
        path: '/api/v1/audit/logs/log-123',
        query: {},
        body: {},
      };

      const response = await routes.handleGetLog(context);

      expect(response.statusCode).toBe(200);
      expect(response.body.logId).toBe('log-123');
    });

    it('should return 404 for non-existent log', async () => {
      const context: HttpContext = {
        userId: 'user-123',
        tenantId: 'tenant-123',
        method: 'GET',
        path: '/api/v1/audit/logs/non-existent',
        query: {},
        body: {},
      };

      const response = await routes.handleGetLog(context);

      expect(response.statusCode).toBe(404);
    });

    it('should return 400 for missing log ID', async () => {
      const context: HttpContext = {
        userId: 'user-123',
        tenantId: 'tenant-123',
        method: 'GET',
        path: '/api/v1/audit/logs/',
        query: {},
        body: {},
      };

      const response = await routes.handleGetLog(context);

      expect(response.statusCode).toBe(400);
    });
  });

  describe('handleVerifyLog', () => {
    it('should verify log integrity successfully', async () => {
      const context: HttpContext = {
        userId: 'user-123',
        tenantId: 'tenant-123',
        method: 'POST',
        path: '/api/v1/audit/logs/log-123/verify',
        query: {},
        body: { expectedHash: 'hash-123' },
      };

      const response = await routes.handleVerifyLog(context);

      expect(response.statusCode).toBe(200);
      expect(response.body.valid).toBe(true);
    });

    it('should return false for invalid hash', async () => {
      const context: HttpContext = {
        userId: 'user-123',
        tenantId: 'tenant-123',
        method: 'POST',
        path: '/api/v1/audit/logs/log-123/verify',
        query: {},
        body: { expectedHash: 'wrong-hash' },
      };

      const response = await routes.handleVerifyLog(context);

      expect(response.statusCode).toBe(200);
      expect(response.body.valid).toBe(false);
    });

    it('should return 400 for missing log ID', async () => {
      const context: HttpContext = {
        userId: 'user-123',
        tenantId: 'tenant-123',
        method: 'POST',
        path: '/api/v1/audit/logs//verify',
        query: {},
        body: { expectedHash: 'hash-123' },
      };

      const response = await routes.handleVerifyLog(context);

      expect(response.statusCode).toBe(400);
    });

    it('should return 400 for missing expected hash', async () => {
      const context: HttpContext = {
        userId: 'user-123',
        tenantId: 'tenant-123',
        method: 'POST',
        path: '/api/v1/audit/logs/log-123/verify',
        query: {},
        body: {},
      };

      const response = await routes.handleVerifyLog(context);

      expect(response.statusCode).toBe(400);
    });
  });
});
