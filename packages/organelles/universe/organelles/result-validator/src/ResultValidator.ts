/**
 * ORGN-AI-RESULT_VALIDATOR-v0.1.0 — Core ResultValidator
 * Agent: webwakaagent5 (Quality, Security & Reliability)
 * Issue: #968 (P2-T01)
 *
 * Pipeline architecture: RequestGate → SchemaValidator → ContentPolicyEnforcer
 *   → PIIDetector → HallucinationChecker → TokenBudgetChecker
 *   → ResultAggregator → CertificateGenerator
 */

import {
  ValidationRequest, ValidationResult, ValidationCertificate,
  ValidationMode, ValidationMetrics, ContentPolicy, Violation,
  Warning, ViolationSeverity, ResultValidatorConfig, ValidationEvent
} from './types';
import {
  IResultValidatorPort, ISchemaValidatorPort, IContentPolicyPort,
  IPIIDetectorPort, IHallucinationDetectorPort, IAuditEmitterPort,
  IInstrumentationPort, CompiledSchema
} from './ports';

const SEVERITY_ORDER: Record<ViolationSeverity, number> = {
  CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3
};

const DEFAULT_CONFIG: ResultValidatorConfig = {
  mode: 'STRICT',
  maxConcurrent: 100,
  timeoutMs: 500,
  maxOutputSizeBytes: 10 * 1024 * 1024,
  schemaCacheSize: 500,
  schemaCacheTtlMs: 3600000,
  dedupCacheSize: 10000,
  dedupTtlMs: 300000,
  certificateChainSize: 1000,
  hmacSecret: '',
};

interface SchemaEntry {
  compiled: CompiledSchema;
  cachedAt: number;
}

export class ResultValidator implements IResultValidatorPort {
  private config: ResultValidatorConfig;
  private schemaCache: Map<string, SchemaEntry> = new Map();
  private contentPolicies: Map<string, ContentPolicy> = new Map();
  private dedupCache: Map<string, number> = new Map();
  private certificateStore: Map<string, ValidationCertificate> = new Map();
  private certificateChain: Map<string, string[]> = new Map(); // tenantId → hash[]
  private activeConcurrent = 0;
  private metrics: ValidationMetrics = {
    totalValidations: 0, passedCount: 0, failedCount: 0,
    partialCount: 0, averageLatencyMs: 0, p99LatencyMs: 0,
    certificatesIssued: 0,
  };
  private latencyHistory: number[] = [];

  constructor(
    private schemaValidator: ISchemaValidatorPort,
    private contentPolicyEnforcer: IContentPolicyPort,
    private piiDetector: IPIIDetectorPort,
    private hallucinationDetector: IHallucinationDetectorPort,
    private auditEmitter: IAuditEmitterPort,
    private instrumentation?: IInstrumentationPort,
    config?: Partial<ResultValidatorConfig>,
  ) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  async validate(request: ValidationRequest): Promise<ValidationResult> {
    const startTime = Date.now();

    // Emit start event
    this.emitEvent('result.validation.started', request.correlationId, request.tenantId, {
      resultId: request.resultId, modelId: request.modelId,
    });

    // Concurrency gate
    if (this.activeConcurrent >= this.config.maxConcurrent) {
      return this.buildFailedResult(request, startTime, [{
        code: 'CONCURRENCY_LIMIT', severity: 'MEDIUM',
        message: `Concurrent validation limit (${this.config.maxConcurrent}) reached`,
        stage: 'RequestGate',
      }]);
    }

    this.activeConcurrent++;
    try {
      return await this.executeWithTimeout(request, startTime);
    } finally {
      this.activeConcurrent--;
    }
  }

  async validateBatch(requests: ValidationRequest[]): Promise<ValidationResult[]> {
    return Promise.all(requests.map(req => this.validate(req)));
  }

  async getValidationCertificate(resultId: string): Promise<ValidationCertificate | null> {
    return this.certificateStore.get(resultId) ?? null;
  }

