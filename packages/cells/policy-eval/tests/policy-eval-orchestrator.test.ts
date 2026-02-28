/**
 * PolicyEvaluatorOrchestrator — Orchestrator Tests
 * Cell: CEL-POLICYEVAL-v0.1.0
 */

import { PolicyEvaluatorOrchestrator } from '../src/policy-eval-orchestrator';

describe('PolicyEvaluatorOrchestrator', () => {
  let orchestrator: PolicyEvaluatorOrchestrator;

  beforeEach(() => {
    orchestrator = new PolicyEvaluatorOrchestrator({
      timeoutMs: 5000,
    });
  });

  afterEach(async () => {
    await orchestrator.shutdown();
  });

  it('should initialize the cell', async () => {
    const cell = await orchestrator.initialize();
    expect(cell).toBeDefined();
    expect(orchestrator.getCell()).toBe(cell);
  });

  it('should shutdown gracefully', async () => {
    await orchestrator.initialize();
    await orchestrator.shutdown();
    expect(orchestrator.getCell()).toBeNull();
  });

  it('should return null cell before initialization', () => {
    expect(orchestrator.getCell()).toBeNull();
  });
});
