/**
 * SchedulerExecutor — Orchestrator (Main Entry Point)
 * Organelle: ORG-ES-SCHEDULER_EXECUTOR-v0.1.0
 */

import {
  SchedulerExecutorConfig,
  SchedulerExecutorState,
  SchedulerExecutorCommand,
  SchedulerExecutorResult,
  SchedulerExecutorQuery,
  SchedulerExecutorQueryResult,
  SchedulerExecutorEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { SchedulerExecutorEntity } from "./scheduler-executor-entity";
import { SchedulerExecutorStateMachine } from "./state-machine";
import { ISchedulerExecutorStorage, InMemorySchedulerExecutorStorage } from "./storage-interface";
import { ISchedulerExecutorEvents, SchedulerExecutorEventBus } from "./event-interface";
import { ISchedulerExecutorObservability, DefaultSchedulerExecutorObservability } from "./observability-interface";

export class SchedulerExecutorOrchestrator {
  private entity: SchedulerExecutorEntity;
  private stateMachine: SchedulerExecutorStateMachine;
  private storage: ISchedulerExecutorStorage;
  private events: ISchedulerExecutorEvents;
  private observability: ISchedulerExecutorObservability;

  constructor(
    config: SchedulerExecutorConfig,
    storage?: ISchedulerExecutorStorage,
    events?: ISchedulerExecutorEvents,
    observability?: ISchedulerExecutorObservability,
  ) {
    this.entity = new SchedulerExecutorEntity(config);
    this.stateMachine = new SchedulerExecutorStateMachine();
    this.storage = storage ?? new InMemorySchedulerExecutorStorage();
    this.events = events ?? new SchedulerExecutorEventBus();
    this.observability = observability ?? new DefaultSchedulerExecutorObservability(config.id);

    this.observability.log("INFO", `SchedulerExecutor orchestrator initialized`, { id: config.id });
  }

  async execute(command: SchedulerExecutorCommand): Promise<SchedulerExecutorResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `SchedulerExecutor.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
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

  query(query: SchedulerExecutorQuery): SchedulerExecutorQueryResult {
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

  getState(): SchedulerExecutorState {
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
      this.observability.log("INFO", "SchedulerExecutor terminated");
    } finally {
      span.end();
    }
  }
}
