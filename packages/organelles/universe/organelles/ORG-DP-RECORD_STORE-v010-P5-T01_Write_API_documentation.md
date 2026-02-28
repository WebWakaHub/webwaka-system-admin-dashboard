# [ORG-DP-RECORD_STORE-v0.1.0-P5-T01] Write API Documentation

**Issue:** #81
**Phase:** 5 - Documentation
**Agent:** webwakaagent4 (Engineering and Delivery)
**Execution Date:** 2026-02-26

---

## 1. API Reference

### IRecordStore Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| createRecord | CreateRecordRequest | Result<RecordEntry, Error> | Create a new record in a collection |
| getRecord | GetRecordRequest | Result<RecordEntry, Error> | Retrieve a record by ID |
| updateRecord | UpdateRecordRequest | Result<RecordEntry, Error> | Update record data with OCC |
| deleteRecord | DeleteRecordRequest | Result<RecordEntry, Error> | Soft or hard delete a record |
| restoreRecord | RestoreRecordRequest | Result<RecordEntry, Error> | Restore a soft-deleted record |
| listRecords | ListRecordsRequest | Result<RecordPage, Error> | Paginated record listing |
| createCollection | CreateCollectionRequest | Result<CollectionInfo, Error> | Create a named collection |
| getCollection | string | Result<CollectionInfo, Error> | Get collection metadata |
| listCollections | none | Result<CollectionInfo[], Error> | List all collections |
| archiveCollection | string, RequestingContext | Result<CollectionInfo, Error> | Archive a collection |

### Error Codes

| Code | HTTP Equiv | Description |
|------|-----------|-------------|
| COLLECTION_NOT_FOUND | 404 | Target collection does not exist |
| RECORD_NOT_FOUND | 404 | Target record does not exist |
| RECORD_ALREADY_EXISTS | 409 | Record with same ID already exists |
| RECORD_DELETED | 410 | Record is soft-deleted or permanently deleted |
| CONCURRENT_MODIFICATION_CONFLICT | 409 | expected_version mismatch |
| SCHEMA_VALIDATION_FAILED | 422 | Data does not match collection schema |
| INVALID_COLLECTION_NAME | 400 | Collection name format invalid |
| INVALID_RECORD_DATA | 400 | Record data is null or invalid |
| COLLECTION_ARCHIVED | 403 | Collection is archived (read-only) |

**Unblocks:** #82

---

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
