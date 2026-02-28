/**
 * Event System Errors Tests
 */

import {
  EventSystemError,
  EventValidationError,
  EventPublishError,
  SubscriptionError,
  ConnectionError,
  TenantIsolationError,
  AuthenticationError,
  AuthorizationError,
} from '../../src/event-system/errors';

describe('Event System Errors', () => {
  describe('EventSystemError', () => {
    it('should create error with code and message', () => {
      const error = new EventSystemError('TEST_ERROR', 'Test message');
      expect(error.code).toBe('TEST_ERROR');
      expect(error.message).toBe('Test message');
      expect(error.name).toBe('EventSystemError');
    });

    it('should include details', () => {
      const details = { key: 'value' };
      const error = new EventSystemError('TEST_ERROR', 'Test message', details);
      expect(error.details).toEqual(details);
    });
  });

  describe('EventValidationError', () => {
    it('should create validation error', () => {
      const error = new EventValidationError('Invalid event');
      expect(error.code).toBe('EVENT_VALIDATION_ERROR');
      expect(error.message).toBe('Invalid event');
      expect(error.name).toBe('EventValidationError');
    });

    it('should be instanceof EventSystemError', () => {
      const error = new EventValidationError('Invalid event');
      expect(error).toBeInstanceOf(EventSystemError);
    });
  });

  describe('EventPublishError', () => {
    it('should create publish error', () => {
      const error = new EventPublishError('Failed to publish');
      expect(error.code).toBe('EVENT_PUBLISH_ERROR');
      expect(error.message).toBe('Failed to publish');
      expect(error.name).toBe('EventPublishError');
    });

    it('should be instanceof EventSystemError', () => {
      const error = new EventPublishError('Failed to publish');
      expect(error).toBeInstanceOf(EventSystemError);
    });
  });

  describe('SubscriptionError', () => {
    it('should create subscription error', () => {
      const error = new SubscriptionError('Subscription failed');
      expect(error.code).toBe('SUBSCRIPTION_ERROR');
      expect(error.message).toBe('Subscription failed');
      expect(error.name).toBe('SubscriptionError');
    });

    it('should be instanceof EventSystemError', () => {
      const error = new SubscriptionError('Subscription failed');
      expect(error).toBeInstanceOf(EventSystemError);
    });
  });

  describe('ConnectionError', () => {
    it('should create connection error', () => {
      const error = new ConnectionError('Connection lost');
      expect(error.code).toBe('CONNECTION_ERROR');
      expect(error.message).toBe('Connection lost');
      expect(error.name).toBe('ConnectionError');
    });

    it('should be instanceof EventSystemError', () => {
      const error = new ConnectionError('Connection lost');
      expect(error).toBeInstanceOf(EventSystemError);
    });
  });

  describe('TenantIsolationError', () => {
    it('should create tenant isolation error', () => {
      const error = new TenantIsolationError('Tenant isolation violated');
      expect(error.code).toBe('TENANT_ISOLATION_ERROR');
      expect(error.message).toBe('Tenant isolation violated');
      expect(error.name).toBe('TenantIsolationError');
    });

    it('should be instanceof EventSystemError', () => {
      const error = new TenantIsolationError('Tenant isolation violated');
      expect(error).toBeInstanceOf(EventSystemError);
    });
  });

  describe('AuthenticationError', () => {
    it('should create authentication error', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error.code).toBe('AUTHENTICATION_ERROR');
      expect(error.message).toBe('Invalid credentials');
      expect(error.name).toBe('AuthenticationError');
    });

    it('should be instanceof EventSystemError', () => {
      const error = new AuthenticationError('Invalid credentials');
      expect(error).toBeInstanceOf(EventSystemError);
    });
  });

  describe('AuthorizationError', () => {
    it('should create authorization error', () => {
      const error = new AuthorizationError('Access denied');
      expect(error.code).toBe('AUTHORIZATION_ERROR');
      expect(error.message).toBe('Access denied');
      expect(error.name).toBe('AuthorizationError');
    });

    it('should be instanceof EventSystemError', () => {
      const error = new AuthorizationError('Access denied');
      expect(error).toBeInstanceOf(EventSystemError);
    });
  });
});
