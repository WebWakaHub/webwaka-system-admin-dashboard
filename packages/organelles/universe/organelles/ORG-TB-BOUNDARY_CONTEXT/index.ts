/**
 * BOUNDARY CONTEXT ORGANELLE
 * Code: ORG-TB-BOUNDARY_CONTEXT-v0.1.0
 * Phase: 3 — Implementation
 * Agent: webwakaagent4
 *
 * Enforces domain boundary constraints, preventing cross-domain contamination
 * and ensuring each bounded context maintains its own invariants.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

export type ContextStatus = 'ACTIVE' | 'DEPRECATED' | 'RETIRED';
export type ContextMapStatus = 'ACTIVE' | 'REVOKED';
export type RelationshipType =
  | 'CONFORMIST'
  | 'ACL'
  | 'OPEN_HOST'
  | 'PUBLISHED_LANGUAGE'
  | 'PARTNERSHIP'
  | 'CUSTOMER_SUPPLIER';
export type ViolationType =
  | 'DIRECT_MODEL_ACCESS'
  | 'UNDECLARED_EVENT_CONSUMPTION'
  | 'UNDECLARED_COMMAND_INVOCATION';
export type IntegrationDirection = 'INBOUND' | 'OUTBOUND';
export type IntegrationPointType = 'EVENT' | 'QUERY' | 'COMMAND';

export interface IntegrationPoint {
  type: IntegrationPointType;
  name: string;
  direction: IntegrationDirection;
}

export interface ContextRecord {
  context_id: string;
  context_name: string;
  domain_scope: string;
  owned_aggregates: string[];
  owned_events: string[];
  version: string;
  status: ContextStatus;
  registered_at: number;
  registered_by: string;
  updated_at: number;
  record_version: number;
}

export interface ContextMapRecord {
  map_id: string;
  source_context_id: string;
  target_context_id: string;
  relationship_type: RelationshipType;
  integration_points: IntegrationPoint[];
  status: ContextMapStatus;
  declared_at: number;
  declared_by: string;
}

export interface BoundaryViolationRecord {
  violation_id: string;
  violating_context: string;
  target_context: string;
  violation_type: ViolationType;
  violation_detail: string;
  detected_at: number;
  detected_by: string;
}

// ─── Command / Result Types ───────────────────────────────────────────────────

export interface RegisterContextCommand {
  context_id: string;
  context_name: string;
  domain_scope: string;
  /** @minItems 1 */
  owned_aggregates: string[];
  /** @minItems 1 */
  owned_events: string[];
  version: string;
  registered_by: string;
}

export type RegisterContextResult =
  | { success: true; context: ContextRecord }
  | {
      success: false;
      error_code:
        | 'DUPLICATE_CONTEXT_NAME'
        | 'AGGREGATE_OWNERSHIP_CONFLICT'
        | 'EVENT_OWNERSHIP_CONFLICT'
        | 'INVALID_CONTEXT_ID_FORMAT'
        | 'MISSING_REQUIRED_FIELD'
        | 'INSUFFICIENT_OWNERSHIP_DECLARATION';
      error_message: string;
    };

export interface DeclareContextMapCommand {
  source_context_id: string;
  target_context_id: string;
  relationship_type: RelationshipType;
  /** @minItems 1 */
  integration_points: IntegrationPoint[];
  declared_by: string;
}

export type DeclareContextMapResult =
  | { success: true; map: ContextMapRecord; was_idempotent: boolean }
  | {
      success: false;
      error_code:
        | 'RETIRED_CONTEXT_REFERENCE'
        | 'SELF_REFERENTIAL_MAP'
        | 'CONTEXT_NOT_FOUND'
        | 'EMPTY_INTEGRATION_POINTS';
      error_message: string;
    };

export interface ReportBoundaryViolationCommand {
  violation_id: string;
  violating_context: string;
  target_context: string;
  violation_type: ViolationType;
  violation_detail: string;
  detected_at: number;
  detected_by: string;
}

export type ReportBoundaryViolationResult =
  | { success: true; violation_id: string; was_idempotent: boolean }
  | {
      success: false;
      error_code: 'CONTEXT_NOT_FOUND' | 'MISSING_REQUIRED_FIELD';
      error_message: string;
    };

