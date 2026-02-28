// IdentityPlatformSystem — Type Definitions
// System ID: SYS-IDA-IDENTITYPLATFORM
// Content Hash: 100ccf0e

export const SYSTEM_ID = 'SYS-IDA-IDENTITYPLATFORM';
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
export interface AuthProviderOrgan {
  initialize(): Promise<void>;
  execute(command: AuthProviderCommand): Promise<AuthProviderResult>;
  executeOffline(command: AuthProviderCommand): Promise<AuthProviderResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface PermissionEngineOrgan {
  initialize(): Promise<void>;
  execute(command: PermissionEngineCommand): Promise<PermissionEngineResult>;
  executeOffline(command: PermissionEngineCommand): Promise<PermissionEngineResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface IdentityStoreOrgan {
  initialize(): Promise<void>;
  execute(command: IdentityStoreCommand): Promise<IdentityStoreResult>;
  executeOffline(command: IdentityStoreCommand): Promise<IdentityStoreResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface SessionManagerOrgan {
  initialize(): Promise<void>;
  execute(command: SessionManagerCommand): Promise<SessionManagerResult>;
  executeOffline(command: SessionManagerCommand): Promise<SessionManagerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface AuditLoggerOrgan {
  initialize(): Promise<void>;
  execute(command: AuditLoggerCommand): Promise<AuditLoggerResult>;
  executeOffline(command: AuditLoggerCommand): Promise<AuditLoggerResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface AuthProviderCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface AuthProviderResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface PermissionEngineCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface PermissionEngineResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface IdentityStoreCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface IdentityStoreResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface SessionManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface SessionManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface AuditLoggerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface AuditLoggerResult {
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
