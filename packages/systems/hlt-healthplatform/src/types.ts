// HealthPlatformSystem — Type Definitions
// System ID: SYS-HLT-HEALTHPLATFORM
// Content Hash: c8a9bb24

export const SYSTEM_ID = 'SYS-HLT-HEALTHPLATFORM';
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
export interface PatientRegistryOrgan {
  initialize(): Promise<void>;
  execute(command: PatientRegistryCommand): Promise<PatientRegistryResult>;
  executeOffline(command: PatientRegistryCommand): Promise<PatientRegistryResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ClinicalRecordOrgan {
  initialize(): Promise<void>;
  execute(command: ClinicalRecordCommand): Promise<ClinicalRecordResult>;
  executeOffline(command: ClinicalRecordCommand): Promise<ClinicalRecordResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface AppointmentSchedulerOrgan {
  initialize(): Promise<void>;
  execute(command: AppointmentSchedulerCommand): Promise<AppointmentSchedulerResult>;
  executeOffline(command: AppointmentSchedulerCommand): Promise<AppointmentSchedulerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface PrescriptionManagerOrgan {
  initialize(): Promise<void>;
  execute(command: PrescriptionManagerCommand): Promise<PrescriptionManagerResult>;
  executeOffline(command: PrescriptionManagerCommand): Promise<PrescriptionManagerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface HealthAnalyticsOrgan {
  initialize(): Promise<void>;
  execute(command: HealthAnalyticsCommand): Promise<HealthAnalyticsResult>;
  executeOffline(command: HealthAnalyticsCommand): Promise<HealthAnalyticsResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface PatientRegistryCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface PatientRegistryResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ClinicalRecordCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ClinicalRecordResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface AppointmentSchedulerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface AppointmentSchedulerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface PrescriptionManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface PrescriptionManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface HealthAnalyticsCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface HealthAnalyticsResult {
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
