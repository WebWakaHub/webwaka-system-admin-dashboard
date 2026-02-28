// ContentPlatformSystem — Type Definitions
// System ID: SYS-MED-CONTENTPLATFORM
// Content Hash: 8ef6607e

export const SYSTEM_ID = 'SYS-MED-CONTENTPLATFORM';
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
export interface ContentEditorOrgan {
  initialize(): Promise<void>;
  execute(command: ContentEditorCommand): Promise<ContentEditorResult>;
  executeOffline(command: ContentEditorCommand): Promise<ContentEditorResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface MediaLibraryOrgan {
  initialize(): Promise<void>;
  execute(command: MediaLibraryCommand): Promise<MediaLibraryResult>;
  executeOffline(command: MediaLibraryCommand): Promise<MediaLibraryResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface DistributionEngineOrgan {
  initialize(): Promise<void>;
  execute(command: DistributionEngineCommand): Promise<DistributionEngineResult>;
  executeOffline(command: DistributionEngineCommand): Promise<DistributionEngineResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ModerationSystemOrgan {
  initialize(): Promise<void>;
  execute(command: ModerationSystemCommand): Promise<ModerationSystemResult>;
  executeOffline(command: ModerationSystemCommand): Promise<ModerationSystemResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface AnalyticsTrackerOrgan {
  initialize(): Promise<void>;
  execute(command: AnalyticsTrackerCommand): Promise<AnalyticsTrackerResult>;
  executeOffline(command: AnalyticsTrackerCommand): Promise<AnalyticsTrackerResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface ContentEditorCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ContentEditorResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface MediaLibraryCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface MediaLibraryResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface DistributionEngineCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface DistributionEngineResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ModerationSystemCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ModerationSystemResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface AnalyticsTrackerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface AnalyticsTrackerResult {
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
