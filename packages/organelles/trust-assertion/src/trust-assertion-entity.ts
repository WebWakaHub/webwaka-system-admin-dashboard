/**
 * TrustAssertion — Entity (Domain Logic)
 * Organelle: ORG-ST-TRUST_ASSERTION-v0.1.0
 */

import {
  TrustAssertionConfig,
  TrustAssertionState,
  TrustAssertionCommand,
  TrustAssertionResult,
  TrustAssertionError,
  AuditEntry,
  OperationMetrics,
} from "./types";

export class TrustAssertionEntity {
  private readonly id: string;
  private readonly config: TrustAssertionConfig;
  private state: TrustAssertionState;
  private readonly createdAt: number;
  private updatedAt: number;
  private operationCount: number;
  private successCount: number;
  private errorCount: number;
  private totalDuration: number;
  private readonly auditLog: AuditEntry[];

  constructor(config: TrustAssertionConfig) {
    this.id = config.id;
    this.config = Object.freeze({ ...config });
    this.state = TrustAssertionState.IDLE;
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

  getState(): TrustAssertionState {
    return this.state;
  }

  setState(newState: TrustAssertionState): void {
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

  private validateTransition(from: TrustAssertionState, to: TrustAssertionState): void {
    const validTransitions: Record<string, string[]> = {
      [TrustAssertionState.IDLE]: [TrustAssertionState.PROCESSING, TrustAssertionState.TERMINATED],
      [TrustAssertionState.PROCESSING]: [TrustAssertionState.COMPLETED, TrustAssertionState.ERROR],
      [TrustAssertionState.COMPLETED]: [TrustAssertionState.IDLE],
      [TrustAssertionState.ERROR]: [TrustAssertionState.IDLE],
      [TrustAssertionState.TERMINATED]: [],
    };

    const allowed = validTransitions[from] || [];
    if (!allowed.includes(to)) {
      throw new Error(`Invalid state transition: ${from} → ${to}`);
    }
  }

  execute(command: TrustAssertionCommand): TrustAssertionResult {
    if (this.state !== TrustAssertionState.IDLE) {
      throw new Error(`Cannot execute in state: ${this.state}`);
    }

    const startTime = Date.now();
    this.setState(TrustAssertionState.PROCESSING);
    this.operationCount++;

    try {
      // Domain-specific command processing
      const result = this.processCommand(command);
      this.setState(TrustAssertionState.COMPLETED);
      this.successCount++;
      const duration = Date.now() - startTime;
      this.totalDuration += duration;
      this.setState(TrustAssertionState.IDLE);

      return {
        success: true,
        data: result,
        duration,
        correlationId: command.correlationId,
      };
    } catch (error) {
      this.setState(TrustAssertionState.ERROR);
      this.errorCount++;
      const duration = Date.now() - startTime;
      this.totalDuration += duration;

      const err: TrustAssertionError = {
        code: "EXECUTION_FAILED",
        message: error instanceof Error ? error.message : String(error),
      };

      // Auto-recover to IDLE
      this.setState(TrustAssertionState.IDLE);

      return {
        success: false,
        error: err,
        duration,
        correlationId: command.correlationId,
      };
    }
  }

  private processCommand(command: TrustAssertionCommand): Record<string, unknown> {
    // Domain-specific logic for TrustAssertion
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
