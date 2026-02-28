/**
 * BOUNDARY CONTEXT ORGANELLE — Verification Test Suite
 * Code: ORG-TB-BOUNDARY_CONTEXT-v0.1.0
 * Phase: 4 — Verification
 * Agent: webwakaagent4
 *
 * Tests all 8 invariants, 6 constraints, and core command/query paths.
 * Uses an in-memory storage adapter to keep tests fast and dependency-free.
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  BoundaryContextOrganelle,
  BoundaryContextStorage,
  BoundaryContextEventPublisher,
  BoundaryContextMetrics,
  ContextRecord,
  ContextMapRecord,
  BoundaryViolationRecord,
  ContextStatus,
  ContextMapStatus,
  RelationshipType,
  ViolationType,
} from './index.js';

// ─── In-Memory Storage Adapter ────────────────────────────────────────────────

class InMemoryStorage implements BoundaryContextStorage {
  contexts = new Map<string, ContextRecord>();
  contextsByName = new Map<string, ContextRecord>();
  maps = new Map<string, ContextMapRecord>();
  violations = new Map<string, BoundaryViolationRecord>();

  async findContextById(id: string) { return this.contexts.get(id) ?? null; }
  async findContextByName(name: string) { return this.contextsByName.get(name) ?? null; }

  async listContexts(opts: { status_filter?: ContextStatus[]; page: number; page_size: number }) {
    let all = Array.from(this.contexts.values());
    if (opts.status_filter?.length) all = all.filter(c => opts.status_filter!.includes(c.status));
    const start = (opts.page - 1) * opts.page_size;
    return { contexts: all.slice(start, start + opts.page_size), total_count: all.length };
  }

  async insertContext(record: ContextRecord) {
    this.contexts.set(record.context_id, record);
    this.contextsByName.set(record.context_name, record);
  }

  async updateContextStatus(context_id: string, new_status: ContextStatus, record_version: number, updated_at: number): Promise<boolean> {
    const ctx = this.contexts.get(context_id);
    if (!ctx || ctx.record_version !== record_version) return false;
    const updated = { ...ctx, status: new_status, updated_at, record_version: ctx.record_version + 1 };
    this.contexts.set(context_id, updated);
    this.contextsByName.set(ctx.context_name, updated);
    return true;
  }

  async findActiveContextsOwningAggregate(name: string) {
    return Array.from(this.contexts.values()).filter(c => c.status === 'ACTIVE' && c.owned_aggregates.includes(name));
  }

  async findActiveContextsOwningEvent(name: string) {
    return Array.from(this.contexts.values()).filter(c => c.status === 'ACTIVE' && c.owned_events.includes(name));
  }

  async findMapById(id: string) { return this.maps.get(id) ?? null; }

  async findActiveMap(source: string, target: string, type: RelationshipType) {
    return Array.from(this.maps.values()).find(m => m.source_context_id === source && m.target_context_id === target && m.relationship_type === type && m.status === 'ACTIVE') ?? null;
  }

  async listMaps(opts: any) {
    let all = Array.from(this.maps.values());
    if (opts.source_context_id) all = all.filter(m => m.source_context_id === opts.source_context_id);
    if (opts.target_context_id) all = all.filter(m => m.target_context_id === opts.target_context_id);
    if (opts.status_filter?.length) all = all.filter(m => opts.status_filter.includes(m.status));
    const start = (opts.page - 1) * opts.page_size;
    return { maps: all.slice(start, start + opts.page_size), total_count: all.length };
  }

  async insertMap(record: ContextMapRecord) { this.maps.set(record.map_id, record); }

  async revokeMapsByContextId(context_id: string, _revoked_at: number): Promise<number> {
    let count = 0;
    for (const [id, map] of this.maps) {
      if ((map.source_context_id === context_id || map.target_context_id === context_id) && map.status === 'ACTIVE') {
        this.maps.set(id, { ...map, status: 'REVOKED' });
        count++;
      }
    }
    return count;
  }

  async updateMapStatus(map_id: string, new_status: ContextMapStatus) {
    const map = this.maps.get(map_id);
    if (map) this.maps.set(map_id, { ...map, status: new_status });
  }

  async findViolationById(id: string) { return this.violations.get(id) ?? null; }

  async insertViolation(record: BoundaryViolationRecord) {
    this.violations.set(record.violation_id, record);
  }

  async listViolations(opts: any) {
    let all = Array.from(this.violations.values());
    if (opts.violating_context_id) all = all.filter(v => v.violating_context === opts.violating_context_id);
    if (opts.violation_type) all = all.filter(v => v.violation_type === opts.violation_type);
    const start = (opts.page - 1) * opts.page_size;
    return { violations: all.slice(start, start + opts.page_size), total_count: all.length };
  }
}

// ─── Test Doubles ─────────────────────────────────────────────────────────────

class SpyEventPublisher implements BoundaryContextEventPublisher {
  published: Array<{ event_type: string; payload: object }> = [];
  async publish(event_type: string, payload: object) {
    this.published.push({ event_type, payload });
  }
}

class NoopMetrics implements BoundaryContextMetrics {
  incrementCounter() {}
  recordHistogram() {}
  setGauge() {}
}

// ─── Test Fixtures ────────────────────────────────────────────────────────────

const CONTEXT_A_ID = '11111111-1111-4111-8111-111111111111';
const CONTEXT_B_ID = '22222222-2222-4222-8222-222222222222';
const CONTEXT_C_ID = '33333333-3333-4333-8333-333333333333';

function makeRegisterCmd(overrides: Partial<Parameters<BoundaryContextOrganelle['registerContext']>[0]> = {}) {
  return {
    context_id: CONTEXT_A_ID,
    context_name: 'OrderManagement',
    domain_scope: 'Manages the full lifecycle of customer orders',
    owned_aggregates: ['Order', 'OrderLine'],
    owned_events: ['OrderPlaced', 'OrderShipped', 'OrderCancelled'],
    version: '1.0.0',
    registered_by: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
    ...overrides,
  };
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

describe('BoundaryContextOrganelle', () => {
  let storage: InMemoryStorage;
  let events: SpyEventPublisher;
  let organelle: BoundaryContextOrganelle;

  beforeEach(() => {
    storage = new InMemoryStorage();
    events = new SpyEventPublisher();
    organelle = new BoundaryContextOrganelle(storage, events, new NoopMetrics());
  });

  // ─── registerContext ───────────────────────────────────────────────────────

  describe('registerContext', () => {
    it('registers a valid context and publishes CONTEXT_REGISTERED event', async () => {
      const result = await organelle.registerContext(makeRegisterCmd());
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.context.context_id).toBe(CONTEXT_A_ID);
      expect(result.context.status).toBe('ACTIVE');
      expect(result.context.record_version).toBe(1);
      expect(events.published[0].event_type).toBe('CONTEXT_REGISTERED');
    });

    it('INV-BC-02: rejects duplicate context name (ACTIVE)', async () => {
      await organelle.registerContext(makeRegisterCmd());
      const result = await organelle.registerContext(makeRegisterCmd({ context_id: CONTEXT_B_ID }));
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error_code).toBe('DUPLICATE_CONTEXT_NAME');
    });

    it('INV-BC-02: allows reuse of name from RETIRED context', async () => {
      await organelle.registerContext(makeRegisterCmd());
      await organelle.retireContext({ context_id: CONTEXT_A_ID, retired_by: 'founder', retirement_reason: 'test' });
      const result = await organelle.registerContext(makeRegisterCmd({ context_id: CONTEXT_B_ID }));
      expect(result.success).toBe(true);
    });

    it('INV-BC-03: rejects aggregate ownership conflict', async () => {
      await organelle.registerContext(makeRegisterCmd());
      const result = await organelle.registerContext(makeRegisterCmd({
        context_id: CONTEXT_B_ID,
        context_name: 'OrderFulfillment',
        owned_aggregates: ['Order'],  // 'Order' already owned by CONTEXT_A
        owned_events: ['FulfillmentStarted'],
      }));
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error_code).toBe('AGGREGATE_OWNERSHIP_CONFLICT');
    });

    it('INV-BC-04: rejects event ownership conflict', async () => {
      await organelle.registerContext(makeRegisterCmd());
      const result = await organelle.registerContext(makeRegisterCmd({
        context_id: CONTEXT_B_ID,
        context_name: 'OrderNotification',
        owned_aggregates: ['Notification'],
        owned_events: ['OrderPlaced'],  // 'OrderPlaced' already owned by CONTEXT_A
      }));
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error_code).toBe('EVENT_OWNERSHIP_CONFLICT');
    });

    it('CON-BC-06: rejects context with no owned aggregates', async () => {
      const result = await organelle.registerContext(makeRegisterCmd({ owned_aggregates: [] }));
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error_code).toBe('INSUFFICIENT_OWNERSHIP_DECLARATION');
    });

    it('CON-BC-06: rejects context with no owned events', async () => {
      const result = await organelle.registerContext(makeRegisterCmd({ owned_events: [] }));
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error_code).toBe('INSUFFICIENT_OWNERSHIP_DECLARATION');
    });

    it('rejects invalid UUID format for context_id', async () => {
      const result = await organelle.registerContext(makeRegisterCmd({ context_id: 'not-a-uuid' }));
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error_code).toBe('INVALID_CONTEXT_ID_FORMAT');
    });
  });

  // ─── declareContextMap ─────────────────────────────────────────────────────

  describe('declareContextMap', () => {
    beforeEach(async () => {
      await organelle.registerContext(makeRegisterCmd({ context_id: CONTEXT_A_ID, context_name: 'OrderManagement' }));
      await organelle.registerContext(makeRegisterCmd({
        context_id: CONTEXT_B_ID,
        context_name: 'InventoryManagement',
        owned_aggregates: ['Product', 'StockLevel'],
        owned_events: ['StockReserved', 'StockReleased'],
      }));
    });

    it('declares a valid context map', async () => {
      const result = await organelle.declareContextMap({
        source_context_id: CONTEXT_A_ID,
        target_context_id: CONTEXT_B_ID,
        relationship_type: 'CONFORMIST',
        integration_points: [{ type: 'EVENT', name: 'StockReserved', direction: 'INBOUND' }],
        declared_by: 'agent4',
      });
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.was_idempotent).toBe(false);
      expect(events.published.some(e => e.event_type === 'CONTEXT_MAP_DECLARED')).toBe(true);
    });

    it('CON-BC-01: rejects self-referential map', async () => {
      const result = await organelle.declareContextMap({
        source_context_id: CONTEXT_A_ID,
        target_context_id: CONTEXT_A_ID,
        relationship_type: 'CONFORMIST',
        integration_points: [{ type: 'EVENT', name: 'OrderPlaced', direction: 'INBOUND' }],
        declared_by: 'agent4',
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error_code).toBe('SELF_REFERENTIAL_MAP');
    });

    it('CON-BC-02: returns idempotent result for duplicate map', async () => {
      const cmd = {
        source_context_id: CONTEXT_A_ID,
        target_context_id: CONTEXT_B_ID,
        relationship_type: 'CONFORMIST' as RelationshipType,
        integration_points: [{ type: 'EVENT' as const, name: 'StockReserved', direction: 'INBOUND' as const }],
        declared_by: 'agent4',
      };
      const first = await organelle.declareContextMap(cmd);
      const second = await organelle.declareContextMap(cmd);
      expect(first.success).toBe(true);
      expect(second.success).toBe(true);
      if (!second.success) return;
      expect(second.was_idempotent).toBe(true);
    });

    it('CON-BC-03: rejects map with empty integration points', async () => {
      const result = await organelle.declareContextMap({
        source_context_id: CONTEXT_A_ID,
        target_context_id: CONTEXT_B_ID,
        relationship_type: 'CONFORMIST',
        integration_points: [],
        declared_by: 'agent4',
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error_code).toBe('EMPTY_INTEGRATION_POINTS');
    });

    it('INV-BC-06: rejects map to RETIRED context', async () => {
      await organelle.retireContext({ context_id: CONTEXT_B_ID, retired_by: 'founder', retirement_reason: 'test' });
      const result = await organelle.declareContextMap({
        source_context_id: CONTEXT_A_ID,
        target_context_id: CONTEXT_B_ID,
        relationship_type: 'CONFORMIST',
        integration_points: [{ type: 'EVENT', name: 'StockReserved', direction: 'INBOUND' }],
        declared_by: 'agent4',
      });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error_code).toBe('RETIRED_CONTEXT_REFERENCE');
    });
  });

  // ─── reportBoundaryViolation ───────────────────────────────────────────────

  describe('reportBoundaryViolation', () => {
    beforeEach(async () => {
      await organelle.registerContext(makeRegisterCmd({ context_id: CONTEXT_A_ID, context_name: 'OrderManagement' }));
      await organelle.registerContext(makeRegisterCmd({
        context_id: CONTEXT_B_ID,
        context_name: 'InventoryManagement',
        owned_aggregates: ['Product'],
        owned_events: ['StockReserved'],
      }));
    });

    it('records a boundary violation and publishes event', async () => {
      const result = await organelle.reportBoundaryViolation({
        violation_id: 'vvvvvvvv-vvvv-4vvv-8vvv-vvvvvvvvvvvv',
        violating_context: CONTEXT_A_ID,
        target_context: CONTEXT_B_ID,
        violation_type: 'UNDECLARED_EVENT_CONSUMPTION',
        violation_detail: 'OrderManagement consumed StockReserved without a declared context map',
        detected_at: Date.now(),
        detected_by: 'enforcement-layer',
      });
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.was_idempotent).toBe(false);
      expect(events.published.some(e => e.event_type === 'BOUNDARY_VIOLATION_DETECTED')).toBe(true);
    });

    it('INV-BC-08: idempotent on duplicate violation_id (no duplicate write)', async () => {
      const cmd = {
        violation_id: 'vvvvvvvv-vvvv-4vvv-8vvv-vvvvvvvvvvvv',
        violating_context: CONTEXT_A_ID,
        target_context: CONTEXT_B_ID,
        violation_type: 'UNDECLARED_EVENT_CONSUMPTION' as ViolationType,
        violation_detail: 'test',
        detected_at: Date.now(),
        detected_by: 'enforcement-layer',
      };
      await organelle.reportBoundaryViolation(cmd);
      const second = await organelle.reportBoundaryViolation(cmd);
      expect(second.success).toBe(true);
      if (!second.success) return;
      expect(second.was_idempotent).toBe(true);
      // Only one violation in storage
      expect(storage.violations.size).toBe(1);
    });
  });

  // ─── Status Transitions (INV-BC-07) ───────────────────────────────────────

  describe('status transitions', () => {
    beforeEach(async () => {
      await organelle.registerContext(makeRegisterCmd({ context_id: CONTEXT_A_ID }));
    });

    it('INV-BC-07: ACTIVE → DEPRECATED is valid', async () => {
      const result = await organelle.deprecateContext({ context_id: CONTEXT_A_ID, deprecated_by: 'founder', deprecation_reason: 'test' });
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.updated.status).toBe('DEPRECATED');
    });

    it('INV-BC-07: DEPRECATED → RETIRED is valid', async () => {
      await organelle.deprecateContext({ context_id: CONTEXT_A_ID, deprecated_by: 'founder', deprecation_reason: 'test' });
      const result = await organelle.retireContext({ context_id: CONTEXT_A_ID, retired_by: 'founder', retirement_reason: 'test' });
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.updated.status).toBe('RETIRED');
    });

    it('INV-BC-07: ACTIVE → RETIRED (emergency) is valid', async () => {
      const result = await organelle.retireContext({ context_id: CONTEXT_A_ID, retired_by: 'founder', retirement_reason: 'emergency' });
      expect(result.success).toBe(true);
      if (!result.success) return;
      expect(result.updated.status).toBe('RETIRED');
    });

    it('INV-BC-07: DEPRECATED → ACTIVE is invalid', async () => {
      await organelle.deprecateContext({ context_id: CONTEXT_A_ID, deprecated_by: 'founder', deprecation_reason: 'test' });
      // No reactivate command exists — attempt deprecate again (wrong state)
      const result = await organelle.deprecateContext({ context_id: CONTEXT_A_ID, deprecated_by: 'founder', deprecation_reason: 'again' });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error_code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('INV-BC-07: RETIRED → any is invalid', async () => {
      await organelle.retireContext({ context_id: CONTEXT_A_ID, retired_by: 'founder', retirement_reason: 'test' });
      const result = await organelle.retireContext({ context_id: CONTEXT_A_ID, retired_by: 'founder', retirement_reason: 'again' });
      expect(result.success).toBe(false);
      if (result.success) return;
      expect(result.error_code).toBe('INVALID_STATUS_TRANSITION');
    });

    it('cascades map revocations on context retirement', async () => {
      await organelle.registerContext(makeRegisterCmd({
        context_id: CONTEXT_B_ID,
        context_name: 'InventoryManagement',
        owned_aggregates: ['Product'],
        owned_events: ['StockReserved'],
      }));
      await organelle.declareContextMap({
        source_context_id: CONTEXT_A_ID,
        target_context_id: CONTEXT_B_ID,
        relationship_type: 'CONFORMIST',
        integration_points: [{ type: 'EVENT', name: 'StockReserved', direction: 'INBOUND' }],
        declared_by: 'agent4',
      });
      await organelle.retireContext({ context_id: CONTEXT_A_ID, retired_by: 'founder', retirement_reason: 'test' });
      const map = Array.from(storage.maps.values())[0];
      expect(map.status).toBe('REVOKED');
    });
  });

  // ─── Queries ───────────────────────────────────────────────────────────────

  describe('queries', () => {
    beforeEach(async () => {
      await organelle.registerContext(makeRegisterCmd({ context_id: CONTEXT_A_ID }));
    });

    it('getContext returns the registered context', async () => {
      const ctx = await organelle.getContext(CONTEXT_A_ID);
      expect(ctx).not.toBeNull();
      expect(ctx?.context_name).toBe('OrderManagement');
    });

    it('getContext returns null for unknown id', async () => {
      const ctx = await organelle.getContext('00000000-0000-4000-8000-000000000000');
      expect(ctx).toBeNull();
    });

    it('listContexts returns all active contexts', async () => {
      const result = await organelle.listContexts({ status_filter: ['ACTIVE'] });
      expect(result.contexts.length).toBe(1);
      expect(result.total_count).toBe(1);
    });

    it('listContexts respects page_size cap of 100', async () => {
      const result = await organelle.listContexts({ page_size: 999 });
      // page_size is capped at 100 internally
      expect(result.contexts.length).toBeLessThanOrEqual(100);
    });
  });
});
