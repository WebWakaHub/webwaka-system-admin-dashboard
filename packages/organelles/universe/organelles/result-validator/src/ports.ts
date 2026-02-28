/**
 * ORGN-AI-RESULT_VALIDATOR-v0.1.0 — Port Interfaces
 * Agent: webwakaagent5 (Quality, Security & Reliability)
 */

import {
  ValidationRequest, ValidationResult, ValidationCertificate,
  ValidationMode, ValidationMetrics, ContentPolicy,
  SchemaValidationResult, PolicyCheckResult, PIIMatch,
  HallucinationAssessment, ValidationEvent
} from './types';

/** Primary port — inbound validation requests */
export interface IResultValidatorPort {
  validate(request: ValidationRequest): Promise<ValidationResult>;
  validateBatch(requests: ValidationRequest[]): Promise<ValidationResult[]>;
  getValidationCertificate(resultId: string): Promise<ValidationCertificate | null>;
  registerSchema(schemaId: string, schema: Record<string, unknown>): void;
  registerContentPolicy(policyId: string, policy: ContentPolicy): void;
  setMode(mode: ValidationMode): void;
  getMetrics(): ValidationMetrics;
}

/** Secondary port — JSON Schema validation */
export interface ISchemaValidatorPort {
  compile(schema: Record<string, unknown>): CompiledSchema;
  validate(data: unknown, compiled: CompiledSchema): SchemaValidationResult;
}

/** Compiled schema handle (opaque) */
export interface CompiledSchema {
  schemaId: string;
  compiledAt: number;
  validate: (data: unknown) => SchemaValidationResult;
}

/** Secondary port — content policy enforcement */
export interface IContentPolicyPort {
  check(content: string, policy: ContentPolicy): PolicyCheckResult;
  sanitize(content: string, policy: ContentPolicy): string;
}

/** Secondary port — PII detection */
export interface IPIIDetectorPort {
  detect(text: string): PIIMatch[];
  redact(text: string, matches: PIIMatch[]): string;
}

/** Secondary port — hallucination detection */
export interface IHallucinationDetectorPort {
  assess(output: string, promptHash: string, modelId: string): HallucinationAssessment;
}

/** Outbound port — audit event emission */
export interface IAuditEmitterPort {
  emit(event: ValidationEvent): void;
}

/** Outbound port — instrumentation (optional) */
export interface IInstrumentationPort {
  recordLatency(operation: string, durationMs: number): void;
  incrementCounter(metric: string, labels?: Record<string, string>): void;
  recordGauge(metric: string, value: number): void;
}
