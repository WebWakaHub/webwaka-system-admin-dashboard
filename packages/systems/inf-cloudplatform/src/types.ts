// CloudPlatformSystem — Type Definitions
// System ID: SYS-INF-CLOUDPLATFORM
// Content Hash: b8c7890c

export const SYSTEM_ID = 'SYS-INF-CLOUDPLATFORM';
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
export interface ComputeManagerOrgan {
  initialize(): Promise<void>;
  execute(command: ComputeManagerCommand): Promise<ComputeManagerResult>;
  executeOffline(command: ComputeManagerCommand): Promise<ComputeManagerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface StorageEngineOrgan {
  initialize(): Promise<void>;
  execute(command: StorageEngineCommand): Promise<StorageEngineResult>;
  executeOffline(command: StorageEngineCommand): Promise<StorageEngineResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface NetworkControllerOrgan {
  initialize(): Promise<void>;
  execute(command: NetworkControllerCommand): Promise<NetworkControllerResult>;
  executeOffline(command: NetworkControllerCommand): Promise<NetworkControllerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface LoadBalancerOrgan {
  initialize(): Promise<void>;
  execute(command: LoadBalancerCommand): Promise<LoadBalancerResult>;
  executeOffline(command: LoadBalancerCommand): Promise<LoadBalancerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface MonitoringAgentOrgan {
  initialize(): Promise<void>;
  execute(command: MonitoringAgentCommand): Promise<MonitoringAgentResult>;
  executeOffline(command: MonitoringAgentCommand): Promise<MonitoringAgentResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface ComputeManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ComputeManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface StorageEngineCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface StorageEngineResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface NetworkControllerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface NetworkControllerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface LoadBalancerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface LoadBalancerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface MonitoringAgentCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface MonitoringAgentResult {
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