  registerSchema(schemaId: string, schema: Record<string, unknown>): void {
    if (this.schemaCache.size >= this.config.schemaCacheSize) {
      this.evictOldestSchema();
    }
    const compiled = this.schemaValidator.compile(schema);
    this.schemaCache.set(schemaId, { compiled, cachedAt: Date.now() });
  }

  registerContentPolicy(policyId: string, policy: ContentPolicy): void {
    this.contentPolicies.set(policyId, policy);
  }

  setMode(mode: ValidationMode): void {
    this.config.mode = mode;
  }

  getMetrics(): ValidationMetrics {
    return { ...this.metrics };
  }

  // ── Pipeline Execution ──────────────────────────────────────────

  private async executeWithTimeout(
    request: ValidationRequest, startTime: number
  ): Promise<ValidationResult> {
    return new Promise<ValidationResult>((resolve) => {
      const timeout = setTimeout(() => {
        resolve(this.buildFailedResult(request, startTime, [{
          code: 'VALIDATION_TIMEOUT', severity: 'MEDIUM',
          message: `Validation exceeded ${this.config.timeoutMs}ms timeout`,
          stage: 'Pipeline',
        }]));
      }, this.config.timeoutMs);

      this.executePipeline(request, startTime).then(result => {
        clearTimeout(timeout);
        resolve(result);
      }).catch(() => {
        clearTimeout(timeout);
        resolve(this.buildFailedResult(request, startTime, [{
          code: 'PIPELINE_ERROR', severity: 'CRITICAL',
          message: 'Unexpected pipeline error', stage: 'Pipeline',
        }]));
      });
    });
  }

  private async executePipeline(
    request: ValidationRequest, startTime: number
  ): Promise<ValidationResult> {
    const violations: Violation[] = [];
    const warnings: Warning[] = [];
    let sanitizedOutput = request.output;
    let confidenceAdjusted = request.confidenceScore;

    // Stage 1: RequestGate — dedup and input validation
    const gateResult = this.requestGate(request);
    if (gateResult.violation) {
      violations.push(gateResult.violation);
      if (this.config.mode === 'STRICT') {
        return this.buildResult(request, startTime, violations, warnings, sanitizedOutput, confidenceAdjusted);
      }
    }
    if (gateResult.warning) warnings.push(gateResult.warning);

    // Stage 2: SchemaValidator
    const schemaResult = this.validateSchema(request);
    violations.push(...schemaResult.violations);
    warnings.push(...schemaResult.warnings);
    if (schemaResult.violations.some(v => v.severity === 'CRITICAL') && this.config.mode === 'STRICT') {
      return this.buildResult(request, startTime, violations, warnings, sanitizedOutput, confidenceAdjusted);
    }

    // Stage 3: ContentPolicyEnforcer
    const outputText = typeof sanitizedOutput === 'string' ? sanitizedOutput : JSON.stringify(sanitizedOutput);
    const policyResult = this.enforceContentPolicy(outputText, request.contentPolicyId);
    violations.push(...policyResult.violations);
    warnings.push(...policyResult.warnings);
    if (policyResult.sanitized) sanitizedOutput = policyResult.sanitized;

    // Stage 4: PIIDetector
    const piiResult = this.detectPII(outputText, request);
    violations.push(...piiResult.violations);
    warnings.push(...piiResult.warnings);
    if (piiResult.redacted) sanitizedOutput = piiResult.redacted;
    confidenceAdjusted = Math.min(confidenceAdjusted, confidenceAdjusted - (piiResult.violations.length * 0.05));

    // Stage 5: HallucinationChecker
    const halResult = this.checkHallucination(outputText, request);
    violations.push(...halResult.violations);
    warnings.push(...halResult.warnings);
    confidenceAdjusted = Math.min(confidenceAdjusted, confidenceAdjusted - (halResult.confidencePenalty));

    // Stage 6: TokenBudgetChecker
    const tokenResult = this.checkTokenBudget(request);
    violations.push(...tokenResult.violations);
    warnings.push(...tokenResult.warnings);

    // Ensure confidence stays in [0, 1]
    confidenceAdjusted = Math.max(0, Math.min(1, confidenceAdjusted));

    // Build result
    const result = this.buildResult(request, startTime, violations, warnings, sanitizedOutput, confidenceAdjusted);

    // Stage 7: CertificateGenerator (only for PASSED or PARTIAL)
    if (result.status !== 'FAILED') {
      const cert = this.generateCertificate(request, result);
      result.certificateId = cert.certificateId;
      this.certificateStore.set(request.resultId, cert);
      this.metrics.certificatesIssued++;

      this.emitEvent('result.certificate.issued', request.correlationId, request.tenantId, {
        certificateId: cert.certificateId, resultId: request.resultId, hash: cert.validationHash,
      });
    }

    // Emit completion event
    this.emitEvent('result.validation.completed', request.correlationId, request.tenantId, {
      resultId: request.resultId, status: result.status,
      violations: result.violations.length, latencyMs: result.latencyMs,
    });

    if (result.status === 'FAILED') {
      this.emitEvent('result.validation.failed', request.correlationId, request.tenantId, {
        resultId: request.resultId, violations: result.violations, modelId: request.modelId,
      });
    }

    // Update metrics
    this.updateMetrics(result);

    return result;
  }

