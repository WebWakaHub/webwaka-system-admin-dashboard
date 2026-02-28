/**
 * ResourceRegistry — Type Definitions
 * Cell: CEL-RESOURCEREG-v0.1.0
 * Category: Resource & Asset Control
 * 
 * Doctrine Compliance:
 * - Build Once Use Infinitely: Generic, reusable types
 * - Offline First: OfflineQueueEntry, SyncResult types
 * - Nigeria First: NetworkConfig with high-latency defaults
 * - Vendor Neutral AI: No vendor-specific type imports
 */

export type CellState = 'IDLE' | 'VALIDATING' | 'PROCESSING' | 'COMPLETING' | 'ERROR' | 'OFFLINE' | 'SYNCING' | 'DEAD_LETTER';

export interface ResourceRegistryCommand {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  idempotencyKey: string;
  timestamp: number;
  locale: string;
}

export interface ResourceRegistryResult {
  id: string;
  commandId: string;
  status: 'success' | 'partial' | 'failed';
  data: Record<string, unknown>;
  metrics: CellMetric[];
  timestamp: number;
}

export interface ExecutionContext {
  tenantId: string;
  userId: string;
  locale: string;
  timezone: string;
  isOffline: boolean;
  networkQuality: 'high' | 'medium' | 'low' | 'offline';
  correlationId: string;
}

export interface ResourceRegistryConfig {
  maxRetries: number;
  timeoutMs: number;
  offlineStorageKey: string;
  enableTelemetry: boolean;
  locale: string;
  networkConfig: NetworkConfig;
}

export interface NetworkConfig {
  defaultTimeoutMs: number;  // 30000 for Nigeria-first
  maxRetries: number;        // 3
  backoffMultiplier: number; // 2
  initialBackoffMs: number;  // 1000
  compressionThreshold: number; // 1024 bytes
}

export interface OfflineQueueEntry {
  id: string;
  command: ResourceRegistryCommand;
  context: ExecutionContext;
  sequenceNumber: number;
  vectorClock: Record<string, number>;
  createdAt: number;
  retryCount: number;
}

export interface SyncResult {
  synced: number;
  failed: number;
  conflicts: ConflictEntry[];
  duration: number;
}

export interface ConflictEntry {
  entryId: string;
  localVersion: Record<string, unknown>;
  remoteVersion: Record<string, unknown>;
  resolution: 'local-wins' | 'remote-wins' | 'merged';
}

export interface CellMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
  tags: Record<string, string>;
}

export interface AuditEntry {
  id: string;
  cellId: string;
  action: string;
  actor: string;
  timestamp: number;
  details: Record<string, unknown>;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export type Unsubscribe = () => void;
