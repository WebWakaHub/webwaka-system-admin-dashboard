// MarketplacePlatformSystem — Type Definitions
// System ID: SYS-EXT-MARKETPLACEPLATFORM
// Content Hash: ca4ffc0c

export const SYSTEM_ID = 'SYS-EXT-MARKETPLACEPLATFORM';
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
export interface VendorManagerOrgan {
  initialize(): Promise<void>;
  execute(command: VendorManagerCommand): Promise<VendorManagerResult>;
  executeOffline(command: VendorManagerCommand): Promise<VendorManagerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ListingEngineOrgan {
  initialize(): Promise<void>;
  execute(command: ListingEngineCommand): Promise<ListingEngineResult>;
  executeOffline(command: ListingEngineCommand): Promise<ListingEngineResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface TransactionProcessorOrgan {
  initialize(): Promise<void>;
  execute(command: TransactionProcessorCommand): Promise<TransactionProcessorResult>;
  executeOffline(command: TransactionProcessorCommand): Promise<TransactionProcessorResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ReviewSystemOrgan {
  initialize(): Promise<void>;
  execute(command: ReviewSystemCommand): Promise<ReviewSystemResult>;
  executeOffline(command: ReviewSystemCommand): Promise<ReviewSystemResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface DisputeResolutionOrgan {
  initialize(): Promise<void>;
  execute(command: DisputeResolutionCommand): Promise<DisputeResolutionResult>;
  executeOffline(command: DisputeResolutionCommand): Promise<DisputeResolutionResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface VendorManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface VendorManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ListingEngineCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ListingEngineResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface TransactionProcessorCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface TransactionProcessorResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ReviewSystemCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ReviewSystemResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface DisputeResolutionCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface DisputeResolutionResult {
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
