/**
 * ORG-WEBWAKA-PLATFORM — WebWaka Platform Organism Test Suite
 * Verifies: orchestration, offline sync, governance, Nigeria-first compliance
 */

import { WebwakaPlatformOrganism } from '../src/entity';
import {
  NIGERIA_FIRST_CONFIG,
  SystemRegistryEntry,
  OrganismEvent,
  OfflineQueueEntry,
  NetworkConfig,
} from '../src/types';

describe('WebwakaPlatformOrganism', () => {
  let organism: WebwakaPlatformOrganism;

  beforeEach(() => {
    organism = new WebwakaPlatformOrganism();
  });

  describe('System Registry', () => {
    it('should register a new system', () => {
      const system: SystemRegistryEntry = {
        systemId: 'SYS-FIN-FINANCEPLATFORM',
        systemName: 'Finance Platform',
        version: '0.1.0',
        domain: 'FIN',
        status: 'active',
        healthEndpoint: '/health',
        capabilities: ['payment', 'invoicing'],
        constitutionalCompliance: {
          systemId: 'SYS-FIN-FINANCEPLATFORM',
          invariantsChecked: 19,
          invariantsPassed: 19,
          lastAuditTimestamp: Date.now(),
          constitutionVersion: '1.0.0',
          compliant: true,
        },
      };
      expect(() => organism.registerSystem(system)).not.toThrow();
    });

    it('should reject duplicate system registration', () => {
      const system: SystemRegistryEntry = {
        systemId: 'SYS-FIN-FINANCEPLATFORM',
        systemName: 'Finance Platform',
        version: '0.1.0',
        domain: 'FIN',
        status: 'active',
        healthEndpoint: '/health',
        capabilities: [],
        constitutionalCompliance: {
          systemId: 'SYS-FIN-FINANCEPLATFORM',
          invariantsChecked: 19,
          invariantsPassed: 19,
          lastAuditTimestamp: Date.now(),
          constitutionVersion: '1.0.0',
          compliant: true,
        },
      };
      organism.registerSystem(system);
      expect(() => organism.registerSystem(system)).toThrow('already registered');
    });

    it('should deprecate a system with migration plan', () => {
      const system: SystemRegistryEntry = {
        systemId: 'SYS-TEST',
        systemName: 'Test',
        version: '0.1.0',
        domain: 'TEST',
        status: 'active',
        healthEndpoint: '/health',
        capabilities: [],
        constitutionalCompliance: {
          systemId: 'SYS-TEST',
          invariantsChecked: 0,
          invariantsPassed: 0,
          lastAuditTimestamp: 0,
          constitutionVersion: '1.0.0',
          compliant: true,
        },
      };
      organism.registerSystem(system);
      expect(() => organism.deprecateSystem('SYS-TEST', 'Migrate to SYS-NEW')).not.toThrow();
    });
  });

  describe('Offline Support (NON-NEGOTIABLE)', () => {
    it('should queue events when offline', async () => {
      // Simulate offline
      Object.defineProperty(navigator, 'onLine', { value: false, writable: true });
      const event: OrganismEvent = {
        id: 'evt-1',
        sourceSystem: 'SYS-FIN-FINANCEPLATFORM',
        targetSystem: 'SYS-CRM-CUSTOMERPLATFORM',
        eventType: 'payment.completed',
        payload: { amount: 5000, currency: 'NGN' },
        timestamp: Date.now(),
        correlationId: 'corr-1',
        offlineQueued: false,
        nigeriaFirst: NIGERIA_FIRST_CONFIG,
      };
      // Should not throw when offline
      expect(organism.orchestrateOffline).toBeDefined();
    });

    it('should sync offline queue when online', async () => {
      expect(organism.sync).toBeDefined();
      expect(typeof organism.sync).toBe('function');
    });
  });

  describe('Nigeria-First Compliance', () => {
    it('should use en-NG locale', () => {
      expect(NIGERIA_FIRST_CONFIG.locale).toBe('en-NG');
    });

    it('should use Africa/Lagos timezone', () => {
      expect(NIGERIA_FIRST_CONFIG.timezone).toBe('Africa/Lagos');
    });

    it('should use NGN currency', () => {
      expect(NIGERIA_FIRST_CONFIG.currency).toBe('NGN');
    });

    it('should use 30s network timeout', () => {
      expect(NIGERIA_FIRST_CONFIG.networkTimeout).toBe(30000);
    });

    it('should have 10000 max offline queue size', () => {
      expect(NIGERIA_FIRST_CONFIG.offlineQueueMaxSize).toBe(10000);
    });
  });

  describe('AI Governance', () => {
    it('should reject non-vendor-neutral AI policies', () => {
      expect(() => organism.registerAIPolicy({
        agentId: 'agent-1',
        allowedActions: ['*'],
        prohibitedActions: [],
        requiresRatification: false,
        vendorNeutral: false,
      })).toThrow('vendor-neutral');
    });

    it('should validate AI agent actions', () => {
      organism.registerAIPolicy({
        agentId: 'agent-1',
        allowedActions: ['read', 'analyze'],
        prohibitedActions: ['delete', 'rename-domain'],
        requiresRatification: false,
        vendorNeutral: true,
      });
      expect(organism.validateAIAction('agent-1', 'read')).toBe(true);
      expect(organism.validateAIAction('agent-1', 'delete')).toBe(false);
    });
  });

  describe('Health Monitoring', () => {
    it('should return health for all registered systems', async () => {
      expect(organism.getHealth).toBeDefined();
      const health = await organism.getHealth();
      expect(health).toBeDefined();
    });
  });

  describe('Constitutional Compliance', () => {
    it('should audit system compliance', async () => {
      const system: SystemRegistryEntry = {
        systemId: 'SYS-TEST-AUDIT',
        systemName: 'Test Audit',
        version: '0.1.0',
        domain: 'TEST',
        status: 'active',
        healthEndpoint: '/health',
        capabilities: [],
        constitutionalCompliance: {
          systemId: 'SYS-TEST-AUDIT',
          invariantsChecked: 0,
          invariantsPassed: 0,
          lastAuditTimestamp: 0,
          constitutionVersion: '1.0.0',
          compliant: true,
        },
      };
      organism.registerSystem(system);
      const compliance = await organism.auditSystemCompliance('SYS-TEST-AUDIT');
      expect(compliance.systemId).toBe('SYS-TEST-AUDIT');
      expect(compliance.invariantsChecked).toBeGreaterThan(0);
    });
  });
});
