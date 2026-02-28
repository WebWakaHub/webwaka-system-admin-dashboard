import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EventService } from '../services/EventService';
import { EventType, EventStatus, RecurringPattern } from '../models/Event';

describe('EventService', () => {
  let eventService: EventService;
  let mockDataSource: any;

  beforeEach(() => {
    mockDataSource = {
      getRepository: vi.fn(() => ({
        create: vi.fn((data) => data),
        save: vi.fn((data) => Promise.resolve({ ...data, eventId: 'event-123' })),
        findOne: vi.fn(),
        findAndCount: vi.fn(() => Promise.resolve([[], 0])),
        update: vi.fn(),
        delete: vi.fn(),
        increment: vi.fn(),
        decrement: vi.fn(),
        find: vi.fn(() => Promise.resolve([])),
      })),
    };

    eventService = new EventService(mockDataSource);
  });

  describe('createEvent', () => {
    it('should create event successfully', async () => {
      const dto = {
        name: 'Sunday Service',
        eventType: EventType.SERVICE,
        startDate: '2026-02-16T10:00:00Z',
        endDate: '2026-02-16T12:00:00Z',
        location: 'Main Sanctuary',
      };

      const event = await eventService.createEvent('church-123', 'user-123', dto);

      expect(event.name).toBe('Sunday Service');
      expect(event.status).toBe(EventStatus.DRAFT);
    });

    it('should throw error if end date is before start date', async () => {
      const dto = {
        name: 'Invalid Event',
        eventType: EventType.SERVICE,
        startDate: '2026-02-16T12:00:00Z',
        endDate: '2026-02-16T10:00:00Z',
      };

      await expect(
        eventService.createEvent('church-123', 'user-123', dto)
      ).rejects.toThrow('End date must be after start date');
    });

    it('should throw error if registration deadline is after start date', async () => {
      const dto = {
        name: 'Invalid Event',
        eventType: EventType.SERVICE,
        startDate: '2026-02-16T10:00:00Z',
        endDate: '2026-02-16T12:00:00Z',
        registrationDeadline: '2026-02-16T11:00:00Z',
      };

      await expect(
        eventService.createEvent('church-123', 'user-123', dto)
      ).rejects.toThrow('Registration deadline must be before event start date');
    });

    it('should create recurring event', async () => {
      const dto = {
        name: 'Weekly Service',
        eventType: EventType.SERVICE,
        startDate: '2026-02-16T10:00:00Z',
        endDate: '2026-02-16T12:00:00Z',
        isRecurring: true,
        recurringPattern: RecurringPattern.WEEKLY,
      };

      const event = await eventService.createEvent('church-123', 'user-123', dto);

      expect(event.isRecurring).toBe(true);
      expect(event.recurringPattern).toBe(RecurringPattern.WEEKLY);
    });
  });

  describe('publishEvent', () => {
    it('should publish draft event', async () => {
      const mockEvent = {
        eventId: 'event-123',
        status: EventStatus.DRAFT,
        name: 'Test Event',
        churchId: 'church-123',
      };

      mockDataSource.getRepository().findOne.mockResolvedValue(mockEvent);
      mockDataSource.getRepository().update.mockResolvedValue({ affected: 1 });
      mockDataSource.getRepository().findOne.mockResolvedValueOnce(mockEvent).mockResolvedValueOnce({
        ...mockEvent,
        status: EventStatus.PUBLISHED,
      });

      const event = await eventService.publishEvent('event-123', 'user-123');

      expect(event.status).toBe(EventStatus.PUBLISHED);
    });

    it('should throw error if event not found', async () => {
      mockDataSource.getRepository().findOne.mockResolvedValue(null);

      await expect(
        eventService.publishEvent('event-123', 'user-123')
      ).rejects.toThrow('Event not found');
    });

    it('should throw error if event is not draft', async () => {
      const mockEvent = {
        eventId: 'event-123',
        status: EventStatus.PUBLISHED,
      };

      mockDataSource.getRepository().findOne.mockResolvedValue(mockEvent);

      await expect(
        eventService.publishEvent('event-123', 'user-123')
      ).rejects.toThrow('Only draft events can be published');
    });
  });

  describe('cancelEvent', () => {
    it('should cancel event successfully', async () => {
      const mockEvent = {
        eventId: 'event-123',
        status: EventStatus.PUBLISHED,
        name: 'Test Event',
        churchId: 'church-123',
      };

      mockDataSource.getRepository().findOne
        .mockResolvedValueOnce(mockEvent)
        .mockResolvedValueOnce({ ...mockEvent, status: EventStatus.CANCELLED });

      const event = await eventService.cancelEvent('event-123', 'user-123');

      expect(event.status).toBe(EventStatus.CANCELLED);
    });
  });

  describe('isEventAtCapacity', () => {
    it('should return true if event is at capacity', async () => {
      const mockEvent = {
        eventId: 'event-123',
        capacity: 100,
        registeredCount: 100,
      };

      mockDataSource.getRepository().findOne.mockResolvedValue(mockEvent);

      const result = await eventService.isEventAtCapacity('event-123');

      expect(result).toBe(true);
    });

    it('should return false if event has available capacity', async () => {
      const mockEvent = {
        eventId: 'event-123',
        capacity: 100,
        registeredCount: 50,
      };

      mockDataSource.getRepository().findOne.mockResolvedValue(mockEvent);

      const result = await eventService.isEventAtCapacity('event-123');

      expect(result).toBe(false);
    });

    it('should return false if event has no capacity limit', async () => {
      const mockEvent = {
        eventId: 'event-123',
        capacity: null,
        registeredCount: 50,
      };

      mockDataSource.getRepository().findOne.mockResolvedValue(mockEvent);

      const result = await eventService.isEventAtCapacity('event-123');

      expect(result).toBe(false);
    });
  });
});
