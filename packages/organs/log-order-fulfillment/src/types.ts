/**
 * OrderFulfillment Organ — Domain Types
 * Organ ID: ORGX-LOG-ORDER_FULFILLMENT
 * Domain: Logistics and Supply Chain
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
  operation: 'OrderFulfillmentCommand';
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
export interface OrderFulfillmentCommand {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  idempotencyKey: string;
  source: 'ORGX-LOG-ORDER_FULFILLMENT';
}

// Domain Event
export interface OrderFulfillmentEvent {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  timestamp: number;
  organId: 'ORGX-LOG-ORDER_FULFILLMENT';
  version: number;
  causationId: string;
}

// Domain Query
export interface OrderFulfillmentQuery {
  type: string;
  filters: Record<string, unknown>;
  pagination: { offset: number; limit: number };
  locale: string;
  offlineCapable: boolean;
}

// Domain State
export interface OrderFulfillmentState {
  version: number;
  lastUpdated: number;
  data: Record<string, unknown>;
  syncStatus: 'synced' | 'pending' | 'conflict';
  offlineChanges: OfflineQueueEntry[];
}

// AI Inference Interface (Vendor Neutral)
export interface OrderFulfillmentAIInference {
  provider: string;
  model: string;
  invoke(input: Record<string, unknown>): Promise<Record<string, unknown>>;
  invokeOffline(input: Record<string, unknown>): Record<string, unknown>;
}

// Organ Health
export interface OrderFulfillmentHealth {
  organId: 'ORGX-LOG-ORDER_FULFILLMENT';
  status: 'healthy' | 'degraded' | 'offline' | 'error';
  tissueHealth: Record<string, 'healthy' | 'degraded' | 'error'>;
  offlineQueueSize: number;
  lastSyncTimestamp: number;
  networkConfig: NetworkConfig;
}
