/**
 * RUNTIME-ADAPTER-DATABASE-v0.1.0
 * Configuration Types
 *
 * Issue: webwaka-runtime-universe#18 (P3-T01)
 */

export type DatabaseEngine = 'postgresql' | 'sqlite' | 'mysql' | 'tidb';
export type DeploymentMode = 'saas-multitenant' | 'enterprise-dedicated' | 'offline';

export interface DatabaseAdapterConfig {
  engine: DatabaseEngine;
  mode: DeploymentMode;
  connection: ConnectionConfig;
  pool: PoolConfig;
  retry: RetryConfig;
  circuitBreaker: CircuitBreakerConfig;
  nigeriaFirstMode: boolean;
  observability: ObservabilityConfig;
  migration: MigrationConfig;
  sync?: SyncConfig;
}

export interface ConnectionConfig {
  host?: string;
  port?: number;
  database: string;
  username?: string;
  passwordRef?: string;
  tls?: {
    enabled: boolean;
    rejectUnauthorized: boolean;
    ca?: string;
  };
}

export interface PoolConfig {
  minConnections: number;
  maxConnections: number;
  acquireTimeout: number;
  idleTimeout: number;
  maxLifetime: number;
  validationInterval: number;
}

export interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  retryableErrors: string[];
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  resetTimeout: number;
  successThreshold: number;
}

export interface ObservabilityConfig {
  metricsEnabled: boolean;
  metricsPrefix: string;
  slowQueryThreshold: number;
  logLevel: 'debug' | 'info' | 'warn' | 'error';
}

export interface MigrationConfig {
  autoMigrate: boolean;
  migrationsDir: string;
  lockTimeout: number;
}

export interface SyncConfig {
  syncInterval: number;
  maxBatchSize: number;
  conflictStrategy: 'lww' | 'vector-clock' | 'manual';
  priorityRules: PriorityRule[];
}

export interface PriorityRule {
  tableName: string;
  priority: number;
}

/**
 * Default configuration with Nigeria-First adjustments.
 */
export const DEFAULT_CONFIG: Partial<DatabaseAdapterConfig> = {
  pool: {
    minConnections: 2,
    maxConnections: 20,
    acquireTimeout: 10000,
    idleTimeout: 300000,
    maxLifetime: 1800000,
    validationInterval: 30000,
  },
  retry: {
    maxRetries: 3,
    baseDelay: 200,
    maxDelay: 5000,
    retryableErrors: ['CONNECTION_FAILED', 'DEADLOCK', 'QUERY_TIMEOUT'],
  },
  circuitBreaker: {
    failureThreshold: 5,
    resetTimeout: 30000,
    successThreshold: 3,
  },
  observability: {
    metricsEnabled: true,
    metricsPrefix: 'webwaka_db',
    slowQueryThreshold: 1000,
    logLevel: 'info',
  },
  migration: {
    autoMigrate: false,
    migrationsDir: './migrations',
    lockTimeout: 30000,
  },
};

export const NIGERIA_FIRST_OVERRIDES: Partial<DatabaseAdapterConfig> = {
  pool: {
    minConnections: 1,
    maxConnections: 5,
    acquireTimeout: 30000,
    idleTimeout: 60000,
    maxLifetime: 1800000,
    validationInterval: 60000,
  },
  retry: {
    maxRetries: 5,
    baseDelay: 500,
    maxDelay: 15000,
    retryableErrors: ['CONNECTION_FAILED', 'DEADLOCK', 'QUERY_TIMEOUT'],
  },
  circuitBreaker: {
    failureThreshold: 10,
    resetTimeout: 60000,
    successThreshold: 3,
  },
};
