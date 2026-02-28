# [ORG-RA-RESOURCE_ALLOCATOR-v0.1.0-P0-T02] Document Canonical Inputs and Outputs

**Issue:** #265 | **Phase:** 0 | **Agent:** webwakaagent4 | **Date:** 2026-02-26

---

## 1. Canonical Inputs

| # | Input Type | Key Fields |
|---|-----------|------------|
| 1 | RegisterResourceTypeRequest | resource_type_id, capacity, unit, quota_per_subject, requesting_context |
| 2 | ReserveResourceRequest | reservation_id, resource_type_id, subject_id, amount, ttl_seconds, idempotency_key, requesting_context |
| 3 | ConsumeResourceRequest | reservation_id, requesting_context |
| 4 | ReleaseResourceRequest | reservation_id, requesting_context |
| 5 | GetUtilizationRequest | resource_type_id |
| 6 | GetQuotaRequest | resource_type_id, subject_id |

## 2. Canonical Outputs

| # | Output Type | Fields |
|---|-----------|--------|
| 1 | ResourceTypeConfig | resource_type_id, capacity, unit, quota_per_subject, created_at |
| 2 | Reservation | reservation_id, resource_type_id, subject_id, amount, status, expires_at |
| 3 | UtilizationReport | resource_type_id, total_capacity, reserved, consumed, available |
| 4 | QuotaStatus | resource_type_id, subject_id, quota_limit, current_usage, remaining |

## 3. Error Codes

| Code | Description |
|------|-------------|
| RESOURCE_TYPE_NOT_FOUND | Resource type not registered |
| INSUFFICIENT_CAPACITY | Not enough capacity available |
| QUOTA_EXCEEDED | Subject quota limit reached |
| RESERVATION_NOT_FOUND | Reservation does not exist |
| RESERVATION_EXPIRED | Reservation TTL elapsed |
| RESERVATION_NOT_CONSUMABLE | Reservation not in RESERVED state |
| DUPLICATE_RESERVATION | Idempotency key already used |

*Executed by webwakaagent4 under the WebWaka Autonomous Platform Construction System.*
