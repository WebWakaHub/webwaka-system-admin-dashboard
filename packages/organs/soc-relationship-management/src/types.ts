/**
 * RelationshipManagement Organ — Domain Types
 * Organ ID: ORGX-SOC-RELATIONSHIP_MANAGEMENT
 * Domain: Social and Relationship
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
  operation: 'RelationshipManagementCommand';
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
export interface RelationshipManagementCommand {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  idempotencyKey: string;
  source: 'ORGX-SOC-RELATIONSHIP_MANAGEMENT';
}

// Domain Event
export interface RelationshipManagementEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  organId: 'ORGX-SOC-RELATIONSHIP_MANAGEMENT';
  version: number;
  causationId: string;
}

// Domain Query
export interface RelationshipManagementQuery {
  type: string;
  filters: Record<string, unknown>;
  pagination: { offset: number; limit: number };
  locale: string;
  offlineCapable: boolean;
}

// Domain State
export interface RelationshipManagementState {
  version: number;
  lastUpdated: number;
  data: Record<string, unknown>;
  syncStatus: 'synced' | 'pending' | 'conflict';
  offlineChanges: OfflineQueueEntry[];
}

// AI Inference Interface (Vendor Neutral)
export interface RelationshipManagementAIInference {
  provider: string;
  model: string;
  invoke(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  invokeOffline(input: Record<string, unknown>): Record<string, unknown>;
}

// Organ Health
export interface RelationshipManagementHealth {
  organId: 'ORGX-SOC-RELATIONSHIP_MANAGEMENT';
  status: 'healthy' | 'degraded' | 'offline' | 'error';
  tissueHealth: Record<string, 'healthy' | 'degraded' | 'error'>;
  offlineQueueSize: number;
  lastSyncTimestamp: number;
  networkConfig: NetworkConfig;
}