export interface DeprecateContextCommand {
  context_id: string;
  deprecated_by: string;
  deprecation_reason: string;
  planned_retirement_date?: number;
}

export interface RetireContextCommand {
  context_id: string;
  retired_by: string;
  retirement_reason: string;
}

export interface RevokeContextMapCommand {
  map_id: string;
  revoked_by: string;
  revocation_reason: string;
}

export type StatusTransitionResult =
  | { success: true; updated: ContextRecord }
  | {
      success: false;
      error_code: 'CONTEXT_NOT_FOUND' | 'INVALID_STATUS_TRANSITION';
      error_message: string;
    };

// ─── Storage Port ─────────────────────────────────────────────────────────────

/**
 * Storage port — implemented by the infrastructure layer (P3-T02).
 * The organelle core logic depends only on this interface, never on a
 * concrete database driver.
 */
export interface BoundaryContextStorage {
  // ContextRecord operations
  findContextById(context_id: string): Promise<ContextRecord | null>;
  findContextByName(context_name: string): Promise<ContextRecord | null>;
  listContexts(opts: {
    status_filter?: ContextStatus[];
    page: number;
    page_size: number;
  }): Promise<{ contexts: ContextRecord[]; total_count: number }>;
  insertContext(record: ContextRecord): Promise<void>;
  updateContextStatus(
    context_id: string,
    new_status: ContextStatus,
    record_version: number,
    updated_at: number
  ): Promise<boolean>; // returns false if optimistic lock fails
  findActiveContextsOwningAggregate(aggregate_name: string): Promise<ContextRecord[]>;
  findActiveContextsOwningEvent(event_name: string): Promise<ContextRecord[]>;

  // ContextMapRecord operations
  findMapById(map_id: string): Promise<ContextMapRecord | null>;
  findActiveMap(
    source: string,
    target: string,
    type: RelationshipType
  ): Promise<ContextMapRecord | null>;
  listMaps(opts: {
    source_context_id?: string;
    target_context_id?: string;
    status_filter?: ContextMapStatus[];
    page: number;
    page_size: number;
  }): Promise<{ maps: ContextMapRecord[]; total_count: number }>;
  insertMap(record: ContextMapRecord): Promise<void>;
  revokeMapsByContextId(context_id: string, revoked_at: number): Promise<number>;
  updateMapStatus(map_id: string, new_status: ContextMapStatus): Promise<void>;

  // BoundaryViolationRecord operations (append-only)
  findViolationById(violation_id: string): Promise<BoundaryViolationRecord | null>;
  insertViolation(record: BoundaryViolationRecord): Promise<void>;
  listViolations(opts: {
    violating_context_id?: string;
    target_context_id?: string;
    violation_type?: ViolationType;
    from_timestamp?: number;
    to_timestamp?: number;
    page: number;
    page_size: number;
  }): Promise<{ violations: BoundaryViolationRecord[]; total_count: number }>;
}

// ─── Event Publisher Port ─────────────────────────────────────────────────────

export interface BoundaryContextEventPublisher {
  publish(event_type: string, payload: object): Promise<void>;
}

// ─── Observability Port ───────────────────────────────────────────────────────

export interface BoundaryContextMetrics {
  incrementCounter(name: string, labels?: Record<string, string>): void;
  recordHistogram(name: string, value: number, labels?: Record<string, string>): void;
  setGauge(name: string, value: number, labels?: Record<string, string>): void;
}

// ─── Core Organelle ───────────────────────────────────────────────────────────

/**
 * BoundaryContextOrganelle — the core domain logic unit.
 *
 * All invariants from BOUNDARY_CONTEXT_ORGANELLE_INVARIANTS.md are enforced here.
 * This class has zero infrastructure dependencies — it operates through ports.
 */
export class BoundaryContextOrganelle {
  constructor(
    private readonly storage: BoundaryContextStorage,
    private readonly events: BoundaryContextEventPublisher,
    private readonly metrics: BoundaryContextMetrics
  ) {}

  // ─── Commands ───────────────────────────────────────────────────────────────

