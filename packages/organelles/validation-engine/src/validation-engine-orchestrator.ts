/**
 * ValidationEngine — Orchestrator (Main Entry Point)
 * Organelle: ORG-FV-VALIDATION_ENGINE-v0.1.0
 */

import {
  ValidationEngineConfig,
  ValidationEngineState,
  ValidationEngineCommand,
  ValidationEngineResult,
  ValidationEngineQuery,
  ValidationEngineQueryResult,
  ValidationEngineEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { ValidationEngineEntity } from "./validation-engine-entity";
import { ValidationEngineStateMachine } from "./state-machine";
import { IValidationEngineStorage, InMemoryValidationEngineStorage } from "./storage-interface";
import { IValidationEngineEvents, ValidationEngineEventBus } from "./event-interface";
import { IValidationEngineObservability, DefaultValidationEngineObservability } from "./observability-interface";

export class ValidationEngineOrchestrator {
  private entity: ValidationEngineEntity;
  private stateMachine: ValidationEngineStateMachine;
  private storage: IValidationEngineStorage;
  private events: IValidationEngineEvents;
  private observability: IValidationEngineObservability;

  constructor(
    config: ValidationEngineConfig,
    storage?: IValidationEngineStorage,
    events?: IValidationEngineEvents,
    observability?: IValidationEngineObservability,
  ) {
    this.entity = new ValidationEngineEntity(config);
    this.stateMachine = new ValidationEngineStateMachine();
    this.storage = storage ?? new InMemoryValidationEngineStorage();
    this.events = events ?? new ValidationEngineEventBus();
    this.observability = observability ?? new DefaultValidationEngineObservability(config.id);

    this.observability.log("INFO", `ValidationEngine orchestrator initialized`, { id: config.id });
  }

  async execute(command: ValidationEngineCommand): Promise<ValidationEngineResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `ValidationEngine.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
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

  query(query: ValidationEngineQuery): ValidationEngineQueryResult {
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

  getState(): ValidationEngineState {
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
      this.observability.log("INFO", "ValidationEngine terminated");
    } finally {
      span.end();
    }
  }
}
