/**
 * EventDispatcher Orchestrator — Integration Tests
 * Organelle: ORG-EM-EVENT_DISPATCHER-v0.1.0
 */

import { EventDispatcherOrchestrator } from "../src/event-dispatcher-orchestrator";
import { EventDispatcherConfig, EventDispatcherState, EventDispatcherCommand } from "../src/types";
import { InMemoryEventDispatcherStorage } from "../src/storage-interface";
import { EventDispatcherEventBus } from "../src/event-interface";

describe("EventDispatcherOrchestrator", () => {
  let orchestrator: EventDispatcherOrchestrator;
  let storage: InMemoryEventDispatcherStorage;
  let eventBus: EventDispatcherEventBus;

  const config: EventDispatcherConfig = {
    id: "test-orch-001",
    name: "Test Orchestrator",
    maxConcurrency: 5,
    timeoutMs: 30000,
    retryPolicy: { maxRetries: 3, backoffMs: 100, backoffMultiplier: 2 },
  };

  beforeEach(() => {
    storage = new InMemoryEventDispatcherStorage();
    eventBus = new EventDispatcherEventBus();
    orchestrator = new EventDispatcherOrchestrator(config, storage, eventBus);
  });

  it("should initialize in IDLE state", () => {
    expect(orchestrator.getState()).toBe(EventDispatcherState.IDLE);
  });

  it("should execute a command and persist state", async () => {
    const command: EventDispatcherCommand = {
      type: "CREATE",
      payload: { name: "test-item" },
      correlationId: "corr-int-001",
      timestamp: Date.now(),
    };
    const result = await orchestrator.execute(command);
    expect(result.success).toBe(true);
    expect(storage.size()).toBe(1);
  });

  it("should emit events on command execution", async () => {
    const events: any[] = [];
    eventBus.subscribe((event) => events.push(event));

    const command: EventDispatcherCommand = {
      type: "CREATE",
      payload: {},
      correlationId: "corr-int-002",
      timestamp: Date.now(),
    };
    await orchestrator.execute(command);
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].type).toContain("SUCCESS");
  });

  it("should return valid metrics", () => {
    const metrics = orchestrator.getMetrics();
    expect(metrics.totalOperations).toBe(0);
  });

  it("should return valid telemetry", () => {
    const telemetry = orchestrator.getTelemetry();
    expect(telemetry.organelleId).toBe("test-orch-001");
    expect(telemetry.state).toBe(EventDispatcherState.IDLE);
  });

  it("should handle query operations", () => {
    const result = orchestrator.query({ type: "STATUS" });
    expect(result.data).toBeDefined();
    expect(result.timestamp).toBeGreaterThan(0);
  });

  it("should handle multiple sequential commands", async () => {
    for (let i = 0; i < 5; i++) {
      const result = await orchestrator.execute({
        type: "CREATE",
        payload: { index: i },
        correlationId: `corr-seq-${i}`,
        timestamp: Date.now(),
      });
      expect(result.success).toBe(true);
    }
    expect(orchestrator.getMetrics().totalOperations).toBe(5);
  });
});
