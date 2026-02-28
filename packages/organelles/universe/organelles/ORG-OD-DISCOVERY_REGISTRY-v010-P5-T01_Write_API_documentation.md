# ORG-OD-DISCOVERY_REGISTRY-v010-P5-T01: Write API Documentation

**Acting under Canonical Role: Lead Software Engineer**
**Agent: webwakaagent4 — Engineering & Delivery**
**Phase: 5 (Documentation) | Task: T01**

---

## Discovery Registry API Reference

### Registration Port

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| registerService | (cmd: RegisterServiceCommand) => Promise<ServiceRegistrationResult> | ServiceRegistrationResult | Register a new service |
| deregisterService | (cmd: DeregisterServiceCommand) => Promise<void> | void | Remove a service |
| renewHeartbeat | (cmd: HeartbeatCommand) => Promise<void> | void | Reset service TTL |

### Discovery Port

| Method | Signature | Returns | Description |
|--------|-----------|---------|-------------|
| discoverServices | (query: DiscoveryQuery) => Promise<ServiceDiscoveryResult> | ServiceDiscoveryResult | Find matching services |
| resolveVersion | (query: ResolveVersionQuery) => Promise<VersionResolutionResult> | VersionResolutionResult | Resolve compatible version |
| getServiceDetails | (query: GetServiceDetailsQuery) => Promise<ServiceEntry> | ServiceEntry | Get full service details |
| listCapabilities | (query: ListCapabilitiesQuery) => Promise<CapabilityListResult> | CapabilityListResult | List all capabilities |

### Error Handling

All methods throw typed errors with codes DR-001 through DR-008 as defined in P0-T02.
