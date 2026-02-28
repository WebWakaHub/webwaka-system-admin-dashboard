# ORG-LG-AUDIT_LOGGER-v0.1.0 — Invariants & Constraints

## Behavioral Invariants
| ID | Invariant | Enforcement |
|----|-----------|-------------|
| INV-B01 | Every audit entry MUST have a unique, monotonically increasing sequence number | SequenceGenerator with atomic increment |
| INV-B02 | Every entry's hash MUST chain to the previous entry's hash (hash(prev_hash + payload)) | HashChainValidator on every write |
| INV-B03 | Audit log MUST be append-only; no entry may be modified or deleted (only archived) | Write-only storage interface |
| INV-B04 | Every entry MUST include actor, action, resource, outcome, and timestamp | Schema validation on ingestion |
| INV-B05 | Hash chain verification MUST detect any tampering or gap | IntegrityVerifier with full chain walk |

## Structural Invariants
| ID | Invariant | Enforcement |
|----|-----------|-------------|
| INV-S01 | All entries MUST carry correlation_id for distributed tracing | Schema enforcement |
| INV-S02 | Actor identifiers MUST follow agent naming convention | Regex validation |
| INV-S03 | Action types MUST be from the registered action vocabulary | Enum validation |
| INV-S04 | Timestamps MUST be UTC ISO-8601 with millisecond precision | Format validation |

## Operational Constraints
| ID | Constraint | Limit |
|----|-----------|-------|
| CON-O01 | Maximum batch size | 500 events |
| CON-O02 | Default retention period | 365 days |
| CON-O03 | Maximum query result size | 10,000 entries |
| CON-O04 | Hash algorithm | SHA-256 |
| CON-O05 | Export formats | JSON-Lines, CSV |
