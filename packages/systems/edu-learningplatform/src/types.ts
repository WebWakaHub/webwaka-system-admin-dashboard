// LearningPlatformSystem — Type Definitions
// System ID: SYS-EDU-LEARNINGPLATFORM
// Content Hash: b1a5aaa8

export const SYSTEM_ID = 'SYS-EDU-LEARNINGPLATFORM';
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
export interface CourseManagerOrgan {
  initialize(): Promise<void>;
  execute(command: CourseManagerCommand): Promise<CourseManagerResult>;
  executeOffline(command: CourseManagerCommand): Promise<CourseManagerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface AssessmentEngineOrgan {
  initialize(): Promise<void>;
  execute(command: AssessmentEngineCommand): Promise<AssessmentEngineResult>;
  executeOffline(command: AssessmentEngineCommand): Promise<AssessmentEngineResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface LearnerProfileOrgan {
  initialize(): Promise<void>;
  execute(command: LearnerProfileCommand): Promise<LearnerProfileResult>;
  executeOffline(command: LearnerProfileCommand): Promise<LearnerProfileResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ContentDeliveryOrgan {
  initialize(): Promise<void>;
  execute(command: ContentDeliveryCommand): Promise<ContentDeliveryResult>;
  executeOffline(command: ContentDeliveryCommand): Promise<ContentDeliveryResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ProgressTrackerOrgan {
  initialize(): Promise<void>;
  execute(command: ProgressTrackerCommand): Promise<ProgressTrackerResult>;
  executeOffline(command: ProgressTrackerCommand): Promise<ProgressTrackerResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface CourseManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface CourseManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface AssessmentEngineCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface AssessmentEngineResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface LearnerProfileCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface LearnerProfileResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ContentDeliveryCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ContentDeliveryResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ProgressTrackerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ProgressTrackerResult {
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
