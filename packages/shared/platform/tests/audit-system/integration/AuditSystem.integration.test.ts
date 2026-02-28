/**
 * Integration tests for Audit System
 */

import { AuditSystem } from '../../../src/audit-system/AuditSystem';
import { AuditSystemFactory } from '../../../src/audit-system/factory/AuditSystemFactory';
import { AuditSystemInitializer } from '../../../src/audit-system/init/AuditSystemInitializer';
import { AuditMiddleware } from '../../../src/audit-system/middleware/AuditMiddleware';

describe('Audit System Integration Tests', () => {
  let auditSystem: AuditSystem;

  beforeEach(async () => {
    AuditSystemFactory.reset();
    auditSystem = AuditSystemFactory.getInstance();
    await auditSystem.start();
  });

  afterEach(async () => {
    await auditSystem.stop();
  });

  describe('End-to-End Event Processing', () => {
    it('should process events from emission to storage', async () => {
      const eventEmitter = auditSystem.getEventEmitter();
      const queryAPI = auditSystem.getQueryAPI();

      // Emit an event
      await eventEmitter.emit(
        'products-service',
        'tenant-123',
        { userId: 'user-123', role: 'admin' },
        { type: 'CREATE', entityType: 'Product', entityId: 'product-456' }
      );

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Query the audit log
      const result = await queryAPI.queryAuditLogs('user-123', {
        tenantId: 'tenant-123',
        entityType: 'Product',
      });

      expect(result.logs.length).toBe(1);
      expect(result.logs[0].action.type).toBe('CREATE');
    });

    it('should handle multiple events', async () => {
      const eventEmitter = auditSystem.getEventEmitter();
      const queryAPI = auditSystem.getQueryAPI();

      // Emit multiple events
      for (let i = 0; i < 5; i++) {
        await eventEmitter.emit(
          'products-service',
          'tenant-123',
          { userId: 'user-123', role: 'admin' },
          { type: 'CREATE', entityType: 'Product', entityId: `product-${i}` }
        );
      }

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Query all logs
      const result = await queryAPI.queryAuditLogs('user-123', {
        tenantId: 'tenant-123',
      });

      expect(result.logs.length).toBe(5);
    });
  });

  describe('Multi-Tenant Isolation', () => {
    it('should isolate audit logs by tenant', async () => {
      const eventEmitter = auditSystem.getEventEmitter();
      const queryAPI = auditSystem.getQueryAPI();

      // Emit events for different tenants
      await eventEmitter.emit(
        'products-service',
        'tenant-123',
        { userId: 'user-123', role: 'admin' },
        { type: 'CREATE', entityType: 'Product', entityId: 'product-1' }
      );

      await eventEmitter.emit(
        'products-service',
        'tenant-456',
        { userId: 'user-456', role: 'admin' },
        { type: 'CREATE', entityType: 'Product', entityId: 'product-2' }
      );

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Query logs for tenant-123
      const result1 = await queryAPI.queryAuditLogs('user-123', {
        tenantId: 'tenant-123',
      });

      expect(result1.logs.length).toBe(1);
      expect(result1.logs[0].tenantId).toBe('tenant-123');
    });
  });

  describe('Query Filtering', () => {
    it('should filter logs by action type', async () => {
      const eventEmitter = auditSystem.getEventEmitter();
      const queryAPI = auditSystem.getQueryAPI();

      // Emit different action types
      await eventEmitter.emit(
        'products-service',
        'tenant-123',
        { userId: 'user-123', role: 'admin' },
        { type: 'CREATE', entityType: 'Product', entityId: 'product-1' }
      );

      await eventEmitter.emit(
        'products-service',
        'tenant-123',
        { userId: 'user-123', role: 'admin' },
        { type: 'UPDATE', entityType: 'Product', entityId: 'product-1' }
      );

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Query only CREATE actions
      const result = await queryAPI.queryAuditLogs('user-123', {
        tenantId: 'tenant-123',
        actionType: 'CREATE',
      });

      expect(result.logs.length).toBe(1);
      expect(result.logs[0].action.type).toBe('CREATE');
    });
  });

  describe('Middleware Integration', () => {
    it('should create middleware instance', () => {
      const middleware = new AuditMiddleware(auditSystem, {
        enabled: true,
        excludeRoutes: ['/health'],
      });

      expect(middleware).toBeDefined();
      const middlewareFn = middleware.middleware();
      expect(typeof middlewareFn).toBe('function');
    });
  });

  describe('Initialization', () => {
    it('should initialize Audit System successfully', async () => {
      const result = await AuditSystemInitializer.initialize();

      expect(result.success).toBe(true);
      expect(result.auditSystem).toBeDefined();
      expect(result.error).toBeUndefined();
    });
  });

  describe('Pagination', () => {
    it('should paginate query results', async () => {
      const eventEmitter = auditSystem.getEventEmitter();
      const queryAPI = auditSystem.getQueryAPI();

      // Emit 5 events
      for (let i = 0; i < 5; i++) {
        await eventEmitter.emit(
          'products-service',
          'tenant-123',
          { userId: 'user-123', role: 'admin' },
          { type: 'CREATE', entityType: 'Product', entityId: `product-${i}` }
        );
      }

      // Wait for processing
      await new Promise((resolve) => setTimeout(resolve, 200));

      // Query with pagination
      const result = await queryAPI.queryAuditLogs('user-123', {
        tenantId: 'tenant-123',
        page: 1,
        limit: 3,
      });

      expect(result.logs.length).toBe(3);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.total).toBe(5);
    });
  });
});