  async registerContext(cmd: RegisterContextCommand): Promise<RegisterContextResult> {
    const start = Date.now();

    // Validate required fields
    if (!cmd.context_id || !cmd.context_name || !cmd.domain_scope || !cmd.registered_by) {
      return { success: false, error_code: 'MISSING_REQUIRED_FIELD', error_message: 'context_id, context_name, domain_scope, and registered_by are required.' };
    }

    // Validate UUID format (INV-BC-01 prerequisite)
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(cmd.context_id)) {
      return { success: false, error_code: 'INVALID_CONTEXT_ID_FORMAT', error_message: `context_id must be a valid UUID v4. Received: ${cmd.context_id}` };
    }

    // CON-BC-06: Minimum one aggregate and one event
    if (!cmd.owned_aggregates || cmd.owned_aggregates.length < 1 || !cmd.owned_events || cmd.owned_events.length < 1) {
      return { success: false, error_code: 'INSUFFICIENT_OWNERSHIP_DECLARATION', error_message: 'A context must own at least one aggregate root and at least one domain event.' };
    }

    // INV-BC-02: Context name uniqueness
    const existing = await this.storage.findContextByName(cmd.context_name);
    if (existing && existing.status !== 'RETIRED') {
      this.metrics.incrementCounter('boundary_context.registration.rejected', { reason: 'duplicate_name' });
      return { success: false, error_code: 'DUPLICATE_CONTEXT_NAME', error_message: `A context named "${cmd.context_name}" already exists with status ${existing.status}.` };
    }

    // INV-BC-03: Aggregate ownership exclusivity
    for (const aggregate of cmd.owned_aggregates) {
      const owners = await this.storage.findActiveContextsOwningAggregate(aggregate);
      if (owners.length > 0) {
        this.metrics.incrementCounter('boundary_context.registration.rejected', { reason: 'aggregate_conflict' });
        return { success: false, error_code: 'AGGREGATE_OWNERSHIP_CONFLICT', error_message: `Aggregate "${aggregate}" is already owned by context "${owners[0].context_name}" (${owners[0].context_id}).` };
      }
    }

    // INV-BC-04: Event ownership exclusivity
    for (const event of cmd.owned_events) {
      const owners = await this.storage.findActiveContextsOwningEvent(event);
      if (owners.length > 0) {
        this.metrics.incrementCounter('boundary_context.registration.rejected', { reason: 'event_conflict' });
        return { success: false, error_code: 'EVENT_OWNERSHIP_CONFLICT', error_message: `Event "${event}" is already owned by context "${owners[0].context_name}" (${owners[0].context_id}).` };
      }
    }

    const now = Date.now();
    const record: ContextRecord = {
      context_id: cmd.context_id,
      context_name: cmd.context_name,
      domain_scope: cmd.domain_scope,
      owned_aggregates: cmd.owned_aggregates,
      owned_events: cmd.owned_events,
      version: cmd.version,
      status: 'ACTIVE',
      registered_at: now,
      registered_by: cmd.registered_by,
      updated_at: now,
      record_version: 1,
    };

    await this.storage.insertContext(record);

    await this.events.publish('CONTEXT_REGISTERED', {
      context_id: record.context_id,
      context_name: record.context_name,
      registered_by: record.registered_by,
      registered_at: record.registered_at,
    });

    this.metrics.incrementCounter('boundary_context.context.registered');
    this.metrics.recordHistogram('boundary_context.registration.duration_ms', Date.now() - start);

