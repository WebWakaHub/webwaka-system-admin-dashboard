/**
 * WEEG (Permission System) - REST API Controller
 * 
 * Provides HTTP endpoints for permission checking and management.
 * 
 * @module weeg/api/weeg-controller
 */

import { Request, Response, NextFunction } from 'express';
import { PermissionService } from '../permission.service';
import {
  PermissionCheckRequest,
  WeegError,
  WeegErrorCode,
} from '../types';

/**
 * WEEG Controller
 * 
 * Handles HTTP requests for the WEEG module.
 */
export class WeegController {
  constructor(private permissionService: PermissionService) {}

  // ==================== Permission Check ====================

  /**
   * POST /api/weeg/check
   * Check if a user has permission to perform an action
   */
  async checkPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const request: PermissionCheckRequest = {
        tenantId: req.body.tenantId,
        userId: req.body.userId,
        action: req.body.action,
        resourceAttributes: req.body.resourceAttributes,
        userAttributes: req.body.userAttributes,
        environmentAttributes: req.body.environmentAttributes,
      };

      const response = await this.permissionService.checkPermission(request);

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }

  // ==================== Role Management ====================

  /**
   * GET /api/weeg/roles
   * Get all roles for a tenant
   */
  async getRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.query.tenantId as string;

      if (!tenantId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'tenantId is required'
        );
      }

      const roles = await this.permissionService.getRolesByTenant(tenantId);

      res.status(200).json({ roles });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/weeg/roles/:roleId
   * Get a specific role
   */
  async getRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roleId = req.params.roleId;
      const tenantId = req.query.tenantId as string;

      if (!tenantId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'tenantId is required'
        );
      }

      const role = await this.permissionService.getRoleById(roleId, tenantId);

      if (!role) {
        throw new WeegError(
          WeegErrorCode.ROLE_NOT_FOUND,
          `Role not found: ${roleId}`
        );
      }

      res.status(200).json({ role });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/weeg/roles
   * Create a new role
   */
  async createRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId, name, description, actorId } = req.body;

      if (!tenantId || !name || !actorId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'tenantId, name, and actorId are required'
        );
      }

      const role = await this.permissionService.createRole(
        tenantId,
        name,
        description,
        actorId
      );

      res.status(201).json({ role });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/weeg/roles/:roleId
   * Update a role
   */
  async updateRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roleId = req.params.roleId;
      const { tenantId, name, description, actorId } = req.body;

      if (!tenantId || !actorId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'tenantId and actorId are required'
        );
      }

      const role = await this.permissionService.updateRole(
        roleId,
        tenantId,
        { name, description },
        actorId
      );

      res.status(200).json({ role });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/weeg/roles/:roleId
   * Delete a role
   */
  async deleteRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roleId = req.params.roleId;
      const tenantId = req.query.tenantId as string;
      const actorId = req.query.actorId as string;

      if (!tenantId || !actorId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'tenantId and actorId are required'
        );
      }

      await this.permissionService.deleteRole(roleId, tenantId, actorId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ==================== Permission Management ====================

  /**
   * GET /api/weeg/permissions
   * Get all permissions
   */
  async getPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const permissions = await this.permissionService.getAllPermissions();

      res.status(200).json({ permissions });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/weeg/permissions
   * Create a new permission
   */
  async createPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { name, description, actorId } = req.body;

      if (!name || !actorId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'name and actorId are required'
        );
      }

      const permission = await this.permissionService.createPermission(
        name,
        description,
        actorId
      );

      res.status(201).json({ permission });
    } catch (error) {
      next(error);
    }
  }

  // ==================== Policy Management ====================

  /**
   * POST /api/weeg/policies
   * Assign a permission to a role
   */
  async assignPermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { roleId, permissionId, tenantId, actorId } = req.body;

      if (!roleId || !permissionId || !tenantId || !actorId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'roleId, permissionId, tenantId, and actorId are required'
        );
      }

      const policy = await this.permissionService.assignPermissionToRole(
        roleId,
        permissionId,
        tenantId,
        actorId
      );

      res.status(201).json({ policy });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/weeg/policies/:policyId
   * Remove a permission from a role
   */
  async removePermission(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const policyId = req.params.policyId;
      const actorId = req.query.actorId as string;

      if (!actorId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'actorId is required'
        );
      }

      await this.permissionService.removePermissionFromRole(policyId, actorId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ==================== User Role Management ====================

  /**
   * GET /api/weeg/users/:userId/roles
   * Get all roles for a user
   */
  async getUserRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const tenantId = req.query.tenantId as string;

      if (!tenantId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'tenantId is required'
        );
      }

      const userRoles = await this.permissionService.getUserRoles(userId, tenantId);

      res.status(200).json({ userRoles });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/weeg/users/:userId/roles
   * Assign a role to a user
   */
  async assignRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const { roleId, tenantId, actorId } = req.body;

      if (!roleId || !tenantId || !actorId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'roleId, tenantId, and actorId are required'
        );
      }

      const userRole = await this.permissionService.assignRoleToUser(
        userId,
        roleId,
        tenantId,
        actorId
      );

      res.status(201).json({ userRole });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/weeg/users/:userId/roles/:roleId
   * Remove a role from a user
   */
  async removeRole(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userId = req.params.userId;
      const roleId = req.params.roleId;
      const tenantId = req.query.tenantId as string;
      const actorId = req.query.actorId as string;

      if (!tenantId || !actorId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'tenantId and actorId are required'
        );
      }

      await this.permissionService.removeRoleFromUser(
        userId,
        roleId,
        tenantId,
        actorId
      );

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  // ==================== ABAC Rule Management ====================

  /**
   * GET /api/weeg/abac-rules
   * Get all ABAC rules for a tenant
   */
  async getAbacRules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const tenantId = req.query.tenantId as string;

      if (!tenantId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'tenantId is required'
        );
      }

      const rules = await this.permissionService.getAbacRulesByTenant(tenantId);

      res.status(200).json({ rules });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/weeg/abac-rules
   * Create a new ABAC rule
   */
  async createAbacRule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { tenantId, name, condition, permissionId, active, actorId } = req.body;

      if (!tenantId || !name || !condition || !permissionId || !actorId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'tenantId, name, condition, permissionId, and actorId are required'
        );
      }

      const rule = await this.permissionService.createAbacRule(
        tenantId,
        name,
        condition,
        permissionId,
        active !== undefined ? active : true,
        actorId
      );

      res.status(201).json({ rule });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/weeg/abac-rules/:ruleId
   * Update an ABAC rule
   */
  async updateAbacRule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ruleId = req.params.ruleId;
      const { tenantId, name, condition, active, actorId } = req.body;

      if (!tenantId || !actorId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'tenantId and actorId are required'
        );
      }

      const rule = await this.permissionService.updateAbacRule(
        ruleId,
        tenantId,
        { name, condition, active },
        actorId
      );

      res.status(200).json({ rule });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/weeg/abac-rules/:ruleId
   * Delete an ABAC rule
   */
  async deleteAbacRule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const ruleId = req.params.ruleId;
      const tenantId = req.query.tenantId as string;
      const actorId = req.query.actorId as string;

      if (!tenantId || !actorId) {
        throw new WeegError(
          WeegErrorCode.INVALID_REQUEST,
          'tenantId and actorId are required'
        );
      }

      await this.permissionService.deleteAbacRule(ruleId, tenantId, actorId);

      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }
}

/**
 * Error handler middleware for WEEG errors
 */
export function weegErrorHandler(
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (error instanceof WeegError) {
    const statusCode = getStatusCodeForError(error.code);
    res.status(statusCode).json({
      error: {
        code: error.code,
        message: error.message,
        details: error.details,
      },
    });
  } else {
    // Pass to next error handler
    next(error);
  }
}

/**
 * Map WeegErrorCode to HTTP status code
 */
function getStatusCodeForError(code: WeegErrorCode): number {
  switch (code) {
    case WeegErrorCode.INVALID_REQUEST:
      return 400;
    case WeegErrorCode.PERMISSION_DENIED:
      return 403;
    case WeegErrorCode.ROLE_NOT_FOUND:
    case WeegErrorCode.PERMISSION_NOT_FOUND:
    case WeegErrorCode.POLICY_NOT_FOUND:
      return 404;
    case WeegErrorCode.DATABASE_ERROR:
    case WeegErrorCode.CACHE_ERROR:
      return 500;
    default:
      return 500;
  }
}
