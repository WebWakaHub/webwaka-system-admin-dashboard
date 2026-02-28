/**
 * RBACService - Manages roles, permissions, and access control
 */

import { v4 as uuidv4 } from 'uuid';
import { Role, Permission } from '../types';
import { RoleNotFoundError, PermissionNotFoundError, PermissionDeniedError } from '../errors';

export class RBACService {
  private db: any;
  private eventBus: any;

  constructor(config: { database: any; eventBus: any }) {
    this.db = config.database;
    this.eventBus = config.eventBus;
  }

  /**
   * Create a new role
   */
  async createRole(tenantId: string, name: string, description?: string): Promise<Role> {
    const result = await this.db.query(
      `INSERT INTO roles (id, tenant_id, name, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [uuidv4(), tenantId, name, description || null]
    );

    const role = this.mapRole(result.rows[0]);

    await this.eventBus.emit('role.created', {
      roleId: role.id,
      tenantId: role.tenantId,
      name: role.name,
    });

    return role;
  }

  /**
   * Get role by ID
   */
  async getRoleById(tenantId: string, roleId: string): Promise<Role> {
    const result = await this.db.query(
      'SELECT * FROM roles WHERE tenant_id = $1 AND id = $2',
      [tenantId, roleId]
    );

    if (result.rows.length === 0) {
      throw new RoleNotFoundError(roleId);
    }

    return this.mapRole(result.rows[0]);
  }

  /**
   * List all roles
   */
  async listRoles(tenantId: string): Promise<Role[]> {
    const result = await this.db.query(
      'SELECT * FROM roles WHERE tenant_id = $1 ORDER BY name',
      [tenantId]
    );

    return result.rows.map((row: any) => this.mapRole(row));
  }

  /**
   * Create a new permission
   */
  async createPermission(
    tenantId: string,
    name: string,
    resource: string,
    action: string,
    description?: string
  ): Promise<Permission> {
    const result = await this.db.query(
      `INSERT INTO permissions (id, tenant_id, name, resource, action, description, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
       RETURNING *`,
      [uuidv4(), tenantId, name, resource, action, description || null]
    );

    const permission = this.mapPermission(result.rows[0]);

    await this.eventBus.emit('permission.created', {
      permissionId: permission.id,
      tenantId: permission.tenantId,
      name: permission.name,
    });

    return permission;
  }

  /**
   * Assign a role to a user
   */
  async assignRoleToUser(tenantId: string, userId: string, roleId: string): Promise<void> {
    // Verify role exists
    await this.getRoleById(tenantId, roleId);

    // Assign role
    await this.db.query(
      `INSERT INTO user_roles (user_id, role_id, assigned_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (user_id, role_id) DO NOTHING`,
      [userId, roleId]
    );

    await this.eventBus.emit('user.role.assigned', {
      userId,
      roleId,
      tenantId,
    });
  }

  /**
   * Remove a role from a user
   */
  async removeRoleFromUser(tenantId: string, userId: string, roleId: string): Promise<void> {
    await this.db.query(
      'DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2',
      [userId, roleId]
    );

    await this.eventBus.emit('user.role.removed', {
      userId,
      roleId,
      tenantId,
    });
  }

  /**
   * Grant a permission to a role
   */
  async grantPermissionToRole(
    tenantId: string,
    roleId: string,
    permissionId: string
  ): Promise<void> {
    // Verify role and permission exist
    await this.getRoleById(tenantId, roleId);
    await this.getPermissionById(tenantId, permissionId);

    // Grant permission
    await this.db.query(
      `INSERT INTO role_permissions (role_id, permission_id, granted_at)
       VALUES ($1, $2, NOW())
       ON CONFLICT (role_id, permission_id) DO NOTHING`,
      [roleId, permissionId]
    );

    await this.eventBus.emit('role.permission.granted', {
      roleId,
      permissionId,
      tenantId,
    });
  }

  /**
   * Revoke a permission from a role
   */
  async revokePermissionFromRole(
    tenantId: string,
    roleId: string,
    permissionId: string
  ): Promise<void> {
    await this.db.query(
      'DELETE FROM role_permissions WHERE role_id = $1 AND permission_id = $2',
      [roleId, permissionId]
    );

    await this.eventBus.emit('role.permission.revoked', {
      roleId,
      permissionId,
      tenantId,
    });
  }

  /**
   * Check if a user has a specific permission
   */
  async hasPermission(
    tenantId: string,
    userId: string,
    resource: string,
    action: string
  ): Promise<boolean> {
    const result = await this.db.query(
      `SELECT COUNT(*) as count FROM permissions p
       JOIN role_permissions rp ON p.id = rp.permission_id
       JOIN user_roles ur ON rp.role_id = ur.role_id
       WHERE ur.user_id = $1 AND p.tenant_id = $2 
       AND p.resource = $3 AND p.action = $4`,
      [userId, tenantId, resource, action]
    );

    return parseInt(result.rows[0].count) > 0;
  }

  /**
   * Enforce permission check (throws if denied)
   */
  async enforcePermission(
    tenantId: string,
    userId: string,
    resource: string,
    action: string
  ): Promise<void> {
    const hasPermission = await this.hasPermission(tenantId, userId, resource, action);

    if (!hasPermission) {
      throw new PermissionDeniedError(`${action} on ${resource}`);
    }
  }

  /**
   * Get permission by ID
   */
  private async getPermissionById(tenantId: string, permissionId: string): Promise<Permission> {
    const result = await this.db.query(
      'SELECT * FROM permissions WHERE tenant_id = $1 AND id = $2',
      [tenantId, permissionId]
    );

    if (result.rows.length === 0) {
      throw new PermissionNotFoundError(permissionId);
    }

    return this.mapPermission(result.rows[0]);
  }

  /**
   * Map database role to Role type
   */
  private mapRole(dbRole: any): Role {
    return {
      id: dbRole.id,
      tenantId: dbRole.tenant_id,
      name: dbRole.name,
      description: dbRole.description,
      createdAt: dbRole.created_at,
      updatedAt: dbRole.updated_at,
    };
  }

  /**
   * Map database permission to Permission type
   */
  private mapPermission(dbPermission: any): Permission {
    return {
      id: dbPermission.id,
      tenantId: dbPermission.tenant_id,
      name: dbPermission.name,
      description: dbPermission.description,
      resource: dbPermission.resource,
      action: dbPermission.action,
      createdAt: dbPermission.created_at,
      updatedAt: dbPermission.updated_at,
    };
  }
}
