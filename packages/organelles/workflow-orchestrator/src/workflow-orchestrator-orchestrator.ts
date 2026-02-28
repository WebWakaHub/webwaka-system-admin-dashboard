/**
 * WorkflowOrchestrator — Orchestrator (Main Entry Point)
 * Organelle: ORG-WO-WORKFLOW_ORCHESTRATOR-v0.1.0
 */

import {
  WorkflowOrchestratorConfig,
  WorkflowOrchestratorState,
  WorkflowOrchestratorCommand,
  WorkflowOrchestratorResult,
  WorkflowOrchestratorQuery,
  WorkflowOrchestratorQueryResult,
  WorkflowOrchestratorEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { WorkflowOrchestratorEntity } from "./workflow-orchestrator-entity";
import { WorkflowOrchestratorStateMachine } from "./state-machine";
import { IWorkflowOrchestratorStorage, InMemoryWorkflowOrchestratorStorage } from "./storage-interface";
import { IWorkflowOrchestratorEvents, WorkflowOrchestratorEventBus } from "./event-interface";
import { IWorkflowOrchestratorObservability, DefaultWorkflowOrchestratorObservability } from "./observability-interface";

export class WorkflowOrchestratorOrchestrator {
  private entity: WorkflowOrchestratorEntity;
  private stateMachine: WorkflowOrchestratorStateMachine;
  private storage: IWorkflowOrchestratorStorage;
  private events: IWorkflowOrchestratorEvents;
  private observability: IWorkflowOrchestratorObservability;

  constructor(
    config: WorkflowOrchestratorConfig,
    storage?: IWorkflowOrchestratorStorage,
    events?: IWorkflowOrchestratorEvents,
    observability?: IWorkflowOrchestratorObservability,
  ) {
    this.entity = new WorkflowOrchestratorEntity(config);
    this.stateMachine = new WorkflowOrchestratorStateMachine();
    this.storage = storage ?? new InMemoryWorkflowOrchestratorStorage();
    this.events = events ?? new WorkflowOrchestratorEventBus();
    this.observability = observability ?? new DefaultWorkflowOrchestratorObservability(config.id);

    this.observability.log("INFO", `WorkflowOrchestrator orchestrator initialized`, { id: config.id });
  }

  async execute(command: WorkflowOrchestratorCommand): Promise<WorkflowOrchestratorResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `WorkflowOrchestrator.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
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

  query(query: WorkflowOrchestratorQuery): WorkflowOrchestratorQueryResult {
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

  getState(): WorkflowOrchestratorState {
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
      this.observability.log("INFO", "WorkflowOrchestrator terminated");
    } finally {
      span.end();
    }
  }
}
