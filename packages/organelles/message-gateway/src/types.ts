/**
 * MessageGateway — Core Type Definitions
 * Organelle: ORG-CI-MESSAGE_GATEWAY-v0.1.0
 */

export enum MessageGatewayState {
  IDLE = "IDLE",
  PROCESSING = "PROCESSING",
  COMPLETED = "COMPLETED",
  ERROR = "ERROR",
  TERMINATED = "TERMINATED",
}

export interface MessageGatewayConfig {
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

export interface MessageGatewayCommand {
  readonly type: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId: string;
  readonly timestamp: number;
}

export interface MessageGatewayResult {
  readonly success: boolean;
  readonly data?: Record<string, unknown>;
  readonly error?: MessageGatewayError;
  readonly duration: number;
  readonly correlationId: string;
}

export interface MessageGatewayQuery {
  readonly type: string;
  readonly filters?: Record<string, unknown>;
}

export interface MessageGatewayQueryResult {
  readonly data: Record<string, unknown>;
  readonly timestamp: number;
}

export interface MessageGatewayEvent {
  readonly type: string;
  readonly source: string;
  readonly data: Record<string, unknown>;
  readonly timestamp: number;
  readonly correlationId: string;
}

export interface MessageGatewayError {
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
  readonly state: MessageGatewayState;
  readonly metrics: OperationMetrics;
  readonly timestamp: number;
}
