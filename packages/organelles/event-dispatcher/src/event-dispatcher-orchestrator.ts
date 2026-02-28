/**
 * EventDispatcher — Orchestrator (Main Entry Point)
 * Organelle: ORG-EM-EVENT_DISPATCHER-v0.1.0
 */

import {
  EventDispatcherConfig,
  EventDispatcherState,
  EventDispatcherCommand,
  EventDispatcherResult,
  EventDispatcherQuery,
  EventDispatcherQueryResult,
  EventDispatcherEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { EventDispatcherEntity } from "./event-dispatcher-entity";
import { EventDispatcherStateMachine } from "./state-machine";
import { IEventDispatcherStorage, InMemoryEventDispatcherStorage } from "./storage-interface";
import { IEventDispatcherEvents, EventDispatcherEventBus } from "./event-interface";
import { IEventDispatcherObservability, DefaultEventDispatcherObservability } from "./observability-interface";

export class EventDispatcherOrchestrator {
  private entity: EventDispatcherEntity;
  private stateMachine: EventDispatcherStateMachine;
  private storage: IEventDispatcherStorage;
  private events: IEventDispatcherEvents;
  private observability: IEventDispatcherObservability;

  constructor(
    config: EventDispatcherConfig,
    storage?: IEventDispatcherStorage,
    events?: IEventDispatcherEvents,
    observability?: IEventDispatcherObservability,
  ) {
    this.entity = new EventDispatcherEntity(config);
    this.stateMachine = new EventDispatcherStateMachine();
    this.storage = storage ?? new InMemoryEventDispatcherStorage();
    this.events = events ?? new EventDispatcherEventBus();
    this.observability = observability ?? new DefaultEventDispatcherObservability(config.id);

    this.observability.log("INFO", `EventDispatcher orchestrator initialized`, { id: config.id });
  }

  async execute(command: EventDispatcherCommand): Promise<EventDispatcherResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `EventDispatcher.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
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

  query(query: EventDispatcherQuery): EventDispatcherQueryResult {
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

  getState(): EventDispatcherState {
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
      this.observability.log("INFO", "EventDispatcher terminated");
    } finally {
      span.end();
    }
  }
}