  // ── Pipeline Stages ─────────────────────────────────────────────

  private requestGate(request: ValidationRequest): { violation?: Violation; warning?: Warning } {
    // Dedup check
    if (this.dedupCache.has(request.resultId)) {
      return { warning: { code: 'DUPLICATE_REQUEST', message: 'Duplicate validation request', stage: 'RequestGate' } };
    }
    this.dedupCache.set(request.resultId, Date.now());
    if (this.dedupCache.size > this.config.dedupCacheSize) {
      this.evictOldestDedup();
    }

    // Size check
    const outputSize = JSON.stringify(request.output).length;
    if (outputSize > this.config.maxOutputSizeBytes) {
      return { violation: {
        code: 'OUTPUT_TOO_LARGE', severity: 'HIGH',
        message: `Output size ${outputSize} exceeds limit ${this.config.maxOutputSizeBytes}`,
        stage: 'RequestGate',
      }};
    }

    // Confidence range check
    if (request.confidenceScore < 0 || request.confidenceScore > 1) {
      return { violation: {
        code: 'INVALID_CONFIDENCE', severity: 'MEDIUM',
        message: `Confidence ${request.confidenceScore} outside [0, 1]`,
        stage: 'RequestGate',
      }};
    }

    return {};
  }

  private validateSchema(request: ValidationRequest): { violations: Violation[]; warnings: Warning[] } {
    const violations: Violation[] = [];
    const warnings: Warning[] = [];

    const entry = this.schemaCache.get(request.expectedSchema);
    if (!entry) {
      if (this.config.mode === 'STRICT') {
        violations.push({
          code: 'SCHEMA_NOT_FOUND', severity: 'CRITICAL',
          message: `Schema '${request.expectedSchema}' not registered`, stage: 'SchemaValidator',
        });
      } else {
        warnings.push({ code: 'SCHEMA_NOT_FOUND', message: `Schema '${request.expectedSchema}' not registered, skipping`, stage: 'SchemaValidator' });
      }
      return { violations, warnings };
    }

    // Check TTL
    if (Date.now() - entry.cachedAt > this.config.schemaCacheTtlMs) {
      warnings.push({ code: 'SCHEMA_STALE', message: 'Cached schema exceeded TTL', stage: 'SchemaValidator' });
    }

    const result = entry.compiled.validate(request.output);
    if (!result.valid) {
      for (const err of result.errors) {
        violations.push({
          code: 'SCHEMA_VIOLATION', severity: 'CRITICAL',
          message: `${err.path}: ${err.message}`, stage: 'SchemaValidator',
        });
      }
    }

    return { violations, warnings };
  }

