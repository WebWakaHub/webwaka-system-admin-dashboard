/**
 * MessageGateway — State Machine
 * Organelle: ORG-CI-MESSAGE_GATEWAY-v0.1.0
 */

import { MessageGatewayState } from "./types";

interface Transition {
  from: MessageGatewayState;
  to: MessageGatewayState;
  guard?: () => boolean;
}

export class MessageGatewayStateMachine {
  private currentState: MessageGatewayState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: MessageGatewayState; to: MessageGatewayState; timestamp: number }>;

  constructor(initialState: MessageGatewayState = MessageGatewayState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: MessageGatewayState.IDLE, to: MessageGatewayState.PROCESSING },
      { from: MessageGatewayState.PROCESSING, to: MessageGatewayState.COMPLETED },
      { from: MessageGatewayState.PROCESSING, to: MessageGatewayState.ERROR },
      { from: MessageGatewayState.COMPLETED, to: MessageGatewayState.IDLE },
      { from: MessageGatewayState.ERROR, to: MessageGatewayState.IDLE },
      { from: MessageGatewayState.IDLE, to: MessageGatewayState.TERMINATED },
    ];
  }

  getState(): MessageGatewayState {
    return this.currentState;
  }

  canTransition(to: MessageGatewayState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: MessageGatewayState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: MessageGatewayState; to: MessageGatewayState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === MessageGatewayState.ERROR || this.currentState === MessageGatewayState.COMPLETED) {
      this.transition(MessageGatewayState.IDLE);
    }
  }
}