    return { success: true, context: record };
  }

  async declareContextMap(cmd: DeclareContextMapCommand): Promise<DeclareContextMapResult> {
    // CON-BC-01: No self-referential maps
    if (cmd.source_context_id === cmd.target_context_id) {
      return { success: false, error_code: 'SELF_REFERENTIAL_MAP', error_message: 'A context cannot declare a map to itself.' };
    }

    // CON-BC-03: Minimum one integration point
    if (!cmd.integration_points || cmd.integration_points.length < 1) {
      return { success: false, error_code: 'EMPTY_INTEGRATION_POINTS', error_message: 'At least one integration point must be declared.' };
    }

    // INV-BC-06: No reference to RETIRED contexts
    const source = await this.storage.findContextById(cmd.source_context_id);
    if (!source) return { success: false, error_code: 'CONTEXT_NOT_FOUND', error_message: `Source context ${cmd.source_context_id} not found.` };
    if (source.status === 'RETIRED') return { success: false, error_code: 'RETIRED_CONTEXT_REFERENCE', error_message: `Source context "${source.context_name}" is RETIRED.` };

    const target = await this.storage.findContextById(cmd.target_context_id);
    if (!target) return { success: false, error_code: 'CONTEXT_NOT_FOUND', error_message: `Target context ${cmd.target_context_id} not found.` };
    if (target.status === 'RETIRED') return { success: false, error_code: 'RETIRED_CONTEXT_REFERENCE', error_message: `Target context "${target.context_name}" is RETIRED.` };

    // CON-BC-02: Idempotent duplicate map handling
    const existing = await this.storage.findActiveMap(cmd.source_context_id, cmd.target_context_id, cmd.relationship_type);
    if (existing) {
      return { success: true, map: existing, was_idempotent: true };
    }

    const map_id = crypto.randomUUID();
    const record: ContextMapRecord = {
      map_id,
      source_context_id: cmd.source_context_id,
      target_context_id: cmd.target_context_id,
      relationship_type: cmd.relationship_type,
      integration_points: cmd.integration_points,
      status: 'ACTIVE',
      declared_at: Date.now(),
      declared_by: cmd.declared_by,
    };

    await this.storage.insertMap(record);
    await this.events.publish('CONTEXT_MAP_DECLARED', {
      map_id: record.map_id,
      source_context_id: record.source_context_id,
      target_context_id: record.target_context_id,
      relationship_type: record.relationship_type,
    });

    this.metrics.incrementCounter('boundary_context.context_map.declared');
    return { success: true, map: record, was_idempotent: false };
  }

  async reportBoundaryViolation(cmd: ReportBoundaryViolationCommand): Promise<ReportBoundaryViolationResult> {
    if (!cmd.violation_id || !cmd.violating_context || !cmd.target_context || !cmd.violation_type || !cmd.violation_detail) {
      return { success: false, error_code: 'MISSING_REQUIRED_FIELD', error_message: 'violation_id, violating_context, target_context, violation_type, and violation_detail are required.' };
    }

    // Verify contexts exist
    const violating = await this.storage.findContextById(cmd.violating_context);
    if (!violating) return { success: false, error_code: 'CONTEXT_NOT_FOUND', error_message: `Violating context ${cmd.violating_context} not found.` };
    const target = await this.storage.findContextById(cmd.target_context);
    if (!target) return { success: false, error_code: 'CONTEXT_NOT_FOUND', error_message: `Target context ${cmd.target_context} not found.` };

    // Idempotency check
    const existing = await this.storage.findViolationById(cmd.violation_id);
    if (existing) {
      return { success: true, violation_id: cmd.violation_id, was_idempotent: true };
    }

    // INV-BC-08: Append-only write
    const record: BoundaryViolationRecord = {
      violation_id: cmd.violation_id,
      violating_context: cmd.violating_context,
      target_context: cmd.target_context,
      violation_type: cmd.violation_type,
      violation_detail: cmd.violation_detail,
      detected_at: cmd.detected_at,
      detected_by: cmd.detected_by,
    };

    await this.storage.insertViolation(record);
    await this.events.publish('BOUNDARY_VIOLATION_DETECTED', {
      violation_id: record.violation_id,
      violating_context: record.violating_context,
      target_context: record.target_context,
      violation_type: record.violation_type,
      detected_at: record.detected_at,
    });

    this.metrics.incrementCounter('boundary_context.violation.reported', { type: cmd.violation_type });
    return { success: true, violation_id: cmd.violation_id, was_idempotent: false };
  }

  async deprecateContext(cmd: DeprecateContextCommand): Promise<StatusTransitionResult> {
    const context = await this.storage.findContextById(cmd.context_id);
    if (!context) return { success: false, error_code: 'CONTEXT_NOT_FOUND', error_message: `Context ${cmd.context_id} not found.` };

    // INV-BC-07: Unidirectional transitions
    if (context.status !== 'ACTIVE') {
      return { success: false, error_code: 'INVALID_STATUS_TRANSITION', error_message: `Cannot deprecate a context with status ${context.status}. Only ACTIVE contexts can be deprecated.` };
    }

    const now = Date.now();
    const ok = await this.storage.updateContextStatus(cmd.context_id, 'DEPRECATED', context.record_version, now);
    if (!ok) return { success: false, error_code: 'INVALID_STATUS_TRANSITION', error_message: 'Optimistic lock failure — context was modified concurrently. Please retry.' };

    const updated: ContextRecord = { ...context, status: 'DEPRECATED', updated_at: now, record_version: context.record_version + 1 };
    await this.events.publish('CONTEXT_DEPRECATED', { context_id: cmd.context_id, deprecated_by: cmd.deprecated_by, deprecated_at: now });
    this.metrics.incrementCounter('boundary_context.context.deprecated');
    return { success: true, updated };
  }

  async retireContext(cmd: RetireContextCommand): Promise<StatusTransitionResult> {
    const context = await this.storage.findContextById(cmd.context_id);
    if (!context) return { success: false, error_code: 'CONTEXT_NOT_FOUND', error_message: `Context ${cmd.context_id} not found.` };

    // INV-BC-07: Only ACTIVE or DEPRECATED contexts can be retired
    if (context.status === 'RETIRED') {
      return { success: false, error_code: 'INVALID_STATUS_TRANSITION', error_message: `Context is already RETIRED.` };
    }

    const now = Date.now();
    const ok = await this.storage.updateContextStatus(cmd.context_id, 'RETIRED', context.record_version, now);
    if (!ok) return { success: false, error_code: 'INVALID_STATUS_TRANSITION', error_message: 'Optimistic lock failure — please retry.' };

    // Cascade: revoke all active context maps involving this context
    const revokedCount = await this.storage.revokeMapsByContextId(cmd.context_id, now);

    const updated: ContextRecord = { ...context, status: 'RETIRED', updated_at: now, record_version: context.record_version + 1 };
    await this.events.publish('CONTEXT_RETIRED', {
      context_id: cmd.context_id,
      retired_by: cmd.retired_by,
      retired_at: now,
      cascaded_map_revocations: revokedCount,
    });
    this.metrics.incrementCounter('boundary_context.context.retired');
    this.metrics.incrementCounter('boundary_context.context_map.cascade_revoked', { count: String(revokedCount) });
    return { success: true, updated };
  }

  async revokeContextMap(cmd: RevokeContextMapCommand): Promise<{ success: boolean; error?: string }> {
    const map = await this.storage.findMapById(cmd.map_id);
    if (!map) return { success: false, error: `Map ${cmd.map_id} not found.` };
    if (map.status === 'REVOKED') return { success: true }; // idempotent

    await this.storage.updateMapStatus(cmd.map_id, 'REVOKED');
    await this.events.publish('CONTEXT_MAP_REVOKED', { map_id: cmd.map_id, revoked_by: cmd.revoked_by, revoked_at: Date.now() });
    this.metrics.incrementCounter('boundary_context.context_map.revoked');
    return { success: true };
  }

  // ─── Queries ────────────────────────────────────────────────────────────────

  async getContext(context_id: string): Promise<ContextRecord | null> {
    return this.storage.findContextById(context_id);
  }

  async findContextByName(context_name: string): Promise<ContextRecord | null> {
    return this.storage.findContextByName(context_name);
  }

  async listContexts(opts: { status_filter?: ContextStatus[]; page?: number; page_size?: number }) {
    return this.storage.listContexts({ status_filter: opts.status_filter, page: opts.page ?? 1, page_size: Math.min(opts.page_size ?? 20, 100) });
  }

  async getContextMap(map_id: string): Promise<ContextMapRecord | null> {
    return this.storage.findMapById(map_id);
  }

  async listContextMaps(opts: { source_context_id?: string; target_context_id?: string; status_filter?: ContextMapStatus[]; page?: number; page_size?: number }) {
    return this.storage.listMaps({ ...opts, page: opts.page ?? 1, page_size: Math.min(opts.page_size ?? 20, 100) });
  }

  async listBoundaryViolations(opts: { violating_context_id?: string; target_context_id?: string; violation_type?: ViolationType; from_timestamp?: number; to_timestamp?: number; page?: number; page_size?: number }) {
    return this.storage.listViolations({ ...opts, page: opts.page ?? 1, page_size: Math.min(opts.page_size ?? 20, 100) });
  }
}
