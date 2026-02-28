# ORG-IN-INSTRUMENTATION_PROBE-v0.1.0 — Dependency Map

> **Agent:** webwakaagent4 (Engineering & Delivery)
> **Issue:** webwaka-organelle-universe#493 (P6-T03)

## Upstream Dependencies

| Dependency | Type | Repository | Status |
|:---|:---|:---|:---|
| RUNTIME-ADAPTER-DATABASE-v0.1.0 | Runtime adapter | webwaka-runtime-universe | Completed |

## Downstream Consumers

This organelle is consumed by any component requiring observability. Expected consumers:

| Consumer | Layer | Integration Point |
|:---|:---|:---|
| All Cell archetypes | Cell | `IInstrumentationPort` injection |
| All Tissue archetypes | Tissue | Propagated via cell composition |
| All Organ archetypes | Organ | Propagated via tissue composition |
| Runtime adapters | Runtime | Direct port integration |

## Port Dependency Graph

```
ITenantContextPort ──────┐
IContextPropagatorPort ──┤
IHealthReporterPort ─────┤
                         ├──▶ InstrumentationProbe ──▶ IInstrumentationPort
ITelemetryEmitterPort ───┤
IOfflineBufferPort ──────┘
```

## Activation Sequence

1. Instantiate adapter implementations for all 5 inbound ports
2. Create `InstrumentationProbe` with adapters
3. Call `initialize(config)` to transition to ACTIVE state
4. Register metrics via `registerCounter/Histogram/Gauge`
5. Use `onOperationStart/End` hooks for automatic instrumentation
6. Call `shutdown()` for graceful termination

## Ratification Status

**RATIFIED** — This organelle is ready for integration into cell-level compositions.
