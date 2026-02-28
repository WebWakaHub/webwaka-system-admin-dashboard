/**
 * ID Generator Tests
 */

import {
  generateUuid,
  generateEventId,
  generateCorrelationId,
  generateSubscriptionId,
  generateTimestamp,
} from '../../src/event-system/utils/id-generator';

describe('ID Generator', () => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

  describe('generateUuid', () => {
    it('should generate a valid UUID v4', () => {
      const uuid = generateUuid();
      expect(uuid).toMatch(uuidRegex);
    });

    it('should generate unique UUIDs', () => {
      const uuid1 = generateUuid();
      const uuid2 = generateUuid();
      expect(uuid1).not.toBe(uuid2);
    });
  });

  describe('generateEventId', () => {
    it('should generate a valid event ID', () => {
      const eventId = generateEventId();
      expect(eventId).toMatch(uuidRegex);
    });

    it('should generate unique event IDs', () => {
      const id1 = generateEventId();
      const id2 = generateEventId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateCorrelationId', () => {
    it('should generate a valid correlation ID', () => {
      const correlationId = generateCorrelationId();
      expect(correlationId).toMatch(uuidRegex);
    });

    it('should generate unique correlation IDs', () => {
      const id1 = generateCorrelationId();
      const id2 = generateCorrelationId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateSubscriptionId', () => {
    it('should generate a subscription ID with sub- prefix', () => {
      const subscriptionId = generateSubscriptionId();
      expect(subscriptionId).toMatch(/^sub-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    });

    it('should generate unique subscription IDs', () => {
      const id1 = generateSubscriptionId();
      const id2 = generateSubscriptionId();
      expect(id1).not.toBe(id2);
    });
  });

  describe('generateTimestamp', () => {
    it('should generate a valid ISO 8601 timestamp', () => {
      const timestamp = generateTimestamp();
      const date = new Date(timestamp);
      expect(date.toISOString()).toBe(timestamp);
    });

    it('should generate timestamps close to current time', () => {
      const timestamp = generateTimestamp();
      const date = new Date(timestamp);
      const now = new Date();
      const diff = Math.abs(now.getTime() - date.getTime());
      expect(diff).toBeLessThan(1000); // Within 1 second
    });
  });
});
