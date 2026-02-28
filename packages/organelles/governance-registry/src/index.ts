/**
 * GovernanceRegistry — Public API
 * Organelle: ORG-RG-GOVERNANCE_REGISTRY-v0.1.0
 * @module @webwaka/organelle-governance-registry
 */

export { GovernanceRegistryOrchestrator } from "./governance-registry-orchestrator";
export { GovernanceRegistryEntity } from "./governance-registry-entity";
export { GovernanceRegistryStateMachine } from "./state-machine";
export { InMemoryGovernanceRegistryStorage } from "./storage-interface";
export type { IGovernanceRegistryStorage } from "./storage-interface";
export { GovernanceRegistryEventBus } from "./event-interface";
export type { IGovernanceRegistryEvents } from "./event-interface";
export { DefaultGovernanceRegistryObservability } from "./observability-interface";
export type { IGovernanceRegistryObservability } from "./observability-interface";
export * from "./types";
