// ConfigPlatformSystem — Type Definitions
// System ID: SYS-CFG-CONFIGPLATFORM
// Content Hash: 811d36b0

export const SYSTEM_ID = 'SYS-CFG-CONFIGPLATFORM';
export const SYSTEM_VERSION = 'v0.1.0';

// Nigeria-First Configuration
export const NIGERIA_FIRST_CONFIG = {
  defaultLocale: 'en-NG',
  defaultCurrency: 'NGN',
  defaultTimezone: 'Africa/Lagos',
  networkTimeout: 30000,
  offlineEnabled: true,
  syncRetryInterval: 5000,
};

// Offline Support Types
export interface OfflineQueueEntry {
  id: string;
  operation: string;
  payload: unknown;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
}

export interface NetworkConfig {
  timeout: number;
  retryAttempts: number;
  offlineFallback: boolean;
  syncOnReconnect: boolean;
}

// Organ Interfaces
export interface ConfigStoreOrgan {
  initialize(): Promise<void>;
  execute(command: ConfigStoreCommand): Promise<ConfigStoreResult>;
  executeOffline(command: ConfigStoreCommand): Promise<ConfigStoreResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface FeatureFlagEngineOrgan {
  initialize(): Promise<void>;
  execute(command: FeatureFlagEngineCommand): Promise<FeatureFlagEngineResult>;
  executeOffline(command: FeatureFlagEngineCommand): Promise<FeatureFlagEngineResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface EnvironmentManagerOrgan {
  initialize(): Promise<void>;
  execute(command: EnvironmentManagerCommand): Promise<EnvironmentManagerResult>;
  executeOffline(command: EnvironmentManagerCommand): Promise<EnvironmentManagerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface SecretVaultOrgan {
  initialize(): Promise<void>;
  execute(command: SecretVaultCommand): Promise<SecretVaultResult>;
  executeOffline(command: SecretVaultCommand): Promise<SecretVaultResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ConfigSyncOrgan {
  initialize(): Promise<void>;
  execute(command: ConfigSyncCommand): Promise<ConfigSyncResult>;
  executeOffline(command: ConfigSyncCommand): Promise<ConfigSyncResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface ConfigStoreCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ConfigStoreResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface FeatureFlagEngineCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface FeatureFlagEngineResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface EnvironmentManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface EnvironmentManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface SecretVaultCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface SecretVaultResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ConfigSyncCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ConfigSyncResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface OrganHealth {
  status: 'healthy' | 'degraded' | 'offline';
  lastSync: number;
  pendingOperations: number;
}

export interface SystemCapability {
  name: string;
  available: boolean;
  offlineSupport: boolean;
}
