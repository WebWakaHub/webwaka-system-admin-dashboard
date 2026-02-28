/**
 * Multi-Tenant Data Scoping Module
 * 
 * Provides comprehensive multi-tenant data isolation and scoping capabilities.
 * Ensures all data operations are automatically scoped to the correct tenant context.
 * 
 * @module Multi-Tenant Data Scoping
 * @author webwakaagent4
 * @date 2026-02-09
 */

// Tenant Context Manager
export {
  TenantContext,
  TenantContextManager,
  TenantContextMissingError,
  TenantContextInvalidError,
  tenantContextManager,
} from './tenant-context.manager';

// Query Interceptor
export {
  QueryOperation,
  QueryInterceptorOptions,
  InterceptedQuery,
  QueryInterceptor,
  queryInterceptor,
} from './query-interceptor';

// Tenant Validator
export {
  TenantPermission,
  TenantAccessDeniedError,
  TenantValidationResult,
  TenantValidator,
  tenantValidator,
} from './tenant-validator';

// Data Access Layer
export {
  TenantScopedRepository,
  TenantScopedTransaction,
  createTenantScopedTransaction,
} from './data-access-layer';

// Tenant Hierarchy Manager (Week 18)
export {
  TenantHierarchyNode,
  HierarchyQueryOptions,
  TenantHierarchyError,
  TenantHierarchyManager,
  tenantHierarchyManager,
} from './tenant-hierarchy.manager';

// Tenant Configuration Manager (Week 18)
export {
  ConfigValue,
  ConfigEntry,
  ConfigUpdateOptions,
  TenantConfigError,
  TenantConfigManager,
  tenantConfigManager,
} from './tenant-config.manager';

// Usage Tracker (Week 18)
export {
  UsageMetricType,
  UsageMetric,
  UsageSummary,
  UsageQuota,
  UsageTrackingError,
  QuotaExceededError,
  UsageTracker,
  usageTracker,
} from './usage-tracker';
