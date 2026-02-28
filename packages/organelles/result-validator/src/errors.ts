/**
 * ORGN-AI-RESULT_VALIDATOR-v0.1.0 — Error Types and Fallback Mechanisms
 * Agent: webwakaagent5 (Quality, Security & Reliability)
 * Issue: #969 (P2-T02)
 */

export class ResultValidatorError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly retryable: boolean = false,
    public readonly stage: string = 'Unknown',
  ) {
    super(message);
    this.name = 'ResultValidatorError';
  }
}

export class SchemaViolationError extends ResultValidatorError {
  constructor(path: string, message: string) {
    super('SCHEMA_VIOLATION', `Schema violation at ${path}: ${message}`, false, 'SchemaValidator');
    this.name = 'SchemaViolationError';
  }
}

export class HallucinationDetectedError extends ResultValidatorError {
  constructor(confidence: number, indicators: string[]) {
    super('HALLUCINATION_DETECTED', `Hallucination detected (confidence: ${confidence}): ${indicators.join(', ')}`, false, 'HallucinationChecker');
    this.name = 'HallucinationDetectedError';
  }
}

export class ContentPolicyViolationError extends ResultValidatorError {
  constructor(ruleId: string, message: string) {
    super('CONTENT_POLICY_VIOLATION', `Content policy violation (rule: ${ruleId}): ${message}`, false, 'ContentPolicyEnforcer');
    this.name = 'ContentPolicyViolationError';
  }
}

export class TokenBudgetExceededError extends ResultValidatorError {
  constructor(actual: number, budget: number) {
    super('TOKEN_BUDGET_EXCEEDED', `Token count ${actual} exceeds budget ${budget}`, false, 'TokenBudgetChecker');
    this.name = 'TokenBudgetExceededError';
  }
}

export class PIIDetectedError extends ResultValidatorError {
  constructor(piiTypes: string[]) {
    super('PII_DETECTED', `PII detected: ${piiTypes.join(', ')}`, false, 'PIIDetector');
    this.name = 'PIIDetectedError';
  }
}

export class ValidationTimeoutError extends ResultValidatorError {
  constructor(timeoutMs: number) {
    super('VALIDATION_TIMEOUT', `Validation exceeded ${timeoutMs}ms timeout`, true, 'Pipeline');
    this.name = 'ValidationTimeoutError';
  }
}

export class CertificateGenerationError extends ResultValidatorError {
  constructor(reason: string) {
    super('CERTIFICATE_GENERATION_FAILED', `Certificate generation failed: ${reason}`, true, 'CertificateGenerator');
    this.name = 'CertificateGenerationError';
  }
}

export class ConcurrencyLimitError extends ResultValidatorError {
  constructor(limit: number) {
    super('CONCURRENCY_LIMIT', `Concurrent validation limit (${limit}) reached`, true, 'RequestGate');
    this.name = 'ConcurrencyLimitError';
  }
}
