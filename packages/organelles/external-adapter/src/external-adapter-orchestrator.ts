import { ExternalAdapterConfig, ExternalAdapterState, ExternalAdapterCommand, ExternalAdapterResult, ExternalAdapterQuery, ExternalAdapterQueryResult, OperationMetrics, TelemetryData } from "./types";
import { ExternalAdapterEntity } from "./external-adapter-entity";
import { ExternalAdapterStateMachine } from "./state-machine";
import { IExternalAdapterStorage, InMemoryExternalAdapterStorage } from "./storage-interface";
import { IExternalAdapterEvents, ExternalAdapterEventBus } from "./event-interface";
import { IExternalAdapterObservability, DefaultExternalAdapterObservability } from "./observability-interface";

export class ExternalAdapterOrchestrator {
  private entity: ExternalAdapterEntity;
  private stateMachine: ExternalAdapterStateMachine;
  private storage: IExternalAdapterStorage;
  private events: IExternalAdapterEvents;
  private observability: IExternalAdapterObservability;

  constructor(config: ExternalAdapterConfig, storage?: IExternalAdapterStorage, events?: IExternalAdapterEvents, observability?: IExternalAdapterObservability) {
    this.entity = new ExternalAdapterEntity(config);
    this.stateMachine = new ExternalAdapterStateMachine();
    this.storage = storage ?? new InMemoryExternalAdapterStorage();
    this.events = events ?? new ExternalAdapterEventBus();
    this.observability = observability ?? new DefaultExternalAdapterObservability(config.id);
    this.observability.log("INFO", `ExternalAdapter orchestrator initialized`, { id: config.id });
  }

  async execute(command: ExternalAdapterCommand): Promise<ExternalAdapterResult> {
    const span = this.observability.createSpan("execute");
    try {
      const result = this.entity.execute(command);
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());
      this.events.emit({ type: `ExternalAdapter.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`, source: this.entity.getId(), data: { command: command.type, success: result.success }, timestamp: Date.now(), correlationId: command.correlationId });
      return result;
    } finally { span.end(); }
  }

  query(query: ExternalAdapterQuery): ExternalAdapterQueryResult { return { data: { state: this.entity.getState(), metrics: this.entity.getMetrics(), snapshot: this.entity.toSnapshot() }, timestamp: Date.now() }; }
  getState(): ExternalAdapterState { return this.entity.getState(); }
  getMetrics(): OperationMetrics { return this.entity.getMetrics(); }
  getTelemetry(): TelemetryData { return { organelleId: this.entity.getId(), state: this.entity.getState(), metrics: this.entity.getMetrics(), timestamp: Date.now() }; }
}
