import { EventBusBridge } from '../../../src/ai-extension-framework/bridge/EventBusBridge';
import { AIExtension } from '../../../src/ai-extension-framework/AIExtension';

describe('EventBusBridge', () => {
  let bridge: EventBusBridge;
  let extension: AIExtension;

  beforeEach(() => {
    bridge = new EventBusBridge();
    extension = new AIExtension('test-extension', '1.0.0');
  });

  describe('Subscription', () => {
    it('should subscribe extension to event', () => {
      const handler = jest.fn();
      bridge.subscribe(extension, 'test.event', handler);
      expect(bridge.getExtensionListeners('test-extension')).toContain('test.event');
    });

    it('should unsubscribe extension from event', () => {
      const handler = jest.fn();
      bridge.subscribe(extension, 'test.event', handler);
      bridge.unsubscribe(extension, 'test.event');
      expect(bridge.getExtensionListeners('test-extension')).not.toContain('test.event');
    });

    it('should handle multiple subscriptions', () => {
      const handler = jest.fn();
      bridge.subscribe(extension, 'event1', handler);
      bridge.subscribe(extension, 'event2', handler);
      const listeners = bridge.getExtensionListeners('test-extension');
      expect(listeners).toContain('event1');
      expect(listeners).toContain('event2');
    });
  });

  describe('Event Emission', () => {
    it('should emit event', () => {
      const handler = jest.fn();
      bridge.subscribe(extension, 'test.event', handler);
      bridge.emit('test.event', { data: 'test' });
      expect(handler).toHaveBeenCalledWith({ data: 'test' });
    });

    it('should emit event from extension', () => {
      const handler = jest.fn();
      bridge.subscribe(extension, 'response.event', handler);
      bridge.emitFromExtension(extension, 'response.event', { result: 'success' });
      expect(handler).toHaveBeenCalled();
      const call = handler.mock.calls[0][0];
      expect(call.source.type).toBe('extension');
      expect(call.source.extensionId).toBe('test-extension');
    });

    it('should enrich event with extension context', () => {
      const handler = jest.fn();
      bridge.subscribe(extension, 'test.event', handler);
      bridge.emitFromExtension(extension, 'test.event', { data: 'test' });
      const call = handler.mock.calls[0][0];
      expect(call.source.extensionId).toBe('test-extension');
      expect(call.source.extensionName).toBe('test-extension');
    });
  });

  describe('Listener Management', () => {
    it('should get extension listeners', () => {
      const handler = jest.fn();
      bridge.subscribe(extension, 'event1', handler);
      bridge.subscribe(extension, 'event2', handler);
      const listeners = bridge.getExtensionListeners('test-extension');
      expect(listeners.length).toBe(2);
    });

    it('should get event listeners', () => {
      const handler = jest.fn();
      bridge.subscribe(extension, 'test.event', handler);
      const ext2 = new AIExtension('ext2', '1.0.0');
      bridge.subscribe(ext2, 'test.event', handler);
      const listeners = bridge.getEventListeners('test.event');
      expect(listeners).toContain('test-extension');
      expect(listeners).toContain('ext2');
    });

    it('should remove all extension listeners', () => {
      const handler = jest.fn();
      bridge.subscribe(extension, 'event1', handler);
      bridge.subscribe(extension, 'event2', handler);
      bridge.removeExtensionListeners('test-extension');
      expect(bridge.getExtensionListeners('test-extension').length).toBe(0);
    });

    it('should get listener count', () => {
      const handler = jest.fn();
      bridge.subscribe(extension, 'test.event', handler);
      expect(bridge.getListenerCount('test.event')).toBe(1);
    });
  });

  describe('Event Management', () => {
    it('should get all events', () => {
      const handler = jest.fn();
      bridge.subscribe(extension, 'event1', handler);
      bridge.subscribe(extension, 'event2', handler);
      const events = bridge.getAllEvents();
      expect(events).toContain('event1');
      expect(events).toContain('event2');
    });

    it('should clear all listeners', () => {
      const handler = jest.fn();
      bridge.subscribe(extension, 'event1', handler);
      bridge.subscribe(extension, 'event2', handler);
      bridge.clearAll();
      expect(bridge.getAllEvents().length).toBe(0);
    });
  });

  describe('Multiple Extensions', () => {
    it('should handle multiple extensions', () => {
      const handler = jest.fn();
      const ext2 = new AIExtension('ext2', '1.0.0');
      bridge.subscribe(extension, 'test.event', handler);
      bridge.subscribe(ext2, 'test.event', handler);
      const listeners = bridge.getEventListeners('test.event');
      expect(listeners.length).toBe(2);
    });

    it('should isolate extension listeners', () => {
      const handler1 = jest.fn();
      const handler2 = jest.fn();
      const ext2 = new AIExtension('ext2', '1.0.0');
      bridge.subscribe(extension, 'event1', handler1);
      bridge.subscribe(ext2, 'event2', handler2);
      bridge.removeExtensionListeners('test-extension');
      expect(bridge.getExtensionListeners('test-extension').length).toBe(0);
      expect(bridge.getExtensionListeners('ext2').length).toBe(1);
    });
  });
});