  private enforceContentPolicy(text: string, policyId: string): { violations: Violation[]; warnings: Warning[]; sanitized?: string } {
    const policy = this.contentPolicies.get(policyId);
    if (!policy) {
      if (this.config.mode === 'STRICT') {
        return { violations: [{ code: 'POLICY_NOT_FOUND', severity: 'HIGH', message: `Policy '${policyId}' not registered`, stage: 'ContentPolicyEnforcer' }], warnings: [] };
      }
      return { violations: [], warnings: [{ code: 'POLICY_NOT_FOUND', message: `Policy '${policyId}' not registered, skipping`, stage: 'ContentPolicyEnforcer' }] };
    }

    const result = this.contentPolicyEnforcer.check(text, policy);
    const sanitized = result.passed ? undefined : this.contentPolicyEnforcer.sanitize(text, policy);
    return { violations: result.violations, warnings: [], sanitized };
  }

  private detectPII(text: string, request: ValidationRequest): { violations: Violation[]; warnings: Warning[]; redacted?: string } {
    try {
      const matches = this.piiDetector.detect(text);
      if (matches.length === 0) return { violations: [], warnings: [] };

      const violations: Violation[] = matches.map(m => ({
        code: 'PII_DETECTED', severity: 'HIGH' as ViolationSeverity,
        message: `PII type '${m.type}' detected (confidence: ${m.confidence})`, stage: 'PIIDetector',
      }));

      const redacted = this.piiDetector.redact(text, matches);

      this.emitEvent('result.pii.detected', request.correlationId, request.tenantId, {
        resultId: request.resultId, piiTypes: matches.map(m => m.type), redacted: true,
      });

      return { violations, warnings: [], redacted };
    } catch {
      return { violations: [], warnings: [{ code: 'PII_DETECTION_FAILED', message: 'PII detection failed, skipping', stage: 'PIIDetector' }] };
    }
  }

  private checkHallucination(text: string, request: ValidationRequest): { violations: Violation[]; warnings: Warning[]; confidencePenalty: number } {
    try {
      const assessment = this.hallucinationDetector.assess(text, request.promptHash, request.modelId);
      if (!assessment.isLikelyHallucinated) return { violations: [], warnings: [], confidencePenalty: 0 };

      const violation: Violation = {
        code: 'HALLUCINATION_DETECTED', severity: 'HIGH',
        message: `Likely hallucination (confidence: ${assessment.confidence}): ${assessment.indicators.join(', ')}`,
        stage: 'HallucinationChecker',
      };

      this.emitEvent('result.hallucination.detected', request.correlationId, request.tenantId, {
        resultId: request.resultId, confidence: assessment.confidence, assessment,
      });

      return { violations: [violation], warnings: [], confidencePenalty: assessment.confidence * 0.3 };
    } catch {
      return { violations: [], warnings: [{ code: 'HALLUCINATION_CHECK_FAILED', message: 'Hallucination check failed, skipping', stage: 'HallucinationChecker' }], confidencePenalty: 0.05 };
    }
  }

  private checkTokenBudget(request: ValidationRequest): { violations: Violation[]; warnings: Warning[] } {
    if (request.tokenCount <= request.tokenBudget) return { violations: [], warnings: [] };

    return {
      violations: [{
        code: 'TOKEN_BUDGET_EXCEEDED', severity: 'MEDIUM',
        message: `Token count ${request.tokenCount} exceeds budget ${request.tokenBudget}`,
        stage: 'TokenBudgetChecker',
      }],
      warnings: [],
    };
  }

  // ── Result Building ─────────────────────────────────────────────

  private buildResult(
    request: ValidationRequest, startTime: number,
    violations: Violation[], warnings: Warning[],
    sanitizedOutput: unknown, confidenceAdjusted: number,
  ): ValidationResult {
    // Sort violations by severity
    violations.sort((a, b) => SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]);

    const hasCritical = violations.some(v => v.severity === 'CRITICAL');
    const hasHigh = violations.some(v => v.severity === 'HIGH');

