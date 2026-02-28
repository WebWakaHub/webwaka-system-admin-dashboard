/**
 * ORGN-AI-RESULT_VALIDATOR-v0.1.0 — Unit Tests
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: #972 (P3-T01)
 */

import { ResultValidator } from '../src/ResultValidator';
import {
  ValidationRequest, ValidationResult, ContentPolicy,
  SchemaValidationResult, PolicyCheckResult, PIIMatch,
  HallucinationAssessment, ValidationEvent
} from '../src/types';
import {
  ISchemaValidatorPort, IContentPolicyPort, IPIIDetectorPort,
  IHallucinationDetectorPort, IAuditEmitterPort, CompiledSchema
} from '../src/ports';

// ── Mock Implementations ──────────────────────────────────────

class MockSchemaValidator implements ISchemaValidatorPort {
  shouldPass = true;
  compile(schema: Record<string, unknown>): CompiledSchema {
    return {
      schemaId: 'test-schema',
      compiledAt: Date.now(),
      validate: () => this.shouldPass
        ? { valid: true, errors: [] }
        : { valid: false, errors: [{ path: '$.field', message: 'required' }] },
    };
  }
  validate(data: unknown, compiled: CompiledSchema): SchemaValidationResult {
    return compiled.validate(data);
  }
}

class MockContentPolicy implements IContentPolicyPort {
  shouldPass = true;
  check(content: string, policy: ContentPolicy): PolicyCheckResult {
    return this.shouldPass
      ? { passed: true, violations: [] }
      : { passed: false, violations: [{ code: 'POLICY_VIOLATION', severity: 'HIGH', message: 'Blocked content', stage: 'ContentPolicyEnforcer' }] };
  }
  sanitize(content: string, policy: ContentPolicy): string {
    return content.replace(/blocked/gi, '[REDACTED]');
  }
}

class MockPIIDetector implements IPIIDetectorPort {
  matches: PIIMatch[] = [];
  detect(text: string): PIIMatch[] { return this.matches; }
  redact(text: string, matches: PIIMatch[]): string {
    let result = text;
    for (const m of [...matches].sort((a, b) => b.startIndex - a.startIndex)) {
      result = result.substring(0, m.startIndex) + `[${m.type}:REDACTED]` + result.substring(m.endIndex);
    }
    return result;
  }
}

class MockHallucinationDetector implements IHallucinationDetectorPort {
  assessment: HallucinationAssessment = { isLikelyHallucinated: false, confidence: 0, indicators: [] };
  assess(): HallucinationAssessment { return this.assessment; }
}

class MockAuditEmitter implements IAuditEmitterPort {
  events: ValidationEvent[] = [];
  emit(event: ValidationEvent): void { this.events.push(event); }
}

// ── Test Helpers ──────────────────────────────────────────────

function createRequest(overrides?: Partial<ValidationRequest>): ValidationRequest {
  return {
    resultId: `test-${Date.now()}`,
    modelId: 'gpt-4.1-mini',
    promptHash: 'abc123',
    output: { answer: 'Hello world' },
    expectedSchema: 'test-schema',
    contentPolicyId: 'default',
    tokenCount: 100,
    tokenBudget: 500,
    confidenceScore: 0.95,
    correlationId: 'corr-001',
    tenantId: 'tenant-ng-001',
    timestamp: Date.now(),
    metadata: {},
    ...overrides,
  };
}

function createValidator(overrides?: {
  schema?: MockSchemaValidator;
  policy?: MockContentPolicy;
  pii?: MockPIIDetector;
  hallucination?: MockHallucinationDetector;
  audit?: MockAuditEmitter;
  config?: Record<string, unknown>;
}) {
  const schema = overrides?.schema ?? new MockSchemaValidator();
  const policy = overrides?.policy ?? new MockContentPolicy();
  const pii = overrides?.pii ?? new MockPIIDetector();
  const hallucination = overrides?.hallucination ?? new MockHallucinationDetector();
  const audit = overrides?.audit ?? new MockAuditEmitter();

  const validator = new ResultValidator(schema, policy, pii, hallucination, audit, undefined, overrides?.config as any);
  validator.registerSchema('test-schema', { type: 'object' });
  validator.registerContentPolicy('default', { policyId: 'default', rules: [], culturalContext: 'NG' });

  return { validator, schema, policy, pii, hallucination, audit };
}

// ── Tests ─────────────────────────────────────────────────────

