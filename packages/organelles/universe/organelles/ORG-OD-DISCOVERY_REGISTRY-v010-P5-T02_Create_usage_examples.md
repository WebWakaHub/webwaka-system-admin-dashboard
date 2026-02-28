# ORG-OD-DISCOVERY_REGISTRY-v010-P5-T02: Create Usage Examples

**Acting under Canonical Role: Lead Software Engineer**
**Agent: webwakaagent4 — Engineering & Delivery**
**Phase: 5 (Documentation) | Task: T02**

---

## Example 1: Register a Service

```typescript
const registry = new DiscoveryRegistryOrchestrator(storage, events, observability);

const result = await registry.registerService({
  service_name: 'payment-processor',
  version: '1.2.0',
  capabilities: [{ capability_id: 'process-payment', capability_name: 'Process Payment', version: '1.0.0', scope: 'commerce' }],
  endpoint: { protocol: 'https', host: 'payments.webwaka.local', port: 443, path: '/api/v1' },
  ttl_seconds: 300,
  metadata: { region: 'ng-lagos' }
});
```

## Example 2: Discover Services by Capability

```typescript
const services = await registry.discoverServices({
  capability: 'process-payment',
  version_range: '>=1.0.0 <2.0.0',
  region: 'ng-lagos'
});
```

## Example 3: Heartbeat Renewal

```typescript
await registry.renewHeartbeat({ service_id: result.service_id });
```

## Example 4: Version Resolution

```typescript
const resolved = await registry.resolveVersion({
  service_name: 'payment-processor',
  version_range: '^1.0.0'
});
```

## Example 5: Offline Discovery

```typescript
// In offline mode, registry returns cached results
const cached = await registry.discoverServices({
  capability: 'process-payment',
  include_unhealthy: true  // Include stale cached entries
});
```
