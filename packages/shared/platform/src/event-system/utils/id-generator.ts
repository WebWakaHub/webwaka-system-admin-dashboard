/**
 * ID Generator
 * Generates unique IDs for events and other entities
 */

import { randomUUID } from 'crypto';

/**
 * Generates a UUID v4
 */
export function generateUuid(): string {
  return randomUUID();
}

/**
 * Generates an event ID (UUID v4)
 */
export function generateEventId(): string {
  return generateUuid();
}

/**
 * Generates a correlation ID (UUID v4)
 */
export function generateCorrelationId(): string {
  return generateUuid();
}

/**
 * Generates a subscription ID
 */
export function generateSubscriptionId(): string {
  return `sub-${generateUuid()}`;
}

/**
 * Generates a timestamp in ISO 8601 format
 */
export function generateTimestamp(): string {
  return new Date().toISOString();
}
