/**
 * Authorization Service
 * 
 * Handles authorization checks by integrating with the WEEG (Permission System) module.
 * Checks if a user has permission to perform an action on a resource.
 */

import { AuthorizationRequest, AuthorizationResult } from '../types';

export class AuthorizationService {
  private weegServiceUrl: string;

  constructor(weegServiceUrl?: string) {
    // In production, this would be the actual WEEG service URL
    // For now, we use a placeholder or environment variable
    this.weegServiceUrl = weegServiceUrl || process.env.WEEG_SERVICE_URL || 'http://localhost:3001/weeg';
  }

  /**
   * Check if a user is authorized to perform an action on a resource
   * 
   * @param request - Authorization request with tenantId, userId, resource, and action
   * @returns Authorization result indicating if the action is allowed
   */
  async checkPermission(request: AuthorizationRequest): Promise<AuthorizationResult> {
    try {
      // Validate request
      if (!request.tenantId || !request.userId || !request.resource || !request.action) {
        return {
          allowed: false,
          reason: 'Invalid authorization request: missing required fields',
        };
      }

      // Call WEEG service to check permission
      // In a real implementation, this would make an HTTP request to the WEEG service
      // For now, we simulate the call
      const allowed = await this.callWeegService(request);

      return {
        allowed,
        reason: allowed ? undefined : 'Permission denied by WEEG',
      };
    } catch (error) {
      // On error, deny access (fail-safe)
      return {
        allowed: false,
        reason: `Authorization check failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }

  /**
   * Call the WEEG service to check permission
   * 
   * @param request - Authorization request
   * @returns True if permission is granted, false otherwise
   */
  private async callWeegService(request: AuthorizationRequest): Promise<boolean> {
    // TODO: Implement actual HTTP call to WEEG service
    // For now, we return a placeholder implementation
    
    // In production, this would be:
    // const response = await fetch(`${this.weegServiceUrl}/check-permission`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(request),
    // });
    // const result = await response.json();
    // return result.allowed;

    // Placeholder: Allow all requests for now (will be replaced with actual WEEG integration)
    console.log(`[AuthorizationService] Checking permission: ${JSON.stringify(request)}`);
    
    // For development, we can implement basic permission logic
    // In production, this MUST be replaced with actual WEEG service calls
    return true;
  }

  /**
   * Batch check permissions for multiple requests
   * Useful for optimizing multiple permission checks
   * 
   * @param requests - Array of authorization requests
   * @returns Array of authorization results
   */
  async checkPermissionBatch(requests: AuthorizationRequest[]): Promise<AuthorizationResult[]> {
    // Check each permission in parallel
    const results = await Promise.all(
      requests.map(request => this.checkPermission(request))
    );

    return results;
  }

  /**
   * Check if a user has any of the specified permissions
   * 
   * @param tenantId - Tenant ID
   * @param userId - User ID
   * @param permissions - Array of permission strings (resource:action)
   * @returns True if user has at least one of the permissions
   */
  async hasAnyPermission(
    tenantId: string,
    userId: string,
    permissions: string[]
  ): Promise<boolean> {
    const requests = permissions.map(permission => {
      const [resource, action] = permission.split(':');
      return { tenantId, userId, resource, action };
    });

    const results = await this.checkPermissionBatch(requests);
    return results.some(result => result.allowed);
  }

  /**
   * Check if a user has all of the specified permissions
   * 
   * @param tenantId - Tenant ID
   * @param userId - User ID
   * @param permissions - Array of permission strings (resource:action)
   * @returns True if user has all of the permissions
   */
  async hasAllPermissions(
    tenantId: string,
    userId: string,
    permissions: string[]
  ): Promise<boolean> {
    const requests = permissions.map(permission => {
      const [resource, action] = permission.split(':');
      return { tenantId, userId, resource, action };
    });

    const results = await this.checkPermissionBatch(requests);
    return results.every(result => result.allowed);
  }
}
