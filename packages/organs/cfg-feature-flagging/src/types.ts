/**
 * FeatureFlagging Organ — Domain Types
 * Organ ID: ORGX-CFG-FEATURE_FLAGGING
 * Domain: Configuration and Policy Management
 * 
 * Doctrines: Build Once Use Infinitely, Mobile First, PWA First,
 *            Offline First, Nigeria First, Africa First, Vendor Neutral AI
 */

// Nigeria-First Configuration
export const NIGERIA_FIRST_CONFIG = {
  timeout: 30_000,
  locale: 'en-NG',
  currency: 'NGN',
  region: 'NG',
  maxRetries: 5,
  retryBackoff: 5_000,
  maxBackoff: 300_000,
  offlineQueueCapacity: 1_000,
} as const;

// Offline Queue Entry
export interface OfflineQueueEntry<T = unknown> {
  id: string;
  timestamp: number;
  operation: 'FeatureFlaggingCommand';
  payload: T;
  retryCount: number;
  lastAttempt: number | null;
  status: 'pending' | 'processing' | 'failed' | 'synced';
}

// Network Configuration
export interface NetworkConfig {
  isOnline: boolean;
  connectionType: 'wifi' | '4g' | '3g' | '2g' | 'slow-2g' | 'offline';
  effectiveBandwidth: number;
  rtt: number;
  timeout: number;
}

// Domain Command
export interface FeatureFlaggingCommand {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  idempotencyKey: string;
  source: 'ORGX-CFG-FEATURE_FLAGGING';
}

// Domain Event
export interface FeatureFlaggingEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  organId: 'ORGX-CFG-FEATURE_FLAGGING';
  version: number;
  causationId: string;
}

// Domain Query
export interface FeatureFlaggingQuery {
  type: string;
  filters: Record<string, unknown>;
  pagination: { offset: number; limit: number };
  locale: string;
  offlineCapable: boolean;
}

// Domain State
export interface FeatureFlaggingState {
  version: number;
  lastUpdated: number;
  data: Record<string, unknown>;
  syncStatus: 'synced' | 'pending' | 'conflict';
  offlineChanges: OfflineQueueEntry[];
}

// AI Inference Interface (Vendor Neutral)
export interface FeatureFlaggingAIInference {
  provider: string;
  model: string;
  invoke(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  invokeOffline(input: Record<string, unknown>): Record<string, unknown>;
}

// Organ Health
export interface FeatureFlaggingHealth {
  organId: 'ORGX-CFG-FEATURE_FLAGGING';
  status: 'healthy' | 'degraded' | 'offline' | 'error';
  tissueHealth: Record<string, 'healthy' | 'degraded' | 'error'>;
  offlineQueueSize: number;
  lastSyncTimestamp: number;
  networkConfig: NetworkConfig;
}
