/**
 * Event Validator Tests
 */

import { validateEvent, validateEventOrThrow } from '../../src/event-system/utils/event-validator';
import { EventValidationError } from '../../src/event-system/errors';
import { Event } from '../../src/event-system/types';

describe('Event Validator', () => {
  const validEvent: Event = {
    eventId: '550e8400-e29b-41d4-a716-446655440000',
    eventType: 'user.created',
    eventVersion: '1.0',
    timestamp: '2026-02-09T10:00:00Z',
    tenantId: '550e8400-e29b-41d4-a716-446655440001',
    userId: '550e8400-e29b-41d4-a716-446655440002',
    source: 'identity-module',
    correlationId: '550e8400-e29b-41d4-a716-446655440003',
    data: { email: 'test@example.com' },
  };

  describe('validateEvent', () => {
    it('should validate a correct event', () => {
      const result = validateEvent(validEvent);
      expect(result.valid).toBe(true);
      expect(result.errors).toBeUndefined();
    });

    it('should reject non-object input', () => {
      const result = validateEvent('not an object');
      expect(result.valid).toBe(false);
      expect(result.errors).toBeDefined();
      expect(result.errors).toContain('Event must be an object');
    });

    it('should reject missing eventId', () => {
      const event = { ...validEvent };
      delete (event as any).eventId;
      const result = validateEvent(event);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('eventId is required and must be a string');
    });

    it('should reject missing eventType', () => {
      const event = { ...validEvent };
      delete (event as any).eventType;
      const result = validateEvent(event);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('eventType is required and must be a string');
    });

    it('should reject invalid eventType format', () => {
      const event = { ...validEvent, eventType: 'invalid' };
      const result = validateEvent(event);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('eventType must follow the format: domain.entity.action');
    });

    it('should reject missing tenantId', () => {
      const event = { ...validEvent };
      delete (event as any).tenantId;
      const result = validateEvent(event);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('tenantId is required and must be a string');
    });

    it('should reject invalid tenantId UUID', () => {
      const event = { ...validEvent, tenantId: 'not-a-uuid' };
      const result = validateEvent(event);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('tenantId must be a valid UUID');
    });

    it('should reject invalid timestamp', () => {
      const event = { ...validEvent, timestamp: 'not-a-timestamp' };
      const result = validateEvent(event);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('timestamp must be a valid ISO 8601 timestamp');
    });

    it('should reject missing data', () => {
      const event = { ...validEvent };
      delete (event as any).data;
      const result = validateEvent(event);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('data is required and must be an object');
    });

    it('should accept optional userId', () => {
      const event = { ...validEvent };
      delete event.userId;
      const result = validateEvent(event);
      expect(result.valid).toBe(true);
    });

    it('should accept optional correlationId', () => {
      const event = { ...validEvent };
      delete event.correlationId;
      const result = validateEvent(event);
      expect(result.valid).toBe(true);
    });
  });

  describe('validateEventOrThrow', () => {
    it('should return event if valid', () => {
      const result = validateEventOrThrow(validEvent);
      expect(result).toEqual(validEvent);
    });

    it('should throw EventValidationError if invalid', () => {
      const event = { ...validEvent };
      delete (event as any).eventType;
      expect(() => validateEventOrThrow(event)).toThrow(EventValidationError);
    });

    it('should include error details in thrown error', () => {
      const event = { ...validEvent };
      delete (event as any).eventType;
      try {
        validateEventOrThrow(event);
        fail('Should have thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(EventValidationError);
        expect((error as EventValidationError).details).toBeDefined();
      }
    });
  });
});
