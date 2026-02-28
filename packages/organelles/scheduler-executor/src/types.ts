/**
 * SchedulerExecutor — Core Type Definitions
 * Organelle: ORG-ES-SCHEDULER_EXECUTOR-v0.1.0
 */

export enum SchedulerExecutorState {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
  TERMINATED = "TERMINATED",
}

export interface SchedulerExecutorConfig {
  readonly id: string;
  readonly name: string;
  readonly maxConcurrency: number;
  readonly timeoutMs: number;
  readonly retryPolicy: RetryPolicy;
}

export interface RetryPolicy {
  readonly maxRetries: number;
  readonly backoffMs: number;
  readonly backoffMultiplier: number;
}

export interface SchedulerExecutorCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}

export interface SchedulerExecutorResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: SchedulerExecutorError;
  readonly duration: number;
  readonly correlationId: string;
}

export interface SchedulerExecutorQuery {
  readonly type: string;
  readonly filters?: Record<string, unknown>;
}

export interface SchedulerExecutorQueryResult {
  readonly data: Record<string, unknown>;
  readonly timestamp: number;
}

export interface SchedulerExecutorEvent {
  readonly type: string;
  readonly source: string;
  readonly data: Record<string, unknown>;
  readonly timestamp: number;
  readonly correlationId: string;
}

export interface SchedulerExecutorError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

export interface AuditEntry {
  readonly id: string;
  readonly timestamp: number;
  readonly action: string;
  readonly actor: string;
  readonly before: string;
  readonly after: string;
  readonly correlationId: string;
}

export interface OperationMetrics {
  readonly totalOperations: number;
  readonly successCount: number;
  readonly errorCount: number;
  readonly averageDuration: number;
  readonly lastOperationAt: number;
}

export interface TelemetryData {
  readonly organelleId: string;
  readonly state: SchedulerExecutorState;
  readonly metrics: OperationMetrics;
  readonly timestamp: number;
}
