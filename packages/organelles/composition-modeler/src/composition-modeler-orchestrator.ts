/**
 * CompositionModeler — Orchestrator (Main Entry Point)
 * Organelle: ORG-CM-COMPOSITION_MODELER-v0.1.0
 */

import {
  CompositionModelerConfig,
  CompositionModelerState,
  CompositionModelerCommand,
  CompositionModelerResult,
  CompositionModelerQuery,
  CompositionModelerQueryResult,
  CompositionModelerEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { CompositionModelerEntity } from "./composition-modeler-entity";
import { CompositionModelerStateMachine } from "./state-machine";
import { ICompositionModelerStorage, InMemoryCompositionModelerStorage } from "./storage-interface";
import { ICompositionModelerEvents, CompositionModelerEventBus } from "./event-interface";
import { ICompositionModelerObservability, DefaultCompositionModelerObservability } from "./observability-interface";

export class CompositionModelerOrchestrator {
  private entity: CompositionModelerEntity;
  private stateMachine: CompositionModelerStateMachine;
  private storage: ICompositionModelerStorage;
  private events: ICompositionModelerEvents;
  private observability: ICompositionModelerObservability;

  constructor(
    config: CompositionModelerConfig,
    storage?: ICompositionModelerStorage,
    events?: ICompositionModelerEvents,
    observability?: ICompositionModelerObservability,
  ) {
    this.entity = new CompositionModelerEntity(config);
    this.stateMachine = new CompositionModelerStateMachine();
    this.storage = storage ?? new InMemoryCompositionModelerStorage();
    this.events = events ?? new CompositionModelerEventBus();
    this.observability = observability ?? new DefaultCompositionModelerObservability(config.id);

    this.observability.log("INFO", `CompositionModeler orchestrator initialized`, { id: config.id });
  }

  async execute(command: CompositionModelerCommand): Promise<CompositionModelerResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `CompositionModeler.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
        source: this.entity.getId(),
        data: { command: command.type, success: result.success },
        timestamp: Date.now(),
        correlationId: command.correlationId,
      });

      this.observability.recordMetric("command.duration", result.duration);
      return result;
    } finally {
      span.end();
    }
  }

  query(query: CompositionModelerQuery): CompositionModelerQueryResult {
    const span = this.observability.createSpan("query");
    try {
      return {
        data: {
          state: this.entity.getState(),
          metrics: this.entity.getMetrics(),
          snapshot: this.entity.toSnapshot(),
        },
        timestamp: Date.now(),
      };
    } finally {
      span.end();
    }
  }

  getState(): CompositionModelerState {
    return this.entity.getState();
  }

  getMetrics(): OperationMetrics {
    return this.entity.getMetrics();
  }

  getTelemetry(): TelemetryData {
    return {
      organelleId: this.entity.getId(),
      state: this.entity.getState(),
      metrics: this.entity.getMetrics(),
      timestamp: Date.now(),
    };
  }

  async reset(): Promise<void> {
    this.observability.log("INFO", "Resetting organelle");
    this.stateMachine.reset();
  }

  async terminate(): Promise<void> {
    const span = this.observability.createSpan("terminate");
    try {
      this.observability.log("INFO", "CompositionModeler terminated");
    } finally {
      span.end();
    }
  }
}
