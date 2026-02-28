/**
 * Unit Tests: Query Interceptor
 * 
 * Tests for automatic tenant scoping of database queries.
 * Week 17 - 50% coverage target (basic scoping tests only)
 * 
 * @module Multi-Tenant Data Scoping Tests
 * @author webwakaagent5
 * @date 2026-02-09
 */

import {
  QueryInterceptor,
  QueryOperation,
  queryInterceptor,
} from '../../../src/core/multi-tenant/query-interceptor';
import { tenantContextManager, TenantContextMissingError } from '../../../src/core/multi-tenant/tenant-context.manager';

describe('QueryInterceptor', () => {
  let interceptor: QueryInterceptor;
  const testTenantId = '550e8400-e29b-41d4-a716-446655440000';

  beforeEach(() => {
    interceptor = QueryInterceptor.getInstance();
    tenantContextManager.clearTenantContext();
  });

  afterEach(() => {
    tenantContextManager.clearTenantContext();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = QueryInterceptor.getInstance();
      const instance2 = QueryInterceptor.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export singleton instance', () => {
      expect(queryInterceptor).toBe(interceptor);
    });
  });

  describe('interceptSelect', () => {
    beforeEach(() => {
      tenantContextManager.setTenantContext(testTenantId);
    });

    it('should add tenant_id filter to SELECT query', () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
      };

      const result = interceptor.interceptSelect(mockQuery);

      expect(mockQuery.where).toHaveBeenCalledWith('tenant_id', testTenantId);
      expect(result.operation).toBe(QueryOperation.SELECT);
      expect(result.tenantId).toBe(testTenantId);
    });

    it('should throw error when tenant context is missing', () => {
      tenantContextManager.clearTenantContext();
      
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
      };

      expect(() => {
        interceptor.interceptSelect(mockQuery);
      }).toThrow(TenantContextMissingError);
    });

    it('should skip tenant scoping when option is set', () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
      };

      const result = interceptor.interceptSelect(mockQuery, {
        skipTenantScoping: true,
      });

      expect(mockQuery.where).not.toHaveBeenCalled();
      expect(result.operation).toBe(QueryOperation.SELECT);
      expect(result.tenantScopingApplied).toBe(false);
    });

    it('should allow query without tenant context when option is set', () => {
      tenantContextManager.clearTenantContext();
      
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
      };

      expect(() => {
        interceptor.interceptSelect(mockQuery, {
          allowWithoutTenantContext: true,
        });
      }).not.toThrow();
    });

    it('should use tenant ID override when provided', () => {
      const overrideTenantId = '660e8400-e29b-41d4-a716-446655440001';
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
      };

      const result = interceptor.interceptSelect(mockQuery, {
        tenantIdOverride: overrideTenantId,
      });

      expect(mockQuery.where).toHaveBeenCalledWith('tenant_id', overrideTenantId);
      expect(result.tenantId).toBe(overrideTenantId);
    });
  });

  describe('interceptInsert', () => {
    beforeEach(() => {
      tenantContextManager.setTenantContext(testTenantId);
    });

    it('should add tenant_id to INSERT data', () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
      };
      const data = { name: 'Test User', email: 'test@example.com' };

      const result = interceptor.interceptInsert(mockQuery, data);

      expect(mockQuery.insert).toHaveBeenCalledWith({
        ...data,
        tenant_id: testTenantId,
      });
      expect(result.operation).toBe(QueryOperation.INSERT);
      expect(result.tenantId).toBe(testTenantId);
    });

    it('should throw error when tenant context is missing', () => {
      tenantContextManager.clearTenantContext();
      
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
      };
      const data = { name: 'Test User' };

      expect(() => {
        interceptor.interceptInsert(mockQuery, data);
      }).toThrow(TenantContextMissingError);
    });

    it('should skip tenant scoping when option is set', () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
      };
      const data = { name: 'Test User' };

      const result = interceptor.interceptInsert(mockQuery, data, {
        skipTenantScoping: true,
      });

      // When skipTenantScoping is true, query builder methods are not called
      expect(result.operation).toBe(QueryOperation.INSERT);
      expect(result.tenantScopingApplied).toBe(false);
    });

    it('should handle array of data for bulk insert', () => {
      const mockQuery = {
        insert: jest.fn().mockReturnThis(),
      };
      const data = [
        { name: 'User 1' },
        { name: 'User 2' },
      ];

      const result = interceptor.interceptInsert(mockQuery, data);

      expect(mockQuery.insert).toHaveBeenCalledWith([
        { name: 'User 1', tenant_id: testTenantId },
        { name: 'User 2', tenant_id: testTenantId },
      ]);
      expect(result.operation).toBe(QueryOperation.INSERT);
    });
  });

  describe('interceptUpdate', () => {
    beforeEach(() => {
      tenantContextManager.setTenantContext(testTenantId);
    });

    it('should add tenant_id filter to UPDATE query', () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
      };

      const result = interceptor.interceptUpdate(mockQuery);

      expect(mockQuery.where).toHaveBeenCalledWith('tenant_id', testTenantId);
      expect(result.operation).toBe(QueryOperation.UPDATE);
      expect(result.tenantId).toBe(testTenantId);
    });

    it('should throw error when tenant context is missing', () => {
      tenantContextManager.clearTenantContext();
      
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
      };

      expect(() => {
        interceptor.interceptUpdate(mockQuery);
      }).toThrow(TenantContextMissingError);
    });

    it('should skip tenant scoping when option is set', () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
      };

      const result = interceptor.interceptUpdate(mockQuery, {
        skipTenantScoping: true,
      });

      expect(mockQuery.where).not.toHaveBeenCalled();
      expect(result.operation).toBe(QueryOperation.UPDATE);
      expect(result.tenantScopingApplied).toBe(false);
    });
  });

  describe('interceptDelete', () => {
    beforeEach(() => {
      tenantContextManager.setTenantContext(testTenantId);
    });

    it('should add tenant_id filter to DELETE query', () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
      };

      const result = interceptor.interceptDelete(mockQuery);

      expect(mockQuery.where).toHaveBeenCalledWith('tenant_id', testTenantId);
      expect(result.operation).toBe(QueryOperation.DELETE);
      expect(result.tenantId).toBe(testTenantId);
    });

    it('should throw error when tenant context is missing', () => {
      tenantContextManager.clearTenantContext();
      
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
      };

      expect(() => {
        interceptor.interceptDelete(mockQuery);
      }).toThrow(TenantContextMissingError);
    });

    it('should skip tenant scoping when option is set', () => {
      const mockQuery = {
        where: jest.fn().mockReturnThis(),
      };

      const result = interceptor.interceptDelete(mockQuery, {
        skipTenantScoping: true,
      });

      expect(mockQuery.where).not.toHaveBeenCalled();
      expect(result.operation).toBe(QueryOperation.DELETE);
      expect(result.tenantScopingApplied).toBe(false);
    });
  });

  describe('getTenantIdForQuery', () => {
    it('should return current tenant ID from context', () => {
      tenantContextManager.setTenantContext(testTenantId);
      const tenantId = interceptor.getTenantIdForQuery();
      expect(tenantId).toBe(testTenantId);
    });

    it('should return override tenant ID when provided', () => {
      const overrideTenantId = '660e8400-e29b-41d4-a716-446655440001';
      
      tenantContextManager.setTenantContext(testTenantId);
      const tenantId = interceptor.getTenantIdForQuery({
        tenantIdOverride: overrideTenantId,
      });
      expect(tenantId).toBe(overrideTenantId);
    });

    it('should return null when skipTenantScoping is true', () => {
      tenantContextManager.setTenantContext(testTenantId);
      const tenantId = interceptor.getTenantIdForQuery({
        skipTenantScoping: true,
      });
      expect(tenantId).toBeNull();
    });

    it('should return null when allowWithoutTenantContext is true and no context', () => {
      const tenantId = interceptor.getTenantIdForQuery({
        allowWithoutTenantContext: true,
      });
      expect(tenantId).toBeNull();
    });
  });
});
