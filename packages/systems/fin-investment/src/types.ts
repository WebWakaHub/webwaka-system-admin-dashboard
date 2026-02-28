// InvestmentSystem — Type Definitions
// System ID: SYS-FIN-INVESTMENT
// Content Hash: 17a2efd6

export const SYSTEM_ID = 'SYS-FIN-INVESTMENT';
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
export interface PortfolioManagerOrgan {
  initialize(): Promise<void>;
  execute(command: PortfolioManagerCommand): Promise<PortfolioManagerResult>;
  executeOffline(command: PortfolioManagerCommand): Promise<PortfolioManagerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface TradingEngineOrgan {
  initialize(): Promise<void>;
  execute(command: TradingEngineCommand): Promise<TradingEngineResult>;
  executeOffline(command: TradingEngineCommand): Promise<TradingEngineResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface RiskAnalyzerOrgan {
  initialize(): Promise<void>;
  execute(command: RiskAnalyzerCommand): Promise<RiskAnalyzerResult>;
  executeOffline(command: RiskAnalyzerCommand): Promise<RiskAnalyzerResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface MarketDataFeedOrgan {
  initialize(): Promise<void>;
  execute(command: MarketDataFeedCommand): Promise<MarketDataFeedResult>;
  executeOffline(command: MarketDataFeedCommand): Promise<MarketDataFeedResult>;
  getHealth(): Promise<OrganHealth>;
}
export interface PerformanceReporterOrgan {
  initialize(): Promise<void>;
  execute(command: PerformanceReporterCommand): Promise<PerformanceReporterResult>;
  executeOffline(command: PerformanceReporterCommand): Promise<PerformanceReporterResult>;
  getHealth(): Promise<OrganHealth>;
}

// Command and Result Types
export interface PortfolioManagerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface PortfolioManagerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface TradingEngineCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface TradingEngineResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface RiskAnalyzerCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface RiskAnalyzerResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface MarketDataFeedCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface MarketDataFeedResult {
  success: boolean;
  data: unknown;
  syncStatus: 'synced' | 'pending' | 'conflict';
}
export interface PerformanceReporterCommand {
  type: string;
  payload: unknown;
  locale: string;
  offline: boolean;
}

export interface PerformanceReporterResult {
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
