/**
 * ORG-WEBWAKA-PLATFORM — Type Definitions
 * Layer: Organism (Final Biological Abstraction)
 * 
 * Doctrines: Build Once Use Infinitely | Mobile First | PWA First
 * Offline First (NON-NEGOTIABLE) | Nigeria First | Africa First | Vendor Neutral AI
 */

// Nigeria-First Configuration
export const NIGERIA_FIRST_CONFIG = {
  locale: 'en-NG' as const,
  timezone: 'Africa/Lagos' as const,
  currency: 'NGN' as const,
  networkTimeout: 30000,
  offlineQueueMaxSize: 10000,
  syncRetryInterval: 5000,
  syncRetryMaxBackoff: 60000,
};

// System Registry Types
export interface SystemRegistryEntry {
  systemId: string;
  systemName: string;
  version: string;
  domain: string;
  status: 'active' | 'deprecated' | 'pending-admission';
  healthEndpoint: string;
  capabilities: string[];
  constitutionalCompliance: ConstitutionalCompliance;
}

export interface ConstitutionalCompliance {
  systemId: string;
  invariantsChecked: number;
  invariantsPassed: number;
  lastAuditTimestamp: number;
  constitutionVersion: string;
  compliant: boolean;
}

// Cross-System Event Types
export interface OrganismEvent {
  id: string;
  sourceSystem: string;
  targetSystem: string | '*';
  eventType: string;
  payload: unknown;
  timestamp: number;
  correlationId: string;
  offlineQueued: boolean;
  nigeriaFirst: typeof NIGERIA_FIRST_CONFIG;
}

// Offline Queue Types
export interface OfflineQueueEntry {
  id: string;
  event: OrganismEvent;
  queuedAt: number;
  retryCount: number;
  maxRetries: number;
  status: 'pending' | 'syncing' | 'synced' | 'failed';
}

// Network Configuration
export interface NetworkConfig {
  timeout: number;
  retryIntervals: number[];
  maxQueueSize: number;
  syncStrategy: 'eager' | 'lazy' | 'scheduled';
}

// System Health
export interface SystemHealth {
  systemId: string;
  status: 'healthy' | 'degraded' | 'offline';
  lastSync: number;
  offlineQueueDepth: number;
  version: string;
  uptime: number;
}

// Organism State
export interface OrganismState {
  organismId: string;
  version: string;
  systems: SystemRegistryEntry[];
  health: Map<string, SystemHealth>;
  offlineQueue: OfflineQueueEntry[];
  constitutionVersion: string;
  lastAudit: number;
}

// AI Governance Types
export interface AIGovernancePolicy {
  agentId: string;
  allowedActions: string[];
  prohibitedActions: string[];
  requiresRatification: boolean;
  vendorNeutral: boolean;
}

export type OrganismId = 'ORG-WEBWAKA-PLATFORM';
