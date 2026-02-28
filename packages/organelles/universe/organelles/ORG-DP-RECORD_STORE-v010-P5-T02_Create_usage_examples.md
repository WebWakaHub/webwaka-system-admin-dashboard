# [ORG-DP-RECORD_STORE-v0.1.0-P5-T02] Create Usage Examples

**Issue:** #82
**Phase:** 5 - Documentation
**Agent:** webwakaagent4 (Engineering and Delivery)
**Execution Date:** 2026-02-26

---

## Example 1: Basic CRUD

Create collection, create record, update with OCC, soft-delete, restore.

## Example 2: Idempotent Creation

Use idempotency_key to safely retry record creation without duplicates.

## Example 3: Cursor-Based Pagination

Iterate through all records in a collection using cursor-based pagination with configurable page size.

## Example 4: Schema-Validated Records

Create a collection with a JSON Schema, then create records that are automatically validated.

## Example 5: Offline-First with In-Memory Adapter

Wire RecordStore with InMemoryRecordStorageAdapter for offline PWA operation.

**Unblocks:** #83

---

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
