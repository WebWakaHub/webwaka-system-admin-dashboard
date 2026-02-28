# ORG-OD-DISCOVERY_REGISTRY-v010-P0-T02: Document Canonical Inputs and Outputs

**Acting under Canonical Role: Core Platform Architect**
**Agent: webwakaagent3 — Architecture & System Design**
**Phase: 0 (Specification) | Task: T02**

---

## Pre-Execution Checklist

| Check | Status |
|-------|--------|
| Impacted Layer | Organelle |
| Impacted Invariants | Input validation, output consistency |
| Dependency Awareness | None (dependency-root) |
| Phase Alignment | Phase 0 — Specification |
| Cross-Category Violation | None |

---

## 1. Input Types

| # | Input | Type | Required | Description |
|---|-------|------|----------|-------------|
| 1 | RegisterServiceCommand | Command | Yes | Register a new service with capabilities |
| 2 | DeregisterServiceCommand | Command | Yes | Remove a service from the registry |
| 3 | HeartbeatCommand | Command | Yes | Update service health/TTL |
| 4 | DiscoverServicesQuery | Query | Yes | Find services by capability/name/version |
| 5 | ResolveVersionQuery | Query | Yes | Resolve compatible service version |
| 6 | GetServiceDetailsQuery | Query | Yes | Get full details of a specific service |
| 7 | ListCapabilitiesQuery | Query | Yes | List all registered capabilities |

## 2. Output Types

| # | Output | Type | Description |
|---|--------|------|-------------|
| 1 | ServiceRegistrationResult | Result | Confirmation of registration with assigned ID |
| 2 | ServiceDiscoveryResult | Result | List of matching services with endpoints |
| 3 | VersionResolutionResult | Result | Resolved service version and endpoint |
| 4 | CapabilityListResult | Result | Enumeration of all registered capabilities |

## 3. Error Codes

| Code | Name | Description |
|------|------|-------------|
| DR-001 | SERVICE_ALREADY_REGISTERED | Duplicate service ID |
| DR-002 | SERVICE_NOT_FOUND | Service ID not in registry |
| DR-003 | INVALID_CAPABILITY | Capability declaration malformed |
| DR-004 | TTL_EXPIRED | Service TTL has expired |
| DR-005 | VERSION_INCOMPATIBLE | No compatible version found |
| DR-006 | SCOPE_VIOLATION | Capability outside declared scope |
| DR-007 | REGISTRY_READONLY | Registry in offline read-only mode |
| DR-008 | INVALID_HEARTBEAT | Heartbeat for unregistered service |

## 4. Lifecycle Events

| # | Event | Trigger | Payload |
|---|-------|---------|---------|
| 1 | ServiceRegistered | Successful registration | service_id, capabilities, endpoint |
| 2 | ServiceDeregistered | Explicit or TTL deregistration | service_id, reason |
| 3 | ServiceHealthChanged | Heartbeat received or missed | service_id, old_status, new_status |
| 4 | VersionResolved | Successful version resolution | service_id, resolved_version |
| 5 | CapabilityIndexUpdated | Registration/deregistration | capability_id, action |
