import { BoundaryContextConfig, BoundaryContextState, BoundaryContextCommand, BoundaryContextResult, BoundaryContextQuery, BoundaryContextQueryResult, OperationMetrics, TelemetryData } from "./types";
import { BoundaryContextEntity } from "./boundary-context-entity";
import { BoundaryContextStateMachine } from "./state-machine";
import { IBoundaryContextStorage, InMemoryBoundaryContextStorage } from "./storage-interface";
import { IBoundaryContextEvents, BoundaryContextEventBus } from "./event-interface";
import { IBoundaryContextObservability, DefaultBoundaryContextObservability } from "./observability-interface";

export class BoundaryContextOrchestrator {
  private entity: BoundaryContextEntity;
  private stateMachine: BoundaryContextStateMachine;
  private storage: IBoundaryContextStorage;
  private events: IBoundaryContextEvents;
  private observability: IBoundaryContextObservability;

  constructor(config: BoundaryContextConfig, storage?: IBoundaryContextStorage, events?: IBoundaryContextEvents, observability?: IBoundaryContextObservability) {
    this.entity = new BoundaryContextEntity(config);
    this.stateMachine = new BoundaryContextStateMachine();
    this.storage = storage ?? new InMemoryBoundaryContextStorage();
    this.events = events ?? new BoundaryContextEventBus();
    this.observability = observability ?? new DefaultBoundaryContextObservability(config.id);
    this.observability.log("INFO", `BoundaryContext orchestrator initialized`, { id: config.id });
  }

  async execute(command: BoundaryContextCommand): Promise<BoundaryContextResult> {
    const span = this.observability.createSpan("execute");
    try {
      const result = this.entity.execute(command);
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());
      this.events.emit({ type: `BoundaryContext.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`, source: this.entity.getId(), data: { command: command.type, success: result.success }, timestamp: Date.now(), correlationId: command.correlationId });
      return result;
    } finally { span.end(); }
  }

  query(query: BoundaryContextQuery): BoundaryContextQueryResult { return { data: { state: this.entity.getState(), metrics: this.entity.getMetrics(), snapshot: this.entity.toSnapshot() }, timestamp: Date.now() }; }
  getState(): BoundaryContextState { return this.entity.getState(); }
  getMetrics(): OperationMetrics { return this.entity.getMetrics(); }
  getTelemetry(): TelemetryData { return { organelleId: this.entity.getId(), state: this.entity.getState(), metrics: this.entity.getMetrics(), timestamp: Date.now() }; }
}
