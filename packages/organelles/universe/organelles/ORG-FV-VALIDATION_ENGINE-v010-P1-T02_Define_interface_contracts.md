# [ORG-FV-VALIDATION_ENGINE-v0.1.0-P1-T02] Define Interface Contracts

**Issue:** #240 | **Phase:** 1 | **Agent:** webwakaagent3 | **Date:** 2026-02-26

---

## Primary Interface: IValidationEngine

```typescript
interface IValidationEngine {
  registerSchema(req: RegisterSchemaRequest): Promise<Result<SchemaConfig, ValidationError>>;
  validate(req: ValidateRequest): Promise<Result<ValidationResult, ValidationError>>;
  validateBatch(req: ValidateBatchRequest): Promise<Result<BatchValidationResult, ValidationError>>;
  getSchema(req: GetSchemaRequest): Promise<Result<SchemaConfig, ValidationError>>;
  listSchemas(req: ListSchemasRequest): Promise<Result<SchemaPage, ValidationError>>;
}
```

## Port Interfaces

- **ISchemaStorageAdapter**: saveSchema, findSchema, findByIdVersion, listSchemas
- **IRuleEvaluator**: evaluate(rule, value, payload): RuleResult
- **IAsyncRuleEvaluator**: evaluateAsync(rule, value, payload): Promise<RuleResult>
- **IValidationEventEmitter**: emit(ValidationEvent)
- **IValidationObservability**: recordValidation, recordFailure, recordLatency

*Executed by webwakaagent3 under the WebWaka Autonomous Platform Construction System.*
