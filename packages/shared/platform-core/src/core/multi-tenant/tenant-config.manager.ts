/**
 * Tenant Configuration Manager
 * 
 * Manages tenant-specific configuration and settings. Provides a flexible key-value
 * store for tenant configurations with type safety and validation.
 * 
 * @module TenantConfigManager
 * @author webwakaagent4
 * @date 2026-02-09
 */

import { tenantContextManager } from './tenant-context.manager';

/**
 * Configuration value types
 */
export type ConfigValue = string | number | boolean | object | null;

/**
 * Configuration entry
 */
export interface ConfigEntry {
  /** Configuration key */
  key: string;
  /** Configuration value */
  value: ConfigValue;
  /** Value type */
  type: 'string' | 'number' | 'boolean' | 'object';
  /** Whether this is a system configuration (read-only for tenants) */
  isSystem: boolean;
  /** Timestamp when configuration was last updated */
  updatedAt: Date;
}

/**
 * Configuration update options
 */
export interface ConfigUpdateOptions {
  /** Whether to validate the configuration value */
  validate?: boolean;
  /** Whether to allow system configuration updates (requires platform admin) */
  allowSystemUpdate?: boolean;
}

/**
 * Error thrown when configuration operation fails
 */
export class TenantConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TenantConfigError';
  }
}

/**
 * Tenant Configuration Manager
 * 
 * Manages tenant-specific configuration and settings with type safety.
 */
