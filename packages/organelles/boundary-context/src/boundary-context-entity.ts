import { BoundaryContextConfig, BoundaryContextState, BoundaryContextCommand, BoundaryContextResult, BoundaryContextError, AuditEntry, OperationMetrics } from "./types";

export class BoundaryContextEntity {
  private readonly id: string;
  private readonly config: BoundaryContextConfig;
  private state: BoundaryContextState;
  private readonly createdAt: number;
  private updatedAt: number;
  private operationCount: number;
  private successCount: number;
  private errorCount: number;
  private totalDuration: number;
  private readonly auditLog: AuditEntry[];

  constructor(config: BoundaryContextConfig) {
    this.id = config.id;
    this.config = Object.freeze({ ...config });
    this.state = BoundaryContextState.IDLE;
    this.createdAt = Date.now();
    this.updatedAt = this.createdAt;
    this.operationCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
    this.totalDuration = 0;
    this.auditLog = [];
  }

  getId(): string { return this.id; }
  getState(): BoundaryContextState { return this.state; }

  setState(newState: BoundaryContextState): void {
    const oldState = this.state;
    this.validateTransition(oldState, newState);
    this.state = newState;
    this.updatedAt = Date.now();
    this.auditLog.push({ id: `audit-${this.auditLog.length + 1}`, timestamp: Date.now(), action: "STATE_TRANSITION", actor: this.id, before: oldState, after: newState, correlationId: `transition-${Date.now()}` });
  }

  private validateTransition(from: BoundaryContextState, to: BoundaryContextState): void {
    const valid: Record<string, string[]> = {
      [BoundaryContextState.IDLE]: [BoundaryContextState.PROCESSING, BoundaryContextState.TERMINATED],
      [BoundaryContextState.PROCESSING]: [BoundaryContextState.COMPLETED, BoundaryContextState.ERROR],
      [BoundaryContextState.COMPLETED]: [BoundaryContextState.IDLE],
      [BoundaryContextState.ERROR]: [BoundaryContextState.IDLE],
      [BoundaryContextState.TERMINATED]: [],
    };
    if (!(valid[from] || []).includes(to)) throw new Error(`Invalid transition: ${from} -> ${to}`);
  }

  execute(command: BoundaryContextCommand): BoundaryContextResult {
    if (this.state !== BoundaryContextState.IDLE) throw new Error(`Cannot execute in state: ${this.state}`);
    const startTime = Date.now();
    this.setState(BoundaryContextState.PROCESSING);
    this.operationCount++;
    try {
      const result = this.processCommand(command);
      this.setState(BoundaryContextState.COMPLETED);
      this.successCount++;
      const duration = Date.now() - startTime;
      this.totalDuration += duration;
      this.setState(BoundaryContextState.IDLE);
      return { success: true, data: result, duration, correlationId: command.correlationId };
    } catch (error) {
      this.setState(BoundaryContextState.ERROR);
      this.errorCount++;
      const duration = Date.now() - startTime;
      this.totalDuration += duration;
      this.setState(BoundaryContextState.IDLE);
      return { success: false, error: { code: "EXECUTION_FAILED", message: error instanceof Error ? error.message : String(error) }, duration, correlationId: command.correlationId };
    }
  }

  private processCommand(command: BoundaryContextCommand): Record<string, unknown> {
    switch (command.type) {
      case "DEFINE_BOUNDARY": return { defined: true, boundaryId: `${this.id}-boundary-${Date.now()}`, ...command.payload };
      case "VALIDATE_CONTEXT": return { valid: true, contextId: command.payload["contextId"] };
      case "MERGE_CONTEXTS": return { merged: true, resultId: `${this.id}-merged-${Date.now()}` };
      default: throw new Error(`Unknown command: ${command.type}`);
    }
  }

  getMetrics(): OperationMetrics {
    return { totalOperations: this.operationCount, successCount: this.successCount, errorCount: this.errorCount, averageDuration: this.operationCount > 0 ? this.totalDuration / this.operationCount : 0, lastOperationAt: this.updatedAt };
  }

  getAuditLog(): ReadonlyArray<AuditEntry> { return [...this.auditLog]; }

  toSnapshot(): Record<string, unknown> {
    return { id: this.id, state: this.state, config: this.config, operationCount: this.operationCount, successCount: this.successCount, errorCount: this.errorCount, createdAt: this.createdAt, updatedAt: this.updatedAt, auditLogSize: this.auditLog.length };
  }
}
