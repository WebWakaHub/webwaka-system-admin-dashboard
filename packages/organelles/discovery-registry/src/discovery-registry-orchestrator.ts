/**
 * DiscoveryRegistry — Orchestrator (Main Entry Point)
 * Organelle: ORG-OD-DISCOVERY_REGISTRY-v0.1.0
 */

import {
  DiscoveryRegistryConfig,
  DiscoveryRegistryState,
  DiscoveryRegistryCommand,
  DiscoveryRegistryResult,
  DiscoveryRegistryQuery,
  DiscoveryRegistryQueryResult,
  DiscoveryRegistryEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { DiscoveryRegistryEntity } from "./discovery-registry-entity";
import { DiscoveryRegistryStateMachine } from "./state-machine";
import { IDiscoveryRegistryStorage, InMemoryDiscoveryRegistryStorage } from "./storage-interface";
import { IDiscoveryRegistryEvents, DiscoveryRegistryEventBus } from "./event-interface";
import { IDiscoveryRegistryObservability, DefaultDiscoveryRegistryObservability } from "./observability-interface";

export class DiscoveryRegistryOrchestrator {
  private entity: DiscoveryRegistryEntity;
  private stateMachine: DiscoveryRegistryStateMachine;
  private storage: IDiscoveryRegistryStorage;
  private events: IDiscoveryRegistryEvents;
  private observability: IDiscoveryRegistryObservability;

  constructor(
    config: DiscoveryRegistryConfig,
    storage?: IDiscoveryRegistryStorage,
    events?: IDiscoveryRegistryEvents,
    observability?: IDiscoveryRegistryObservability,
  ) {
    this.entity = new DiscoveryRegistryEntity(config);
    this.stateMachine = new DiscoveryRegistryStateMachine();
    this.storage = storage ?? new InMemoryDiscoveryRegistryStorage();
    this.events = events ?? new DiscoveryRegistryEventBus();
    this.observability = observability ?? new DefaultDiscoveryRegistryObservability(config.id);

    this.observability.log("INFO", `DiscoveryRegistry orchestrator initialized`, { id: config.id });
  }

  async execute(command: DiscoveryRegistryCommand): Promise<DiscoveryRegistryResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `DiscoveryRegistry.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
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

  query(query: DiscoveryRegistryQuery): DiscoveryRegistryQueryResult {
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

  getState(): DiscoveryRegistryState {
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
      this.observability.log("INFO", "DiscoveryRegistry terminated");
    } finally {
      span.end();
    }
  }
}
