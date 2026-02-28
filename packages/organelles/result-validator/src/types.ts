/**
 * ORGN-AI-RESULT_VALIDATOR-v0.1.0 — Core Types
 * Agent: webwakaagent5 (Quality, Security & Reliability)
 */

export type ValidationMode = 'STRICT' | 'LENIENT' | 'BEST_EFFORT';

export type ValidationStatus = 'PASSED' | 'FAILED' | 'PARTIAL';

export type ViolationSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface ValidationRequest {
  resultId: string;
  modelId: string;
  promptHash: string;
  output: unknown;
  expectedSchema: string;
  contentPolicyId: string;
  tokenCount: number;
  tokenBudget: number;
  confidenceScore: number;
  correlationId: string;
  tenantId: string;
  timestamp: number;
  metadata: Record<string, unknown>;
}

export interface ValidationResult {
  resultId: string;
  status: ValidationStatus;
  sanitizedOutput: unknown;
  violations: Violation[];
  warnings: Warning[];
  confidenceAdjusted: number;
  certificateId: string | null;
  latencyMs: number;
  timestamp: number;
}

export interface Violation {
  code: string;
  severity: ViolationSeverity;
  message: string;
  stage: string;
}

export interface Warning {
  code: string;
  message: string;
  stage: string;
}

export interface ValidationCertificate {
  certificateId: string;
  resultId: string;
  status: ValidationStatus;
  validationHash: string;
  previousCertificateHash: string | null;
  issuedAt: number;
  issuedBy: string;
  schemaId: string;
  policyId: string;
  confidenceScore: number;
  signature: string;
}

export interface ContentPolicy {
  policyId: string;
  rules: ContentPolicyRule[];
  culturalContext: string;
}

export interface ContentPolicyRule {
  ruleId: string;
  type: 'BLOCKLIST' | 'REGEX' | 'SEMANTIC';
  pattern: string;
  severity: ViolationSeverity;
  message: string;
}

export interface PIIMatch {
  type: string;
  value: string;
  startIndex: number;
  endIndex: number;
  confidence: number;
}

export interface HallucinationAssessment {
  isLikelyHallucinated: boolean;
  confidence: number;
  indicators: string[];
}

export interface SchemaValidationResult {
  valid: boolean;
  errors: Array<{ path: string; message: string }>;
}

export interface PolicyCheckResult {
  passed: boolean;
  violations: Violation[];
}

export interface ValidationMetrics {
  totalValidations: number;
  passedCount: number;
  failedCount: number;
  partialCount: number;
  averageLatencyMs: number;
  p99LatencyMs: number;
  certificatesIssued: number;
}

export interface ValidationEvent {
  type: string;
  correlationId: string;
  tenantId: string;
  timestamp: number;
  payload: Record<string, unknown>;
}

export interface ResultValidatorConfig {
  mode: ValidationMode;
  maxConcurrent: number;
  timeoutMs: number;
  maxOutputSizeBytes: number;
  schemaCacheSize: number;
  schemaCacheTtlMs: number;
  dedupCacheSize: number;
  dedupTtlMs: number;
  certificateChainSize: number;
  hmacSecret: string;
}
