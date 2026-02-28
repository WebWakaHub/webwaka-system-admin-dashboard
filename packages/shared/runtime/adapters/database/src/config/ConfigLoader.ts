/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * ConfigLoader — Configuration loading with Nigeria-First mode support
 *
 * Issue: webwaka-runtime-universe#20 (P3-T03)
 */

import {
  DatabaseAdapterConfig,
  DEFAULT_CONFIG,
  NIGERIA_FIRST_OVERRIDES,
} from '../types/config';
import { DatabaseError, DatabaseErrorCode } from '../types/errors';

export class ConfigLoader {
  /**
   * Load and validate configuration from environment or provided config.
   * Applies Nigeria-First overrides when nigeriaFirstMode is true.
   */
  static load(userConfig: Partial<DatabaseAdapterConfig>): DatabaseAdapterConfig {
    // Merge with defaults
    const merged: DatabaseAdapterConfig = {
      engine: userConfig.engine || 'postgresql',
      mode: userConfig.mode || 'saas-multitenant',
      connection: userConfig.connection || { database: '' },
      pool: { ...DEFAULT_CONFIG.pool!, ...userConfig.pool },
      retry: { ...DEFAULT_CONFIG.retry!, ...userConfig.retry },
      circuitBreaker: { ...DEFAULT_CONFIG.circuitBreaker!, ...userConfig.circuitBreaker },
      nigeriaFirstMode: userConfig.nigeriaFirstMode ?? false,
      observability: { ...DEFAULT_CONFIG.observability!, ...userConfig.observability },
      migration: { ...DEFAULT_CONFIG.migration!, ...userConfig.migration },
      sync: userConfig.sync,
    };

    // Apply Nigeria-First overrides
    if (merged.nigeriaFirstMode) {
      merged.pool = { ...merged.pool, ...NIGERIA_FIRST_OVERRIDES.pool };
      merged.retry = { ...merged.retry, ...NIGERIA_FIRST_OVERRIDES.retry };
      merged.circuitBreaker = { ...merged.circuitBreaker, ...NIGERIA_FIRST_OVERRIDES.circuitBreaker };
    }

    // Validate
    ConfigLoader.validate(merged);

    return merged;
  }

  /**
   * Load configuration from environment variables.
   */
  static loadFromEnv(): DatabaseAdapterConfig {
    const engine = (process.env.WEBWAKA_DB_ENGINE || 'postgresql') as any;
    const mode = (process.env.WEBWAKA_DB_MODE || 'saas-multitenant') as any;

    return ConfigLoader.load({
      engine,
      mode,
      nigeriaFirstMode: process.env.WEBWAKA_NIGERIA_FIRST === 'true',
      connection: {
        host: process.env.WEBWAKA_DB_HOST,
        port: process.env.WEBWAKA_DB_PORT ? parseInt(process.env.WEBWAKA_DB_PORT) : undefined,
        database: process.env.WEBWAKA_DB_NAME || 'webwaka',
        username: process.env.WEBWAKA_DB_USER,
        passwordRef: 'WEBWAKA_DB_PASSWORD',
        tls: {
          enabled: process.env.WEBWAKA_DB_TLS === 'true',
          rejectUnauthorized: process.env.WEBWAKA_DB_TLS_REJECT_UNAUTHORIZED !== 'false',
        },
      },
    });
  }

  /**
   * Validate configuration for consistency and completeness.
   */
  private static validate(config: DatabaseAdapterConfig): void {
    const errors: string[] = [];

    // Engine validation
    const validEngines = ['postgresql', 'sqlite', 'mysql', 'tidb'];
    if (!validEngines.includes(config.engine)) {
      errors.push(`Invalid engine: ${config.engine}. Must be one of: ${validEngines.join(', ')}`);
    }

    // Mode validation
    const validModes = ['saas-multitenant', 'enterprise-dedicated', 'offline'];
    if (!validModes.includes(config.mode)) {
      errors.push(`Invalid mode: ${config.mode}. Must be one of: ${validModes.join(', ')}`);
    }

    // Offline mode requires SQLite
    if (config.mode === 'offline' && config.engine !== 'sqlite') {
      errors.push('Offline mode requires SQLite engine');
    }

    // Connection validation
    if (!config.connection.database) {
      errors.push('Connection database name is required');
    }

    // Pool validation
    if (config.pool.minConnections > config.pool.maxConnections) {
      errors.push('Pool minConnections cannot exceed maxConnections');
    }
    if (config.pool.minConnections < 0) {
      errors.push('Pool minConnections must be non-negative');
    }

    // Sync config required for offline mode
    if (config.mode === 'offline' && !config.sync) {
      errors.push('Sync configuration is required for offline mode');
    }

    if (errors.length > 0) {
      throw new DatabaseError(
        DatabaseErrorCode.VALIDATION_ERROR,
        `Configuration validation failed:\n${errors.map((e) => `  - ${e}`).join('\n')}`,
        undefined,
        { errors },
      );
    }
  }
}
