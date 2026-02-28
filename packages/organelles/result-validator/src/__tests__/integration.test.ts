/**
 * ORGN-AI-RESULT_VALIDATOR-v0.1.0 — Integration Tests
 * Agent: webwakaagent4 (Engineering & Delivery)
 * Issue: #973 (P3-T02)
 */

import { ResultValidator } from '../src/ResultValidator';
import { PIIDetectorDefault } from '../src/PIIDetectorDefault';
import {
  ISchemaValidatorPort, IContentPolicyPort,
  IHallucinationDetectorPort, IAuditEmitterPort, CompiledSchema
} from '../src/ports';
import { ValidationRequest, ValidationEvent, ContentPolicy } from '../src/types';

// ── Real-ish Adapters ─────────────────────────────────────────

class SimpleSchemaValidator implements ISchemaValidatorPort {
  compile(schema: Record<string, unknown>): CompiledSchema {
    return {
      schemaId: schema['$id'] as string ?? 'default',
      compiledAt: Date.now(),
      validate: (data: unknown) => {
        if (schema.type === 'object' && typeof data !== 'object') {
          return { valid: false, errors: [{ path: '$', message: 'Expected object' }] };
        }
        if (schema.type === 'string' && typeof data !== 'string') {
          return { valid: false, errors: [{ path: '$', message: 'Expected string' }] };
        }
        return { valid: true, errors: [] };
      },
    };
  }
  validate(data: unknown, compiled: CompiledSchema) { return compiled.validate(data); }
}

class SimpleContentPolicy implements IContentPolicyPort {
  check(content: string, policy: ContentPolicy) {
    for (const rule of policy.rules) {
      if (rule.type === 'BLOCKLIST' && content.includes(rule.pattern)) {
        return { passed: false, violations: [{ code: 'CONTENT_BLOCKED', severity: rule.severity, message: rule.message, stage: 'ContentPolicyEnforcer' }] };
      }
    }
    return { passed: true, violations: [] };
  }
  sanitize(content: string, policy: ContentPolicy) {
    let result = content;
    for (const rule of policy.rules) {
      if (rule.type === 'BLOCKLIST') result = result.replace(new RegExp(rule.pattern, 'gi'), '[BLOCKED]');
    }
    return result;
  }
}

class SimpleHallucinationDetector implements IHallucinationDetectorPort {
  assess(output: string) {
    const suspicious = output.includes('definitely true') || output.includes('100% certain');
    return { isLikelyHallucinated: suspicious, confidence: suspicious ? 0.7 : 0, indicators: suspicious ? ['overconfident_language'] : [] };
  }
}

class CollectingAuditEmitter implements IAuditEmitterPort {
  events: ValidationEvent[] = [];
  emit(event: ValidationEvent) { this.events.push(event); }
}

// ── Integration Tests ─────────────────────────────────────────

