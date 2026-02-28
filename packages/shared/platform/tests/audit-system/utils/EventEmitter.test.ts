/**
 * Unit tests for EventEmitter
 */

import { EventEmitter } from '../../../src/audit-system/utils/EventEmitter';
import { AuditEvent } from '../../../src/audit-system/types/AuditLog';

describe('EventEmitter', () => {
  let emitter: EventEmitter;

  beforeEach(() => {
    emitter = new EventEmitter();
  });

  describe('subscribe', () => {
    it('should add a listener', () => {
      const listener = jest.fn();

      emitter.subscribe(listener);

      expect(emitter.getListenerCount()).toBe(1);
    });

    it('should add multiple listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.subscribe(listener1);
      emitter.subscribe(listener2);

      expect(emitter.getListenerCount()).toBe(2);
    });
  });

  describe('unsubscribe', () => {
    it('should remove a listener', () => {
      const listener = jest.fn();

      emitter.subscribe(listener);
      emitter.unsubscribe(listener);

      expect(emitter.getListenerCount()).toBe(0);
    });

    it('should remove only the specified listener', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.subscribe(listener1);
      emitter.subscribe(listener2);
      emitter.unsubscribe(listener1);

      expect(emitter.getListenerCount()).toBe(1);
    });
  });

  describe('emit', () => {
    it('should call all subscribed listeners', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.subscribe(listener1);
      emitter.subscribe(listener2);

      await emitter.emit('products-service', 'tenant-123', { userId: 'user-123', role: 'admin' }, { type: 'CREATE', entityType: 'Product', entityId: 'product-456' });

      expect(listener1).toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });

    it('should emit event with correct structure', async () => {
      const listener = jest.fn();

      emitter.subscribe(listener);

      await emitter.emit('products-service', 'tenant-123', { userId: 'user-123', role: 'admin' }, { type: 'CREATE', entityType: 'Product', entityId: 'product-456' });

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        eventType: 'audit.action.performed',
        sourceModule: 'products-service',
        tenantId: 'tenant-123',
      }));
    });

    it('should emit event with optional details', async () => {
      const listener = jest.fn();

      emitter.subscribe(listener);

      const details = {
        originalState: { price: 100 },
        newState: { price: 150 },
      };

      await emitter.emit('products-service', 'tenant-123', { userId: 'user-123', role: 'admin' }, { type: 'UPDATE', entityType: 'Product', entityId: 'product-456' }, details);

      expect(listener).toHaveBeenCalledWith(expect.objectContaining({
        details,
      }));
    });

    it('should not call unsubscribed listeners', async () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      emitter.subscribe(listener1);
      emitter.subscribe(listener2);
      emitter.unsubscribe(listener1);

      await emitter.emit('products-service', 'tenant-123', { userId: 'user-123', role: 'admin' }, { type: 'CREATE', entityType: 'Product', entityId: 'product-456' });

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalled();
    });
  });

  describe('getListenerCount', () => {
    it('should return 0 when no listeners are subscribed', () => {
      expect(emitter.getListenerCount()).toBe(0);
    });

    it('should return the correct listener count', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();
      const listener3 = jest.fn();

      emitter.subscribe(listener1);
      emitter.subscribe(listener2);
      emitter.subscribe(listener3);

      expect(emitter.getListenerCount()).toBe(3);
    });
  });
});
