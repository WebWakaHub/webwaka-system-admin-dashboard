/**
 * DiscoveryRegistry Entity — Unit Tests
 * Organelle: ORG-OD-DISCOVERY_REGISTRY-v0.1.0
 */

import { DiscoveryRegistryEntity } from "../src/discovery-registry-entity";
import { DiscoveryRegistryConfig, DiscoveryRegistryState, DiscoveryRegistryCommand } from "../src/types";

describe("DiscoveryRegistryEntity", () => {
  let entity: DiscoveryRegistryEntity;
  const config: DiscoveryRegistryConfig = {
    id: "test-discovery-registry-001",
    name: "Test DiscoveryRegistry",
    maxConcurrency: 5,
    timeoutMs: 30000,
    retryPolicy: { maxRetries: 3, backoffMs: 100, backoffMultiplier: 2 },
  };

  beforeEach(() => {
    entity = new DiscoveryRegistryEntity(config);
  });

  describe("initialization", () => {
    it("should initialize with IDLE state", () => {
      expect(entity.getState()).toBe(DiscoveryRegistryState.IDLE);
    });

    it("should have the correct ID", () => {
      expect(entity.getId()).toBe("test-discovery-registry-001");
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
      entity.setState(DiscoveryRegistryState.PROCESSING);
      expect(entity.getState()).toBe(DiscoveryRegistryState.PROCESSING);
    });

    it("should reject invalid transitions", () => {
      expect(() => entity.setState(DiscoveryRegistryState.COMPLETED)).toThrow("Invalid state transition");
    });

    it("should record audit entries on transitions", () => {
      entity.setState(DiscoveryRegistryState.PROCESSING);
      expect(entity.getAuditLog().length).toBeGreaterThan(0);
      expect(entity.getAuditLog()[0].action).toBe("STATE_TRANSITION");
    });

    it("should not allow transition from TERMINATED", () => {
      entity.setState(DiscoveryRegistryState.TERMINATED);
      expect(() => entity.setState(DiscoveryRegistryState.IDLE)).toThrow();
    });
  });

  describe("command execution", () => {
    it("should execute CREATE command successfully", () => {
      const command: DiscoveryRegistryCommand = {
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
      const command: DiscoveryRegistryCommand = {
        type: "UPDATE",
        payload: { name: "updated" },
        correlationId: "corr-002",
        timestamp: Date.now(),
      };
      const result = entity.execute(command);
      expect(result.success).toBe(true);
    });

    it("should handle unknown command types gracefully", () => {
      const command: DiscoveryRegistryCommand = {
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
      const command: DiscoveryRegistryCommand = {
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
      const command: DiscoveryRegistryCommand = {
        type: "CREATE",
        payload: {},
        correlationId: "corr-005",
        timestamp: Date.now(),
      };
      entity.execute(command);
      expect(entity.getState()).toBe(DiscoveryRegistryState.IDLE);
    });
  });

  describe("snapshot", () => {
    it("should produce a valid snapshot", () => {
      const snapshot = entity.toSnapshot();
      expect(snapshot.id).toBe("test-discovery-registry-001");
      expect(snapshot.state).toBe(DiscoveryRegistryState.IDLE);
      expect(snapshot.operationCount).toBe(0);
    });
  });
});
