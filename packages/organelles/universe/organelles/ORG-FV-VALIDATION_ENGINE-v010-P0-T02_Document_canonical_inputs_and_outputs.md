# [ORG-FV-VALIDATION_ENGINE-v0.1.0-P0-T02] Document Canonical Inputs and Outputs

**Issue:** #236 | **Phase:** 0 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## 1. Canonical Inputs

| # | Input Type | Key Fields |
|---|-----------|------------|
| 1 | RegisterSchemaRequest | schema_id, schema_version, rules[], requesting_context |
| 2 | ValidateRequest | schema_id, schema_version, payload, requesting_context |
| 3 | GetSchemaRequest | schema_id, schema_version |
| 4 | ListSchemasRequest | cursor, limit |
| 5 | ValidateBatchRequest | schema_id, payloads[], requesting_context |

## 2. Canonical Outputs

| # | Output Type | Fields |
|---|-----------|--------|
| 1 | SchemaConfig | schema_id, schema_version, rules[], created_at |
| 2 | ValidationResult | valid, errors[]{field, code, message}, warnings[] |
| 3 | BatchValidationResult | results[], valid_count, invalid_count |
| 4 | SchemaPage | schemas[], next_cursor |

## 3. Error Codes

| Code | Description |
|------|-------------|
| SCHEMA_NOT_FOUND | Schema not registered |
| SCHEMA_ALREADY_EXISTS | Schema ID+version already registered |
| INVALID_RULE_DEFINITION | Rule definition is malformed |
| VALIDATION_EXECUTION_ERROR | Runtime error during validation |
| PAYLOAD_TOO_LARGE | Payload exceeds size limit |

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
