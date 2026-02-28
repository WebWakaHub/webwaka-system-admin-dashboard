# ORG-WEBWAKA-PLATFORM — API Documentation

## Overview

The WebWaka Platform Organism provides the following public APIs:

### `orchestrate(event: OrganismEvent): Promise<void>`
Routes a cross-system event through the governance layer.
Automatically falls back to offline queueing when connectivity is lost.

### `orchestrateOffline(event: OrganismEvent): Promise<void>`
Explicitly queues an event for later synchronization.
Used when the application knows it is offline.

### `sync(): Promise<void>`
Processes the offline queue, attempting to deliver all pending events.
Uses Nigeria-first network settings (30s timeout, exponential backoff).

### `registerSystem(system: SystemRegistryEntry): void`
Registers a new system with the organism. Validates admission criteria.

### `deprecateSystem(systemId: string, migrationPlan: string): void`
Marks a system as deprecated. Requires a migration plan.

### `auditSystemCompliance(systemId: string): Promise<ConstitutionalCompliance>`
Audits a system's compliance with constitutional invariants.

### `getHealth(): Promise<Record<string, SystemHealth>>`
Returns the health status of all registered systems.

### `registerAIPolicy(policy: AIGovernancePolicy): void`
Registers an AI governance policy. Must be vendor-neutral.

### `validateAIAction(agentId: string, action: string): boolean`
Validates whether an AI agent is allowed to perform a specific action.

## Doctrine Compliance

| Doctrine | How Enforced |
|----------|-------------|
| Build Once Use Infinitely | Single organism instance governs all systems |
| Mobile First | All APIs are async, mobile-optimized |
| PWA First | Service worker integration for offline sync |
| Offline First | Every operation works offline (NON-NEGOTIABLE) |
| Nigeria First | en-NG locale, WAT timezone, NGN currency, 30s timeout |
| Africa First | Multi-country support via locale configuration |
| Vendor Neutral AI | AI policies must declare vendorNeutral: true |
