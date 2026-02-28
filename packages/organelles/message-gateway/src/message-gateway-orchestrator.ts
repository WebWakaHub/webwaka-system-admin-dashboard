/**
 * MessageGateway — Orchestrator (Main Entry Point)
 * Organelle: ORG-CI-MESSAGE_GATEWAY-v0.1.0
 */

import {
  MessageGatewayConfig,
  MessageGatewayState,
  MessageGatewayCommand,
  MessageGatewayResult,
  MessageGatewayQuery,
  MessageGatewayQueryResult,
  MessageGatewayEvent,
  OperationMetrics,
  TelemetryData,
} from "./types";
import { MessageGatewayEntity } from "./message-gateway-entity";
import { MessageGatewayStateMachine } from "./state-machine";
import { IMessageGatewayStorage, InMemoryMessageGatewayStorage } from "./storage-interface";
import { IMessageGatewayEvents, MessageGatewayEventBus } from "./event-interface";
import { IMessageGatewayObservability, DefaultMessageGatewayObservability } from "./observability-interface";

export class MessageGatewayOrchestrator {
  private entity: MessageGatewayEntity;
  private stateMachine: MessageGatewayStateMachine;
  private storage: IMessageGatewayStorage;
  private events: IMessageGatewayEvents;
  private observability: IMessageGatewayObservability;

  constructor(
    config: MessageGatewayConfig,
    storage?: IMessageGatewayStorage,
    events?: IMessageGatewayEvents,
    observability?: IMessageGatewayObservability,
  ) {
    this.entity = new MessageGatewayEntity(config);
    this.stateMachine = new MessageGatewayStateMachine();
    this.storage = storage ?? new InMemoryMessageGatewayStorage();
    this.events = events ?? new MessageGatewayEventBus();
    this.observability = observability ?? new DefaultMessageGatewayObservability(config.id);

    this.observability.log("INFO", `MessageGateway orchestrator initialized`, { id: config.id });
  }

  async execute(command: MessageGatewayCommand): Promise<MessageGatewayResult> {
    const span = this.observability.createSpan("execute");
    this.observability.log("INFO", `Executing command: ${command.type}`, { correlationId: command.correlationId });

    try {
      const result = this.entity.execute(command);

      // Persist state
      await this.storage.save(this.entity.getId(), this.entity.toSnapshot());

      // Emit event
      this.events.emit({
        type: `MessageGateway.${command.type}.${result.success ? "SUCCESS" : "FAILURE"}`,
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

  query(query: MessageGatewayQuery): MessageGatewayQueryResult {
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

  getState(): MessageGatewayState {
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
      this.observability.log("INFO", "MessageGateway terminated");
    } finally {
      span.end();
    }
  }
}
