/**
 * MessageGateway — Event Interface
 * Organelle: ORG-CI-MESSAGE_GATEWAY-v0.1.0
 */

import { MessageGatewayEvent } from "./types";

type EventHandler = (event: MessageGatewayEvent) => void;

export interface IMessageGatewayEvents {
  emit(event: MessageGatewayEvent): void;
  subscribe(handler: EventHandler): () => void;
  getEventCount(): number;
}

export class MessageGatewayEventBus implements IMessageGatewayEvents {
  private readonly handlers: Set<EventHandler>;
  private eventCount: number;
  private readonly eventLog: MessageGatewayEvent[];

  constructor() {
    this.handlers = new Set();
    this.eventCount = 0;
    this.eventLog = [];
  }

  emit(event: MessageGatewayEvent): void {
    this.eventCount++;
    this.eventLog.push(event);
    for (const handler of this.handlers) {
      try {
        handler(event);
      } catch (error) {
        console.error(`Event handler error:`, error);
      }
    }
  }

  subscribe(handler: EventHandler): () => void {
    this.handlers.add(handler);
    return () => {
      this.handlers.delete(handler);
    };
  }

  getEventCount(): number {
    return this.eventCount;
  }

  getEventLog(): ReadonlyArray<MessageGatewayEvent> {
    return [...this.eventLog];
  }
}
