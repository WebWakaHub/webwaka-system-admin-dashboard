import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AttendanceService } from '../services/AttendanceService';
import { CheckInMethod } from '../models/Attendance';

describe('AttendanceService', () => {
  let attendanceService: AttendanceService;
  let mockDataSource: any;

  beforeEach(() => {
    mockDataSource = {
      getRepository: vi.fn((entity) => {
        if (entity.name === 'Registration') {
          return {
            findOne: vi.fn(),
            count: vi.fn(() => Promise.resolve(100)),
          };
        }
        if (entity.name === 'Event') {
          return {
            findOne: vi.fn(),
            increment: vi.fn(),
          };
        }
        return {
          create: vi.fn((data) => data),
          save: vi.fn((data) => Promise.resolve({ ...data, attendanceId: 'att-123' })),
          findOne: vi.fn(),
          find: vi.fn(() => Promise.resolve([])),
          count: vi.fn(() => Promise.resolve(80)),
        };
      }),
    };

    attendanceService = new AttendanceService(mockDataSource);
  });

  describe('checkIn', () => {
    it('should check in with QR code successfully', async () => {
      const mockRegistration = {
        registrationId: 'reg-123',
        eventId: 'event-123',
        memberId: 'member-123',
        qrCode: 'EVT-a1b2c3d4-e5f6g7h8-ABC123-1707849600000',
      };

      const mockEvent = {
        eventId: 'event-123',
        name: 'Test Event',
      };

      mockDataSource.getRepository().findOne
        .mockResolvedValueOnce(mockRegistration) // Registration lookup
        .mockResolvedValueOnce(mockEvent) // Event lookup
        .mockResolvedValueOnce(null); // No existing attendance

      const dto = {
        eventId: 'event-123',
        qrCode: 'EVT-a1b2c3d4-e5f6g7h8-ABC123-1707849600000',
        checkInMethod: CheckInMethod.QR_CODE,
      };

      const attendance = await attendanceService.checkIn('church-123', 'user-123', dto);

      expect(attendance.eventId).toBe('event-123');
      expect(attendance.memberId).toBe('member-123');
      expect(attendance.checkInMethod).toBe(CheckInMethod.QR_CODE);
    });

    it('should check in with member ID successfully', async () => {
      const mockEvent = {
        eventId: 'event-123',
        name: 'Test Event',
      };

      mockDataSource.getRepository().findOne
        .mockResolvedValueOnce(mockEvent) // Event lookup
        .mockResolvedValueOnce(null); // No existing attendance

      const dto = {
        eventId: 'event-123',
        memberId: 'member-123',
        checkInMethod: CheckInMethod.MANUAL,
      };

      const attendance = await attendanceService.checkIn('church-123', 'user-123', dto);

      expect(attendance.eventId).toBe('event-123');
      expect(attendance.memberId).toBe('member-123');
      expect(attendance.checkInMethod).toBe(CheckInMethod.MANUAL);
    });

    it('should throw error if QR code is invalid', async () => {
      mockDataSource.getRepository().findOne.mockResolvedValue(null);

      const dto = {
        eventId: 'event-123',
        qrCode: 'INVALID-QR-CODE',
        checkInMethod: CheckInMethod.QR_CODE,
      };

      await expect(
        attendanceService.checkIn('church-123', 'user-123', dto)
      ).rejects.toThrow('Invalid QR code');
    });

    it('should throw error if QR code is for different event', async () => {
      const mockRegistration = {
        registrationId: 'reg-123',
        eventId: 'event-456',
        memberId: 'member-123',
        qrCode: 'EVT-a1b2c3d4-e5f6g7h8-ABC123-1707849600000',
      };

      mockDataSource.getRepository().findOne.mockResolvedValue(mockRegistration);

      const dto = {
        eventId: 'event-123',
        qrCode: 'EVT-a1b2c3d4-e5f6g7h8-ABC123-1707849600000',
        checkInMethod: CheckInMethod.QR_CODE,
      };

      await expect(
        attendanceService.checkIn('church-123', 'user-123', dto)
      ).rejects.toThrow('QR code is not valid for this event');
    });

    it('should throw error if member ID or QR code not provided', async () => {
      const dto = {
        eventId: 'event-123',
        checkInMethod: CheckInMethod.MANUAL,
      };

      await expect(
        attendanceService.checkIn('church-123', 'user-123', dto)
      ).rejects.toThrow('Member ID or QR code is required');
    });

    it('should throw error if event not found', async () => {
      mockDataSource.getRepository().findOne.mockResolvedValue(null);

      const dto = {
        eventId: 'event-123',
        memberId: 'member-123',
        checkInMethod: CheckInMethod.MANUAL,
      };

      await expect(
        attendanceService.checkIn('church-123', 'user-123', dto)
      ).rejects.toThrow('Event not found');
    });

    it('should throw error if already checked in', async () => {
      const mockEvent = {
        eventId: 'event-123',
        name: 'Test Event',
      };

      const existingAttendance = {
        attendanceId: 'att-456',
        eventId: 'event-123',
        memberId: 'member-123',
      };

      mockDataSource.getRepository().findOne
        .mockResolvedValueOnce(mockEvent)
        .mockResolvedValueOnce(existingAttendance);

      const dto = {
        eventId: 'event-123',
        memberId: 'member-123',
        checkInMethod: CheckInMethod.MANUAL,
      };

      await expect(
        attendanceService.checkIn('church-123', 'user-123', dto)
      ).rejects.toThrow('Member already checked in');
    });
  });

  describe('getAttendanceStats', () => {
    it('should calculate attendance statistics', async () => {
      const stats = await attendanceService.getAttendanceStats('event-123');

      expect(stats.totalRegistrations).toBe(100);
      expect(stats.totalAttendance).toBe(80);
      expect(stats.attendanceRate).toBe(80);
    });
  });
});
