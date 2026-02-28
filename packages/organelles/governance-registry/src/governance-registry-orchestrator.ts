/**
 * GovernanceRegistry — Orchestrator (Main Entry Point)
 * Organelle: ORG-RG-GOVERNANCE_REGISTRY-v0.1.0
 */

import {
  GovernanceRegistryConfig,
  GovernanceRegistryState,
  GovernanceRegistryCommand,
  GovernanceRegistryResult,
  GovernanceRegistryQuery,
  GovernanceRegistryQueryResult,
  GovernanceRegistryEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { GovernanceRegistryEntity } from "./governance-registry-entity";
import { GovernanceRegistryStateMachine } from "./state-machine";
import { IGovernanceRegistryStorage, InMemoryGovernanceRegistryStorage } from "./storage-interface";
import { IGovernanceRegistryEvents, GovernanceRegistryEventBus } from "./event-interface";
import { IGovernanceRegistryObservability, DefaultGovernanceRegistryObservability } from "./observability-interface";

export class GovernanceRegistryOrchestrator {
  private entity: GovernanceRegistryEntity;
  private stateMachine: GovernanceRegistryStateMachine;
  private storage: IGovernanceRegistryStorage;
  private events: IGovernanceRegistryEvents;
  private observability: IGovernanceRegistryObservability;

  constructor(
    config: GovernanceRegistryConfig,
    storage?: IGovernanceRegistryStorage,
    events?: IGovernanceRegistryEvents,
    observability?: IGovernanceRegistryObservability,
  ) {
    this.entity = new GovernanceRegistryEntity(config);
    this.stateMachine = new GovernanceRegistryStateMachine();
    this.storage = storage ?? new InMemoryGovernanceRegistryStorage();
    this.events = events ?? new GovernanceRegistryEventBus();
    this.observability = observability ?? new DefaultGovernanceRegistryObservability(config.id);

    this.observability.log("INFO", `GovernanceRegistry orchestrator initialized`, { id: config.id });
  }

  async execute(command: GovernanceRegistryCommand): Promise<GovernanceRegistryResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `GovernanceRegistry.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
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

  query(query: GovernanceRegistryQuery): GovernanceRegistryQueryResult {
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

  getState(): GovernanceRegistryState {
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
      this.observability.log("INFO", "GovernanceRegistry terminated");
    } finally {
      span.end();
    }
  }
}
