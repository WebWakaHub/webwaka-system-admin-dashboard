// AnalyticsPlatformSystem — Type Definitions
// System ID: SYS-ANA-ANALYTICSPLATFORM
// Content Hash: 11fc3779

export const SYSTEM_ID = 'SYS-ANA-ANALYTICSPLATFORM';
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
export interface DataCollectionOrgan {
  initialize(): Promise<void>;
  execute(command: DataCollectionCommand): Promise<DataCollectionResult>;
  executeOffline(command: DataCollectionCommand): Promise<DataCollectionResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface DataProcessingOrgan {
  initialize(): Promise<void>;
  execute(command: DataProcessingCommand): Promise<DataProcessingResult>;
  executeOffline(command: DataProcessingCommand): Promise<DataProcessingResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface VisualizationEngineOrgan {
  initialize(): Promise<void>;
  execute(command: VisualizationEngineCommand): Promise<VisualizationEngineResult>;
  executeOffline(command: VisualizationEngineCommand): Promise<VisualizationEngineResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ReportGeneratorOrgan {
  initialize(): Promise<void>;
  execute(command: ReportGeneratorCommand): Promise<ReportGeneratorResult>;
  executeOffline(command: ReportGeneratorCommand): Promise<ReportGeneratorResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface DashboardManagerOrgan {
  initialize(): Promise<void>;
  execute(command: DashboardManagerCommand): Promise<DashboardManagerResult>;
  executeOffline(command: DashboardManagerCommand): Promise<DashboardManagerResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface DataCollectionCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface DataCollectionResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface DataProcessingCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface DataProcessingResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface VisualizationEngineCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface VisualizationEngineResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ReportGeneratorCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ReportGeneratorResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface DashboardManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface DashboardManagerResult {
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
