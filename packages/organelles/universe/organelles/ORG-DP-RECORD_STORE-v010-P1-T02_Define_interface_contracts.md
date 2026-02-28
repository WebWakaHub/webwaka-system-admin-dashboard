# [ORG-DP-RECORD_STORE-v0.1.0-P1-T02] Define Interface Contracts

**Issue:** #66
**Phase:** 1 — Design
**Agent:** webwakaagent3 (Architecture & System Design)
**Execution Date:** 2026-02-26

---

## 1. Primary Interface: IRecordStore

```typescript
interface IRecordStore {
  // Record Operations
  createRecord(request: CreateRecordRequest): Promise<Result<RecordEntry, RecordStoreError>>;
  getRecord(request: GetRecordRequest): Promise<Result<RecordEntry, RecordStoreError>>;
  updateRecord(request: UpdateRecordRequest): Promise<Result<RecordEntry, RecordStoreError>>;
  deleteRecord(request: DeleteRecordRequest): Promise<Result<RecordEntry, RecordStoreError>>;
  restoreRecord(request: RestoreRecordRequest): Promise<Result<RecordEntry, RecordStoreError>>;
  listRecords(request: ListRecordsRequest): Promise<Result<RecordPage, RecordStoreError>>;

  // Collection Operations
  createCollection(request: CreateCollectionRequest): Promise<Result<CollectionInfo, RecordStoreError>>;
  getCollection(name: string): Promise<Result<CollectionInfo, RecordStoreError>>;
  listCollections(): Promise<Result<CollectionInfo[], RecordStoreError>>;
  archiveCollection(name: string, ctx: RequestingContext): Promise<Result<CollectionInfo, RecordStoreError>>;
}
```

## 2. Storage Port: IRecordStorageAdapter

```typescript
interface IRecordStorageAdapter {
  // Record persistence
  insertRecord(collection: string, record: RecordEntry): Promise<void>;
  findRecord(collection: string, record_id: string): Promise<RecordEntry | null>;
  updateRecord(collection: string, record: RecordEntry, expected_version: number): Promise<void>;
  deleteRecord(collection: string, record_id: string): Promise<void>;
  listRecords(collection: string, cursor: string | null, limit: number): Promise<{ records: RecordEntry[]; next_cursor: string | null }>;

  // Collection persistence
  insertCollection(info: CollectionInfo): Promise<void>;
  findCollection(name: string): Promise<CollectionInfo | null>;
  listCollections(): Promise<CollectionInfo[]>;
  updateCollection(info: CollectionInfo): Promise<void>;
}
```

## 3. Event Port: IRecordEventEmitter

```typescript
interface IRecordEventEmitter {
  emit(event: RecordLifecycleEvent): Promise<void>;
}

type RecordLifecycleEvent =
  | RecordCreatedEvent
  | RecordUpdatedEvent
  | RecordDeletedEvent
  | RecordRestoredEvent
  | RecordPurgedEvent
  | CollectionCreatedEvent;
```

## 4. Observability Port: IRecordObservability

```typescript
interface IRecordObservability {
  recordOperationStarted(operation: string, collection: string): void;
  recordOperationCompleted(operation: string, collection: string, duration_ms: number): void;
  recordOperationFailed(operation: string, collection: string, error: RecordStoreError): void;
  recordSchemaValidationResult(collection: string, passed: boolean): void;
  recordVersionConflict(collection: string, record_id: string, expected: number, actual: number): void;
}
```

## 5. Schema Validator Port: IRecordSchemaValidator

```typescript
interface IRecordSchemaValidator {
  validate(data: Record<string, unknown>, schema: RecordSchema): Result<void, SchemaValidationError>;
}
```

## 6. Constructor Contract

```typescript
class RecordStore implements IRecordStore {
  constructor(
    storage: IRecordStorageAdapter,
    events: IRecordEventEmitter,
    observability: IRecordObservability,
    schemaValidator: IRecordSchemaValidator
  );
}
```

All dependencies are injected via constructor. No service locator, no global state, no ambient imports.

## 7. Result Type

```typescript
type Result<T, E> =
  | { success: true; value: T }
  | { success: false; error: E };
```

## 8. Contract Rules

| Rule | Description |
|------|-------------|
| CR-01 | All methods return `Promise<Result<T, E>>` — no thrown exceptions |
| CR-02 | All mutation methods require `RequestingContext` for audit |
| CR-03 | All mutation methods emit events via `IRecordEventEmitter` after success |
| CR-04 | All methods instrument via `IRecordObservability` |
| CR-05 | Storage adapter throws on version conflict; RecordStore catches and returns error |
| CR-06 | Schema validation runs before storage write |

**Unblocks:** #67

---

*Executed by webwakaagent3 under the WebWaka Autonomous Platform Construction System.*