describe('Result Validator Integration', () => {
  let validator: ResultValidator;
  let audit: CollectingAuditEmitter;

  beforeEach(() => {
    audit = new CollectingAuditEmitter();
    validator = new ResultValidator(
      new SimpleSchemaValidator(),
      new SimpleContentPolicy(),
      new PIIDetectorDefault(),
      new SimpleHallucinationDetector(),
      audit,
      undefined,
      { mode: 'LENIENT', hmacSecret: 'test-secret-key' },
    );
    validator.registerSchema('object-schema', { type: 'object', $id: 'object-schema' });
    validator.registerSchema('string-schema', { type: 'string', $id: 'string-schema' });
    validator.registerContentPolicy('ng-default', {
      policyId: 'ng-default',
      culturalContext: 'NG',
      rules: [
        { ruleId: 'no-hate', type: 'BLOCKLIST', pattern: 'hate speech', severity: 'CRITICAL', message: 'Hate speech detected' },
      ],
    });
  });

  test('end-to-end clean validation with certificate', async () => {
    const request: ValidationRequest = {
      resultId: 'int-001', modelId: 'gpt-4.1-mini', promptHash: 'hash1',
      output: { answer: 'Lagos is the largest city in Nigeria' },
      expectedSchema: 'object-schema', contentPolicyId: 'ng-default',
      tokenCount: 50, tokenBudget: 500, confidenceScore: 0.92,
      correlationId: 'corr-int-001', tenantId: 'tenant-ng-001',
      timestamp: Date.now(), metadata: {},
    };

    const result = await validator.validate(request);
    expect(result.status).toBe('PASSED');
    expect(result.certificateId).toBeTruthy();

    const cert = await validator.getValidationCertificate('int-001');
    expect(cert).toBeTruthy();
    expect(cert!.signature).toBeTruthy();
    expect(cert!.issuedBy).toBe('webwakaagent5');
  });

  test('end-to-end with Nigerian PII detection', async () => {
    const request: ValidationRequest = {
      resultId: 'int-002', modelId: 'gpt-4.1-mini', promptHash: 'hash2',
      output: 'Contact John at +2348012345678 or john@example.com',
      expectedSchema: 'string-schema', contentPolicyId: 'ng-default',
      tokenCount: 30, tokenBudget: 500, confidenceScore: 0.88,
      correlationId: 'corr-int-002', tenantId: 'tenant-ng-001',
      timestamp: Date.now(), metadata: {},
    };

    const result = await validator.validate(request);
    expect(result.violations.some(v => v.code === 'PII_DETECTED')).toBe(true);
    expect(audit.events.some(e => e.type === 'result.pii.detected')).toBe(true);
  });

  test('end-to-end with content policy violation', async () => {
    const request: ValidationRequest = {
      resultId: 'int-003', modelId: 'gpt-4.1-mini', promptHash: 'hash3',
      output: 'This contains hate speech which is blocked',
      expectedSchema: 'string-schema', contentPolicyId: 'ng-default',
      tokenCount: 20, tokenBudget: 500, confidenceScore: 0.9,
      correlationId: 'corr-int-003', tenantId: 'tenant-ng-001',
      timestamp: Date.now(), metadata: {},
    };

    const result = await validator.validate(request);
    expect(result.violations.some(v => v.code === 'CONTENT_BLOCKED')).toBe(true);
  });

  test('end-to-end with hallucination detection', async () => {
    const request: ValidationRequest = {
      resultId: 'int-004', modelId: 'gpt-4.1-mini', promptHash: 'hash4',
      output: 'This is definitely true and 100% certain',
      expectedSchema: 'string-schema', contentPolicyId: 'ng-default',
      tokenCount: 15, tokenBudget: 500, confidenceScore: 0.85,
      correlationId: 'corr-int-004', tenantId: 'tenant-ng-001',
      timestamp: Date.now(), metadata: {},
    };

    const result = await validator.validate(request);
    expect(result.violations.some(v => v.code === 'HALLUCINATION_DETECTED')).toBe(true);
    expect(result.confidenceAdjusted).toBeLessThan(0.85);
  });

  test('batch validation processes all requests', async () => {
    const requests = Array.from({ length: 5 }, (_, i) => ({
      resultId: `batch-${i}`, modelId: 'gpt-4.1-mini', promptHash: `hash-${i}`,
      output: { answer: `Response ${i}` },
      expectedSchema: 'object-schema', contentPolicyId: 'ng-default',
      tokenCount: 10, tokenBudget: 500, confidenceScore: 0.9,
      correlationId: `corr-batch-${i}`, tenantId: 'tenant-ng-001',
      timestamp: Date.now(), metadata: {},
    }));

    const results = await validator.validateBatch(requests);
    expect(results).toHaveLength(5);
    expect(results.every(r => r.status === 'PASSED')).toBe(true);
  });

  test('certificate chain integrity across multiple validations', async () => {
    const certs = [];
    for (let i = 0; i < 5; i++) {
      await validator.validate({
        resultId: `chain-${i}`, modelId: 'gpt-4.1-mini', promptHash: `hash-${i}`,
        output: { answer: `Response ${i}` },
        expectedSchema: 'object-schema', contentPolicyId: 'ng-default',
        tokenCount: 10, tokenBudget: 500, confidenceScore: 0.9,
        correlationId: `corr-chain-${i}`, tenantId: 'tenant-ng-001',
        timestamp: Date.now(), metadata: {},
      });
      const cert = await validator.getValidationCertificate(`chain-${i}`);
      certs.push(cert!);
    }

    // Verify chain links
    expect(certs[0].previousCertificateHash).toBeNull();
    for (let i = 1; i < certs.length; i++) {
      expect(certs[i].previousCertificateHash).toBe(certs[i - 1].validationHash);
    }
  });

  test('audit trail completeness', async () => {
    await validator.validate({
      resultId: 'audit-001', modelId: 'gpt-4.1-mini', promptHash: 'hash1',
      output: { answer: 'Clean output' },
      expectedSchema: 'object-schema', contentPolicyId: 'ng-default',
      tokenCount: 10, tokenBudget: 500, confidenceScore: 0.9,
      correlationId: 'corr-audit-001', tenantId: 'tenant-ng-001',
      timestamp: Date.now(), metadata: {},
    });

    const eventTypes = audit.events.map(e => e.type);
    expect(eventTypes).toContain('result.validation.started');
    expect(eventTypes).toContain('result.validation.completed');
    expect(eventTypes).toContain('result.certificate.issued');

    // All events should have correct tenant and correlation
    for (const event of audit.events) {
      expect(event.tenantId).toBe('tenant-ng-001');
      expect(event.correlationId).toBe('corr-audit-001');
      expect(event.timestamp).toBeGreaterThan(0);
    }
  });
});
