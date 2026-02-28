/**
 * TelemetryCollector — Orchestrator (Main Entry Point)
 * Organelle: ORG-TS-TELEMETRY_COLLECTOR-v0.1.0
 */

import {
  TelemetryCollectorConfig,
  TelemetryCollectorState,
  TelemetryCollectorCommand,
  TelemetryCollectorResult,
  TelemetryCollectorQuery,
  TelemetryCollectorQueryResult,
  TelemetryCollectorEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { TelemetryCollectorEntity } from "./telemetry-collector-entity";
import { TelemetryCollectorStateMachine } from "./state-machine";
import { ITelemetryCollectorStorage, InMemoryTelemetryCollectorStorage } from "./storage-interface";
import { ITelemetryCollectorEvents, TelemetryCollectorEventBus } from "./event-interface";
import { ITelemetryCollectorObservability, DefaultTelemetryCollectorObservability } from "./observability-interface";

export class TelemetryCollectorOrchestrator {
  private entity: TelemetryCollectorEntity;
  private stateMachine: TelemetryCollectorStateMachine;
  private storage: ITelemetryCollectorStorage;
  private events: ITelemetryCollectorEvents;
  private observability: ITelemetryCollectorObservability;

  constructor(
    config: TelemetryCollectorConfig,
    storage?: ITelemetryCollectorStorage,
    events?: ITelemetryCollectorEvents,
    observability?: ITelemetryCollectorObservability,
  ) {
    this.entity = new TelemetryCollectorEntity(config);
    this.stateMachine = new TelemetryCollectorStateMachine();
    this.storage = storage ?? new InMemoryTelemetryCollectorStorage();
    this.events = events ?? new TelemetryCollectorEventBus();
    this.observability = observability ?? new DefaultTelemetryCollectorObservability(config.id);

    this.observability.log("INFO", `TelemetryCollector orchestrator initialized`, { id: config.id });
  }

  async execute(command: TelemetryCollectorCommand): Promise<TelemetryCollectorResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `TelemetryCollector.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
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

  query(query: TelemetryCollectorQuery): TelemetryCollectorQueryResult {
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

  getState(): TelemetryCollectorState {
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
      this.observability.log("INFO", "TelemetryCollector terminated");
    } finally {
      span.end();
    }
  }
}
