/**
 * Unit Tests for Permission Service
 * 
 * Tests the business logic layer of the WEEG module.
 * Target: 50% coverage for Week 20
 */

import { PermissionService, PermissionRepository, PermissionCache } from '../permission.service';
import {
  PermissionCheckRequest,
  Permission,
  Role,
  UserRole,
  Policy,
  AbacRule,
  PermissionAuditLog,
  CachedPermissions,
  PermissionCacheKey,
  WeegError,
  WeegErrorCode,
} from '../types';

// Mock Repository
class MockPermissionRepository implements PermissionRepository {
  private roles: Map<string, Role> = new Map();
  private permissions: Map<string, Permission> = new Map();
  private policies: Map<string, Policy> = new Map();
  private userRoles: Map<string, UserRole[]> = new Map();
  private abacRules: Map<string, AbacRule[]> = new Map();
  private auditLogs: PermissionAuditLog[] = [];

  async getRoleById(roleId: string, tenantId: string): Promise<Role | null> {
    const role = this.roles.get(roleId);
    if (role && role.tenantId === tenantId) {
      return role;
    }
    return null;
  }

  async getRolesByTenant(tenantId: string): Promise<Role[]> {
    return Array.from(this.roles.values()).filter(r => r.tenantId === tenantId);
  }

  async createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    const newRole: Role = {
      ...role,
      id: `role-${this.roles.size + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.roles.set(newRole.id, newRole);
    return newRole;
  }

  async updateRole(roleId: string, tenantId: string, updates: Partial<Role>): Promise<Role> {
    const role = await this.getRoleById(roleId, tenantId);
    if (!role) {
      throw new Error('Role not found');
    }
    const updatedRole = { ...role, ...updates, updatedAt: new Date() };
    this.roles.set(roleId, updatedRole);
    return updatedRole;
  }

  async deleteRole(roleId: string, tenantId: string): Promise<void> {
    this.roles.delete(roleId);
  }

  async getPermissionById(permissionId: string): Promise<Permission | null> {
    return this.permissions.get(permissionId) || null;
  }

  async getPermissionByName(name: string): Promise<Permission | null> {
    return Array.from(this.permissions.values()).find(p => p.name === name) || null;
  }

  async getAllPermissions(): Promise<Permission[]> {
    return Array.from(this.permissions.values());
  }

  async createPermission(permission: Omit<Permission, 'id' | 'createdAt'>): Promise<Permission> {
    const newPermission: Permission = {
      ...permission,
      id: `perm-${this.permissions.size + 1}`,
      createdAt: new Date(),
    };
    this.permissions.set(newPermission.id, newPermission);
    return newPermission;
  }

  async getPoliciesByRoleIds(roleIds: string[]): Promise<Policy[]> {
    return Array.from(this.policies.values()).filter(p => roleIds.includes(p.roleId));
  }

  async createPolicy(policy: Omit<Policy, 'id' | 'createdAt'>): Promise<Policy> {
    const newPolicy: Policy = {
      ...policy,
      id: `policy-${this.policies.size + 1}`,
      createdAt: new Date(),
    };
    this.policies.set(newPolicy.id, newPolicy);
    return newPolicy;
  }

  async deletePolicy(policyId: string): Promise<void> {
    this.policies.delete(policyId);
  }

  async getUserRoles(userId: string, tenantId: string): Promise<UserRole[]> {
    const key = `${userId}:${tenantId}`;
    return this.userRoles.get(key) || [];
  }

  async assignRoleToUser(userId: string, roleId: string, tenantId: string): Promise<UserRole> {
    const userRole: UserRole = {
      userId,
      roleId,
      tenantId,
      assignedAt: new Date(),
    };
    const key = `${userId}:${tenantId}`;
    const existing = this.userRoles.get(key) || [];
    this.userRoles.set(key, [...existing, userRole]);
    return userRole;
  }

  async removeRoleFromUser(userId: string, roleId: string, tenantId: string): Promise<void> {
    const key = `${userId}:${tenantId}`;
    const existing = this.userRoles.get(key) || [];
    this.userRoles.set(key, existing.filter(ur => ur.roleId !== roleId));
  }

  async getAbacRulesByTenant(tenantId: string): Promise<AbacRule[]> {
    return this.abacRules.get(tenantId) || [];
  }

  async createAbacRule(rule: Omit<AbacRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AbacRule> {
    const newRule: AbacRule = {
      ...rule,
      id: `rule-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const existing = this.abacRules.get(rule.tenantId) || [];
    this.abacRules.set(rule.tenantId, [...existing, newRule]);
    return newRule;
  }