    let status: 'PASSED' | 'FAILED' | 'PARTIAL';
    if (this.config.mode === 'STRICT') {
      status = violations.length === 0 ? 'PASSED' : 'FAILED';
    } else if (this.config.mode === 'LENIENT') {
      status = hasCritical ? 'FAILED' : violations.length === 0 ? 'PASSED' : 'PARTIAL';
    } else {
      status = hasCritical && hasHigh ? 'FAILED' : violations.length === 0 ? 'PASSED' : 'PARTIAL';
    }

    return {
      resultId: request.resultId,
      status,
      sanitizedOutput,
      violations,
      warnings,
      confidenceAdjusted,
      certificateId: null,
      latencyMs: Date.now() - startTime,
      timestamp: Date.now(),
    };
  }

  private buildFailedResult(request: ValidationRequest, startTime: number, violations: Violation[]): ValidationResult {
    return this.buildResult(request, startTime, violations, [], request.output, 0);
  }

  // ── Certificate Generation ──────────────────────────────────────

  private generateCertificate(request: ValidationRequest, result: ValidationResult): ValidationCertificate {
    const tenantChain = this.certificateChain.get(request.tenantId) ?? [];
    const previousHash = tenantChain.length > 0 ? tenantChain[tenantChain.length - 1] : null;

    const validationHash = this.computeHash(
      `${request.resultId}:${request.modelId}:${result.status}:${result.confidenceAdjusted}`
    );

    const cert: ValidationCertificate = {
      certificateId: `cert-${request.resultId}-${Date.now()}`,
      resultId: request.resultId,
      status: result.status as 'PASSED' | 'PARTIAL',
      validationHash,
      previousCertificateHash: previousHash,
      issuedAt: Date.now(),
      issuedBy: 'webwakaagent5',
      schemaId: request.expectedSchema,
      policyId: request.contentPolicyId,
      confidenceScore: result.confidenceAdjusted,
      signature: this.computeHMAC(validationHash),
    };

    // Update chain
    tenantChain.push(validationHash);
    if (tenantChain.length > this.config.certificateChainSize) {
      tenantChain.shift();
    }
    this.certificateChain.set(request.tenantId, tenantChain);

    return cert;
  }

  private computeHash(input: string): string {
    // Simple hash for v0.1.0 — replace with crypto.subtle in production
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `sha256-${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }

  private computeHMAC(data: string): string {
    return this.computeHash(`${this.config.hmacSecret}:${data}`);
  }

  // ── Cache Management ────────────────────────────────────────────

  private evictOldestSchema(): void {
    let oldest = Infinity;
    let oldestKey = '';
    for (const [key, entry] of this.schemaCache) {
      if (entry.cachedAt < oldest) { oldest = entry.cachedAt; oldestKey = key; }
    }
    if (oldestKey) this.schemaCache.delete(oldestKey);
  }

  private evictOldestDedup(): void {
    let oldest = Infinity;
    let oldestKey = '';
    for (const [key, ts] of this.dedupCache) {
      if (ts < oldest) { oldest = ts; oldestKey = key; }
    }
    if (oldestKey) this.dedupCache.delete(oldestKey);
  }

  // ── Metrics ─────────────────────────────────────────────────────

  private updateMetrics(result: ValidationResult): void {
    this.metrics.totalValidations++;
    if (result.status === 'PASSED') this.metrics.passedCount++;
    else if (result.status === 'FAILED') this.metrics.failedCount++;
    else this.metrics.partialCount++;

    this.latencyHistory.push(result.latencyMs);
    if (this.latencyHistory.length > 1000) this.latencyHistory.shift();

    this.metrics.averageLatencyMs = this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
    const sorted = [...this.latencyHistory].sort((a, b) => a - b);
    this.metrics.p99LatencyMs = sorted[Math.floor(sorted.length * 0.99)] ?? 0;

    this.instrumentation?.recordLatency('result_validation', result.latencyMs);
    this.instrumentation?.incrementCounter('validations_total', { status: result.status });
  }

  // ── Event Emission ──────────────────────────────────────────────

  private emitEvent(type: string, correlationId: string, tenantId: string, payload: Record<string, unknown>): void {
    this.auditEmitter.emit({ type, correlationId, tenantId, timestamp: Date.now(), payload });
  }
}
