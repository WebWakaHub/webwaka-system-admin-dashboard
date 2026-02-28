#!/usr/bin/env python3
"""Generate TypeScript implementation for Governance Registry organelle."""
import os

BASE = "/home/ubuntu/impl-webwaka-organelle-governance-registry"
os.makedirs(f"{BASE}/src", exist_ok=True)

files = {
    "package.json": """{
  "name": "@webwaka/organelle-governance-registry",
  "version": "0.1.0",
  "description": "Governance Registry Organelle — Rule registration, versioning, amendment processing, compliance binding",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": { "build": "tsc", "test": "jest" },
  "dependencies": { "uuid": "^9.0.0" },
  "devDependencies": { "typescript": "^5.3.0", "@types/node": "^20.0.0", "jest": "^29.0.0", "@types/jest": "^29.0.0", "ts-jest": "^29.0.0" }
}""",
    "tsconfig.json": """{
  "compilerOptions": { "target": "ES2022", "module": "commonjs", "lib": ["ES2022"], "outDir": "./dist", "rootDir": "./src", "strict": true, "esModuleInterop": true, "declaration": true, "sourceMap": true },
  "include": ["src/**/*"]
}""",
    "README.md": """# Governance Registry Organelle

**Code:** ORG-RG-GOVERNANCE_REGISTRY | **Version:** 0.1.0 | **Category:** Regulatory & Governance

Provides the canonical mechanism for registering, versioning, enforcing, and auditing governance rules, constitutional articles, and compliance policies across the WebWaka Biological Architecture.

## Architecture
Hexagonal architecture with primary ports (GovernanceManagement, GovernanceQuery) and secondary ports (Storage, Event, Observability).

## Key Components
- **RuleEntity** — 4-state FSM (DRAFT → ACTIVE → DEPRECATED → ARCHIVED)
- **AmendmentProcessor** — Quorum verification and amendment application
- **ComplianceBinder** — Policy-to-target binding with duplicate detection
- **GovernanceOrchestrator** — Main orchestrator
""",
    "src/types.ts": """// ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — Type Definitions

export type RuleState = 'DRAFT' | 'ACTIVE' | 'DEPRECATED' | 'ARCHIVED';

export interface GovernanceRule {
  readonly rule_id: string;
  readonly title: string;
  readonly body: string;
  readonly category: string;
  readonly state: RuleState;
  readonly version: string;
  readonly sunset_date?: Date;
  readonly deprecation_reason?: string;
  readonly created_at: Date;
  readonly updated_at: Date;
}

export interface RuleVersion {
  readonly version_id: string;
  readonly rule_id: string;
  readonly version: string;
  readonly body: string;
  readonly created_at: Date;
}

export interface ComplianceBinding {
  readonly binding_id: string;
  readonly policy_id: string;
  readonly target_type: string;
  readonly target_id: string;
  readonly created_at: Date;
}

export interface AmendmentResult {
  readonly amendment_id: string;
  readonly article_id: string;
  readonly status: 'APPROVED' | 'REJECTED';
  readonly quorum_met: boolean;
  readonly effective_date?: Date;
}

export interface ComplianceReport {
  readonly target_type: string;
  readonly target_id: string;
  readonly applicable_rules: GovernanceRule[];
  readonly compliance_status: 'COMPLIANT' | 'NON_COMPLIANT' | 'UNKNOWN';
}

export interface RegisterRuleCommand {
  readonly rule_id: string;
  readonly title: string;
  readonly body: string;
  readonly category: string;
  readonly version: string;
  readonly idempotency_key?: string;
}

export interface ActivateRuleCommand { readonly rule_id: string; }
export interface DeprecateRuleCommand { readonly rule_id: string; readonly reason: string; readonly sunset_date: Date; }
export interface ArchiveRuleCommand { readonly rule_id: string; }
export interface AmendConstitutionCommand { readonly article_id: string; readonly amendment_body: string; readonly proposer: string; readonly signatures: string[]; }
export interface BindPolicyCommand { readonly policy_id: string; readonly target_type: string; readonly target_id: string; }
export interface QueryComplianceCommand { readonly target_type: string; readonly target_id: string; readonly category?: string; }
export interface RuleQuery { readonly category?: string; readonly state?: RuleState; readonly limit?: number; readonly offset?: number; }

export interface GovernanceEvent {
  readonly event_id: string;
  readonly event_type: string;
  readonly aggregate_id: string;
  readonly payload: Record<string, unknown>;
  readonly timestamp: Date;
}

export interface MetricEntry { readonly name: string; readonly value: number; readonly labels: Record<string, string>; readonly timestamp: Date; }
export interface TraceSpan { readonly span_id: string; readonly operation: string; readonly attributes: Record<string, unknown>; readonly start_time: Date; readonly end_time?: Date; }
export interface LogEntry { readonly level: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'; readonly message: string; readonly context: Record<string, unknown>; readonly timestamp: Date; }

export class GovernanceRegistryError extends Error {
  constructor(public readonly code: string, message: string) { super(message); this.name = 'GovernanceRegistryError'; }
}
""",
    "src/rule-entity.ts": """// ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — Rule Entity with FSM

import { RuleState, GovernanceRule, RuleVersion, GovernanceRegistryError } from './types';

const VALID_TRANSITIONS: Record<RuleState, RuleState[]> = {
  DRAFT: ['ACTIVE'],
  ACTIVE: ['DEPRECATED', 'ARCHIVED'],
  DEPRECATED: ['ARCHIVED'],
  ARCHIVED: [],
};

export class RuleEntity {
  private _state: RuleState;
  private _title: string;
  private _body: string;
  private _version: string;
  private _sunset_date?: Date;
  private _deprecation_reason?: string;
  private _updated_at: Date;
  private readonly _versions: RuleVersion[] = [];

  constructor(
    public readonly rule_id: string,
    title: string,
    body: string,
    public readonly category: string,
    version: string,
    public readonly created_at: Date = new Date(),
  ) {
    if (!rule_id || !title || !body || !category || !version) {
      throw new GovernanceRegistryError('GR-002', 'Invalid rule: missing required fields');
    }
    this._title = title;
    this._body = body;
    this._version = version;
    this._state = 'DRAFT';
    this._updated_at = this.created_at;
    this._versions.push({ version_id: crypto.randomUUID(), rule_id, version, body, created_at: this.created_at });
  }

  get state(): RuleState { return this._state; }
  get title(): string { return this._title; }
  get body(): string { return this._body; }
  get version(): string { return this._version; }
  get sunset_date(): Date | undefined { return this._sunset_date; }
  get deprecation_reason(): string | undefined { return this._deprecation_reason; }
  get updated_at(): Date { return this._updated_at; }
  get versions(): ReadonlyArray<RuleVersion> { return [...this._versions]; }

  private transition(target: RuleState): void {
    const allowed = VALID_TRANSITIONS[this._state];
    if (!allowed.includes(target)) {
      throw new GovernanceRegistryError('GR-003', `Cannot transition from ${this._state} to ${target}`);
    }
    this._state = target;
    this._updated_at = new Date();
  }

  activate(): void { this.transition('ACTIVE'); }

  deprecate(reason: string, sunset_date: Date): void {
    if (!reason || !sunset_date) {
      throw new GovernanceRegistryError('GR-003', 'Deprecation requires reason and sunset_date (INV-B05)');
    }
    this.transition('DEPRECATED');
    this._deprecation_reason = reason;
    this._sunset_date = sunset_date;
  }

  archive(): void { this.transition('ARCHIVED'); }

  toSnapshot(): GovernanceRule {
    return {
      rule_id: this.rule_id, title: this._title, body: this._body, category: this.category,
      state: this._state, version: this._version, sunset_date: this._sunset_date,
      deprecation_reason: this._deprecation_reason, created_at: this.created_at, updated_at: this._updated_at,
    };
  }
}
""",
    "src/amendment-processor.ts": """// ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — Amendment Processor with Quorum Verification

import { AmendConstitutionCommand, AmendmentResult, GovernanceRegistryError } from './types';

const QUORUM_THRESHOLD = 0.51;
const AUTHORIZED_SIGNERS = ['webwaka007', 'webwakaagent1', 'webwakaagent2', 'webwakaagent3', 'webwakaagent4', 'webwakaagent5', 'webwakaagent6', 'webwakaagent7', 'webwakaagent8', 'webwakaagent9', 'webwakaagent10'];

export class AmendmentProcessor {
  processAmendment(cmd: AmendConstitutionCommand): AmendmentResult {
    const validSignatures = cmd.signatures.filter(s => AUTHORIZED_SIGNERS.includes(s));
    const uniqueSignatures = [...new Set(validSignatures)];
    const quorumRatio = uniqueSignatures.length / AUTHORIZED_SIGNERS.length;
    const quorum_met = quorumRatio >= QUORUM_THRESHOLD;

    if (!quorum_met) {
      return {
        amendment_id: crypto.randomUUID(), article_id: cmd.article_id,
        status: 'REJECTED', quorum_met: false,
      };
    }

    return {
      amendment_id: crypto.randomUUID(), article_id: cmd.article_id,
      status: 'APPROVED', quorum_met: true, effective_date: new Date(),
    };
  }
}
""",
    "src/state-machine.ts": """// ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — State Machine Definition

import { RuleState } from './types';

export interface Transition { from: RuleState; to: RuleState; trigger: string; guards: string[]; }

export const RULE_TRANSITIONS: Transition[] = [
  { from: 'DRAFT', to: 'ACTIVE', trigger: 'activate', guards: ['rule passes schema validation'] },
  { from: 'ACTIVE', to: 'DEPRECATED', trigger: 'deprecate', guards: ['reason and sunset_date provided'] },
  { from: 'DEPRECATED', to: 'ARCHIVED', trigger: 'archive', guards: ['sunset date passed or explicit'] },
  { from: 'ACTIVE', to: 'ARCHIVED', trigger: 'archive', guards: ['emergency governance override'] },
];

export function isValidTransition(from: RuleState, to: RuleState): boolean {
  return RULE_TRANSITIONS.some(t => t.from === from && t.to === to);
}

export function getTerminalStates(): RuleState[] { return ['ARCHIVED']; }
export function getInitialState(): RuleState { return 'DRAFT'; }
""",
    "src/storage-interface.ts": """// ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — Storage Port Interface

import { RuleEntity } from './rule-entity';
import { ComplianceBinding, RuleQuery } from './types';

export interface IGovernanceStoragePort {
  saveRule(rule: RuleEntity): Promise<void>;
  findRuleById(ruleId: string): Promise<RuleEntity | null>;
  findRulesByQuery(query: RuleQuery): Promise<RuleEntity[]>;
  saveBinding(binding: ComplianceBinding): Promise<void>;
  findBindingsByTarget(targetType: string, targetId: string): Promise<ComplianceBinding[]>;
  bindingExists(policyId: string, targetType: string, targetId: string): Promise<boolean>;
}
""",
    "src/event-interface.ts": """// ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — Event Port Interface

import { GovernanceEvent } from './types';

export interface IGovernanceEventPort {
  emit(event: GovernanceEvent): Promise<void>;
  emitBatch(events: GovernanceEvent[]): Promise<void>;
}

export function createGovernanceEvent(type: string, aggregateId: string, payload: Record<string, unknown>): GovernanceEvent {
  return { event_id: crypto.randomUUID(), event_type: type, aggregate_id: aggregateId, payload, timestamp: new Date() };
}
""",
    "src/observability-interface.ts": """// ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — Observability Port Interface

import { MetricEntry, TraceSpan, LogEntry } from './types';

export interface IGovernanceObservabilityPort {
  recordMetric(metric: MetricEntry): void;
  recordTrace(span: TraceSpan): void;
  recordLog(entry: LogEntry): void;
}

export function createMetric(name: string, value: number, labels: Record<string, string> = {}): MetricEntry {
  return { name, value, labels, timestamp: new Date() };
}

export function createLog(level: LogEntry['level'], message: string, context: Record<string, unknown> = {}): LogEntry {
  return { level, message, context, timestamp: new Date() };
}
""",
    "src/governance-orchestrator.ts": """// ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — Main Orchestrator

import { IGovernanceStoragePort } from './storage-interface';
import { IGovernanceEventPort, createGovernanceEvent } from './event-interface';
import { IGovernanceObservabilityPort, createMetric, createLog } from './observability-interface';
import { RuleEntity } from './rule-entity';
import { AmendmentProcessor } from './amendment-processor';
import {
  RegisterRuleCommand, ActivateRuleCommand, DeprecateRuleCommand, ArchiveRuleCommand,
  AmendConstitutionCommand, BindPolicyCommand, QueryComplianceCommand, RuleQuery,
  GovernanceRule, AmendmentResult, ComplianceBinding, ComplianceReport, GovernanceRegistryError,
} from './types';

export class GovernanceOrchestrator {
  private readonly amendmentProcessor = new AmendmentProcessor();

  constructor(
    private readonly storage: IGovernanceStoragePort,
    private readonly events: IGovernanceEventPort,
    private readonly observability: IGovernanceObservabilityPort,
  ) {}

  async registerRule(cmd: RegisterRuleCommand): Promise<GovernanceRule> {
    this.observability.recordLog(createLog('INFO', 'Registering governance rule', { rule_id: cmd.rule_id }));
    const entity = new RuleEntity(cmd.rule_id, cmd.title, cmd.body, cmd.category, cmd.version);
    await this.storage.saveRule(entity);
    await this.events.emit(createGovernanceEvent('RuleRegistered', cmd.rule_id, { title: cmd.title, category: cmd.category }));
    this.observability.recordMetric(createMetric('governance.rule.registered.count', 1, { category: cmd.category }));
    return entity.toSnapshot();
  }

  async activateRule(cmd: ActivateRuleCommand): Promise<GovernanceRule> {
    const entity = await this.requireRule(cmd.rule_id);
    entity.activate();
    await this.storage.saveRule(entity);
    await this.events.emit(createGovernanceEvent('RuleActivated', cmd.rule_id, {}));
    this.observability.recordMetric(createMetric('governance.rule.activated.count', 1, { category: entity.category }));
    return entity.toSnapshot();
  }

  async deprecateRule(cmd: DeprecateRuleCommand): Promise<GovernanceRule> {
    const entity = await this.requireRule(cmd.rule_id);
    entity.deprecate(cmd.reason, cmd.sunset_date);
    await this.storage.saveRule(entity);
    await this.events.emit(createGovernanceEvent('RuleDeprecated', cmd.rule_id, { reason: cmd.reason }));
    return entity.toSnapshot();
  }

  async archiveRule(cmd: ArchiveRuleCommand): Promise<void> {
    const entity = await this.requireRule(cmd.rule_id);
    entity.archive();
    await this.storage.saveRule(entity);
    await this.events.emit(createGovernanceEvent('RuleArchived', cmd.rule_id, {}));
  }

  async amendConstitution(cmd: AmendConstitutionCommand): Promise<AmendmentResult> {
    const result = this.amendmentProcessor.processAmendment(cmd);
    await this.events.emit(createGovernanceEvent('AmendmentProcessed', cmd.article_id, { status: result.status, quorum_met: result.quorum_met }));
    this.observability.recordMetric(createMetric('governance.amendment.processed.count', 1, { status: result.status }));
    return result;
  }

  async bindPolicy(cmd: BindPolicyCommand): Promise<ComplianceBinding> {
    const exists = await this.storage.bindingExists(cmd.policy_id, cmd.target_type, cmd.target_id);
    if (exists) throw new GovernanceRegistryError('GR-005', 'Duplicate binding');
    const binding: ComplianceBinding = { binding_id: crypto.randomUUID(), policy_id: cmd.policy_id, target_type: cmd.target_type, target_id: cmd.target_id, created_at: new Date() };
    await this.storage.saveBinding(binding);
    await this.events.emit(createGovernanceEvent('PolicyBound', binding.binding_id, { policy_id: cmd.policy_id, target: `${cmd.target_type}:${cmd.target_id}` }));
    return binding;
  }

  async queryCompliance(cmd: QueryComplianceCommand): Promise<ComplianceReport> {
    const start = Date.now();
    const rules = await this.storage.findRulesByQuery({ state: 'ACTIVE', category: cmd.category });
    const duration = Date.now() - start;
    this.observability.recordMetric(createMetric('governance.compliance.query.duration_ms', duration, { target_type: cmd.target_type }));
    return { target_type: cmd.target_type, target_id: cmd.target_id, applicable_rules: rules.map(r => r.toSnapshot()), compliance_status: rules.length > 0 ? 'COMPLIANT' : 'UNKNOWN' };
  }

  async getRule(ruleId: string): Promise<GovernanceRule> { return (await this.requireRule(ruleId)).toSnapshot(); }
  async getRuleHistory(ruleId: string): Promise<GovernanceRule[]> { const e = await this.requireRule(ruleId); return [e.toSnapshot()]; }
  async listRules(query: RuleQuery): Promise<GovernanceRule[]> { return (await this.storage.findRulesByQuery(query)).map(r => r.toSnapshot()); }

  private async requireRule(ruleId: string): Promise<RuleEntity> {
    const entity = await this.storage.findRuleById(ruleId);
    if (!entity) throw new GovernanceRegistryError('GR-001', `Rule not found: ${ruleId}`);
    return entity;
  }
}
""",
    "src/index.ts": """// ORG-RG-GOVERNANCE_REGISTRY-v0.1.0 — Public API

export { GovernanceOrchestrator } from './governance-orchestrator';
export { RuleEntity } from './rule-entity';
export { AmendmentProcessor } from './amendment-processor';
export { isValidTransition, getTerminalStates, getInitialState, RULE_TRANSITIONS } from './state-machine';
export type { IGovernanceStoragePort } from './storage-interface';
export type { IGovernanceEventPort } from './event-interface';
export { createGovernanceEvent } from './event-interface';
export type { IGovernanceObservabilityPort } from './observability-interface';
export { createMetric, createLog } from './observability-interface';
export * from './types';
""",
}

for name, content in files.items():
    path = os.path.join(BASE, name)
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, 'w') as f:
        f.write(content)
    print(f"Written: {name}")
print(f"\nTotal files: {len(files)}")