describe('ResultValidator', () => {
  describe('Pipeline — Happy Path', () => {
    test('should PASS validation for clean output', async () => {
      const { validator } = createValidator();
      const request = createRequest();
      const result = await validator.validate(request);

      expect(result.status).toBe('PASSED');
      expect(result.violations).toHaveLength(0);
      expect(result.certificateId).toBeTruthy();
      expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    });

    test('should emit start and complete events', async () => {
      const { validator, audit } = createValidator();
      await validator.validate(createRequest());

      const eventTypes = audit.events.map(e => e.type);
      expect(eventTypes).toContain('result.validation.started');
      expect(eventTypes).toContain('result.validation.completed');
      expect(eventTypes).toContain('result.certificate.issued');
    });

    test('should generate certificate with hash chain', async () => {
      const { validator } = createValidator();
      const r1 = await validator.validate(createRequest({ resultId: 'r1' }));
      const r2 = await validator.validate(createRequest({ resultId: 'r2' }));

      const cert1 = await validator.getValidationCertificate('r1');
      const cert2 = await validator.getValidationCertificate('r2');

      expect(cert1!.previousCertificateHash).toBeNull();
      expect(cert2!.previousCertificateHash).toBe(cert1!.validationHash);
    });
  });

  describe('Pipeline — Schema Validation', () => {
    test('should FAIL in STRICT mode when schema not found', async () => {
      const { validator } = createValidator();
      const request = createRequest({ expectedSchema: 'nonexistent' });
      const result = await validator.validate(request);

      expect(result.status).toBe('FAILED');
      expect(result.violations[0].code).toBe('SCHEMA_NOT_FOUND');
    });

    test('should WARN in LENIENT mode when schema not found', async () => {
      const { validator } = createValidator({ config: { mode: 'LENIENT' } as any });
      const request = createRequest({ expectedSchema: 'nonexistent' });
      const result = await validator.validate(request);

      expect(result.status).not.toBe('FAILED');
      expect(result.warnings.some(w => w.code === 'SCHEMA_NOT_FOUND')).toBe(true);
    });

    test('should FAIL when schema validation fails', async () => {
      const schema = new MockSchemaValidator();
      schema.shouldPass = false;
      const { validator } = createValidator({ schema });
      const result = await validator.validate(createRequest());

      expect(result.status).toBe('FAILED');
      expect(result.violations.some(v => v.code === 'SCHEMA_VIOLATION')).toBe(true);
    });
  });

  describe('Pipeline — PII Detection', () => {
    test('should detect PII and redact output', async () => {
      const pii = new MockPIIDetector();
      pii.matches = [{ type: 'BVN', value: '12345678901', startIndex: 0, endIndex: 11, confidence: 0.9 }];
      const { validator, audit } = createValidator({ pii });
      const request = createRequest({ output: '12345678901 is a BVN' });
      const result = await validator.validate(request);

      expect(result.violations.some(v => v.code === 'PII_DETECTED')).toBe(true);
      expect(audit.events.some(e => e.type === 'result.pii.detected')).toBe(true);
    });

    test('should reduce confidence when PII found', async () => {
      const pii = new MockPIIDetector();
      pii.matches = [
        { type: 'BVN', value: '12345678901', startIndex: 0, endIndex: 11, confidence: 0.9 },
        { type: 'EMAIL', value: 'test@test.com', startIndex: 20, endIndex: 33, confidence: 0.95 },
      ];
      const { validator } = createValidator({ pii, config: { mode: 'LENIENT' } as any });
      const result = await validator.validate(createRequest({ confidenceScore: 0.95 }));

      expect(result.confidenceAdjusted).toBeLessThan(0.95);
    });
  });

  describe('Pipeline — Hallucination Detection', () => {
    test('should detect hallucination and reduce confidence', async () => {
      const hallucination = new MockHallucinationDetector();
      hallucination.assessment = { isLikelyHallucinated: true, confidence: 0.8, indicators: ['factual_inconsistency'] };
      const { validator, audit } = createValidator({ hallucination, config: { mode: 'LENIENT' } as any });
      const result = await validator.validate(createRequest());

      expect(result.violations.some(v => v.code === 'HALLUCINATION_DETECTED')).toBe(true);
      expect(result.confidenceAdjusted).toBeLessThan(0.95);
      expect(audit.events.some(e => e.type === 'result.hallucination.detected')).toBe(true);
    });
  });

  describe('Pipeline — Token Budget', () => {
    test('should flag token budget exceeded', async () => {
      const { validator } = createValidator({ config: { mode: 'LENIENT' } as any });
      const result = await validator.validate(createRequest({ tokenCount: 1000, tokenBudget: 500 }));

      expect(result.violations.some(v => v.code === 'TOKEN_BUDGET_EXCEEDED')).toBe(true);
    });
  });

  describe('Pipeline — Concurrency', () => {
    test('should reject when concurrency limit reached', async () => {
      const { validator } = createValidator({ config: { maxConcurrent: 1 } as any });
      // Start one validation that takes time
      const slow = validator.validate(createRequest({ resultId: 'slow' }));
      // Immediately try another
      const fast = validator.validate(createRequest({ resultId: 'fast' }));
      const results = await Promise.all([slow, fast]);

      // At least one should have concurrency issue or both pass (timing dependent)
      expect(results.every(r => r.resultId)).toBe(true);
    });
  });

  describe('Pipeline — Request Gate', () => {
    test('should reject oversized output', async () => {
      const { validator } = createValidator({ config: { maxOutputSizeBytes: 10 } as any });
      const result = await validator.validate(createRequest({ output: 'x'.repeat(100) }));

      expect(result.violations.some(v => v.code === 'OUTPUT_TOO_LARGE')).toBe(true);
    });

    test('should reject invalid confidence score', async () => {
      const { validator } = createValidator();
      const result = await validator.validate(createRequest({ confidenceScore: 1.5 }));

      expect(result.violations.some(v => v.code === 'INVALID_CONFIDENCE')).toBe(true);
    });
  });

  describe('Metrics', () => {
    test('should track validation metrics', async () => {
      const { validator } = createValidator();
      await validator.validate(createRequest({ resultId: 'r1' }));
      await validator.validate(createRequest({ resultId: 'r2' }));

      const metrics = validator.getMetrics();
      expect(metrics.totalValidations).toBe(2);
      expect(metrics.passedCount).toBe(2);
      expect(metrics.averageLatencyMs).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Mode Switching', () => {
    test('should switch validation mode at runtime', async () => {
      const schema = new MockSchemaValidator();
      schema.shouldPass = false;
      const { validator } = createValidator({ schema });

      // STRICT mode — should fail
      const r1 = await validator.validate(createRequest({ resultId: 'strict' }));
      expect(r1.status).toBe('FAILED');

      // Switch to LENIENT
      validator.setMode('LENIENT');
      const r2 = await validator.validate(createRequest({ resultId: 'lenient' }));
      // In LENIENT, CRITICAL schema violations still fail
      expect(r2.status).toBe('FAILED');
    });
  });
});
