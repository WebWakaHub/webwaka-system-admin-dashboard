/**
 * Tenant Enforcer Tests
 */

import { TenantEnforcer, TenantContext } from '../../src/event-system/utils/tenant-enforcer';
import { Event } from '../../src/event-system/types';
import { TenantIsolationError } from '../../src/event-system/errors';

describe('Tenant Enforcer', () => {
  const createEvent = (overrides?: Partial<Event>): Event => ({
    eventId: '550e8400-e29b-41d4-a716-446655440000',
    eventType: 'user.created',
    eventVersion: '1.0',
    timestamp: '2026-02-09T10:00:00Z',
    tenantId: '550e8400-e29b-41d4-a716-446655440001',
    source: 'test-module',
    data: { email: 'test@example.com' },
    ...overrides,
  });

  const createContext = (overrides?: Partial<TenantContext>): TenantContext => ({
    tenantId: '550e8400-e29b-41d4-a716-446655440001',
    userId: 'user-123',
    permissions: ['read:events', 'write:events'],
    ...overrides,
  });

  describe('Tenant Access Validation', () => {
    it('should allow access when tenant IDs match', () => {
      const context = createContext();
      const event = createEvent();
      expect(() => TenantEnforcer.validateTenantAccess(context, event)).not.toThrow();
    });

    it('should deny access when tenant IDs do not match', () => {
      const context = createContext();
      const event = createEvent({ tenantId: 'different-tenant' });
      expect(() => TenantEnforcer.validateTenantAccess(context, event)).toThrow(TenantIsolationError);
    });

    it('should include details in error', () => {
      const context = createContext({ tenantId: 'tenant-1' });
      const event = createEvent({ tenantId: 'tenant-2' });
      try {
        TenantEnforcer.validateTenantAccess(context, event);
        fail('Should throw error');
      } catch (error) {
        expect(error).toBeInstanceOf(TenantIsolationError);
        expect((error as any).details).toEqual({
          requestingTenant: 'tenant-1',
          eventTenant: 'tenant-2',
        });
      }
    });
  });

  describe('Subscription Access Validation', () => {
    it('should allow access when tenant IDs match', () => {
      const context = createContext({ tenantId: 'tenant-123' });
      expect(() => TenantEnforcer.validateSubscriptionAccess(context, 'tenant-123')).not.toThrow();
    });

    it('should deny access when tenant IDs do not match', () => {
      const context = createContext({ tenantId: 'tenant-1' });
      expect(() => TenantEnforcer.validateSubscriptionAccess(context, 'tenant-2')).toThrow(
        TenantIsolationError
      );
    });
  });

  describe('Event Tenant Validation', () => {
    it('should allow when event belongs to tenant', () => {
      const event = createEvent({ tenantId: 'tenant-123' });
      expect(() => TenantEnforcer.validateEventTenant(event, 'tenant-123')).not.toThrow();
    });

    it('should deny when event does not belong to tenant', () => {
      const event = createEvent({ tenantId: 'tenant-1' });
      expect(() => TenantEnforcer.validateEventTenant(event, 'tenant-2')).toThrow(TenantIsolationError);
    });
  });

  describe('Event Filtering', () => {
    it('should filter events by tenant', () => {
      const events = [
        createEvent({ tenantId: 'tenant-1' }),
        createEvent({ tenantId: 'tenant-2' }),
        createEvent({ tenantId: 'tenant-1' }),
      ];

      const filtered = TenantEnforcer.filterEventsByTenant(events, 'tenant-1');
      expect(filtered).toHaveLength(2);
      expect(filtered.every((e) => e.tenantId === 'tenant-1')).toBe(true);
    });

    it('should return empty array when no events match', () => {
      const events = [createEvent({ tenantId: 'tenant-1' })];
      const filtered = TenantEnforcer.filterEventsByTenant(events, 'tenant-2');
      expect(filtered).toHaveLength(0);
    });
  });

  describe('Batch Event Validation', () => {
    it('should allow when all events belong to tenant', () => {
      const events = [
        createEvent({ tenantId: 'tenant-123' }),
        createEvent({ tenantId: 'tenant-123' }),
      ];
      expect(() => TenantEnforcer.validateEventsTenant(events, 'tenant-123')).not.toThrow();
    });

    it('should deny when any event does not belong to tenant', () => {
      const events = [
        createEvent({ tenantId: 'tenant-1' }),
        createEvent({ tenantId: 'tenant-2' }),
      ];
      expect(() => TenantEnforcer.validateEventsTenant(events, 'tenant-1')).toThrow(TenantIsolationError);
    });
  });

  describe('Permission Validation', () => {
    it('should allow when permission exists', () => {
      const context = createContext({ permissions: ['read:events', 'write:events'] });
      expect(() => TenantEnforcer.validatePermission(context, 'read:events')).not.toThrow();
    });

    it('should deny when permission does not exist', () => {
      const context = createContext({ permissions: ['read:events'] });
      expect(() => TenantEnforcer.validatePermission(context, 'delete:events')).toThrow(
        TenantIsolationError
      );
    });

    it('should allow when no permissions are required', () => {
      const context = createContext({ permissions: undefined });
      expect(() => TenantEnforcer.validatePermission(context, 'any:permission')).not.toThrow();
    });
  });

  describe('Tenant Filter Creation', () => {
    it('should create single tenant filter', () => {
      const filter = TenantEnforcer.createTenantFilter('tenant-123');
      const event1 = createEvent({ tenantId: 'tenant-123' });
      const event2 = createEvent({ tenantId: 'tenant-456' });

      expect(filter(event1)).toBe(true);
      expect(filter(event2)).toBe(false);
    });

    it('should create multi-tenant filter', () => {
      const filter = TenantEnforcer.createMultiTenantFilter(['tenant-1', 'tenant-2']);
      const event1 = createEvent({ tenantId: 'tenant-1' });
      const event2 = createEvent({ tenantId: 'tenant-2' });
      const event3 = createEvent({ tenantId: 'tenant-3' });

      expect(filter(event1)).toBe(true);
      expect(filter(event2)).toBe(true);
      expect(filter(event3)).toBe(false);
    });
  });

  describe('Error Details', () => {
    it('should include detailed error information', () => {
      const context = createContext({ tenantId: 'tenant-1' });
      const event = createEvent({ tenantId: 'tenant-2', eventId: 'event-123' });

      try {
        TenantEnforcer.validateEventTenant(event, 'tenant-1');
        fail('Should throw error');
      } catch (error) {
        expect(error).toBeInstanceOf(TenantIsolationError);
        expect((error as any).details).toEqual({
          expectedTenant: 'tenant-1',
          actualTenant: 'tenant-2',
          eventId: 'event-123',
        });
      }
    });
  });
});
