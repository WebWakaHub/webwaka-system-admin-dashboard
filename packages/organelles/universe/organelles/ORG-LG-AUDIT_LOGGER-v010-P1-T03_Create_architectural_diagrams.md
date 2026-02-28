# ORG-LG-AUDIT_LOGGER-v0.1.0 — Architectural Diagrams

## Hexagonal Architecture
```
                    ┌─────────────────────────────────┐
                    │       Audit Logger Core          │
  ┌──────────┐      │                                 │      ┌──────────────┐
  │ Organelle │─────▶│  ┌─────────────┐  ┌──────────┐│─────▶│Audit Storage │
  │ Events    │      │  │  Schema     │  │ Hash     ││      │(Append-Only) │
  └──────────┘      │  │  Validator  │  │ Chain    ││      └──────────────┘
  ┌──────────┐      │  └─────────────┘  │ Engine   ││      ┌──────────────┐
  │ Query    │─────▶│  ┌─────────────┐  └──────────┘│─────▶│ Event Bus    │
  │ Requests │      │  │  Sequence   │               │      └──────────────┘
  └──────────┘      │  │  Generator  │  ┌──────────┐│      ┌──────────────┐
  ┌──────────┐      │  └─────────────┘  │ Integrity││─────▶│ Observability│
  │Management│─────▶│  ┌─────────────┐  │ Verifier ││      └──────────────┘
  │ Commands │      │  │  Retention  │  └──────────┘│      ┌──────────────┐
  └──────────┘      │  │  Manager   │               │─────▶│ Crypto Port  │
                    │  └─────────────┘               │      └──────────────┘
                    └─────────────────────────────────┘
```

## Hash Chain Structure
```
Entry N-1: { seq: N-1, hash: H(N-1), prev_hash: H(N-2), payload: ... }
     │
     ▼
Entry N:   { seq: N,   hash: H(N),   prev_hash: H(N-1), payload: ... }
     │
     ▼
Entry N+1: { seq: N+1, hash: H(N+1), prev_hash: H(N),   payload: ... }

Where H(N) = SHA-256(prev_hash || actor || action || resource || outcome || timestamp)
```
