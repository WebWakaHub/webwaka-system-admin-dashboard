/**
 * Tenant Status Enum
 *
 * Defines the lifecycle states of a tenant.
 *
 * State machine:
 *   PENDING → ACTIVE → SUSPENDED → TERMINATED
 *   PENDING → ACTIVE → TERMINATED
 *   SUSPENDED → ACTIVE (reactivation)
 */
export enum TenantStatus {
  PENDING = 'PENDING',         // Created, awaiting onboarding completion
  ACTIVE = 'ACTIVE',           // Fully operational
  SUSPENDED = 'SUSPENDED',     // Temporarily disabled (e.g., payment overdue)
  TERMINATED = 'TERMINATED',   // Permanently closed (data retained per policy)
}

/**
 * Tenant Plan Enum
 *
 * Defines the subscription tier of a tenant.
 * Nigeria-First: Naira-denominated pricing tiers.
 */
export enum TenantPlan {
  STARTER = 'STARTER',         // Free tier — limited features
  GROWTH = 'GROWTH',           // Paid tier — standard features
  ENTERPRISE = 'ENTERPRISE',   // Full features + SLA
  CUSTOM = 'CUSTOM',           // Negotiated enterprise contract
}

/**
 * Tenant Event Enum
 *
 * All tenant domain events emitted by the tenancy service.
 */
export enum TenantEvent {
  TENANT_CREATED = 'tenancy.tenant.created',
  TENANT_ACTIVATED = 'tenancy.tenant.activated',
  TENANT_SUSPENDED = 'tenancy.tenant.suspended',
  TENANT_REACTIVATED = 'tenancy.tenant.reactivated',
  TENANT_TERMINATED = 'tenancy.tenant.terminated',
  TENANT_UPDATED = 'tenancy.tenant.updated',
  TENANT_PLAN_CHANGED = 'tenancy.tenant.plan.changed',
  TENANT_ADMIN_ASSIGNED = 'tenancy.tenant.admin.assigned',
  TENANT_FEATURE_ENABLED = 'tenancy.tenant.feature.enabled',
  TENANT_FEATURE_DISABLED = 'tenancy.tenant.feature.disabled',
  TENANT_CONFIG_UPDATED = 'tenancy.tenant.config.updated',
  TENANT_ONBOARDING_COMPLETED = 'tenancy.tenant.onboarding.completed',
}
