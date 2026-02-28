/**
 * CognitivefabricSystem Type Definitions
 * System ID: SYSX-AI-COGNITIVE_FABRIC
 * Hash: 92672c08
 */

export const SYSTEM_ID = 'SYSX-AI-COGNITIVE_FABRIC';

export const NIGERIA_FIRST_CONFIG = {
  locale: 'en-NG' as const,
  timezone: 'Africa/Lagos' as const,
  currency: 'NGN' as const,
  currencySymbol: '₦',
  networkTimeout: 30000,
  offlineQueueDepth: 1000,
  syncBatchSize: 50,
};

export interface NetworkConfig {
  timeout: number;
  retries: number;
  backoffMs: number;
}

export interface OfflineQueueEntry {
  id: string;
  command: SystemCommand;
  timestamp: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'processing' | 'failed' | 'synced';
}

export interface SystemCommand {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  locale: typeof NIGERIA_FIRST_CONFIG.locale;
  timezone: typeof NIGERIA_FIRST_CONFIG.timezone;
  createdAt: number;
}

export interface SystemResult {
  success: boolean;
  data?: unknown;
  error?: string;
  offlineQueued?: boolean;
}

export interface SyncResult {
  synced: number;
  failed: number;
  remaining: number;
}

export interface HealthStatus {
  systemId: string;
  status: 'healthy' | 'degraded' | 'offline';
  lastSync: number;
  queueDepth: number;
  uptime: number;
}
