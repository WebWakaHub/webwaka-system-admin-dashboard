/**
 * Audit System Configuration
 * Centralized configuration for the Audit System module
 */

/**
 * Audit System configuration options
 */
export interface AuditSystemConfigOptions {
  /**
   * Enable audit logging
   */
  enabled: boolean;

  /**
   * Maximum number of events to queue before processing
   */
  maxQueueSize: number;

  /**
   * Maximum number of audit logs to store in memory (for development/testing)
   */
  maxStorageSize: number;

  /**
   * Enable event validation
   */
  validateEvents: boolean;

  /**
   * Enable hash verification
   */
  verifyIntegrity: boolean;

  /**
   * Default page size for queries
   */
  defaultPageSize: number;

  /**
   * Maximum page size for queries
   */
  maxPageSize: number;

  /**
   * Enable audit log encryption (future feature)
   */
  encryptLogs: boolean;

  /**
   * Retention period in days (0 = no limit)
   */
  retentionDays: number;
}

/**
 * Default configuration
 */
const DEFAULT_CONFIG: AuditSystemConfigOptions = {
  enabled: true,
  maxQueueSize: 10000,
  maxStorageSize: 1000000,
  validateEvents: true,
  verifyIntegrity: true,
  defaultPageSize: 100,
  maxPageSize: 1000,
  encryptLogs: false,
  retentionDays: 0,
};

/**
 * AuditSystemConfig class
 * Manages Audit System configuration
 */
export class AuditSystemConfig {
  private config: AuditSystemConfigOptions;

  constructor(options?: Partial<AuditSystemConfigOptions>) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...options,
    };
  }

  /**
   * Get a configuration option
   */
  public get<K extends keyof AuditSystemConfigOptions>(key: K): AuditSystemConfigOptions[K] {
    return this.config[key];
  }

  /**
   * Set a configuration option
   */
  public set<K extends keyof AuditSystemConfigOptions>(key: K, value: AuditSystemConfigOptions[K]): void {
    this.config[key] = value;
  }

  /**
   * Get all configuration options
   */
  public getAll(): AuditSystemConfigOptions {
    return { ...this.config };
  }

  /**
   * Validate configuration
   */
  public validate(): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (this.config.maxQueueSize <= 0) {
      errors.push('maxQueueSize must be greater than 0');
    }

    if (this.config.maxStorageSize <= 0) {
      errors.push('maxStorageSize must be greater than 0');
    }

    if (this.config.defaultPageSize <= 0) {
      errors.push('defaultPageSize must be greater than 0');
    }

    if (this.config.maxPageSize < this.config.defaultPageSize) {
      errors.push('maxPageSize must be greater than or equal to defaultPageSize');
    }

    if (this.config.retentionDays < 0) {
      errors.push('retentionDays must be greater than or equal to 0');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }
}

/**
 * Global configuration instance
 */
export const globalAuditSystemConfig = new AuditSystemConfig();
