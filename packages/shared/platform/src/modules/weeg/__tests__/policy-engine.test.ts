/**
 * Unit Tests for Policy Engine
 * 
 * Tests the core authorization logic of the WEEG module.
 * Target: 50% coverage for Week 20
 */

import { PolicyEngine } from '../policy-engine';
import {
  PermissionCheckRequest,
  Permission,
  UserRole,
  Policy,
  AbacRule,
  WeegError,
  WeegErrorCode,
} from '../types';

describe('PolicyEngine', () => {
  let policyEngine: PolicyEngine;

  beforeEach(() => {
    policyEngine = new PolicyEngine();
  });

  describe('checkPermission - RBAC', () => {
    const tenantId = 'tenant-1';
    const userId = 'user-1';
    const roleId = 'role-1';

    const userRoles: UserRole[] = [
      {
        userId,
        roleId,
        tenantId,
        assignedAt: new Date(),
      },
    ];

    const permissions: Permission[] = [
      {
        id: 'perm-1',
        name: 'user.create',
        description: 'Create users',
        createdAt: new Date(),
      },
      {
        id: 'perm-2',
        name: 'user.delete',
        description: 'Delete users',
        createdAt: new Date(),
      },
      {
        id: 'perm-3',
        name: 'document.read',
        description: 'Read documents',
        createdAt: new Date(),
      },
    ];

    const policies: Policy[] = [
      {
        id: 'policy-1',
        roleId,
        permissionId: 'perm-1',
        createdAt: new Date(),
      },
      {
        id: 'policy-2',
        roleId,
        permissionId: 'perm-3',
        createdAt: new Date(),
      },
    ];

    it('should allow action when user has direct permission', async () => {
      const request: PermissionCheckRequest = {
        tenantId,
        userId,
        action: 'user.create',
      };

      const response = await policyEngine.checkPermission(
        request,
        userRoles,
        policies,
        permissions
      );

      expect(response.allowed).toBe(true);
      expect(response.reason).toBeUndefined();
    });

    it('should deny action when user does not have permission', async () => {
      const request: PermissionCheckRequest = {
        tenantId,
        userId,
        action: 'user.delete',
      };

      const response = await policyEngine.checkPermission(
        request,
        userRoles,
        policies,
        permissions
      );

      expect(response.allowed).toBe(false);
      expect(response.reason).toContain('does not have permission');
    });

    it('should deny action when user has no roles in tenant', async () => {
      const request: PermissionCheckRequest = {
        tenantId,
        userId,
        action: 'user.create',
      };

      const response = await policyEngine.checkPermission(
        request,
        [], // No roles
        policies,
        permissions
      );

      expect(response.allowed).toBe(false);
      expect(response.reason).toBe('User has no roles in this tenant');
    });

    it('should filter roles by tenant', async () => {
      const otherTenantRoles: UserRole[] = [
        {
          userId,
          roleId: 'role-2',
          tenantId: 'tenant-2',
          assignedAt: new Date(),
        },
      ];

      const request: PermissionCheckRequest = {
        tenantId,
        userId,
        action: 'user.create',
      };

      const response = await policyEngine.checkPermission(
        request,
        otherTenantRoles,
        policies,
        permissions
      );

      expect(response.allowed).toBe(false);
      expect(response.reason).toBe('User has no roles in this tenant');
    });
  });

  describe('checkPermission - Wildcard Permissions', () => {
    const tenantId = 'tenant-1';
    const userId = 'user-1';
    const roleId = 'role-1';

    const userRoles: UserRole[] = [
      {
        userId,
        roleId,
        tenantId,
        assignedAt: new Date(),
      },
    ];

    const permissions: Permission[] = [
      {
        id: 'perm-1',
        name: 'user.*',
        description: 'All user permissions',
        createdAt: new Date(),
      },
    ];

    const policies: Policy[] = [
      {
        id: 'policy-1',
        roleId,
        permissionId: 'perm-1',
        createdAt: new Date(),
      },
    ];

    it('should allow action when user has wildcard permission', async () => {
      const request: PermissionCheckRequest = {
        tenantId,
        userId,
        action: 'user.create',
      };

      const response = await policyEngine.checkPermission(
        request,
        userRoles,
        policies,
        permissions
      );

      expect(response.allowed).toBe(true);
    });

    it('should allow multiple actions with wildcard permission', async () => {
      const actions = ['user.create', 'user.delete', 'user.update', 'user.read'];

      for (const action of actions) {
        const request: PermissionCheckRequest = {
          tenantId,
          userId,
          action,
        };

        const response = await policyEngine.checkPermission(
          request,
          userRoles,
          policies,
          permissions
        );

        expect(response.allowed).toBe(true);
      }
    });

    it('should deny action when wildcard does not match', async () => {
      const request: PermissionCheckRequest = {
        tenantId,
        userId,
        action: 'document.read',
      };

      const response = await policyEngine.checkPermission(
        request,
        userRoles,
        policies,
        permissions
      );

      expect(response.allowed).toBe(false);
    });
  });

  describe('checkPermission - Global Admin Permission', () => {
    const tenantId = 'tenant-1';
    const userId = 'user-1';
    const roleId = 'role-admin';

    const userRoles: UserRole[] = [
      {
        userId,
        roleId,
        tenantId,
        assignedAt: new Date(),
      },
    ];

    const permissions: Permission[] = [
      {
        id: 'perm-admin',
        name: '*',
        description: 'Global admin permission',
        createdAt: new Date(),
      },
    ];

    const policies: Policy[] = [
      {
        id: 'policy-admin',
        roleId,
        permissionId: 'perm-admin',
        createdAt: new Date(),
      },
    ];

    it('should allow any action with global admin permission', async () => {
      const actions = [
        'user.create',
        'document.delete',
        'system.config',
        'anything.at.all',
      ];

      for (const action of actions) {
        const request: PermissionCheckRequest = {
          tenantId,
          userId,
          action,
        };

        const response = await policyEngine.checkPermission(
          request,
          userRoles,
          policies,
          permissions
        );

        expect(response.allowed).toBe(true);
      }
    });
  });

  describe('checkPermission - Request Validation', () => {
    it('should throw error when tenantId is missing', async () => {
      const request: any = {
        userId: 'user-1',
        action: 'user.create',
      };

      await expect(
        policyEngine.checkPermission(request, [], [], [])
      ).rejects.toThrow(WeegError);

      await expect(
        policyEngine.checkPermission(request, [], [], [])
      ).rejects.toMatchObject({
        code: WeegErrorCode.INVALID_REQUEST,
        message: 'tenantId is required',
      });
    });

    it('should throw error when userId is missing', async () => {
      const request: any = {
        tenantId: 'tenant-1',
        action: 'user.create',
      };

      await expect(
        policyEngine.checkPermission(request, [], [], [])
      ).rejects.toThrow(WeegError);

      await expect(
        policyEngine.checkPermission(request, [], [], [])
      ).rejects.toMatchObject({
        code: WeegErrorCode.INVALID_REQUEST,
        message: 'userId is required',
      });
    });

    it('should throw error when action is missing', async () => {
      const request: any = {
        tenantId: 'tenant-1',
        userId: 'user-1',
      };

      await expect(
        policyEngine.checkPermission(request, [], [], [])
      ).rejects.toThrow(WeegError);

      await expect(
        policyEngine.checkPermission(request, [], [], [])
      ).rejects.toMatchObject({
        code: WeegErrorCode.INVALID_REQUEST,
        message: 'action is required',
      });
    });
  });

  describe('checkPermission - ABAC (Basic)', () => {
    const tenantId = 'tenant-1';
    const userId = 'user-1';
    const roleId = 'role-1';

    const userRoles: UserRole[] = [
      {
        userId,
        roleId,
        tenantId,
        assignedAt: new Date(),
      },
    ];

    const permissions: Permission[] = [
      {
        id: 'perm-1',
        name: 'document.read',
        description: 'Read documents',
        createdAt: new Date(),
      },
    ];

    const policies: Policy[] = [];

    const abacRules: AbacRule[] = [
      {
        id: 'rule-1',
        tenantId,
        name: 'Department-based access',
        condition: {
          'user.department': 'engineering',
        },
        permissionId: 'perm-1',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    it('should allow action when ABAC rule matches', async () => {
      const request: PermissionCheckRequest = {
        tenantId,
        userId,
        action: 'document.read',
        userAttributes: {
          department: 'engineering',
        },
      };

      const response = await policyEngine.checkPermission(
        request,
        userRoles,
        policies,
        permissions,
        abacRules
      );

      expect(response.allowed).toBe(true);
    });

    it('should deny action when ABAC rule does not match', async () => {
      const request: PermissionCheckRequest = {
        tenantId,
        userId,
        action: 'document.read',
        userAttributes: {
          department: 'sales',
        },
      };

      const response = await policyEngine.checkPermission(
        request,
        userRoles,
        policies,
        permissions,
        abacRules
      );

      expect(response.allowed).toBe(false);
    });

    it('should deny action when ABAC rule is inactive', async () => {
      const inactiveRules: AbacRule[] = [
        {
          ...abacRules[0],
          active: false,
        },
      ];

      const request: PermissionCheckRequest = {
        tenantId,
        userId,
        action: 'document.read',
        userAttributes: {
          department: 'engineering',
        },
      };

      const response = await policyEngine.checkPermission(
        request,
        userRoles,
        policies,
        permissions,
        inactiveRules
      );

      expect(response.allowed).toBe(false);
    });
  });

  describe('matchesPattern', () => {
    it('should match exact permission', () => {
      expect(policyEngine.matchesPattern('user.create', 'user.create')).toBe(
        true
      );
    });

    it('should match wildcard permission', () => {
      expect(policyEngine.matchesPattern('user.create', 'user.*')).toBe(true);
      expect(policyEngine.matchesPattern('user.delete', 'user.*')).toBe(true);
      expect(policyEngine.matchesPattern('user.update', 'user.*')).toBe(true);
    });

    it('should match global wildcard', () => {
      expect(policyEngine.matchesPattern('user.create', '*')).toBe(true);
      expect(policyEngine.matchesPattern('document.read', '*')).toBe(true);
      expect(policyEngine.matchesPattern('anything', '*')).toBe(true);
    });

    it('should not match different permission', () => {
      expect(policyEngine.matchesPattern('user.create', 'document.read')).toBe(
        false
      );
    });

    it('should not match different wildcard', () => {
      expect(policyEngine.matchesPattern('user.create', 'document.*')).toBe(
        false
      );
    });
  });

  describe('PolicyEngine Configuration', () => {
    it('should use default configuration', () => {
      const engine = new PolicyEngine();
      expect(engine).toBeDefined();
    });

    it('should accept custom configuration', () => {
      const engine = new PolicyEngine({
        enableAbac: false,
        enableCaching: false,
        cacheTtl: 600,
        enableAuditLogging: false,
      });
      expect(engine).toBeDefined();
    });

    it('should merge partial configuration with defaults', () => {
      const engine = new PolicyEngine({
        enableAbac: false,
      });
      expect(engine).toBeDefined();
    });
  });
});
