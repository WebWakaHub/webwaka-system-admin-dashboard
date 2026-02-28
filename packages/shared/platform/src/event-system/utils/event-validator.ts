/**
 * Event Validator
 * Validates events against the standard Event schema
 */

import { Event, ValidationResult } from '../types';
import { EventValidationError } from '../errors';

/**
 * Validates an event against the standard schema
 */
export function validateEvent(event: unknown): ValidationResult {
  const errors: string[] = [];

  if (!event || typeof event !== 'object') {
    return {
      valid: false,
      errors: ['Event must be an object'],
    };
  }

  const e = event as Record<string, unknown>;

  // Check required fields
  if (!e.eventId || typeof e.eventId !== 'string') {
    errors.push('eventId is required and must be a string');
  }

  if (!e.eventType || typeof e.eventType !== 'string') {
    errors.push('eventType is required and must be a string');
  } else if (!isValidEventType(e.eventType as string)) {
    errors.push('eventType must follow the format: domain.entity.action');
  }

  if (!e.eventVersion || typeof e.eventVersion !== 'string') {
    errors.push('eventVersion is required and must be a string');
  }

  if (!e.timestamp || typeof e.timestamp !== 'string') {
    errors.push('timestamp is required and must be a string');
  } else if (!isValidIso8601(e.timestamp as string)) {
    errors.push('timestamp must be a valid ISO 8601 timestamp');
  }

  if (!e.tenantId || typeof e.tenantId !== 'string') {
    errors.push('tenantId is required and must be a string');
  } else if (!isValidUuid(e.tenantId as string)) {
    errors.push('tenantId must be a valid UUID');
  }

  if (e.userId !== undefined && e.userId !== null) {
    if (typeof e.userId !== 'string' || !isValidUuid(e.userId as string)) {
      errors.push('userId must be a valid UUID if provided');
    }
  }

  if (!e.source || typeof e.source !== 'string') {
    errors.push('source is required and must be a string');
  }

  if (e.correlationId !== undefined && e.correlationId !== null) {
    if (typeof e.correlationId !== 'string' || !isValidUuid(e.correlationId as string)) {
      errors.push('correlationId must be a valid UUID if provided');
    }
  }

  if (!e.data || typeof e.data !== 'object' || Array.isArray(e.data)) {
    errors.push('data is required and must be an object');
  }

  return {
    valid: errors.length === 0,
    errors: errors.length > 0 ? errors : undefined,
  };
}

/**
 * Validates event type format: domain.entity.action
 */
function isValidEventType(eventType: string): boolean {
  const parts = eventType.split('.');
  return parts.length >= 2 && parts.every((part) => part.length > 0 && /^[a-z0-9_]+$/.test(part));
}

/**
 * Validates ISO 8601 timestamp
 */
function isValidIso8601(timestamp: string): boolean {
  try {
    const date = new Date(timestamp);
    return !isNaN(date.getTime()) && timestamp === date.toISOString();
  } catch {
    return false;
  }
}

/**
 * Validates UUID v4 format
 */
function isValidUuid(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates and throws error if invalid
 */
export function validateEventOrThrow(event: unknown): Event {
  const result = validateEvent(event);
  if (!result.valid) {
    throw new EventValidationError('Event validation failed', {
      errors: result.errors,
    });
  }
  return event as Event;
}
