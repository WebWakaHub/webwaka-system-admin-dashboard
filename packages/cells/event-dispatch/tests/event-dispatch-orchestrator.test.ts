/**
 * EventDispatcherOrchestrator — Orchestrator Tests
 * Cell: CEL-EVENTDISPATCH-v0.1.0
 */

import { EventDispatcherOrchestrator } from '../src/event-dispatch-orchestrator';

describe('EventDispatcherOrchestrator', () => {
  let orchestrator: EventDispatcherOrchestrator;

  beforeEach(() => {
    orchestrator = new EventDispatcherOrchestrator({
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
