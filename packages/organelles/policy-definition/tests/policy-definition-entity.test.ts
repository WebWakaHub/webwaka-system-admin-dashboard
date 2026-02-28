/**
 * PolicyDefinition Entity — Unit Tests
 * Organelle: ORG-CP-POLICY_DEFINITION-v0.1.0
 */

import { PolicyDefinitionEntity } from "../src/policy-definition-entity";
import { PolicyDefinitionConfig, PolicyDefinitionState, PolicyDefinitionCommand } from "../src/types";

describe("PolicyDefinitionEntity", () => {
  let entity: PolicyDefinitionEntity;
  const config: PolicyDefinitionConfig = {
    id: "test-policy-definition-001",
    name: "Test PolicyDefinition",
    maxConcurrency: 5,
    timeoutMs: 30000,
    retryPolicy: { maxRetries: 3, backoffMs: 100, backoffMultiplier: 2 },
  };

  beforeEach(() => {
    entity = new PolicyDefinitionEntity(config);
  });

  describe("initialization", () => {
    it("should initialize with IDLE state", () => {
      expect(entity.getState()).toBe(PolicyDefinitionState.IDLE);
    });

    it("should have the correct ID", () => {
      expect(entity.getId()).toBe("test-policy-definition-001");
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
      entity.setState(PolicyDefinitionState.PROCESSING);
      expect(entity.getState()).toBe(PolicyDefinitionState.PROCESSING);
    });

    it("should reject invalid transitions", () => {
      expect(() => entity.setState(PolicyDefinitionState.COMPLETED)).toThrow("Invalid state transition");
    });

    it("should record audit entries on transitions", () => {
      entity.setState(PolicyDefinitionState.PROCESSING);
      expect(entity.getAuditLog().length).toBeGreaterThan(0);
      expect(entity.getAuditLog()[0].action).toBe("STATE_TRANSITION");
    });

    it("should not allow transition from TERMINATED", () => {
      entity.setState(PolicyDefinitionState.TERMINATED);
      expect(() => entity.setState(PolicyDefinitionState.IDLE)).toThrow();
    });
  });

  describe("command execution", () => {
    it("should execute CREATE command successfully", () => {
      const command: PolicyDefinitionCommand = {
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
      const command: PolicyDefinitionCommand = {
        type: "UPDATE",
        payload: { name: "updated" },
        correlationId: "corr-002",
        timestamp: Date.now(),
      };
      const result = entity.execute(command);
      expect(result.success).toBe(true);
    });

    it("should handle unknown command types gracefully", () => {
      const command: PolicyDefinitionCommand = {
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
      const command: PolicyDefinitionCommand = {
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
      const command: PolicyDefinitionCommand = {
        type: "CREATE",
        payload: {},
        correlationId: "corr-005",
        timestamp: Date.now(),
      };
      entity.execute(command);
      expect(entity.getState()).toBe(PolicyDefinitionState.IDLE);
    });
  });

  describe("snapshot", () => {
    it("should produce a valid snapshot", () => {
      const snapshot = entity.toSnapshot();
      expect(snapshot.id).toBe("test-policy-definition-001");
      expect(snapshot.state).toBe(PolicyDefinitionState.IDLE);
      expect(snapshot.operationCount).toBe(0);
    });
  });
});
