/**
 * Usage Tracker
 * 
 * Tracks tenant resource usage for monitoring, billing, and quota enforcement.
 * Provides real-time usage metrics and historical usage data.
 * 
 * @module UsageTracker
 * @author webwakaagent4
 * @date 2026-02-09
 */

import { tenantContextManager } from './tenant-context.manager';

/**
 * Usage metric types
 */
export enum UsageMetricType {
  /** API requests */
  API_REQUESTS = 'api_requests',
  /** Database queries */
  DATABASE_QUERIES = 'database_queries',
  /** Storage used (bytes) */
  STORAGE_BYTES = 'storage_bytes',
  /** Bandwidth used (bytes) */
  BANDWIDTH_BYTES = 'bandwidth_bytes',
  /** Active users */
  ACTIVE_USERS = 'active_users',
  /** Custom metric */
  CUSTOM = 'custom',
}

/**
 * Usage metric entry
 */
export interface UsageMetric {
  /** Tenant ID */
  tenantId: string;
  /** Metric type */
  type: UsageMetricType;
  /** Metric value */
  value: number;
  /** Metric unit */
  unit: string;
  /** Timestamp when metric was recorded */
  timestamp: Date;
  /** Additional metadata */
  metadata?: Record<string, any>;
}

/**
 * Usage summary for a time period
 */
export interface UsageSummary {
  /** Tenant ID */
  tenantId: string;
  /** Start of time period */
  startDate: Date;
  /** End of time period */
  endDate: Date;
  /** Metrics summary */
  metrics: Map<UsageMetricType, number>;
  /** Total usage cost (if applicable) */
  totalCost?: number;
}

/**
 * Usage quota
 */
export interface UsageQuota {
  /** Tenant ID */
  tenantId: string;
  /** Metric type */
  type: UsageMetricType;
  /** Quota limit */
  limit: number;
  /** Current usage */
  current: number;
  /** Quota period (e.g., 'monthly', 'daily') */
  period: 'hourly' | 'daily' | 'monthly' | 'yearly';
  /** Whether quota is exceeded */
  isExceeded: boolean;
  /** Percentage of quota used */
  usagePercentage: number;
}

/**
 * Error thrown when usage tracking operation fails
 */
export class UsageTrackingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'UsageTrackingError';
  }
}

/**
 * Error thrown when usage quota is exceeded
 */
export class QuotaExceededError extends Error {
  constructor(
    public readonly tenantId: string,
    public readonly metricType: UsageMetricType,
    public readonly current: number,
    public readonly limit: number
  ) {
    super(
      `Quota exceeded for tenant ${tenantId}: ${metricType} usage (${current}) exceeds limit (${limit})`
    );
    this.name = 'QuotaExceededError';
  }
}

/**
 * Usage Tracker
 * 
 * Tracks and monitors tenant resource usage with quota enforcement.
 */
