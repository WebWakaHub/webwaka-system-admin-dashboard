/**
 * Tenant Isolation Enforcer
 * Ensures strict tenant isolation in the Event System
 */

import { Event } from '../types';
import { TenantIsolationError } from '../errors';

/**
 * Tenant context for authorization
 */
export interface TenantContext {
  tenantId: string;
  userId?: string;
  permissions?: string[];
}

/**
 * Tenant Isolation Enforcer
 * Enforces tenant isolation at all levels
 */
export class TenantEnforcer {
  /**
   * Validate that a tenant context has access to an event
   */
  static validateTenantAccess(context: TenantContext, event: Event): void {
    if (context.tenantId !== event.tenantId) {
      throw new TenantIsolationError(
        `Tenant ${context.tenantId} does not have access to events from tenant ${event.tenantId}`,
        {
          requestingTenant: context.tenantId,
          eventTenant: event.tenantId,
        }
      );
    }
  }

  /**
   * Validate that a tenant context has access to a subscription
   */
  static validateSubscriptionAccess(context: TenantContext, subscriptionTenantId: string): void {
    if (context.tenantId !== subscriptionTenantId) {
      throw new TenantIsolationError(
        `Tenant ${context.tenantId} does not have access to subscriptions from tenant ${subscriptionTenantId}`,
        {
          requestingTenant: context.tenantId,
          subscriptionTenant: subscriptionTenantId,
        }
      );
    }
  }

  /**
   * Validate that an event belongs to the specified tenant
   */
  static validateEventTenant(event: Event, expectedTenantId: string): void {
    if (event.tenantId !== expectedTenantId) {
      throw new TenantIsolationError(
        `Event tenant ID mismatch: expected ${expectedTenantId}, got ${event.tenantId}`,
        {
          expectedTenant: expectedTenantId,
          actualTenant: event.tenantId,
        }
      );
    }
  }

  /**
   * Filter events to only include those from the specified tenant
   */
  static filterEventsByTenant(events: Event[], tenantId: string): Event[] {
    return events.filter((event) => event.tenantId === tenantId);
  }

  /**
   * Validate that all events belong to the specified tenant
   */
  static validateEventsTenant(events: Event[], tenantId: string): void {
    for (const event of events) {
      if (event.tenantId !== tenantId) {
        throw new TenantIsolationError(
          `Event tenant ID mismatch: expected ${tenantId}, got ${event.tenantId}`,
          {
            expectedTenant: tenantId,
            actualTenant: event.tenantId,
            eventId: event.eventId,
          }
        );
      }
    }
  }

  /**
   * Validate that a context has permission for an operation
   */
  static validatePermission(context: TenantContext, permission: string): void {
    if (context.permissions && !context.permissions.includes(permission)) {
      throw new TenantIsolationError(
        `Tenant ${context.tenantId} does not have permission: ${permission}`,
        {
          tenantId: context.tenantId,
          requiredPermission: permission,
          availablePermissions: context.permissions,
        }
      );
    }
  }

  /**
   * Create a tenant-scoped event filter
   */
  static createTenantFilter(tenantId: string): (event: Event) => boolean {
    return (event: Event) => event.tenantId === tenantId;
  }

  /**
   * Create a multi-tenant event filter
   */
  static createMultiTenantFilter(tenantIds: string[]): (event: Event) => boolean {
    return (event: Event) => tenantIds.includes(event.tenantId);
  }
}