  async updateAbacRule(ruleId: string, tenantId: string, updates: Partial<AbacRule>): Promise<AbacRule> {
    const rules = this.abacRules.get(tenantId) || [];
    const ruleIndex = rules.findIndex(r => r.id === ruleId);
    if (ruleIndex === -1) {
      throw new Error('Rule not found');
    }
    const updatedRule = { ...rules[ruleIndex], ...updates, updatedAt: new Date() };
    rules[ruleIndex] = updatedRule;
    this.abacRules.set(tenantId, rules);
    return updatedRule;
  }

  async deleteAbacRule(ruleId: string, tenantId: string): Promise<void> {
    const rules = this.abacRules.get(tenantId) || [];
    this.abacRules.set(tenantId, rules.filter(r => r.id !== ruleId));
  }

  async createAuditLog(log: Omit<PermissionAuditLog, 'id' | 'timestamp'>): Promise<PermissionAuditLog> {
    const newLog: PermissionAuditLog = {
      ...log,
      id: `log-${this.auditLogs.length + 1}`,
      timestamp: new Date(),
    };
    this.auditLogs.push(newLog);
    return newLog;
  }

  // Helper methods for testing
  addPermission(permission: Permission): void {
    this.permissions.set(permission.id, permission);
  }

  addRole(role: Role): void {
    this.roles.set(role.id, role);
  }

  addPolicy(policy: Policy): void {
    this.policies.set(policy.id, policy);
  }

  addUserRole(userRole: UserRole): void {
    const key = `${userRole.userId}:${userRole.tenantId}`;
    const existing = this.userRoles.get(key) || [];
    this.userRoles.set(key, [...existing, userRole]);
  }

  getAuditLogs(): PermissionAuditLog[] {
    return this.auditLogs;
  }
}

// Mock Cache
class MockPermissionCache implements PermissionCache {
  private cache: Map<string, CachedPermissions> = new Map();

  private getCacheKey(key: PermissionCacheKey): string {
    return `${key.tenantId}:${key.userId}${key.action ? ':' + key.action : ''}`;
  }

  async get(key: PermissionCacheKey): Promise<CachedPermissions | null> {
    return this.cache.get(this.getCacheKey(key)) || null;
  }

  async set(key: PermissionCacheKey, value: CachedPermissions, ttl: number): Promise<void> {
    this.cache.set(this.getCacheKey(key), value);
  }

  async invalidate(key: PermissionCacheKey): Promise<void> {
    this.cache.delete(this.getCacheKey(key));
  }

  async invalidateUser(userId: string, tenantId: string): Promise<void> {
    const prefix = `${tenantId}:${userId}`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
  }

  async invalidateTenant(tenantId: string): Promise<void> {
    for (const key of this.cache.keys()) {
      if (key.startsWith(tenantId)) {
        this.cache.delete(key);
      }
    }
  }
}

