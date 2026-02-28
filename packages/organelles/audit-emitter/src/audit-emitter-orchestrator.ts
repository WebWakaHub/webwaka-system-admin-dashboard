import { AuditEmitterConfig, AuditEmitterState, AuditEmitterCommand, AuditEmitterResult, AuditEmitterQuery, AuditEmitterQueryResult, OperationMetrics, TelemetryData } from "./types";
import { AuditEmitterEntity } from "./audit-emitter-entity";
import { AuditEmitterStateMachine } from "./state-machine";
import { IAuditEmitterStorage, InMemoryAuditEmitterStorage } from "./storage-interface";
import { IAuditEmitterEvents, AuditEmitterEventBus } from "./event-interface";
import { IAuditEmitterObservability, DefaultAuditEmitterObservability } from "./observability-interface";

export class AuditEmitterOrchestrator {
  private entity: AuditEmitterEntity;
  private stateMachine: AuditEmitterStateMachine;
  private storage: IAuditEmitterStorage;
  private events: IAuditEmitterEvents;
  private observability: IAuditEmitterObservability;

  constructor(config: AuditEmitterConfig, storage?: IAuditEmitterStorage, events?: IAuditEmitterEvents, observability?: IAuditEmitterObservability) {
    this.entity = new AuditEmitterEntity(config);
    this.stateMachine = new AuditEmitterStateMachine();
    this.storage = storage ?? new InMemoryAuditEmitterStorage();
    this.events = events ?? new AuditEmitterEventBus();
    this.observability = observability ?? new DefaultAuditEmitterObservability(config.id);
    this.observability.log("INFO", `AuditEmitter orchestrator initialized`, { id: config.id });
  }

  async execute(command: AuditEmitterCommand): Promise<AuditEmitterResult> {
    const span = this.observability.createSpan("execute");
    try {
      const result = this.entity.execute(command);
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());
      this.events.emit({ type: `AuditEmitter.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`, source: this.entity.getId(), data: { command: command.type, success: result.success }, timestamp: Date.now(), correlationId: command.correlationId });
      return result;
    } finally { span.end(); }
  }

  query(query: AuditEmitterQuery): AuditEmitterQueryResult { return { data: { state: this.entity.getState(), metrics: this.entity.getMetrics(), snapshot: this.entity.toSnapshot() }, timestamp: Date.now() }; }
  getState(): AuditEmitterState { return this.entity.getState(); }
  getMetrics(): OperationMetrics { return this.entity.getMetrics(); }
  getTelemetry(): TelemetryData { return { organelleId: this.entity.getId(), state: this.entity.getState(), metrics: this.entity.getMetrics(), timestamp: Date.now() }; }
}
