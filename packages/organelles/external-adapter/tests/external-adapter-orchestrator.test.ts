import { ExternalAdapterOrchestrator } from "../src/external-adapter-orchestrator";
import { ExternalAdapterConfig, ExternalAdapterState, ExternalAdapterCommand } from "../src/types";
import { InMemoryExternalAdapterStorage } from "../src/storage-interface";
import { ExternalAdapterEventBus } from "../src/event-interface";

describe("ExternalAdapterOrchestrator", () => {
  let orch: ExternalAdapterOrchestrator;
  let storage: InMemoryExternalAdapterStorage;
  let eventBus: ExternalAdapterEventBus;
  const config: ExternalAdapterConfig = { id: "orch-001", name: "Test Orch", maxConcurrency: 5, timeoutMs: 30000, retryPolicy: { maxRetries: 3, backoffMs: 100, backoffMultiplier: 2 } };
  beforeEach(() => { storage = new InMemoryExternalAdapterStorage(); eventBus = new ExternalAdapterEventBus(); orch = new ExternalAdapterOrchestrator(config, storage, eventBus); });

  it("should initialize in IDLE", () => { expect(orch.getState()).toBe(ExternalAdapterState.IDLE); });
  it("should execute and persist", async () => { const r = await orch.execute({ type: "CREATE", payload: { name: "x" }, correlationId: "c1", timestamp: Date.now() }); expect(r.success).toBe(true); expect(storage.size()).toBe(1); });
  it("should emit events", async () => { const events: any[] = []; eventBus.subscribe(e => events.push(e)); await orch.execute({ type: "CREATE", payload: {}, correlationId: "c2", timestamp: Date.now() }); expect(events.length).toBeGreaterThan(0); });
  it("should return valid telemetry", () => { const t = orch.getTelemetry(); expect(t.organelleId).toBe("orch-001"); });
});
