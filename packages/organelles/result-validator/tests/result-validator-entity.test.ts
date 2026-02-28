import { ResultValidatorEntity } from "../src/result-validator-entity";
import { ResultValidatorConfig, ResultValidatorState, ResultValidatorCommand } from "../src/types";

describe("ResultValidatorEntity", () => {
  let entity: ResultValidatorEntity;
  const config: ResultValidatorConfig = { id: "test-001", name: "Test ResultValidator", maxConcurrency: 5, timeoutMs: 30000, retryPolicy: { maxRetries: 3, backoffMs: 100, backoffMultiplier: 2 } };
  beforeEach(() => { entity = new ResultValidatorEntity(config); });

  it("should initialize with IDLE state", () => { expect(entity.getState()).toBe(ResultValidatorState.IDLE); });
  it("should have correct ID", () => { expect(entity.getId()).toBe("test-001"); });
  it("should have zero metrics initially", () => { const m = entity.getMetrics(); expect(m.totalOperations).toBe(0); });
  it("should execute CREATE command", () => { const cmd: ResultValidatorCommand = { type: "CREATE", payload: { name: "test" }, correlationId: "c1", timestamp: Date.now() }; const r = entity.execute(cmd); expect(r.success).toBe(true); });
  it("should handle unknown commands gracefully", () => { const cmd: ResultValidatorCommand = { type: "UNKNOWN", payload: {}, correlationId: "c2", timestamp: Date.now() }; const r = entity.execute(cmd); expect(r.success).toBe(false); expect(r.error).toBeDefined(); });
  it("should reject invalid transitions", () => { expect(() => entity.setState(ResultValidatorState.COMPLETED)).toThrow(); });
  it("should return to IDLE after execution", () => { entity.execute({ type: "CREATE", payload: {}, correlationId: "c3", timestamp: Date.now() }); expect(entity.getState()).toBe(ResultValidatorState.IDLE); });
  it("should produce valid snapshot", () => { const s = entity.toSnapshot(); expect(s.id).toBe("test-001"); });
});
