/**
 * PolicyDefinition — Orchestrator (Main Entry Point)
 * Organelle: ORG-CP-POLICY_DEFINITION-v0.1.0
 */

import {
  PolicyDefinitionConfig,
  PolicyDefinitionState,
  PolicyDefinitionCommand,
  PolicyDefinitionResult,
  PolicyDefinitionQuery,
  PolicyDefinitionQueryResult,
  PolicyDefinitionEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { PolicyDefinitionEntity } from "./policy-definition-entity";
import { PolicyDefinitionStateMachine } from "./state-machine";
import { IPolicyDefinitionStorage, InMemoryPolicyDefinitionStorage } from "./storage-interface";
import { IPolicyDefinitionEvents, PolicyDefinitionEventBus } from "./event-interface";
import { IPolicyDefinitionObservability, DefaultPolicyDefinitionObservability } from "./observability-interface";

export class PolicyDefinitionOrchestrator {
  private entity: PolicyDefinitionEntity;
  private stateMachine: PolicyDefinitionStateMachine;
  private storage: IPolicyDefinitionStorage;
  private events: IPolicyDefinitionEvents;
  private observability: IPolicyDefinitionObservability;

  constructor(
    config: PolicyDefinitionConfig,
    storage?: IPolicyDefinitionStorage,
    events?: IPolicyDefinitionEvents,
    observability?: IPolicyDefinitionObservability,
  ) {
    this.entity = new PolicyDefinitionEntity(config);
    this.stateMachine = new PolicyDefinitionStateMachine();
    this.storage = storage ?? new InMemoryPolicyDefinitionStorage();
    this.events = events ?? new PolicyDefinitionEventBus();
    this.observability = observability ?? new DefaultPolicyDefinitionObservability(config.id);

    this.observability.log("INFO", `PolicyDefinition orchestrator initialized`, { id: config.id });
  }

  async execute(command: PolicyDefinitionCommand): Promise<PolicyDefinitionResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `PolicyDefinition.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
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

  query(query: PolicyDefinitionQuery): PolicyDefinitionQueryResult {
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

  getState(): PolicyDefinitionState {
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
      this.observability.log("INFO", "PolicyDefinition terminated");
    } finally {
      span.end();
    }
  }
}
