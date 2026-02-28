/**
 * Unit Tests: Tenant Validator
 * 
 * Tests for tenant access permission validation.
 * Week 17 - 50% coverage target (permission validation tests only)
 * 
 * @module Multi-Tenant Data Scoping Tests
 * @author webwakaagent5
 * @date 2026-02-09
 */

import {
  TenantValidator,
  TenantPermission,
  TenantAccessDeniedError,
  tenantValidator,
} from '../../../src/core/multi-tenant/tenant-validator';
import { tenantContextManager } from '../../../src/core/multi-tenant/tenant-context.manager';

describe('TenantValidator', () => {
  let validator: TenantValidator;
  const testTenantId = '550e8400-e29b-41d4-a716-446655440000';
  const otherTenantId = '660e8400-e29b-41d4-a716-446655440001';

  beforeEach(() => {
    validator = TenantValidator.getInstance();
    tenantContextManager.clearTenantContext();
  });

  afterEach(() => {
    tenantContextManager.clearTenantContext();
  });

  describe('Singleton Pattern', () => {
    it('should return the same instance', () => {
      const instance1 = TenantValidator.getInstance();
      const instance2 = TenantValidator.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('should export singleton instance', () => {
      expect(tenantValidator).toBe(validator);
    });
  });

  describe('validateTenantAccess - Same Tenant', () => {
    beforeEach(() => {
      tenantContextManager.setTenantContext(testTenantId);
    });

    it('should grant access for same tenant with READ permission', () => {
      const result = validator.validateTenantAccess(
        testTenantId,
        TenantPermission.READ,
        [TenantPermission.READ]
      );

      expect(result.granted).toBe(true);
      expect(result.tenantId).toBe(testTenantId);
      expect(result.permission).toBe(TenantPermission.READ);
    });

    it('should grant access for same tenant with WRITE permission', () => {
      const result = validator.validateTenantAccess(
        testTenantId,
        TenantPermission.WRITE,
        [TenantPermission.WRITE]
      );

      expect(result.granted).toBe(true);
    });

    it('should grant access for same tenant with ADMIN permission', () => {
      const result = validator.validateTenantAccess(
        testTenantId,
        TenantPermission.ADMIN,
        [TenantPermission.ADMIN]
      );

      expect(result.granted).toBe(true);
    });

    it('should deny access for same tenant without required permission', () => {
      const result = validator.validateTenantAccess(
        testTenantId,
        TenantPermission.WRITE,
        [TenantPermission.READ]
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('does not have WRITE permission');
    });
  });

  describe('validateTenantAccess - Platform Admin', () => {
    beforeEach(() => {
      tenantContextManager.setTenantContext(testTenantId);
    });

    it('should grant access to any tenant for platform admin', () => {
      const result = validator.validateTenantAccess(
        otherTenantId,
        TenantPermission.READ,
        [TenantPermission.PLATFORM_ADMIN]
      );

      expect(result.granted).toBe(true);
      expect(result.tenantId).toBe(otherTenantId);
    });

    it('should grant access to same tenant for platform admin', () => {
      const result = validator.validateTenantAccess(
        testTenantId,
        TenantPermission.WRITE,
        [TenantPermission.PLATFORM_ADMIN]
      );

      expect(result.granted).toBe(true);
    });
  });

  describe('validateTenantAccess - Cross-Tenant', () => {
    beforeEach(() => {
      tenantContextManager.setTenantContext(testTenantId);
    });

    it('should grant cross-tenant READ access with CROSS_TENANT_READ permission', () => {
      const result = validator.validateTenantAccess(
        otherTenantId,
        TenantPermission.CROSS_TENANT_READ,
        [TenantPermission.CROSS_TENANT_READ]
      );

      expect(result.granted).toBe(true);
      expect(result.tenantId).toBe(otherTenantId);
    });

    it('should deny cross-tenant READ access without CROSS_TENANT_READ permission', () => {
      const result = validator.validateTenantAccess(
        otherTenantId,
        TenantPermission.CROSS_TENANT_READ,
        [TenantPermission.READ]
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('does not have CROSS_TENANT_READ permission');
    });

    it('should deny cross-tenant WRITE access', () => {
      const result = validator.validateTenantAccess(
        otherTenantId,
        TenantPermission.WRITE,
        [TenantPermission.WRITE]
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Cross-tenant WRITE access is not allowed');
    });

    it('should deny cross-tenant ADMIN access', () => {
      const result = validator.validateTenantAccess(
        otherTenantId,
        TenantPermission.ADMIN,
        [TenantPermission.ADMIN]
      );

      expect(result.granted).toBe(false);
      expect(result.reason).toContain('Cross-tenant ADMIN access is not allowed');
    });
  });

  describe('assertTenantAccess', () => {
    beforeEach(() => {
      tenantContextManager.setTenantContext(testTenantId);
    });

    it('should not throw error when access is granted', () => {
      expect(() => {
        validator.assertTenantAccess(
          testTenantId,
          TenantPermission.READ,
          [TenantPermission.READ]
        );
      }).not.toThrow();
    });

    it('should throw TenantAccessDeniedError when access is denied', () => {
      expect(() => {
        validator.assertTenantAccess(
          testTenantId,
          TenantPermission.WRITE,
          [TenantPermission.READ]
        );
      }).toThrow(TenantAccessDeniedError);
    });

    it('should include denial reason in error', () => {
      try {
        validator.assertTenantAccess(
          otherTenantId,
          TenantPermission.WRITE,
          [TenantPermission.WRITE]
        );
        fail('Should have thrown TenantAccessDeniedError');
      } catch (error) {
        expect(error).toBeInstanceOf(TenantAccessDeniedError);
        expect((error as TenantAccessDeniedError).message).toContain('Cross-tenant');
        expect((error as TenantAccessDeniedError).tenantId).toBe(otherTenantId);
        expect((error as TenantAccessDeniedError).permission).toBe(TenantPermission.WRITE);
      }
    });
  });

  describe('validateCurrentTenant', () => {
    beforeEach(() => {
      tenantContextManager.setTenantContext(testTenantId);
    });

    it('should not throw error when tenant matches current context', () => {
      expect(() => {
        validator.validateCurrentTenant(testTenantId);
      }).not.toThrow();
    });

    it('should throw error when tenant does not match current context', () => {
      expect(() => {
        validator.validateCurrentTenant(otherTenantId);
      }).toThrow(TenantAccessDeniedError);
    });

    it('should include mismatch details in error', () => {
      try {
        validator.validateCurrentTenant(otherTenantId);
        fail('Should have thrown TenantAccessDeniedError');
      } catch (error) {
        expect(error).toBeInstanceOf(TenantAccessDeniedError);
        expect((error as TenantAccessDeniedError).message).toContain('Tenant context mismatch');
        expect((error as TenantAccessDeniedError).message).toContain(testTenantId);
        expect((error as TenantAccessDeniedError).message).toContain(otherTenantId);
      }
    });
  });

  describe('isPlatformAdmin', () => {
    it('should return true for platform admin', () => {
      const result = validator.isPlatformAdmin([TenantPermission.PLATFORM_ADMIN]);
      expect(result).toBe(true);
    });

    it('should return false for non-platform admin', () => {
      const result = validator.isPlatformAdmin([TenantPermission.ADMIN]);
      expect(result).toBe(false);
    });

    it('should return false for empty permissions', () => {
      const result = validator.isPlatformAdmin([]);
      expect(result).toBe(false);
    });
  });

  describe('isTenantAdmin', () => {
    it('should return true for tenant admin', () => {
      const result = validator.isTenantAdmin([TenantPermission.ADMIN]);
      expect(result).toBe(true);
    });

    it('should return true for platform admin', () => {
      const result = validator.isTenantAdmin([TenantPermission.PLATFORM_ADMIN]);
      expect(result).toBe(true);
    });

    it('should return false for non-admin', () => {
      const result = validator.isTenantAdmin([TenantPermission.WRITE]);
      expect(result).toBe(false);
    });

    it('should return false for empty permissions', () => {
      const result = validator.isTenantAdmin([]);
      expect(result).toBe(false);
    });
  });

  describe('Permission Hierarchy', () => {
    beforeEach(() => {
      tenantContextManager.setTenantContext(testTenantId);
    });

    it('should grant READ permission when user has WRITE permission', () => {
      const result = validator.validateTenantAccess(
        testTenantId,
        TenantPermission.READ,
        [TenantPermission.WRITE]
      );

      expect(result.granted).toBe(true);
    });

    it('should grant READ and WRITE permissions when user has ADMIN permission', () => {
      const readResult = validator.validateTenantAccess(
        testTenantId,
        TenantPermission.READ,
        [TenantPermission.ADMIN]
      );
      const writeResult = validator.validateTenantAccess(
        testTenantId,
        TenantPermission.WRITE,
        [TenantPermission.ADMIN]
      );

      expect(readResult.granted).toBe(true);
      expect(writeResult.granted).toBe(true);
    });

    it('should grant all tenant-level permissions for PLATFORM_ADMIN', () => {
      const permissions = [TenantPermission.PLATFORM_ADMIN];

      const readResult = validator.validateTenantAccess(
        testTenantId,
        TenantPermission.READ,
        permissions
      );
      const writeResult = validator.validateTenantAccess(
        testTenantId,
        TenantPermission.WRITE,
        permissions
      );
      const adminResult = validator.validateTenantAccess(
        testTenantId,
        TenantPermission.ADMIN,
        permissions
      );

      expect(readResult.granted).toBe(true);
      expect(writeResult.granted).toBe(true);
      expect(adminResult.granted).toBe(true);
    });
  });

  describe('getAccessibleTenantIds', () => {
    beforeEach(() => {
      tenantContextManager.setTenantContext(testTenantId);
    });

    it('should return current tenant ID for regular user', () => {
      const tenantIds = validator.getAccessibleTenantIds([TenantPermission.READ]);
      expect(tenantIds).toEqual([testTenantId]);
    });

    it('should return empty array for platform admin (requires separate query)', () => {
      const tenantIds = validator.getAccessibleTenantIds([TenantPermission.PLATFORM_ADMIN]);
      expect(tenantIds).toEqual([]);
    });

    it('should return empty array when no tenant context', () => {
      tenantContextManager.clearTenantContext();
      const tenantIds = validator.getAccessibleTenantIds([TenantPermission.READ]);
      expect(tenantIds).toEqual([]);
    });
  });
});
