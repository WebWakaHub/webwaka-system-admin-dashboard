# [ORGN-AI-RESULT_VALIDATOR-v0.1.0-P0-T02] Document Result Validator Interface Contracts and Invariants

**Agent:** webwakaagent3 (Architecture & System Design)
**Issue:** #961
**Phase:** P0 — Specification
**Task:** T02

## 1. Primary Port Interface

### `IResultValidatorPort`

```typescript
interface IResultValidatorPort {
  validate(request: ValidationRequest): Promise<ValidationResult>;
  validateBatch(requests: ValidationRequest[]): Promise<ValidationResult[]>;
  getValidationCertificate(resultId: string): Promise<ValidationCertificate | null>;
  registerSchema(schemaId: string, schema: JSONSchema): void;
  registerContentPolicy(policyId: string, policy: ContentPolicy): void;
  setMode(mode: ValidationMode): void;
  getMetrics(): ValidationMetrics;
}
```

### `ValidationRequest`

```typescript
interface ValidationRequest {
  resultId: string;
  modelId: string;
  promptHash: string;
  output: unknown;
  expectedSchema: string;       // Schema ID reference
  contentPolicyId: string;      // Content policy ID reference
  tokenCount: number;
  tokenBudget: number;
  confidenceScore: number;      // 0.0–1.0 from model
  correlationId: string;
  tenantId: string;
  timestamp: number;
  metadata: Record<string, unknown>;
}
```

### `ValidationResult`

```typescript
interface ValidationResult {
  resultId: string;
  status: 'PASSED' | 'FAILED' | 'PARTIAL';
  sanitizedOutput: unknown;     // Cleaned output (PII removed, etc.)
  violations: Violation[];
  warnings: Warning[];
  confidenceAdjusted: number;   // Adjusted confidence after validation
  certificateId: string | null; // Set after certification
  latencyMs: number;
  timestamp: number;
}
```

### `ValidationCertificate`

```typescript
interface ValidationCertificate {
  certificateId: string;
  resultId: string;
  status: 'PASSED' | 'PARTIAL';
  validationHash: string;       // SHA-256 of validation inputs
  previousCertificateHash: string | null; // Hash chain
  issuedAt: number;
  issuedBy: string;             // Agent identity
  schemaId: string;
  policyId: string;
  confidenceScore: number;
  signature: string;            // HMAC signature
}
```

## 2. Secondary Port Interfaces

### `ISchemaValidatorPort`

```typescript
interface ISchemaValidatorPort {
  compile(schema: JSONSchema): CompiledSchema;
  validate(data: unknown, compiled: CompiledSchema): SchemaValidationResult;
}
```

### `IContentPolicyPort`

```typescript
interface IContentPolicyPort {
  check(content: string, policy: ContentPolicy): PolicyCheckResult;
  sanitize(content: string, policy: ContentPolicy): string;
}
```

### `IPIIDetectorPort`

```typescript
interface IPIIDetectorPort {
  detect(text: string): PIIMatch[];
  redact(text: string, matches: PIIMatch[]): string;
}
```

### `IHallucinationDetectorPort`

```typescript
interface IHallucinationDetectorPort {
  assess(output: string, context: HallucinationContext): HallucinationAssessment;
}
```

## 3. Event Contracts

### Emitted Events (to Audit Emitter)

| Event | Trigger | Payload |
|:---|:---|:---|
| `result.validation.started` | Validation begins | `{ resultId, modelId, correlationId }` |
| `result.validation.completed` | Validation ends | `{ resultId, status, violations, latencyMs }` |
| `result.validation.failed` | Critical violation | `{ resultId, violations, modelId }` |
| `result.certificate.issued` | Certificate generated | `{ certificateId, resultId, hash }` |
| `result.pii.detected` | PII found in output | `{ resultId, piiTypes, redacted }` |
| `result.hallucination.detected` | Hallucination flagged | `{ resultId, confidence, assessment }` |

## 4. Invariants

1. **Determinism**: `validate(req)` MUST return identical `ValidationResult` for identical `ValidationRequest` inputs
2. **Completeness**: Every `ValidationRequest` MUST produce exactly one `ValidationResult`
3. **Ordering**: Violations MUST be ordered by severity (CRITICAL → HIGH → MEDIUM → LOW)
4. **Bounded Time**: Validation MUST complete within 500ms or emit `ValidationTimeoutError`
5. **Certificate Chain**: Each certificate's `previousCertificateHash` MUST reference the last issued certificate (or null for first)
6. **Sanitization Idempotency**: `sanitize(sanitize(x)) === sanitize(x)` for all inputs
7. **Confidence Range**: `confidenceAdjusted` MUST be in `[0.0, 1.0]` and `≤ confidenceScore` (validation can only reduce confidence)
8. **Tenant Isolation**: Schemas, policies, and certificates are scoped per tenant
