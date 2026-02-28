/**
 * Unit Tests: Tenant Context Manager
 * 
 * Tests for tenant context management using AsyncLocalStorage.
 * Week 17 - 50% coverage target (critical path tests only)
 * 
 * @module Multi-Tenant Data Scoping Tests
 * @author webwakaagent5
 * @date 2026-02-09
 */

import {
  TenantContextManager,
  TenantContextMissingError,
  TenantContextInvalidError,
  tenantContextManager,
} from '../../../src/core/multi-tenant/tenant-context.manager';

describe('TenantContextManager', () => {
  let manager: TenantContextManager;
  const testTenantId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    // Get singleton instance
    manager = TenantContextManager.getInstance();
    // Clear any existing context
    manager.clearTenantContext();
  });

  afterEach(() => {
    // Clean up after each test
    manager.clearTenantContext();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = TenantContextManager.getInstance();
      const instance2 = TenantContextManager.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export singleton instance', () => {
      expect(tenantContextManager).toBe(manager);
    });
  });

  describe('setTenantContext', () => {
    it('should set tenant context successfully', () => {
      const userId = 'user123';
      const requestId = 'req456';

      manager.setTenantContext(testTenantId, userId, requestId);
      const retrieved = manager.getTenantContext();
      
      expect(retrieved).not.toBeNull();
      expect(retrieved!.tenantId).toBe(testTenantId);
      expect(retrieved!.userId).toBe(userId);
      expect(retrieved!.requestId).toBe(requestId);
      expect(retrieved!.timestamp).toBeInstanceOf(Date);
    });

    it('should set tenant context with only tenant ID', () => {
      manager.setTenantContext(testTenantId);
      const retrieved = manager.getTenantContext();
      
      expect(retrieved).not.toBeNull();
      expect(retrieved!.tenantId).toBe(testTenantId);
      expect(retrieved!.userId).toBeUndefined();
      expect(retrieved!.requestId).toBeUndefined();
    });

    it('should validate tenant ID format (UUID v4)', () => {
      const invalidTenantId = 'invalid-tenant-id';

      expect(() => {
        manager.setTenantContext(invalidTenantId);
      }).toThrow(TenantContextInvalidError);
    });

    it('should accept valid UUID v4 tenant ID', () => {
      const validTenantId = '550e8400-e29b-41d4-a716-446655440000';

      expect(() => {
        manager.setTenantContext(validTenantId);
      }).not.toThrow();
    });
  });

  describe('getTenantContext', () => {
    it('should return tenant context when set', () => {
      manager.setTenantContext(testTenantId, 'user123');
      const retrieved = manager.getTenantContext();
      
      expect(retrieved).not.toBeNull();
      expect(retrieved!.tenantId).toBe(testTenantId);
      expect(retrieved!.userId).toBe('user123');
    });

    it('should throw error when context is missing and required', () => {
      expect(() => {
        manager.getTenantContext(true);
      }).toThrow(TenantContextMissingError);
    });

    it('should return null when context is missing and not required', () => {
      const context = manager.getTenantContext(false);
      expect(context).toBeNull();
    });
  });

  describe('getTenantId', () => {
    it('should return tenant ID when context is set', () => {
      manager.setTenantContext(testTenantId);
      const tenantId = manager.getTenantId();
      
      expect(tenantId).toBe(testTenantId);
    });

    it('should throw error when context is missing and required', () => {
      expect(() => {
        manager.getTenantId(true);
      }).toThrow(TenantContextMissingError);
    });

    it('should return null when context is missing and not required', () => {
      const tenantId = manager.getTenantId(false);
      expect(tenantId).toBeNull();
    });
  });

  describe('clearTenantContext', () => {
    it('should clear tenant context', () => {
      manager.setTenantContext(testTenantId);
      expect(manager.hasTenantContext()).toBe(true);
      
      manager.clearTenantContext();
      expect(manager.hasTenantContext()).toBe(false);
    });

    it('should not throw error when clearing non-existent context', () => {
      expect(() => {
        manager.clearTenantContext();
      }).not.toThrow();
    });
  });

  describe('hasTenantContext', () => {
    it('should return true when context is set', () => {
      manager.setTenantContext(testTenantId);
      expect(manager.hasTenantContext()).toBe(true);
    });

    it('should return false when context is not set', () => {
      expect(manager.hasTenantContext()).toBe(false);
    });
  });

  describe('runWithTenantContext', () => {
    it('should run function with tenant context', async () => {
      const result = await manager.runWithTenantContext(testTenantId, async () => {
        const currentTenantId = manager.getTenantId();
        expect(currentTenantId).toBe(testTenantId);
        return 'success';
      });

      expect(result).toBe('success');
    });

    it('should isolate tenant context across concurrent calls', async () => {
      const tenant1 = '550e8400-e29b-41d4-a716-446655440000';
      const tenant2 = '660e8400-e29b-41d4-a716-446655440001';

      const promise1 = manager.runWithTenantContext(tenant1, async () => {
        await new Promise(resolve => setTimeout(resolve, 10));
        return manager.getTenantId();
      });

      const promise2 = manager.runWithTenantContext(tenant2, async () => {
        await new Promise(resolve => setTimeout(resolve, 5));
        return manager.getTenantId();
      });

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1).toBe(tenant1);
      expect(result2).toBe(tenant2);
    });

    it('should validate tenant ID before running', async () => {
      const invalidTenantId = 'invalid-tenant-id';

      await expect(
        manager.runWithTenantContext(invalidTenantId, async () => {
          return 'should not execute';
        })
      ).rejects.toThrow(TenantContextInvalidError);
    });
  });

  describe('validateTenantId', () => {
    it('should validate correct UUID v4 format', () => {
      const validId = '550e8400-e29b-41d4-a716-446655440000';
      expect(() => {
        manager.validateTenantId(validId);
      }).not.toThrow();
    });

    it('should reject invalid UUID format', () => {
      const invalidId = 'not-a-uuid';
      expect(() => {
        manager.validateTenantId(invalidId);
      }).toThrow(TenantContextInvalidError);
    });

    it('should reject empty string', () => {
      expect(() => {
        manager.validateTenantId('');
      }).toThrow(TenantContextInvalidError);
    });

    it('should reject UUID v1 format', () => {
      const uuidV1 = '550e8400-e29b-11d4-a716-446655440000';
      expect(() => {
        manager.validateTenantId(uuidV1);
      }).toThrow(TenantContextInvalidError);
    });
  });

  describe('getTenantContextForLogging', () => {
    it('should return sanitized context for logging', () => {
      const userId = 'user123';
      const requestId = 'req456';

      manager.setTenantContext(testTenantId, userId, requestId);
      const logContext = manager.getTenantContextForLogging();

      expect(logContext).toBeDefined();
      expect(logContext.tenantId).toBe(testTenantId);
      expect(logContext.requestId).toBe(requestId);
      expect(logContext.timestamp).toBeDefined();
      expect(typeof logContext.timestamp).toBe('string'); // ISO string
    });

    it('should return object with tenantContext not_set when no context is set', () => {
      const logContext = manager.getTenantContextForLogging();
      expect(logContext).toEqual({ tenantContext: 'not_set' });
    });
  });
});