export class UsageTracker {
  private static instance: UsageTracker;
  private usageMetrics: Map<string, UsageMetric[]> = new Map();
  private usageQuotas: Map<string, Map<UsageMetricType, UsageQuota>> = new Map();

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): UsageTracker {
    if (!UsageTracker.instance) {
      UsageTracker.instance = new UsageTracker();
    }
    return UsageTracker.instance;
  }

  /**
   * Track usage metric
   * 
   * @param type - Metric type
   * @param value - Metric value
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @param metadata - Additional metadata
   * @throws QuotaExceededError if quota is exceeded
   */
  public async trackUsage(
    type: UsageMetricType,
    value: number,
    tenantId?: string,
    metadata?: Record<string, any>
  ): Promise<void> {
    const targetTenantId = tenantId || tenantContextManager.getTenantId();
    
    if (!targetTenantId) {
      throw new UsageTrackingError('Tenant context is required to track usage');
    }

    // Check quota before recording usage
    await this.checkQuota(type, value, targetTenantId);

    // Create usage metric
    const metric: UsageMetric = {
      tenantId: targetTenantId,
      type,
      value,
      unit: this.getMetricUnit(type),
      timestamp: new Date(),
      metadata,
    };

    // Get or create metrics array for tenant
    let tenantMetrics = this.usageMetrics.get(targetTenantId);
    if (!tenantMetrics) {
      tenantMetrics = [];
      this.usageMetrics.set(targetTenantId, tenantMetrics);
    }

    // Add metric
    tenantMetrics.push(metric);

    // Update quota current usage
    await this.updateQuotaUsage(type, value, targetTenantId);
  }

  /**
   * Increment usage counter
   * 
   * @param type - Metric type
   * @param increment - Increment value (default: 1)
   * @param tenantId - Tenant ID (defaults to current tenant)
   */
  public async incrementUsage(
    type: UsageMetricType,
    increment: number = 1,
    tenantId?: string
  ): Promise<void> {
    await this.trackUsage(type, increment, tenantId);
  }

  /**
   * Get usage metrics for a tenant
   * 
   * @param type - Metric type (optional, returns all types if not specified)
   * @param startDate - Start date (optional)
   * @param endDate - End date (optional)
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @returns Array of usage metrics
   */
  public async getUsageMetrics(
    type?: UsageMetricType,
    startDate?: Date,
    endDate?: Date,
    tenantId?: string
  ): Promise<UsageMetric[]> {
    const targetTenantId = tenantId || tenantContextManager.getTenantId();
    
    if (!targetTenantId) {
      throw new UsageTrackingError('Tenant context is required to get usage metrics');
    }

    const tenantMetrics = this.usageMetrics.get(targetTenantId) || [];

    // Filter by type
    let filteredMetrics = type
      ? tenantMetrics.filter(m => m.type === type)
      : tenantMetrics;

    // Filter by date range
    if (startDate) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp >= startDate);
    }
    if (endDate) {
      filteredMetrics = filteredMetrics.filter(m => m.timestamp <= endDate);
    }

    return filteredMetrics;
  }

  /**
   * Get usage summary for a time period
   * 
   * @param startDate - Start date
   * @param endDate - End date
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @returns Usage summary
   */
  public async getUsageSummary(
    startDate: Date,
    endDate: Date,
    tenantId?: string
  ): Promise<UsageSummary> {
    const targetTenantId = tenantId || tenantContextManager.getTenantId();
    
    if (!targetTenantId) {
      throw new UsageTrackingError('Tenant context is required to get usage summary');
    }

    const metrics = await this.getUsageMetrics(undefined, startDate, endDate, targetTenantId);

    // Aggregate metrics by type
    const metricsMap = new Map<UsageMetricType, number>();
    for (const metric of metrics) {
      const current = metricsMap.get(metric.type) || 0;
      metricsMap.set(metric.type, current + metric.value);
    }

    return {
      tenantId: targetTenantId,
      startDate,
      endDate,
      metrics: metricsMap,
    };
  }

  /**
   * Set usage quota
   * 
   * @param type - Metric type
   * @param limit - Quota limit
   * @param period - Quota period
   * @param tenantId - Tenant ID
   */
  public async setQuota(
    type: UsageMetricType,
    limit: number,
    period: 'hourly' | 'daily' | 'monthly' | 'yearly',
    tenantId: string
  ): Promise<void> {
    const quota: UsageQuota = {
      tenantId,
      type,
      limit,
      current: 0,
      period,
      isExceeded: false,
      usagePercentage: 0,
    };

    let tenantQuotas = this.usageQuotas.get(tenantId);
    if (!tenantQuotas) {
      tenantQuotas = new Map();
      this.usageQuotas.set(tenantId, tenantQuotas);
    }

    tenantQuotas.set(type, quota);
  }

  /**
   * Get usage quota
   * 
   * @param type - Metric type
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @returns Usage quota or null if not set
   */
  public async getQuota(
    type: UsageMetricType,
    tenantId?: string
  ): Promise<UsageQuota | null> {
    const targetTenantId = tenantId || tenantContextManager.getTenantId();
    
    if (!targetTenantId) {
      throw new UsageTrackingError('Tenant context is required to get quota');
    }

    const tenantQuotas = this.usageQuotas.get(targetTenantId);
    if (!tenantQuotas) {
      return null;
    }

    return tenantQuotas.get(type) || null;
  }

  /**
   * Get all quotas for a tenant
   * 
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @returns Array of usage quotas
   */
  public async getAllQuotas(tenantId?: string): Promise<UsageQuota[]> {
    const targetTenantId = tenantId || tenantContextManager.getTenantId();
    
    if (!targetTenantId) {
      throw new UsageTrackingError('Tenant context is required to get quotas');
    }

    const tenantQuotas = this.usageQuotas.get(targetTenantId);
    if (!tenantQuotas) {
      return [];
    }

    return Array.from(tenantQuotas.values());
  }

  /**
   * Check if quota is exceeded
   * 
   * @param type - Metric type
   * @param additionalUsage - Additional usage to check
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @throws QuotaExceededError if quota would be exceeded
   */
  private async checkQuota(
    type: UsageMetricType,
    additionalUsage: number,
    tenantId: string
  ): Promise<void> {
    const quota = await this.getQuota(type, tenantId);
    
    if (!quota) {
      // No quota set, allow usage
      return;
    }

    const newUsage = quota.current + additionalUsage;
    
    if (newUsage > quota.limit) {
      throw new QuotaExceededError(tenantId, type, newUsage, quota.limit);
    }
  }

  /**
   * Update quota current usage
   * 
   * @param type - Metric type
   * @param value - Usage value to add
   * @param tenantId - Tenant ID
   */
  private async updateQuotaUsage(
    type: UsageMetricType,
    value: number,
    tenantId: string
  ): Promise<void> {
    const quota = await this.getQuota(type, tenantId);
    
    if (!quota) {
      return;
    }

    quota.current += value;
    quota.usagePercentage = (quota.current / quota.limit) * 100;
    quota.isExceeded = quota.current > quota.limit;

    const tenantQuotas = this.usageQuotas.get(tenantId);
    if (tenantQuotas) {
      tenantQuotas.set(type, quota);
    }
  }

  /**
   * Reset quota usage
   * 
   * @param type - Metric type
   * @param tenantId - Tenant ID
   */
  public async resetQuota(type: UsageMetricType, tenantId: string): Promise<void> {
    const quota = await this.getQuota(type, tenantId);
    
    if (!quota) {
      return;
    }

    quota.current = 0;
    quota.usagePercentage = 0;
    quota.isExceeded = false;

    const tenantQuotas = this.usageQuotas.get(tenantId);
    if (tenantQuotas) {
      tenantQuotas.set(type, quota);
    }
  }

  /**
   * Get metric unit
   * 
   * @param type - Metric type
   * @returns Metric unit
   */
  private getMetricUnit(type: UsageMetricType): string {
    switch (type) {
      case UsageMetricType.API_REQUESTS:
        return 'requests';
      case UsageMetricType.DATABASE_QUERIES:
        return 'queries';
      case UsageMetricType.STORAGE_BYTES:
        return 'bytes';
      case UsageMetricType.BANDWIDTH_BYTES:
        return 'bytes';
      case UsageMetricType.ACTIVE_USERS:
        return 'users';
      case UsageMetricType.CUSTOM:
        return 'units';
      default:
        return 'units';
    }
  }

  /**
   * Clear all usage data
   */
  public clearAllData(): void {
    this.usageMetrics.clear();
    this.usageQuotas.clear();
  }

  /**
   * Clear usage data for a tenant
   * 
   * @param tenantId - Tenant ID
   */
  public clearTenantData(tenantId: string): void {
    this.usageMetrics.delete(tenantId);
    this.usageQuotas.delete(tenantId);
  }
}

/**
 * Singleton instance of Usage Tracker
 */
export const usageTracker = UsageTracker.getInstance();
