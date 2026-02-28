import { InstrumentationProbeConfig, InstrumentationProbeState, InstrumentationProbeCommand, InstrumentationProbeResult, InstrumentationProbeQuery, InstrumentationProbeQueryResult, OperationMetrics, TelemetryData } from "./types";
import { InstrumentationProbeEntity } from "./instrumentation-probe-entity";
import { InstrumentationProbeStateMachine } from "./state-machine";
import { IInstrumentationProbeStorage, InMemoryInstrumentationProbeStorage } from "./storage-interface";
import { IInstrumentationProbeEvents, InstrumentationProbeEventBus } from "./event-interface";
import { IInstrumentationProbeObservability, DefaultInstrumentationProbeObservability } from "./observability-interface";

export class InstrumentationProbeOrchestrator {
  private entity: InstrumentationProbeEntity;
  private stateMachine: InstrumentationProbeStateMachine;
  private storage: IInstrumentationProbeStorage;
  private events: IInstrumentationProbeEvents;
  private observability: IInstrumentationProbeObservability;

  constructor(config: InstrumentationProbeConfig, storage?: IInstrumentationProbeStorage, events?: IInstrumentationProbeEvents, observability?: IInstrumentationProbeObservability) {
    this.entity = new InstrumentationProbeEntity(config);
    this.stateMachine = new InstrumentationProbeStateMachine();
    this.storage = storage ?? new InMemoryInstrumentationProbeStorage();
    this.events = events ?? new InstrumentationProbeEventBus();
    this.observability = observability ?? new DefaultInstrumentationProbeObservability(config.id);
    this.observability.log("INFO", `InstrumentationProbe orchestrator initialized`, { id: config.id });
  }

  async execute(command: InstrumentationProbeCommand): Promise<InstrumentationProbeResult> {
    const span = this.observability.createSpan("execute");
    try {
      const result = this.entity.execute(command);
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());
      this.events.emit({ type: `InstrumentationProbe.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`, source: this.entity.getId(), data: { command: command.type, success: result.success }, timestamp: Date.now(), correlationId: command.correlationId });
      return result;
    } finally { span.end(); }
  }

  query(query: InstrumentationProbeQuery): InstrumentationProbeQueryResult { return { data: { state: this.entity.getState(), metrics: this.entity.getMetrics(), snapshot: this.entity.toSnapshot() }, timestamp: Date.now() }; }
  getState(): InstrumentationProbeState { return this.entity.getState(); }
  getMetrics(): OperationMetrics { return this.entity.getMetrics(); }
  getTelemetry(): TelemetryData { return { organelleId: this.entity.getId(), state: this.entity.getState(), metrics: this.entity.getMetrics(), timestamp: Date.now() }; }
}
