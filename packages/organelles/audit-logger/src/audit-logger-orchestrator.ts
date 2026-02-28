/**
 * AuditLogger — Orchestrator (Main Entry Point)
 * Organelle: ORG-LG-AUDIT_LOGGER-v0.1.0
 */

import {
  AuditLoggerConfig,
  AuditLoggerState,
  AuditLoggerCommand,
  AuditLoggerResult,
  AuditLoggerQuery,
  AuditLoggerQueryResult,
  AuditLoggerEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { AuditLoggerEntity } from "./audit-logger-entity";
import { AuditLoggerStateMachine } from "./state-machine";
import { IAuditLoggerStorage, InMemoryAuditLoggerStorage } from "./storage-interface";
import { IAuditLoggerEvents, AuditLoggerEventBus } from "./event-interface";
import { IAuditLoggerObservability, DefaultAuditLoggerObservability } from "./observability-interface";

export class AuditLoggerOrchestrator {
  private entity: AuditLoggerEntity;
  private stateMachine: AuditLoggerStateMachine;
  private storage: IAuditLoggerStorage;
  private events: IAuditLoggerEvents;
  private observability: IAuditLoggerObservability;

  constructor(
    config: AuditLoggerConfig,
    storage?: IAuditLoggerStorage,
    events?: IAuditLoggerEvents,
    observability?: IAuditLoggerObservability,
  ) {
    this.entity = new AuditLoggerEntity(config);
    this.stateMachine = new AuditLoggerStateMachine();
    this.storage = storage ?? new InMemoryAuditLoggerStorage();
    this.events = events ?? new AuditLoggerEventBus();
    this.observability = observability ?? new DefaultAuditLoggerObservability(config.id);

    this.observability.log("INFO", `AuditLogger orchestrator initialized`, { id: config.id });
  }

  async execute(command: AuditLoggerCommand): Promise<AuditLoggerResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `AuditLogger.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
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

  query(query: AuditLoggerQuery): AuditLoggerQueryResult {
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

  getState(): AuditLoggerState {
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
      this.observability.log("INFO", "AuditLogger terminated");
    } finally {
      span.end();
    }
  }
}
