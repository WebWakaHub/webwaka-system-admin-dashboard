import { BoundaryContextOrchestrator } from "../src/boundary-context-orchestrator";
import { BoundaryContextConfig, BoundaryContextState } from "../src/types";
import { InMemoryBoundaryContextStorage } from "../src/storage-interface";
import { BoundaryContextEventBus } from "../src/event-interface";

describe("BoundaryContextOrchestrator", () => {
  let orch: BoundaryContextOrchestrator;
  let storage: InMemoryBoundaryContextStorage;
  let eventBus: BoundaryContextEventBus;
  const config: BoundaryContextConfig = { id: "orch-bc-001", name: "Test Orch", maxConcurrency: 5, timeoutMs: 30000, retryPolicy: { maxRetries: 3, backoffMs: 100, backoffMultiplier: 2 } };
  beforeEach(() => { storage = new InMemoryBoundaryContextStorage(); eventBus = new BoundaryContextEventBus(); orch = new BoundaryContextOrchestrator(config, storage, eventBus); });

  it("should initialize in IDLE", () => { expect(orch.getState()).toBe(BoundaryContextState.IDLE); });
  it("should execute and persist", async () => { const r = await orch.execute({ type: "DEFINE_BOUNDARY", payload: { name: "x" }, correlationId: "c1", timestamp: Date.now() }); expect(r.success).toBe(true); expect(storage.size()).toBe(1); });
  it("should emit events", async () => { const events: any[] = []; eventBus.subscribe(e => events.push(e)); await orch.execute({ type: "DEFINE_BOUNDARY", payload: {}, correlationId: "c2", timestamp: Date.now() }); expect(events.length).toBeGreaterThan(0); });
  it("should return valid telemetry", () => { const t = orch.getTelemetry(); expect(t.organelleId).toBe("orch-bc-001"); });
});
