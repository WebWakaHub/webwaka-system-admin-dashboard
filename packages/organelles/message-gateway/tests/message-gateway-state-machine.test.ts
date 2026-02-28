/**
 * MessageGateway State Machine — Unit Tests
 * Organelle: ORG-CI-MESSAGE_GATEWAY-v0.1.0
 */

import { MessageGatewayStateMachine } from "../src/state-machine";
import { MessageGatewayState } from "../src/types";

describe("MessageGatewayStateMachine", () => {
  let sm: MessageGatewayStateMachine;

  beforeEach(() => {
    sm = new MessageGatewayStateMachine();
  });

  it("should start in IDLE state", () => {
    expect(sm.getState()).toBe(MessageGatewayState.IDLE);
  });

  it("should allow IDLE → PROCESSING", () => {
    expect(sm.canTransition(MessageGatewayState.PROCESSING)).toBe(true);
    sm.transition(MessageGatewayState.PROCESSING);
    expect(sm.getState()).toBe(MessageGatewayState.PROCESSING);
  });

  it("should allow PROCESSING → COMPLETED", () => {
    sm.transition(MessageGatewayState.PROCESSING);
    sm.transition(MessageGatewayState.COMPLETED);
    expect(sm.getState()).toBe(MessageGatewayState.COMPLETED);
  });

  it("should allow PROCESSING → ERROR", () => {
    sm.transition(MessageGatewayState.PROCESSING);
    sm.transition(MessageGatewayState.ERROR);
    expect(sm.getState()).toBe(MessageGatewayState.ERROR);
  });

  it("should allow ERROR → IDLE via reset", () => {
    sm.transition(MessageGatewayState.PROCESSING);
    sm.transition(MessageGatewayState.ERROR);
    sm.reset();
    expect(sm.getState()).toBe(MessageGatewayState.IDLE);
  });

  it("should reject invalid transitions", () => {
    expect(() => sm.transition(MessageGatewayState.COMPLETED)).toThrow();
  });

  it("should maintain transition history", () => {
    sm.transition(MessageGatewayState.PROCESSING);
    sm.transition(MessageGatewayState.COMPLETED);
    const history = sm.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(MessageGatewayState.IDLE);
    expect(history[0].to).toBe(MessageGatewayState.PROCESSING);
  });

  it("should allow IDLE → TERMINATED", () => {
    sm.transition(MessageGatewayState.TERMINATED);
    expect(sm.getState()).toBe(MessageGatewayState.TERMINATED);
  });

  it("should not allow transitions from TERMINATED", () => {
    sm.transition(MessageGatewayState.TERMINATED);
    expect(sm.canTransition(MessageGatewayState.IDLE)).toBe(false);
  });
});
