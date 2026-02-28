/**
 * ResourceAllocator — State Machine
 * Organelle: ORG-RA-RESOURCE_ALLOCATOR-v0.1.0
 */

import { ResourceAllocatorState } from "./types";

interface Transition {
  from: ResourceAllocatorState;
  to: ResourceAllocatorState;
  guard?: () => boolean;
}

export class ResourceAllocatorStateMachine {
  private currentState: ResourceAllocatorState;
  private readonly transitions: Transition[];
  private readonly history: Array<{ from: ResourceAllocatorState; to: ResourceAllocatorState; timestamp: number }>;

  constructor(initialState: ResourceAllocatorState = ResourceAllocatorState.IDLE) {
    this.currentState = initialState;
    this.history = [];
    this.transitions = [
      { from: ResourceAllocatorState.IDLE, to: ResourceAllocatorState.PROCESSING },
      { from: ResourceAllocatorState.PROCESSING, to: ResourceAllocatorState.COMPLETED },
      { from: ResourceAllocatorState.PROCESSING, to: ResourceAllocatorState.ERROR },
      { from: ResourceAllocatorState.COMPLETED, to: ResourceAllocatorState.IDLE },
      { from: ResourceAllocatorState.ERROR, to: ResourceAllocatorState.IDLE },
      { from: ResourceAllocatorState.IDLE, to: ResourceAllocatorState.TERMINATED },
    ];
  }

  getState(): ResourceAllocatorState {
    return this.currentState;
  }

  canTransition(to: ResourceAllocatorState): boolean {
    return this.transitions.some(
      (t) => t.from === this.currentState && t.to === to && (!t.guard || t.guard())
    );
  }

  transition(to: ResourceAllocatorState): void {
    if (!this.canTransition(to)) {
      throw new Error(`Invalid transition: ${this.currentState} → ${to}`);
    }
    this.history.push({ from: this.currentState, to, timestamp: Date.now() });
    this.currentState = to;
  }

  getHistory(): ReadonlyArray<{ from: ResourceAllocatorState; to: ResourceAllocatorState; timestamp: number }> {
    return [...this.history];
  }

  reset(): void {
    if (this.currentState === ResourceAllocatorState.ERROR || this.currentState === ResourceAllocatorState.COMPLETED) {
      this.transition(ResourceAllocatorState.IDLE);
    }
  }
}
