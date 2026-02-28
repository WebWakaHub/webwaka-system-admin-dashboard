/**
 * ResourceAllocator — Orchestrator (Main Entry Point)
 * Organelle: ORG-RA-RESOURCE_ALLOCATOR-v0.1.0
 */

import {
  ResourceAllocatorConfig,
  ResourceAllocatorState,
  ResourceAllocatorCommand,
  ResourceAllocatorResult,
  ResourceAllocatorQuery,
  ResourceAllocatorQueryResult,
  ResourceAllocatorEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { ResourceAllocatorEntity } from "./resource-allocator-entity";
import { ResourceAllocatorStateMachine } from "./state-machine";
import { IResourceAllocatorStorage, InMemoryResourceAllocatorStorage } from "./storage-interface";
import { IResourceAllocatorEvents, ResourceAllocatorEventBus } from "./event-interface";
import { IResourceAllocatorObservability, DefaultResourceAllocatorObservability } from "./observability-interface";

export class ResourceAllocatorOrchestrator {
  private entity: ResourceAllocatorEntity;
  private stateMachine: ResourceAllocatorStateMachine;
  private storage: IResourceAllocatorStorage;
  private events: IResourceAllocatorEvents;
  private observability: IResourceAllocatorObservability;

  constructor(
    config: ResourceAllocatorConfig,
    storage?: IResourceAllocatorStorage,
    events?: IResourceAllocatorEvents,
    observability?: IResourceAllocatorObservability,
  ) {
    this.entity = new ResourceAllocatorEntity(config);
    this.stateMachine = new ResourceAllocatorStateMachine();
    this.storage = storage ?? new InMemoryResourceAllocatorStorage();
    this.events = events ?? new ResourceAllocatorEventBus();
    this.observability = observability ?? new DefaultResourceAllocatorObservability(config.id);

    this.observability.log("INFO", `ResourceAllocator orchestrator initialized`, { id: config.id });
  }

  async execute(command: ResourceAllocatorCommand): Promise<ResourceAllocatorResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `ResourceAllocator.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
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

  query(query: ResourceAllocatorQuery): ResourceAllocatorQueryResult {
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

  getState(): ResourceAllocatorState {
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
      this.observability.log("INFO", "ResourceAllocator terminated");
    } finally {
      span.end();
    }
  }
}
