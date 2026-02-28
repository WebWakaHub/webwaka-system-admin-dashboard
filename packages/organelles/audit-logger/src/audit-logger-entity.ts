/**
 * AuditLogger — Entity (Domain Logic)
 * Organelle: ORG-LG-AUDIT_LOGGER-v0.1.0
 */

import {
  AuditLoggerConfig,
  AuditLoggerState,
  AuditLoggerCommand,
  AuditLoggerResult,
  AuditLoggerError,
  AuditEntry,
  OperationMetrics,
} from "./types";

export class AuditLoggerEntity {
  private readonly id: string;
  private readonly config: AuditLoggerConfig;
  private state: AuditLoggerState;
  private readonly createdAt: number;
  private updatedAt: number;
  private operationCount: number;
  private successCount: number;
  private errorCount: number;
  private totalDuration: number;
  private readonly auditLog: AuditEntry[];

  constructor(config: AuditLoggerConfig) {
    this.id = config.id;
    this.config = Object.freeze({ ...config });
    this.state = AuditLoggerState.IDLE;
    this.createdAt = Date.now();
    this.updatedAt = this.createdAt;
    this.operationCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
    this.totalDuration = 0;
    this.auditLog = [];
  }

  getId(): string {
    return this.id;
  }

  getState(): AuditLoggerState {
    return this.state;
  }

  setState(newState: AuditLoggerState): void {
    const oldState = this.state;
    this.validateTransition(oldState, newState);
    this.state = newState;
    this.updatedAt = Date.now();
    this.auditLog.push({
      id: `audit-${this.auditLog.length + 1}`,
      timestamp: Date.now(),
      action: "STATE_TRANSITION",
      actor: this.id,
      before: oldState,
      after: newState,
      correlationId: `transition-${Date.now()}`,
    });
  }

  private validateTransition(from: AuditLoggerState, to: AuditLoggerState): void {
    const validTransitions: Record<string, string[]> = {
      [AuditLoggerState.IDLE]: [AuditLoggerState.PROCESSING, AuditLoggerState.TERMINATED],
      [AuditLoggerState.PROCESSING]: [AuditLoggerState.COMPLETED, AuditLoggerState.ERROR],
      [AuditLoggerState.COMPLETED]: [AuditLoggerState.IDLE],
      [AuditLoggerState.ERROR]: [AuditLoggerState.IDLE],
      [AuditLoggerState.TERMINATED]: [],
    };

    const allowed = validTransitions[from] || [];
    if (!allowed.includes(to)) {
      throw new Error(`Invalid state transition: ${from} → ${to}`);
    }
  }

  execute(command: AuditLoggerCommand): AuditLoggerResult {
    if (this.state !== AuditLoggerState.IDLE) {
      throw new Error(`Cannot execute in state: ${this.state}`);
    }

    const startTime = Date.now();
    this.setState(AuditLoggerState.PROCESSING);
    this.operationCount++;

    try {
      // Domain-specific command processing
      const result = this.processCommand(command);
      this.setState(AuditLoggerState.COMPLETED);
      this.successCount++;
      const duration = Date.now() - startTime;
      this.totalDuration += duration;
      this.setState(AuditLoggerState.IDLE);

      return {
        success: true,
        data: result,
        duration,
        correlationId: command.correlationId,
      };
    } catch (error) {
      this.setState(AuditLoggerState.ERROR);
      this.errorCount++;
      const duration = Date.now() - startTime;
      this.totalDuration += duration;

      const err: AuditLoggerError = {
        code: "EXECUTION_FAILED",
        message: error instanceof Error ? error.message : String(error),
      };

      // Auto-recover to IDLE
      this.setState(AuditLoggerState.IDLE);

      return {
        success: false,
        error: err,
        duration,
        correlationId: command.correlationId,
      };
    }
  }

  private processCommand(command: AuditLoggerCommand): Record<string, unknown> {
    // Domain-specific logic for AuditLogger
    switch (command.type) {
      case "CREATE":
        return { created: true, id: `${this.id}-${Date.now()}`, ...command.payload };
      case "UPDATE":
        return { updated: true, ...command.payload };
      case "DELETE":
        return { deleted: true, id: command.payload["id"] };
      case "QUERY":
        return { results: [], query: command.payload };
      default:
        throw new Error(`Unknown command type: ${command.type}`);
    }
  }

  getMetrics(): OperationMetrics {
    return {
      totalOperations: this.operationCount,
      successCount: this.successCount,
      errorCount: this.errorCount,
      averageDuration: this.operationCount > 0 ? this.totalDuration / this.operationCount : 0,
      lastOperationAt: this.updatedAt,
    };
  }

  getAuditLog(): ReadonlyArray<AuditEntry> {
    return [...this.auditLog];
  }

  toSnapshot(): Record<string, unknown> {
    return {
      id: this.id,
      state: this.state,
      config: this.config,
      operationCount: this.operationCount,
      successCount: this.successCount,
      errorCount: this.errorCount,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      auditLogSize: this.auditLog.length,
    };
  }
}
