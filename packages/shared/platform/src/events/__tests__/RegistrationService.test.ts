import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RegistrationService } from '../services/RegistrationService';
import { RegistrationStatus, TicketType } from '../models/Registration';

describe('RegistrationService', () => {
  let registrationService: RegistrationService;
  let mockDataSource: any;

  beforeEach(() => {
    mockDataSource = {
      getRepository: vi.fn((entity) => {
        if (entity.name === 'Event') {
          return {
            findOne: vi.fn(),
            increment: vi.fn(),
            decrement: vi.fn(),
          };
        }
        return {
          create: vi.fn((data) => data),
          save: vi.fn((data) => Promise.resolve({ ...data, registrationId: 'reg-123' })),
          findOne: vi.fn(),
          find: vi.fn(() => Promise.resolve([])),
          update: vi.fn(),
          count: vi.fn(() => Promise.resolve(0)),
        };
      }),
    };

    registrationService = new RegistrationService(mockDataSource);
  });

  describe('registerForEvent', () => {
    it('should register member successfully', async () => {
      const mockEvent = {
        eventId: 'event-123',
        registrationRequired: true,
        capacity: 100,
        registeredCount: 50,
        registrationDeadline: new Date('2026-03-01'),
      };

      mockDataSource.getRepository().findOne
        .mockResolvedValueOnce(mockEvent) // Event lookup
        .mockResolvedValueOnce(null); // No existing registration

      const dto = {
        eventId: 'event-123',
        memberId: 'member-123',
        ticketType: TicketType.FREE,
      };

      const result = await registrationService.registerForEvent('church-123', dto);

      expect(result.registration.status).toBe(RegistrationStatus.CONFIRMED);
      expect(result.qrCodeData).toBeDefined();
    });

    it('should throw error if event not found', async () => {
      mockDataSource.getRepository().findOne.mockResolvedValue(null);

      const dto = {
        eventId: 'event-123',
        memberId: 'member-123',
      };

      await expect(
        registrationService.registerForEvent('church-123', dto)
      ).rejects.toThrow('Event not found');
    });

    it('should throw error if registration not required', async () => {
      const mockEvent = {
        eventId: 'event-123',
        registrationRequired: false,
      };

      mockDataSource.getRepository().findOne.mockResolvedValue(mockEvent);

      const dto = {
        eventId: 'event-123',
        memberId: 'member-123',
      };

      await expect(
        registrationService.registerForEvent('church-123', dto)
      ).rejects.toThrow('Registration is not required for this event');
    });

    it('should throw error if registration deadline passed', async () => {
      const mockEvent = {
        eventId: 'event-123',
        registrationRequired: true,
        registrationDeadline: new Date('2020-01-01'),
      };

      mockDataSource.getRepository().findOne.mockResolvedValue(mockEvent);

      const dto = {
        eventId: 'event-123',
        memberId: 'member-123',
      };

      await expect(
        registrationService.registerForEvent('church-123', dto)
      ).rejects.toThrow('Registration deadline has passed');
    });

    it('should throw error if already registered', async () => {
      const mockEvent = {
        eventId: 'event-123',
        registrationRequired: true,
        registrationDeadline: new Date('2026-03-01'),
      };

      const existingRegistration = {
        registrationId: 'reg-456',
        eventId: 'event-123',
        memberId: 'member-123',
      };

      mockDataSource.getRepository().findOne
        .mockResolvedValueOnce(mockEvent)
        .mockResolvedValueOnce(existingRegistration);

      const dto = {
        eventId: 'event-123',
        memberId: 'member-123',
      };

      await expect(
        registrationService.registerForEvent('church-123', dto)
      ).rejects.toThrow('Already registered for this event');
    });

    it('should add to waitlist if event is at capacity', async () => {
      const mockEvent = {
        eventId: 'event-123',
        registrationRequired: true,
        capacity: 100,
        registeredCount: 100,
        registrationDeadline: new Date('2026-03-01'),
      };

      mockDataSource.getRepository().findOne
        .mockResolvedValueOnce(mockEvent)
        .mockResolvedValueOnce(null);

      const dto = {
        eventId: 'event-123',
        memberId: 'member-123',
      };

      const result = await registrationService.registerForEvent('church-123', dto);

      expect(result.registration.status).toBe(RegistrationStatus.WAITLIST);
    });
  });

  describe('cancelRegistration', () => {
    it('should cancel registration successfully', async () => {
      const mockRegistration = {
        registrationId: 'reg-123',
        status: RegistrationStatus.CONFIRMED,
        eventId: 'event-123',
        memberId: 'member-123',
      };

      mockDataSource.getRepository().findOne
        .mockResolvedValueOnce(mockRegistration)
        .mockResolvedValueOnce({ ...mockRegistration, status: RegistrationStatus.CANCELLED });

      const result = await registrationService.cancelRegistration('reg-123');

      expect(result.status).toBe(RegistrationStatus.CANCELLED);
    });

    it('should throw error if registration not found', async () => {
      mockDataSource.getRepository().findOne.mockResolvedValue(null);

      await expect(
        registrationService.cancelRegistration('reg-123')
      ).rejects.toThrow('Registration not found');
    });

    it('should throw error if already cancelled', async () => {
      const mockRegistration = {
        registrationId: 'reg-123',
        status: RegistrationStatus.CANCELLED,
      };

      mockDataSource.getRepository().findOne.mockResolvedValue(mockRegistration);

      await expect(
        registrationService.cancelRegistration('reg-123')
      ).rejects.toThrow('Registration already cancelled');
    });
  });
});
