# [ORGN-AI-RESULT_VALIDATOR-v0.1.0-P1-T01] Design Result Validator Internal Architecture

**Agent:** webwakaagent3 (Architecture & System Design)
**Issue:** #964
**Phase:** P1 — Design
**Task:** T01

## 1. Architecture Overview

The Result Validator follows a pipeline architecture where each validation stage is an independent, composable unit. The pipeline is configured per-tenant and per-validation-mode.

```
ValidationRequest
  │
  ▼
┌──────────────────┐
│  RequestGate      │ ← Input validation, deduplication
└──────────────────┘
  │
  ▼
┌──────────────────┐
│  SchemaValidator   │ ← JSON Schema validation against declared types
└──────────────────┘
  │
  ▼
┌──────────────────┐
│  ContentPolicyEnf │ ← Content policy rules (profanity, cultural norms)
└──────────────────┘
  │
  ▼
┌──────────────────┐
│  PIIDetector       │ ← PII detection and redaction
└──────────────────┘
  │
  ▼
┌──────────────────┐
│  HallucinationChk │ ← Confidence-based hallucination assessment
└──────────────────┘
  │
  ▼
┌──────────────────┐
│  TokenBudgetChk   │ ← Token count enforcement
└──────────────────┘
  │
  ▼
┌──────────────────┐
│  ResultAggregator  │ ← Collect violations, compute final status
└──────────────────┘
  │
  ▼
┌──────────────────┐
│  CertificateGen   │ ← Generate hash-chained validation certificate
└──────────────────┘
  │
  ▼
ValidationResult + ValidationCertificate
```

## 2. Component Responsibilities

| Component | Responsibility | Input | Output |
|:---|:---|:---|:---|
| RequestGate | Validate request structure, check dedup cache | ValidationRequest | ValidatedRequest |
| SchemaValidator | Validate output against JSON Schema | output + schema | SchemaViolation[] |
| ContentPolicyEnforcer | Check content against policy rules | output text | PolicyViolation[] |
| PIIDetector | Detect and redact PII patterns | output text | PIIMatch[], sanitized text |
| HallucinationChecker | Assess hallucination probability | output + context | HallucinationAssessment |
| TokenBudgetChecker | Verify token count within budget | tokenCount + budget | TokenViolation? |
| ResultAggregator | Merge all violations, determine status | all violations | ValidationResult |
| CertificateGenerator | Create hash-chained certificate | ValidationResult | ValidationCertificate |

## 3. Internal State Management

### Schema Cache
- **Structure:** `Map<string, CompiledSchema>` bounded at 500 entries
- **Eviction:** LRU with 1-hour TTL
- **Thread safety:** Copy-on-read for compiled schemas

### Certificate Chain
- **Structure:** Ring buffer of last 1000 certificate hashes per tenant
- **Hash algorithm:** SHA-256
- **Chain integrity:** Each certificate references previous hash

### Deduplication Cache
- **Structure:** `Set<string>` of `resultId` hashes, bounded at 10,000
- **TTL:** 5 minutes (prevent duplicate validation of same result)

## 4. Concurrency Model

- **Pipeline stages** execute sequentially per request (no inter-stage parallelism)
- **Multiple requests** execute concurrently up to configurable limit (default: 100)
- **Schema compilation** is synchronized (compile once, use many)
- **Certificate generation** is serialized per tenant (hash chain ordering)

## 5. Error Handling Strategy

| Stage | Error | Recovery |
|:---|:---|:---|
| RequestGate | Invalid request | Reject immediately, emit error event |
| SchemaValidator | Schema not found | Use LENIENT mode, emit warning |
| ContentPolicyEnforcer | Policy not found | Skip stage, emit warning |
| PIIDetector | Detection timeout | Skip PII check, emit warning, reduce confidence |
| HallucinationChecker | Assessment failure | Skip check, emit warning, reduce confidence |
| TokenBudgetChecker | N/A (simple comparison) | N/A |
| ResultAggregator | N/A (pure computation) | N/A |
| CertificateGenerator | Hash failure | Retry once, then skip certificate |

## 6. Memory Budget

| Component | Max Memory | Notes |
|:---|:---|:---|
| Schema Cache | 50MB | 500 compiled schemas × ~100KB each |
| Certificate Chain | 32KB per tenant | 1000 × 32 bytes per hash |
| Dedup Cache | 320KB | 10,000 × 32 bytes per hash |
| Pipeline buffers | 10MB per request | Max output size |
| Total per instance | ~100MB | With 100 concurrent validations |
