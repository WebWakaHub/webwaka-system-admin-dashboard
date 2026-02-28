import { ExternalAdapterConfig, ExternalAdapterState, ExternalAdapterCommand, ExternalAdapterResult, ExternalAdapterError, AuditEntry, OperationMetrics } from "./types";

export class ExternalAdapterEntity {
  private readonly id: string;
  private readonly config: ExternalAdapterConfig;
  private state: ExternalAdapterState;
  private readonly createdAt: number;
  private updatedAt: number;
  private operationCount: number;
  private successCount: number;
  private errorCount: number;
  private totalDuration: number;
  private readonly auditLog: AuditEntry[];

  constructor(config: ExternalAdapterConfig) {
    this.id = config.id;
    this.config = Object.freeze({ ...config });
    this.state = ExternalAdapterState.IDLE;
    this.createdAt = Date.now();
    this.updatedAt = this.createdAt;
    this.operationCount = 0;
    this.successCount = 0;
    this.errorCount = 0;
    this.totalDuration = 0;
    this.auditLog = [];
  }

  getId(): string { return this.id; }
  getState(): ExternalAdapterState { return this.state; }

  setState(newState: ExternalAdapterState): void {
    const oldState = this.state;
    this.validateTransition(oldState, newState);
    this.state = newState;
    this.updatedAt = Date.now();
    this.auditLog.push({ id: `audit-${this.auditLog.length + 1}`, timestamp: Date.now(), action: "STATE_TRANSITION", actor: this.id, before: oldState, after: newState, correlationId: `transition-${Date.now()}` });
  }

  private validateTransition(from: ExternalAdapterState, to: ExternalAdapterState): void {
    const valid: Record<string, string[]> = {
      [ExternalAdapterState.IDLE]: [ExternalAdapterState.PROCESSING, ExternalAdapterState.TERMINATED],
      [ExternalAdapterState.PROCESSING]: [ExternalAdapterState.COMPLETED, ExternalAdapterState.ERROR],
      [ExternalAdapterState.COMPLETED]: [ExternalAdapterState.IDLE],
      [ExternalAdapterState.ERROR]: [ExternalAdapterState.IDLE],
      [ExternalAdapterState.TERMINATED]: [],
    };
    if (!(valid[from] || []).includes(to)) throw new Error(`Invalid transition: ${from} → ${to}`);
  }

  execute(command: ExternalAdapterCommand): ExternalAdapterResult {
    if (this.state !== ExternalAdapterState.IDLE) throw new Error(`Cannot execute in state: ${this.state}`);
    const startTime = Date.now();
    this.setState(ExternalAdapterState.PROCESSING);
    this.operationCount++;
    try {
      const result = this.processCommand(command);
      this.setState(ExternalAdapterState.COMPLETED);
      this.successCount++;
      const duration = Date.now() - startTime;
      this.totalDuration += duration;
      this.setState(ExternalAdapterState.IDLE);
      return { success: true, data: result, duration, correlationId: command.correlationId };
    } catch (error) {
      this.setState(ExternalAdapterState.ERROR);
      this.errorCount++;
      const duration = Date.now() - startTime;
      this.totalDuration += duration;
      this.setState(ExternalAdapterState.IDLE);
      return { success: false, error: { code: "EXECUTION_FAILED", message: error instanceof Error ? error.message : String(error) }, duration, correlationId: command.correlationId };
    }
  }

  private processCommand(command: ExternalAdapterCommand): Record<string, unknown> {
    switch (command.type) {
      case "CREATE": return { created: true, id: `${this.id}-${Date.now()}`, ...command.payload };
      case "UPDATE": return { updated: true, ...command.payload };
      case "DELETE": return { deleted: true, id: command.payload["id"] };
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
