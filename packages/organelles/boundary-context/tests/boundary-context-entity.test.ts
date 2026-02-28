import { BoundaryContextEntity } from "../src/boundary-context-entity";
import { BoundaryContextConfig, BoundaryContextState, BoundaryContextCommand } from "../src/types";

describe("BoundaryContextEntity", () => {
  let entity: BoundaryContextEntity;
  const config: BoundaryContextConfig = { id: "test-bc-001", name: "Test BoundaryContext", maxConcurrency: 5, timeoutMs: 30000, retryPolicy: { maxRetries: 3, backoffMs: 100, backoffMultiplier: 2 } };
  beforeEach(() => { entity = new BoundaryContextEntity(config); });

  it("should initialize with IDLE state", () => { expect(entity.getState()).toBe(BoundaryContextState.IDLE); });
  it("should have correct ID", () => { expect(entity.getId()).toBe("test-bc-001"); });
  it("should have zero metrics initially", () => { const m = entity.getMetrics(); expect(m.totalOperations).toBe(0); });
  it("should execute DEFINE_BOUNDARY command", () => { const cmd: BoundaryContextCommand = { type: "DEFINE_BOUNDARY", payload: { name: "test-boundary" }, correlationId: "c1", timestamp: Date.now() }; const r = entity.execute(cmd); expect(r.success).toBe(true); });
  it("should execute VALIDATE_CONTEXT command", () => { const cmd: BoundaryContextCommand = { type: "VALIDATE_CONTEXT", payload: { contextId: "ctx-1" }, correlationId: "c2", timestamp: Date.now() }; const r = entity.execute(cmd); expect(r.success).toBe(true); });
  it("should handle unknown commands gracefully", () => { const cmd: BoundaryContextCommand = { type: "UNKNOWN", payload: {}, correlationId: "c3", timestamp: Date.now() }; const r = entity.execute(cmd); expect(r.success).toBe(false); expect(r.error).toBeDefined(); });
  it("should reject invalid transitions", () => { expect(() => entity.setState(BoundaryContextState.COMPLETED)).toThrow(); });
  it("should return to IDLE after execution", () => { entity.execute({ type: "DEFINE_BOUNDARY", payload: {}, correlationId: "c4", timestamp: Date.now() }); expect(entity.getState()).toBe(BoundaryContextState.IDLE); });
  it("should produce valid snapshot", () => { const s = entity.toSnapshot(); expect(s.id).toBe("test-bc-001"); });
  it("should track metrics after execution", () => { entity.execute({ type: "DEFINE_BOUNDARY", payload: {}, correlationId: "c5", timestamp: Date.now() }); const m = entity.getMetrics(); expect(m.totalOperations).toBe(1); expect(m.successCount).toBe(1); });
});