export class TenantConfigManager {
  private static instance: TenantConfigManager;
  private configCache: Map<string, Map<string, ConfigEntry>> = new Map();

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): TenantConfigManager {
    if (!TenantConfigManager.instance) {
      TenantConfigManager.instance = new TenantConfigManager();
    }
    return TenantConfigManager.instance;
  }

  /**
   * Get configuration value
   * 
   * @param key - Configuration key
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @returns Configuration value or null if not found
   */
  public async getConfig<T extends ConfigValue = ConfigValue>(
    key: string,
    tenantId?: string
  ): Promise<T | null> {
    const targetTenantId = tenantId || tenantContextManager.getTenantId();
    
    if (!targetTenantId) {
      throw new TenantConfigError('Tenant context is required to get configuration');
    }

    const tenantConfigs = this.configCache.get(targetTenantId);
    if (!tenantConfigs) {
      return null;
    }

    const entry = tenantConfigs.get(key);
    return entry ? (entry.value as T) : null;
  }

  /**
   * Get multiple configuration values
   * 
   * @param keys - Configuration keys
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @returns Map of configuration key-value pairs
   */
  public async getConfigs(
    keys: string[],
    tenantId?: string
  ): Promise<Map<string, ConfigValue>> {
    const configs = new Map<string, ConfigValue>();

    for (const key of keys) {
      const value = await this.getConfig(key, tenantId);
      if (value !== null) {
        configs.set(key, value);
      }
    }

    return configs;
  }

  /**
   * Get all configuration entries for a tenant
   * 
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @param includeSystem - Include system configurations (default: false)
   * @returns Array of configuration entries
   */
  public async getAllConfigs(
    tenantId?: string,
    includeSystem: boolean = false
  ): Promise<ConfigEntry[]> {
    const targetTenantId = tenantId || tenantContextManager.getTenantId();
    
    if (!targetTenantId) {
      throw new TenantConfigError('Tenant context is required to get configurations');
    }

    const tenantConfigs = this.configCache.get(targetTenantId);
    if (!tenantConfigs) {
      return [];
    }

    const entries = Array.from(tenantConfigs.values());
    
    if (!includeSystem) {
      return entries.filter(entry => !entry.isSystem);
    }

    return entries;
  }

  /**
   * Set configuration value
   * 
   * @param key - Configuration key
   * @param value - Configuration value
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @param options - Update options
   */
  public async setConfig(
    key: string,
    value: ConfigValue,
    tenantId?: string,
    options: ConfigUpdateOptions = {}
  ): Promise<void> {
    const targetTenantId = tenantId || tenantContextManager.getTenantId();
    
    if (!targetTenantId) {
      throw new TenantConfigError('Tenant context is required to set configuration');
    }

    // Validate key
    if (!key || key.trim().length === 0) {
      throw new TenantConfigError('Configuration key cannot be empty');
    }

    // Check if configuration exists and is system configuration
    const existingEntry = await this.getConfigEntry(key, targetTenantId);
    if (existingEntry && existingEntry.isSystem && !options.allowSystemUpdate) {
      throw new TenantConfigError(
        `Cannot update system configuration '${key}'. System configurations are read-only.`
      );
    }

    // Validate value if requested
    if (options.validate) {
      this.validateConfigValue(key, value);
    }

    // Determine value type
    const type = this.getValueType(value);

    // Create configuration entry
    const entry: ConfigEntry = {
      key,
      value,
      type,
      isSystem: existingEntry?.isSystem ?? false,
      updatedAt: new Date(),
    };

    // Get or create tenant config map
    let tenantConfigs = this.configCache.get(targetTenantId);
    if (!tenantConfigs) {
      tenantConfigs = new Map();
      this.configCache.set(targetTenantId, tenantConfigs);
    }

    // Set configuration
    tenantConfigs.set(key, entry);
  }

  /**
   * Set multiple configuration values
   * 
   * @param configs - Map of configuration key-value pairs
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @param options - Update options
   */
  public async setConfigs(
    configs: Map<string, ConfigValue>,
    tenantId?: string,
    options: ConfigUpdateOptions = {}
  ): Promise<void> {
    for (const [key, value] of configs.entries()) {
      await this.setConfig(key, value, tenantId, options);
    }
  }

  /**
   * Delete configuration
   * 
   * @param key - Configuration key
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @param allowSystemDelete - Allow deleting system configurations
   */
  public async deleteConfig(
    key: string,
    tenantId?: string,
    allowSystemDelete: boolean = false
  ): Promise<void> {
    const targetTenantId = tenantId || tenantContextManager.getTenantId();
    
    if (!targetTenantId) {
      throw new TenantConfigError('Tenant context is required to delete configuration');
    }

    const tenantConfigs = this.configCache.get(targetTenantId);
    if (!tenantConfigs) {
      return;
    }

    // Check if configuration is system configuration
    const entry = tenantConfigs.get(key);
    if (entry && entry.isSystem && !allowSystemDelete) {
      throw new TenantConfigError(
        `Cannot delete system configuration '${key}'. System configurations are protected.`
      );
    }

    tenantConfigs.delete(key);
  }

  /**
   * Check if configuration exists
   * 
   * @param key - Configuration key
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @returns True if configuration exists
   */
  public async hasConfig(key: string, tenantId?: string): Promise<boolean> {
    const value = await this.getConfig(key, tenantId);
    return value !== null;
  }

  /**
   * Get configuration entry (including metadata)
   * 
   * @param key - Configuration key
   * @param tenantId - Tenant ID (defaults to current tenant)
   * @returns Configuration entry or null if not found
   */
  public async getConfigEntry(
    key: string,
    tenantId?: string
  ): Promise<ConfigEntry | null> {
    const targetTenantId = tenantId || tenantContextManager.getTenantId();
    
    if (!targetTenantId) {
      throw new TenantConfigError('Tenant context is required to get configuration entry');
    }

    const tenantConfigs = this.configCache.get(targetTenantId);
    if (!tenantConfigs) {
      return null;
    }

    return tenantConfigs.get(key) || null;
  }

  /**
   * Set system configuration (read-only for tenants)
   * 
   * @param key - Configuration key
   * @param value - Configuration value
   * @param tenantId - Tenant ID
   */
  public async setSystemConfig(
    key: string,
    value: ConfigValue,
    tenantId: string
  ): Promise<void> {
    const type = this.getValueType(value);

    const entry: ConfigEntry = {
      key,
      value,
      type,
      isSystem: true,
      updatedAt: new Date(),
    };

    let tenantConfigs = this.configCache.get(tenantId);
    if (!tenantConfigs) {
      tenantConfigs = new Map();
      this.configCache.set(tenantId, tenantConfigs);
    }

    tenantConfigs.set(key, entry);
  }

  /**
   * Clear all configurations for a tenant
   * 
   * @param tenantId - Tenant ID
   * @param includeSystem - Clear system configurations (default: false)
   */
  public async clearConfigs(
    tenantId: string,
    includeSystem: boolean = false
  ): Promise<void> {
    const tenantConfigs = this.configCache.get(tenantId);
    if (!tenantConfigs) {
      return;
    }

    if (includeSystem) {
      this.configCache.delete(tenantId);
    } else {
      // Only delete non-system configurations
      for (const [key, entry] of tenantConfigs.entries()) {
        if (!entry.isSystem) {
          tenantConfigs.delete(key);
        }
      }
    }
  }

  /**
   * Get value type
   * 
   * @param value - Configuration value
   * @returns Value type
   */
  private getValueType(value: ConfigValue): 'string' | 'number' | 'boolean' | 'object' {
    if (value === null) {
      return 'object';
    }

    if (typeof value === 'string') {
      return 'string';
    }

    if (typeof value === 'number') {
      return 'number';
    }

    if (typeof value === 'boolean') {
      return 'boolean';
    }

    return 'object';
  }

  /**
   * Validate configuration value
   * 
   * @param key - Configuration key
   * @param value - Configuration value
   * @throws TenantConfigError if validation fails
   */
  private validateConfigValue(key: string, value: ConfigValue): void {
    // Add custom validation logic here based on key patterns
    // For example:
    // - Validate email format for keys ending with '_email'
    // - Validate URL format for keys ending with '_url'
    // - Validate numeric ranges for specific keys

    // Basic validation: check if value is not undefined
    if (value === undefined) {
      throw new TenantConfigError(
        `Invalid configuration value for '${key}': value cannot be undefined`
      );
    }
  }

  /**
   * Clear all configuration cache
   */
  public clearCache(): void {
    this.configCache.clear();
  }
}

/**
 * Singleton instance of Tenant Configuration Manager
 */
export const tenantConfigManager = TenantConfigManager.getInstance();
