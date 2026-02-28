// BankingSystem — Type Definitions
// System ID: SYS-FIN-BANKING
// Content Hash: 1042afb4

export const SYSTEM_ID = 'SYS-FIN-BANKING';
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
export interface AccountManagerOrgan {
  initialize(): Promise<void>;
  execute(command: AccountManagerCommand): Promise<AccountManagerResult>;
  executeOffline(command: AccountManagerCommand): Promise<AccountManagerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface TransactionEngineOrgan {
  initialize(): Promise<void>;
  execute(command: TransactionEngineCommand): Promise<TransactionEngineResult>;
  executeOffline(command: TransactionEngineCommand): Promise<TransactionEngineResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface ComplianceMonitorOrgan {
  initialize(): Promise<void>;
  execute(command: ComplianceMonitorCommand): Promise<ComplianceMonitorResult>;
  executeOffline(command: ComplianceMonitorCommand): Promise<ComplianceMonitorResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface StatementGeneratorOrgan {
  initialize(): Promise<void>;
  execute(command: StatementGeneratorCommand): Promise<StatementGeneratorResult>;
  executeOffline(command: StatementGeneratorCommand): Promise<StatementGeneratorResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface InterestCalculatorOrgan {
  initialize(): Promise<void>;
  execute(command: InterestCalculatorCommand): Promise<InterestCalculatorResult>;
  executeOffline(command: InterestCalculatorCommand): Promise<InterestCalculatorResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface AccountManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface AccountManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface TransactionEngineCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface TransactionEngineResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface ComplianceMonitorCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface ComplianceMonitorResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface StatementGeneratorCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface StatementGeneratorResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface InterestCalculatorCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface InterestCalculatorResult {
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
