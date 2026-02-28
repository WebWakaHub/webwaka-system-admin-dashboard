// AssetPlatformSystem — Type Definitions
// System ID: SYS-RES-ASSETPLATFORM
// Content Hash: 3c7597ec

export const SYSTEM_ID = 'SYS-RES-ASSETPLATFORM';
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
export interface AssetRegistryOrgan {
  initialize(): Promise<void>;
  execute(command: AssetRegistryCommand): Promise<AssetRegistryResult>;
  executeOffline(command: AssetRegistryCommand): Promise<AssetRegistryResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface LifecycleManagerOrgan {
  initialize(): Promise<void>;
  execute(command: LifecycleManagerCommand): Promise<LifecycleManagerResult>;
  executeOffline(command: LifecycleManagerCommand): Promise<LifecycleManagerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface MaintenanceSchedulerOrgan {
  initialize(): Promise<void>;
  execute(command: MaintenanceSchedulerCommand): Promise<MaintenanceSchedulerResult>;
  executeOffline(command: MaintenanceSchedulerCommand): Promise<MaintenanceSchedulerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface DepreciationCalculatorOrgan {
  initialize(): Promise<void>;
  execute(command: DepreciationCalculatorCommand): Promise<DepreciationCalculatorResult>;
  executeOffline(command: DepreciationCalculatorCommand): Promise<DepreciationCalculatorResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface AuditTrailOrgan {
  initialize(): Promise<void>;
  execute(command: AuditTrailCommand): Promise<AuditTrailResult>;
  executeOffline(command: AuditTrailCommand): Promise<AuditTrailResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface AssetRegistryCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface AssetRegistryResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface LifecycleManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface LifecycleManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface MaintenanceSchedulerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface MaintenanceSchedulerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface DepreciationCalculatorCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface DepreciationCalculatorResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface AuditTrailCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface AuditTrailResult {
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
