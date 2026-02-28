/**
 * RecordStore — Orchestrator (Main Entry Point)
 * Organelle: ORG-DP-RECORD_STORE-v0.1.0
 */

import {
  RecordStoreConfig,
  RecordStoreState,
  RecordStoreCommand,
  RecordStoreResult,
  RecordStoreQuery,
  RecordStoreQueryResult,
  RecordStoreEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { RecordStoreEntity } from "./record-store-entity";
import { RecordStoreStateMachine } from "./state-machine";
import { IRecordStoreStorage, InMemoryRecordStoreStorage } from "./storage-interface";
import { IRecordStoreEvents, RecordStoreEventBus } from "./event-interface";
import { IRecordStoreObservability, DefaultRecordStoreObservability } from "./observability-interface";

export class RecordStoreOrchestrator {
  private entity: RecordStoreEntity;
  private stateMachine: RecordStoreStateMachine;
  private storage: IRecordStoreStorage;
  private events: IRecordStoreEvents;
  private observability: IRecordStoreObservability;

  constructor(
    config: RecordStoreConfig,
    storage?: IRecordStoreStorage,
    events?: IRecordStoreEvents,
    observability?: IRecordStoreObservability,
  ) {
    this.entity = new RecordStoreEntity(config);
    this.stateMachine = new RecordStoreStateMachine();
    this.storage = storage ?? new InMemoryRecordStoreStorage();
    this.events = events ?? new RecordStoreEventBus();
    this.observability = observability ?? new DefaultRecordStoreObservability(config.id);

    this.observability.log("INFO", `RecordStore orchestrator initialized`, { id: config.id });
  }

  async execute(command: RecordStoreCommand): Promise<RecordStoreResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `RecordStore.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
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

  query(query: RecordStoreQuery): RecordStoreQueryResult {
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

  getState(): RecordStoreState {
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
      this.observability.log("INFO", "RecordStore terminated");
    } finally {
      span.end();
    }
  }
}
