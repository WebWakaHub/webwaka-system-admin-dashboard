// EnterprisePlatformSystem — Type Definitions
// System ID: SYS-ENT-ENTERPRISEPLATFORM
// Content Hash: 424f19d8

export const SYSTEM_ID = 'SYS-ENT-ENTERPRISEPLATFORM';
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
export interface WorkflowEngineOrgan {
  initialize(): Promise<void>;
  execute(command: WorkflowEngineCommand): Promise<WorkflowEngineResult>;
  executeOffline(command: WorkflowEngineCommand): Promise<WorkflowEngineResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ResourcePlannerOrgan {
  initialize(): Promise<void>;
  execute(command: ResourcePlannerCommand): Promise<ResourcePlannerResult>;
  executeOffline(command: ResourcePlannerCommand): Promise<ResourcePlannerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface OperationsManagerOrgan {
  initialize(): Promise<void>;
  execute(command: OperationsManagerCommand): Promise<OperationsManagerResult>;
  executeOffline(command: OperationsManagerCommand): Promise<OperationsManagerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface TaskSchedulerOrgan {
  initialize(): Promise<void>;
  execute(command: TaskSchedulerCommand): Promise<TaskSchedulerResult>;
  executeOffline(command: TaskSchedulerCommand): Promise<TaskSchedulerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ApprovalEngineOrgan {
  initialize(): Promise<void>;
  execute(command: ApprovalEngineCommand): Promise<ApprovalEngineResult>;
  executeOffline(command: ApprovalEngineCommand): Promise<ApprovalEngineResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface WorkflowEngineCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface WorkflowEngineResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ResourcePlannerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ResourcePlannerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface OperationsManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface OperationsManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface TaskSchedulerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface TaskSchedulerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ApprovalEngineCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ApprovalEngineResult {
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
