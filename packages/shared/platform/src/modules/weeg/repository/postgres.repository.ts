/**
 * WEEG (Permission System) - PostgreSQL Repository
 * 
 * Implements the PermissionRepository interface using PostgreSQL.
 * Provides data access methods for roles, permissions, policies, and audit logs.
 * 
 * @module weeg/repository/postgres-repository
 */

import { Pool, PoolClient } from 'pg';
import {
  Role,
  Permission,
  Policy,
  UserRole,
  AbacRule,
  PermissionAuditLog,
  WeegError,
  WeegErrorCode,
} from '../types';
import { PermissionRepository } from '../permission.service';

/**
 * PostgreSQL Repository Configuration
 */
export interface PostgresRepositoryConfig {
  /** PostgreSQL connection pool */
  pool: Pool;
  
  /** Schema name (default: 'weeg') */
  schema?: string;
}

/**
 * PostgreSQL Repository Implementation
 * 
 * Implements all data access methods for the WEEG module using PostgreSQL.
 */
export class PostgresRepository implements PermissionRepository {
  private pool: Pool;
  private schema: string;

  constructor(config: PostgresRepositoryConfig) {
    this.pool = config.pool;
    this.schema = config.schema || 'weeg';
  }

  // ==================== Role Operations ====================

  async getRoleById(roleId: string, tenantId: string): Promise<Role | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${this.schema}.roles WHERE id = $1 AND tenant_id = $2`,
        [roleId, tenantId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToRole(result.rows[0]);
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to get role by ID',
        { roleId, tenantId, error }
      );
    }
  }

  async getRolesByTenant(tenantId: string): Promise<Role[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${this.schema}.roles WHERE tenant_id = $1 ORDER BY name`,
        [tenantId]
      );

      return result.rows.map(row => this.mapRowToRole(row));
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to get roles by tenant',
        { tenantId, error }
      );
    }
  }

  async createRole(role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>): Promise<Role> {
    try {
      const result = await this.pool.query(
        `INSERT INTO ${this.schema}.roles (tenant_id, name, description, created_at, updated_at)
         VALUES ($1, $2, $3, NOW(), NOW())
         RETURNING *`,
        [role.tenantId, role.name, role.description || null]
      );

      return this.mapRowToRole(result.rows[0]);
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to create role',
        { role, error }
      );
    }
  }

  async updateRole(roleId: string, tenantId: string, updates: Partial<Role>): Promise<Role> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        setClauses.push(`name = $${paramIndex++}`);
        values.push(updates.name);
      }

      if (updates.description !== undefined) {
        setClauses.push(`description = $${paramIndex++}`);
        values.push(updates.description);
      }

      setClauses.push(`updated_at = NOW()`);

      values.push(roleId, tenantId);

      const result = await this.pool.query(
        `UPDATE ${this.schema}.roles
         SET ${setClauses.join(', ')}
         WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new WeegError(
          WeegErrorCode.ROLE_NOT_FOUND,
          `Role not found: ${roleId}`
        );
      }

      return this.mapRowToRole(result.rows[0]);
    } catch (error) {
      if (error instanceof WeegError) {
        throw error;
      }
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to update role',
        { roleId, tenantId, updates, error }
      );
    }
  }

  async deleteRole(roleId: string, tenantId: string): Promise<void> {
    try {
      await this.pool.query(
        `DELETE FROM ${this.schema}.roles WHERE id = $1 AND tenant_id = $2`,
        [roleId, tenantId]
      );
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to delete role',
        { roleId, tenantId, error }
      );
    }
  }

  // ==================== Permission Operations ====================

  async getPermissionById(permissionId: string): Promise<Permission | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${this.schema}.permissions WHERE id = $1`,
        [permissionId]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToPermission(result.rows[0]);
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to get permission by ID',
        { permissionId, error }
      );
    }
  }

  async getPermissionByName(name: string): Promise<Permission | null> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${this.schema}.permissions WHERE name = $1`,
        [name]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return this.mapRowToPermission(result.rows[0]);
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to get permission by name',
        { name, error }
      );
    }
  }

  async getAllPermissions(): Promise<Permission[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${this.schema}.permissions ORDER BY name`
      );

      return result.rows.map(row => this.mapRowToPermission(row));
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to get all permissions',
        { error }
      );
    }
  }

  async createPermission(permission: Omit<Permission, 'id' | 'createdAt'>): Promise<Permission> {
    try {
      const result = await this.pool.query(
        `INSERT INTO ${this.schema}.permissions (name, description, created_at)
         VALUES ($1, $2, NOW())
         RETURNING *`,
        [permission.name, permission.description || null]
      );

      return this.mapRowToPermission(result.rows[0]);
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to create permission',
        { permission, error }
      );
    }
  }

  // ==================== Policy Operations ====================

  async getPoliciesByRoleIds(roleIds: string[]): Promise<Policy[]> {
    try {
      if (roleIds.length === 0) {
        return [];
      }

      const result = await this.pool.query(
        `SELECT * FROM ${this.schema}.policies WHERE role_id = ANY($1)`,
        [roleIds]
      );

      return result.rows.map(row => this.mapRowToPolicy(row));
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to get policies by role IDs',
        { roleIds, error }
      );
    }
  }

  async createPolicy(policy: Omit<Policy, 'id' | 'createdAt'>): Promise<Policy> {
    try {
      const result = await this.pool.query(
        `INSERT INTO ${this.schema}.policies (role_id, permission_id, created_at)
         VALUES ($1, $2, NOW())
         RETURNING *`,
        [policy.roleId, policy.permissionId]
      );

      return this.mapRowToPolicy(result.rows[0]);
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to create policy',
        { policy, error }
      );
    }
  }

  async deletePolicy(policyId: string): Promise<void> {
    try {
      await this.pool.query(
        `DELETE FROM ${this.schema}.policies WHERE id = $1`,
        [policyId]
      );
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to delete policy',
        { policyId, error }
      );
    }
  }

  // ==================== User Role Operations ====================

  async getUserRoles(userId: string, tenantId: string): Promise<UserRole[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${this.schema}.user_roles WHERE user_id = $1 AND tenant_id = $2`,
        [userId, tenantId]
      );

      return result.rows.map(row => this.mapRowToUserRole(row));
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to get user roles',
        { userId, tenantId, error }
      );
    }
  }

  async assignRoleToUser(userId: string, roleId: string, tenantId: string): Promise<UserRole> {
    try {
      const result = await this.pool.query(
        `INSERT INTO ${this.schema}.user_roles (user_id, role_id, tenant_id, assigned_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, role_id, tenant_id) DO NOTHING
         RETURNING *`,
        [userId, roleId, tenantId]
      );

      if (result.rows.length === 0) {
        // Role already assigned, fetch it
        const existingResult = await this.pool.query(
          `SELECT * FROM ${this.schema}.user_roles WHERE user_id = $1 AND role_id = $2 AND tenant_id = $3`,
          [userId, roleId, tenantId]
        );
        return this.mapRowToUserRole(existingResult.rows[0]);
      }

      return this.mapRowToUserRole(result.rows[0]);
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to assign role to user',
        { userId, roleId, tenantId, error }
      );
    }
  }

  async removeRoleFromUser(userId: string, roleId: string, tenantId: string): Promise<void> {
    try {
      await this.pool.query(
        `DELETE FROM ${this.schema}.user_roles WHERE user_id = $1 AND role_id = $2 AND tenant_id = $3`,
        [userId, roleId, tenantId]
      );
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to remove role from user',
        { userId, roleId, tenantId, error }
      );
    }
  }

  // ==================== ABAC Rule Operations ====================

  async getAbacRulesByTenant(tenantId: string): Promise<AbacRule[]> {
    try {
      const result = await this.pool.query(
        `SELECT * FROM ${this.schema}.abac_rules WHERE tenant_id = $1 AND active = true`,
        [tenantId]
      );

      return result.rows.map(row => this.mapRowToAbacRule(row));
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to get ABAC rules by tenant',
        { tenantId, error }
      );
    }
  }

  async createAbacRule(rule: Omit<AbacRule, 'id' | 'createdAt' | 'updatedAt'>): Promise<AbacRule> {
    try {
      const result = await this.pool.query(
        `INSERT INTO ${this.schema}.abac_rules (tenant_id, name, condition, permission_id, active, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
         RETURNING *`,
        [rule.tenantId, rule.name, JSON.stringify(rule.condition), rule.permissionId, rule.active]
      );

      return this.mapRowToAbacRule(result.rows[0]);
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to create ABAC rule',
        { rule, error }
      );
    }
  }

  async updateAbacRule(ruleId: string, tenantId: string, updates: Partial<AbacRule>): Promise<AbacRule> {
    try {
      const setClauses: string[] = [];
      const values: any[] = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        setClauses.push(`name = $${paramIndex++}`);
        values.push(updates.name);
      }

      if (updates.condition !== undefined) {
        setClauses.push(`condition = $${paramIndex++}`);
        values.push(JSON.stringify(updates.condition));
      }

      if (updates.active !== undefined) {
        setClauses.push(`active = $${paramIndex++}`);
        values.push(updates.active);
      }

      setClauses.push(`updated_at = NOW()`);

      values.push(ruleId, tenantId);

      const result = await this.pool.query(
        `UPDATE ${this.schema}.abac_rules
         SET ${setClauses.join(', ')}
         WHERE id = $${paramIndex++} AND tenant_id = $${paramIndex++}
         RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        throw new WeegError(
          WeegErrorCode.POLICY_NOT_FOUND,
          `ABAC rule not found: ${ruleId}`
        );
      }

      return this.mapRowToAbacRule(result.rows[0]);
    } catch (error) {
      if (error instanceof WeegError) {
        throw error;
      }
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to update ABAC rule',
        { ruleId, tenantId, updates, error }
      );
    }
  }

  async deleteAbacRule(ruleId: string, tenantId: string): Promise<void> {
    try {
      await this.pool.query(
        `DELETE FROM ${this.schema}.abac_rules WHERE id = $1 AND tenant_id = $2`,
        [ruleId, tenantId]
      );
    } catch (error) {
      throw new WeegError(
        WeegErrorCode.DATABASE_ERROR,
        'Failed to delete ABAC rule',
        { ruleId, tenantId, error }
      );
    }
  }

  // ==================== Audit Log Operations ====================

  async createAuditLog(log: Omit<PermissionAuditLog, 'id' | 'timestamp'>): Promise<PermissionAuditLog> {
    try {
      const result = await this.pool.query(
        `INSERT INTO ${this.schema}.audit_logs 
         (tenant_id, actor_id, action, entity_type, entity_id, previous_state, new_state, timestamp)
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
         RETURNING *`,
        [
          log.tenantId,
          log.actorId,
          log.action,
          log.entityType,
          log.entityId,
          log.previousState ? JSON.stringify(log.previousState) : null,
          log.newState ? JSON.stringify(log.newState) : null,
        ]
      );

      return this.mapRowToAuditLog(result.rows[0]);
    } catch (error) {
      // Don't throw errors for audit logging failures
      console.error('Failed to create audit log:', error);
      return {
        id: 'error',
        ...log,
        timestamp: new Date(),
      };
    }
  }

  // ==================== Row Mapping Methods ====================

  private mapRowToRole(row: any): Role {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      description: row.description,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToPermission(row: any): Permission {
    return {
      id: row.id,
      name: row.name,
      description: row.description,
      createdAt: new Date(row.created_at),
    };
  }

  private mapRowToPolicy(row: any): Policy {
    return {
      id: row.id,
      roleId: row.role_id,
      permissionId: row.permission_id,
      createdAt: new Date(row.created_at),
    };
  }

  private mapRowToUserRole(row: any): UserRole {
    return {
      userId: row.user_id,
      roleId: row.role_id,
      tenantId: row.tenant_id,
      assignedAt: new Date(row.assigned_at),
    };
  }

  private mapRowToAbacRule(row: any): AbacRule {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      condition: typeof row.condition === 'string' ? JSON.parse(row.condition) : row.condition,
      permissionId: row.permission_id,
      active: row.active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  private mapRowToAuditLog(row: any): PermissionAuditLog {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      actorId: row.actor_id,
      action: row.action,
      entityType: row.entity_type,
      entityId: row.entity_id,
      previousState: row.previous_state ? JSON.parse(row.previous_state) : undefined,
      newState: row.new_state ? JSON.parse(row.new_state) : undefined,
      timestamp: new Date(row.timestamp),
    };
  }
}
