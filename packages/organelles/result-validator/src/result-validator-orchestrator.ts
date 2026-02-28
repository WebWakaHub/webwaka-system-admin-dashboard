import { ResultValidatorConfig, ResultValidatorState, ResultValidatorCommand, ResultValidatorResult, ResultValidatorQuery, ResultValidatorQueryResult, OperationMetrics, TelemetryData } from "./types";
import { ResultValidatorEntity } from "./result-validator-entity";
import { ResultValidatorStateMachine } from "./state-machine";
import { IResultValidatorStorage, InMemoryResultValidatorStorage } from "./storage-interface";
import { IResultValidatorEvents, ResultValidatorEventBus } from "./event-interface";
import { IResultValidatorObservability, DefaultResultValidatorObservability } from "./observability-interface";

export class ResultValidatorOrchestrator {
  private entity: ResultValidatorEntity;
  private stateMachine: ResultValidatorStateMachine;
  private storage: IResultValidatorStorage;
  private events: IResultValidatorEvents;
  private observability: IResultValidatorObservability;

  constructor(config: ResultValidatorConfig, storage?: IResultValidatorStorage, events?: IResultValidatorEvents, observability?: IResultValidatorObservability) {
    this.entity = new ResultValidatorEntity(config);
    this.stateMachine = new ResultValidatorStateMachine();
    this.storage = storage ?? new InMemoryResultValidatorStorage();
    this.events = events ?? new ResultValidatorEventBus();
    this.observability = observability ?? new DefaultResultValidatorObservability(config.id);
    this.observability.log("INFO", `ResultValidator orchestrator initialized`, { id: config.id });
  }

  async execute(command: ResultValidatorCommand): Promise<ResultValidatorResult> {
    const span = this.observability.createSpan("execute");
    try {
      const result = this.entity.execute(command);
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());
      this.events.emit({ type: `ResultValidator.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`, source: this.entity.getId(), data: { command: command.type, success: result.success }, timestamp: Date.now(), correlationId: command.correlationId });
      return result;
    } finally { span.end(); }
  }

  query(query: ResultValidatorQuery): ResultValidatorQueryResult { return { data: { state: this.entity.getState(), metrics: this.entity.getMetrics(), snapshot: this.entity.toSnapshot() }, timestamp: Date.now() }; }
  getState(): ResultValidatorState { return this.entity.getState(); }
  getMetrics(): OperationMetrics { return this.entity.getMetrics(); }
  getTelemetry(): TelemetryData { return { organelleId: this.entity.getId(), state: this.entity.getState(), metrics: this.entity.getMetrics(), timestamp: Date.now() }; }
}
