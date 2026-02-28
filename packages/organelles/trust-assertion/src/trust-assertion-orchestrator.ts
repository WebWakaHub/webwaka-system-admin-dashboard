/**
 * TrustAssertion — Orchestrator (Main Entry Point)
 * Organelle: ORG-ST-TRUST_ASSERTION-v0.1.0
 */

import {
  TrustAssertionConfig,
  TrustAssertionState,
  TrustAssertionCommand,
  TrustAssertionResult,
  TrustAssertionQuery,
  TrustAssertionQueryResult,
  TrustAssertionEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { TrustAssertionEntity } from "./trust-assertion-entity";
import { TrustAssertionStateMachine } from "./state-machine";
import { ITrustAssertionStorage, InMemoryTrustAssertionStorage } from "./storage-interface";
import { ITrustAssertionEvents, TrustAssertionEventBus } from "./event-interface";
import { ITrustAssertionObservability, DefaultTrustAssertionObservability } from "./observability-interface";

export class TrustAssertionOrchestrator {
  private entity: TrustAssertionEntity;
  private stateMachine: TrustAssertionStateMachine;
  private storage: ITrustAssertionStorage;
  private events: ITrustAssertionEvents;
  private observability: ITrustAssertionObservability;

  constructor(
    config: TrustAssertionConfig,
    storage?: ITrustAssertionStorage,
    events?: ITrustAssertionEvents,
    observability?: ITrustAssertionObservability,
  ) {
    this.entity = new TrustAssertionEntity(config);
    this.stateMachine = new TrustAssertionStateMachine();
    this.storage = storage ?? new InMemoryTrustAssertionStorage();
    this.events = events ?? new TrustAssertionEventBus();
    this.observability = observability ?? new DefaultTrustAssertionObservability(config.id);

    this.observability.log("INFO", `TrustAssertion orchestrator initialized`, { id: config.id });
  }

  async execute(command: TrustAssertionCommand): Promise<TrustAssertionResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `TrustAssertion.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
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

  query(query: TrustAssertionQuery): TrustAssertionQueryResult {
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

  getState(): TrustAssertionState {
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
      this.observability.log("INFO", "TrustAssertion terminated");
    } finally {
      span.end();
    }
  }
}
