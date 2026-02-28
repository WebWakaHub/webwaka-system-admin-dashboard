// CivicPlatformSystem — Type Definitions
// System ID: SYS-GOV-CIVICPLATFORM
// Content Hash: fec00688

export const SYSTEM_ID = 'SYS-GOV-CIVICPLATFORM';
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
export interface CitizenPortalOrgan {
  initialize(): Promise<void>;
  execute(command: CitizenPortalCommand): Promise<CitizenPortalResult>;
  executeOffline(command: CitizenPortalCommand): Promise<CitizenPortalResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface PolicyManagerOrgan {
  initialize(): Promise<void>;
  execute(command: PolicyManagerCommand): Promise<PolicyManagerResult>;
  executeOffline(command: PolicyManagerCommand): Promise<PolicyManagerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ServiceCatalogOrgan {
  initialize(): Promise<void>;
  execute(command: ServiceCatalogCommand): Promise<ServiceCatalogResult>;
  executeOffline(command: ServiceCatalogCommand): Promise<ServiceCatalogResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface FeedbackEngineOrgan {
  initialize(): Promise<void>;
  execute(command: FeedbackEngineCommand): Promise<FeedbackEngineResult>;
  executeOffline(command: FeedbackEngineCommand): Promise<FeedbackEngineResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface TransparencyDashboardOrgan {
  initialize(): Promise<void>;
  execute(command: TransparencyDashboardCommand): Promise<TransparencyDashboardResult>;
  executeOffline(command: TransparencyDashboardCommand): Promise<TransparencyDashboardResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface CitizenPortalCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface CitizenPortalResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface PolicyManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface PolicyManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ServiceCatalogCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ServiceCatalogResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface FeedbackEngineCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface FeedbackEngineResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface TransparencyDashboardCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface TransparencyDashboardResult {
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
