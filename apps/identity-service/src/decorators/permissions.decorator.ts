import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator to restrict route access to users with specific permissions.
 *
 * Permissions use the resource:action format.
 *
 * Usage:
 *   @RequirePermissions('users:create', 'users:read')
 *   @UseGuards(JwtAuthGuard, PermissionsGuard)
 *   async createUser() { ... }
 */
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
