import { ResultValidatorOrchestrator } from "../src/result-validator-orchestrator";
import { ResultValidatorConfig, ResultValidatorState, ResultValidatorCommand } from "../src/types";
import { InMemoryResultValidatorStorage } from "../src/storage-interface";
import { ResultValidatorEventBus } from "../src/event-interface";

describe("ResultValidatorOrchestrator", () => {
  let orch: ResultValidatorOrchestrator;
  let storage: InMemoryResultValidatorStorage;
  let eventBus: ResultValidatorEventBus;
  const config: ResultValidatorConfig = { id: "orch-001", name: "Test Orch", maxConcurrency: 5, timeoutMs: 30000, retryPolicy: { maxRetries: 3, backoffMs: 100, backoffMultiplier: 2 } };
  beforeEach(() => { storage = new InMemoryResultValidatorStorage(); eventBus = new ResultValidatorEventBus(); orch = new ResultValidatorOrchestrator(config, storage, eventBus); });

  it("should initialize in IDLE", () => { expect(orch.getState()).toBe(ResultValidatorState.IDLE); });
  it("should execute and persist", async () => { const r = await orch.execute({ type: "CREATE", payload: { name: "x" }, correlationId: "c1", timestamp: Date.now() }); expect(r.success).toBe(true); expect(storage.size()).toBe(1); });
  it("should emit events", async () => { const events: any[] = []; eventBus.subscribe(e => events.push(e)); await orch.execute({ type: "CREATE", payload: {}, correlationId: "c2", timestamp: Date.now() }); expect(events.length).toBeGreaterThan(0); });
  it("should return valid telemetry", () => { const t = orch.getTelemetry(); expect(t.organelleId).toBe("orch-001"); });
});
