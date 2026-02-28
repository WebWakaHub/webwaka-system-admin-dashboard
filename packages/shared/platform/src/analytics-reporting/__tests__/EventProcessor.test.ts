/**
 * Unit tests for EventProcessor
 */

import { EventProcessor } from '../services/EventProcessor';

describe('EventProcessor', () => {
  let eventProcessor: EventProcessor;
  let mockEventBus: any;
  let mockClickHouseClient: any;

  beforeEach(() => {
    mockEventBus = {
      on: jest.fn(),
      off: jest.fn(),
      emit: jest.fn(),
    };

    mockClickHouseClient = {
      query: jest.fn().mockResolvedValue({ rows: [] }),
    };

    eventProcessor = new EventProcessor(mockEventBus, mockClickHouseClient);
  });

  describe('initialize', () => {
    it('should subscribe to analytics events', async () => {
      await eventProcessor.initialize();

      expect(mockEventBus.on).toHaveBeenCalledWith('analytics.pageView', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('analytics.click', expect.any(Function));
      expect(mockEventBus.on).toHaveBeenCalledWith('analytics.formSubmission', expect.any(Function));
    });
  });

  describe('writeEvent', () => {
    it('should write an event to the database', async () => {
      const event = {
        timestamp: new Date(),
        tenantId: 'tenant-1',
        eventType: 'pageView',
        userId: 'user-1',
        sessionId: 'session-1',
        page: '/home',
        metadata: {},
      };

      await eventProcessor.writeEvent(event);

      expect(mockEventBus.emit).toHaveBeenCalledWith('analytics.event.processed', {
        eventType: 'pageView',
      });
    });
  });

  describe('shutdown', () => {
    it('should unsubscribe from analytics events', async () => {
      await eventProcessor.shutdown();

      expect(mockEventBus.off).toHaveBeenCalledWith('analytics.pageView', expect.any(Function));
      expect(mockEventBus.off).toHaveBeenCalledWith('analytics.click', expect.any(Function));
      expect(mockEventBus.off).toHaveBeenCalledWith('analytics.formSubmission', expect.any(Function));
    });
  });
});
