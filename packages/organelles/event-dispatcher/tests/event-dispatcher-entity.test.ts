/**
 * EventDispatcher Entity — Unit Tests
 * Organelle: ORG-EM-EVENT_DISPATCHER-v0.1.0
 */

import { EventDispatcherEntity } from "../src/event-dispatcher-entity";
import { EventDispatcherConfig, EventDispatcherState, EventDispatcherCommand } from "../src/types";

describe("EventDispatcherEntity", () => {
  let entity: EventDispatcherEntity;
  const config: EventDispatcherConfig = {
    id: "test-event-dispatcher-001",
    name: "Test EventDispatcher",
    maxConcurrency: 5,
    timeoutMs: 30000,
    retryPolicy: { maxRetries: 3, backoffMs: 100, backoffMultiplier: 2 },
  };

  beforeEach(() => {
    entity = new EventDispatcherEntity(config);
  });

  describe("initialization", () => {
    it("should initialize with IDLE state", () => {
      expect(entity.getState()).toBe(EventDispatcherState.IDLE);
    });

    it("should have the correct ID", () => {
      expect(entity.getId()).toBe("test-event-dispatcher-001");
    });

    it("should have zero metrics initially", () => {
      const metrics = entity.getMetrics();
      expect(metrics.totalOperations).toBe(0);
      expect(metrics.successCount).toBe(0);
      expect(metrics.errorCount).toBe(0);
    });

    it("should have empty audit log initially", () => {
      expect(entity.getAuditLog()).toHaveLength(0);
    });
  });

  describe("state transitions", () => {
    it("should transition from IDLE to PROCESSING", () => {
      entity.setState(EventDispatcherState.PROCESSING);
      expect(entity.getState()).toBe(EventDispatcherState.PROCESSING);
    });

    it("should reject invalid transitions", () => {
      expect(() => entity.setState(EventDispatcherState.COMPLETED)).toThrow("Invalid state transition");
    });

    it("should record audit entries on transitions", () => {
      entity.setState(EventDispatcherState.PROCESSING);
      expect(entity.getAuditLog().length).toBeGreaterThan(0);
      expect(entity.getAuditLog()[0].action).toBe("STATE_TRANSITION");
    });

    it("should not allow transition from TERMINATED", () => {
      entity.setState(EventDispatcherState.TERMINATED);
      expect(() => entity.setState(EventDispatcherState.IDLE)).toThrow();
    });
  });

  describe("command execution", () => {
    it("should execute CREATE command successfully", () => {
      const command: EventDispatcherCommand = {
        type: "CREATE",
        payload: { name: "test" },
        correlationId: "corr-001",
        timestamp: Date.now(),
      };
      const result = entity.execute(command);
      expect(result.success).toBe(true);
      expect(result.correlationId).toBe("corr-001");
    });

    it("should execute UPDATE command successfully", () => {
      const command: EventDispatcherCommand = {
        type: "UPDATE",
        payload: { name: "updated" },
        correlationId: "corr-002",
        timestamp: Date.now(),
      };
      const result = entity.execute(command);
      expect(result.success).toBe(true);
    });

    it("should handle unknown command types gracefully", () => {
      const command: EventDispatcherCommand = {
        type: "UNKNOWN_CMD",
        payload: {},
        correlationId: "corr-003",
        timestamp: Date.now(),
      };
      const result = entity.execute(command);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.error!.code).toBe("EXECUTION_FAILED");
    });

    it("should increment metrics on execution", () => {
      const command: EventDispatcherCommand = {
        type: "CREATE",
        payload: {},
        correlationId: "corr-004",
        timestamp: Date.now(),
      };
      entity.execute(command);
      const metrics = entity.getMetrics();
      expect(metrics.totalOperations).toBe(1);
      expect(metrics.successCount).toBe(1);
    });

    it("should return to IDLE state after execution", () => {
      const command: EventDispatcherCommand = {
        type: "CREATE",
        payload: {},
        correlationId: "corr-005",
        timestamp: Date.now(),
      };
      entity.execute(command);
      expect(entity.getState()).toBe(EventDispatcherState.IDLE);
    });
  });

  describe("snapshot", () => {
    it("should produce a valid snapshot", () => {
      const snapshot = entity.toSnapshot();
      expect(snapshot.id).toBe("test-event-dispatcher-001");
      expect(snapshot.state).toBe(EventDispatcherState.IDLE);
      expect(snapshot.operationCount).toBe(0);
    });
  });
});