describe('PermissionService', () => {
  let service: PermissionService;
  let repository: MockPermissionRepository;
  let cache: MockPermissionCache;

  beforeEach(() => {
    repository = new MockPermissionRepository();
    cache = new MockPermissionCache();
    service = new PermissionService(repository, cache);
  });

  describe('checkPermission', () => {
    const tenantId = 'tenant-1';
    const userId = 'user-1';
    const roleId = 'role-1';

    beforeEach(() => {
      // Set up test data
      const role: Role = {
        id: roleId,
        tenantId,
        name: 'Test Role',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repository.addRole(role);

      const permission: Permission = {
        id: 'perm-1',
        name: 'user.create',
        description: 'Create users',
        createdAt: new Date(),
      };
      repository.addPermission(permission);

      const policy: Policy = {
        id: 'policy-1',
        roleId,
        permissionId: 'perm-1',
        createdAt: new Date(),
      };
      repository.addPolicy(policy);

      const userRole: UserRole = {
        userId,
        roleId,
        tenantId,
        assignedAt: new Date(),
      };
      repository.addUserRole(userRole);
    });

    it('should allow action when user has permission', async () => {
      const request: PermissionCheckRequest = {
        tenantId,
        userId,
        action: 'user.create',
      };

      const response = await service.checkPermission(request);

      expect(response.allowed).toBe(true);
      expect(response.reason).toBeUndefined();
    });

    it('should deny action when user does not have permission', async () => {
      const request: PermissionCheckRequest = {
        tenantId,
        userId,
        action: 'user.delete',
      };

      const response = await service.checkPermission(request);

      expect(response.allowed).toBe(false);
      expect(response.reason).toContain('does not have permission');
    });

    it('should deny action when user has no roles', async () => {
      const request: PermissionCheckRequest = {
        tenantId,
        userId: 'user-without-roles',
        action: 'user.create',
      };

      const response = await service.checkPermission(request);

      expect(response.allowed).toBe(false);
      expect(response.reason).toBe('User has no roles in this tenant');
    });

    it('should create audit log when audit logging is enabled', async () => {
      const request: PermissionCheckRequest = {
        tenantId,
        userId,
        action: 'user.create',
      };

      await service.checkPermission(request);

      const auditLogs = repository.getAuditLogs();
      expect(auditLogs.length).toBeGreaterThan(0);
      expect(auditLogs[0].action).toBe('permission.check');
      expect(auditLogs[0].actorId).toBe(userId);
    });
  });

  describe('createRole', () => {
    const tenantId = 'tenant-1';
    const actorId = 'admin-1';

    it('should create a new role', async () => {
      const role = await service.createRole(
        tenantId,
        'Test Role',
        'A test role',
        actorId
      );

      expect(role.id).toBeDefined();
      expect(role.tenantId).toBe(tenantId);
      expect(role.name).toBe('Test Role');
      expect(role.description).toBe('A test role');
    });

    it('should create audit log for role creation', async () => {
      await service.createRole(
        tenantId,
        'Test Role',
        'A test role',
        actorId
      );

      const auditLogs = repository.getAuditLogs();
      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].action).toBe('role.created');
      expect(auditLogs[0].entityType).toBe('role');
    });
  });

  describe('assignPermissionToRole', () => {
    const tenantId = 'tenant-1';
    const actorId = 'admin-1';
    const roleId = 'role-1';
    const permissionId = 'perm-1';

    beforeEach(() => {
      const role: Role = {
        id: roleId,
        tenantId,
        name: 'Test Role',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repository.addRole(role);

      const permission: Permission = {
        id: permissionId,
        name: 'user.create',
        description: 'Create users',
        createdAt: new Date(),
      };
      repository.addPermission(permission);
    });

    it('should assign permission to role', async () => {
      const policy = await service.assignPermissionToRole(
        roleId,
        permissionId,
        tenantId,
        actorId
      );

      expect(policy.id).toBeDefined();
      expect(policy.roleId).toBe(roleId);
      expect(policy.permissionId).toBe(permissionId);
    });

    it('should throw error when role not found', async () => {
      await expect(
        service.assignPermissionToRole(
          'non-existent-role',
          permissionId,
          tenantId,
          actorId
        )
      ).rejects.toThrow(WeegError);

      await expect(
        service.assignPermissionToRole(
          'non-existent-role',
          permissionId,
          tenantId,
          actorId
        )
      ).rejects.toMatchObject({
        code: WeegErrorCode.ROLE_NOT_FOUND,
      });
    });

    it('should throw error when permission not found', async () => {
      await expect(
        service.assignPermissionToRole(
          roleId,
          'non-existent-permission',
          tenantId,
          actorId
        )
      ).rejects.toThrow(WeegError);

      await expect(
        service.assignPermissionToRole(
          roleId,
          'non-existent-permission',
          tenantId,
          actorId
        )
      ).rejects.toMatchObject({
        code: WeegErrorCode.PERMISSION_NOT_FOUND,
      });
    });

    it('should create audit log for permission assignment', async () => {
      await service.assignPermissionToRole(
        roleId,
        permissionId,
        tenantId,
        actorId
      );

      const auditLogs = repository.getAuditLogs();
      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].action).toBe('permission.assigned');
      expect(auditLogs[0].entityType).toBe('policy');
    });
  });

  describe('assignRoleToUser', () => {
    const tenantId = 'tenant-1';
    const userId = 'user-1';
    const roleId = 'role-1';
    const actorId = 'admin-1';

    beforeEach(() => {
      const role: Role = {
        id: roleId,
        tenantId,
        name: 'Test Role',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      repository.addRole(role);
    });

    it('should assign role to user', async () => {
      const userRole = await service.assignRoleToUser(
        userId,
        roleId,
        tenantId,
        actorId
      );

      expect(userRole.userId).toBe(userId);
      expect(userRole.roleId).toBe(roleId);
      expect(userRole.tenantId).toBe(tenantId);
    });

    it('should throw error when role not found', async () => {
      await expect(
        service.assignRoleToUser(
          userId,
          'non-existent-role',
          tenantId,
          actorId
        )
      ).rejects.toThrow(WeegError);

      await expect(
        service.assignRoleToUser(
          userId,
          'non-existent-role',
          tenantId,
          actorId
        )
      ).rejects.toMatchObject({
        code: WeegErrorCode.ROLE_NOT_FOUND,
      });
    });

    it('should create audit log for role assignment', async () => {
      await service.assignRoleToUser(
        userId,
        roleId,
        tenantId,
        actorId
      );

      const auditLogs = repository.getAuditLogs();
      expect(auditLogs.length).toBe(1);
      expect(auditLogs[0].action).toBe('role.assigned');
      expect(auditLogs[0].entityType).toBe('user_role');
    });
  });
});
