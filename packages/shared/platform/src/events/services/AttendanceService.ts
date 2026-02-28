import { DataSource } from 'typeorm';
import { Attendance, CheckInMethod } from '../models/Attendance';
import { AttendanceRepository } from '../repositories/AttendanceRepository';
import { RegistrationRepository } from '../repositories/RegistrationRepository';
import { EventRepository } from '../repositories/EventRepository';
import { CheckInDto } from '../dto/CheckInDto';
import { EventEventPublisher } from '../events/EventEventPublisher';
import { v4 as uuidv4 } from 'uuid';

export class AttendanceService {
  private attendanceRepository: AttendanceRepository;
  private registrationRepository: RegistrationRepository;
  private eventRepository: EventRepository;

  constructor(dataSource: DataSource) {
    this.attendanceRepository = new AttendanceRepository(dataSource);
    this.registrationRepository = new RegistrationRepository(dataSource);
    this.eventRepository = new EventRepository(dataSource);
  }

  /**
   * Check in a member to an event
   */
  async checkIn(
    churchId: string,
    userId: string,
    dto: CheckInDto
  ): Promise<Attendance> {
    // Determine member ID
    let memberId = dto.memberId;

    // If QR code is provided, validate and extract member ID
    if (dto.qrCode) {
      const registration = await this.registrationRepository.findByQrCode(dto.qrCode);
      if (!registration) {
        throw new Error('Invalid QR code');
      }

      if (registration.eventId !== dto.eventId) {
        throw new Error('QR code is not valid for this event');
      }

      memberId = registration.memberId;
    }

    if (!memberId) {
      throw new Error('Member ID or QR code is required');
    }

    // Check if event exists
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if already checked in
    const existing = await this.attendanceRepository.findByEventAndMember(
      dto.eventId,
      memberId
    );
    if (existing) {
      throw new Error('Member already checked in');
    }

    // Create attendance record
    const attendance = await this.attendanceRepository.create({
      attendanceId: uuidv4(),
      churchId,
      eventId: dto.eventId,
      memberId,
      checkInTime: new Date(),
      checkInMethod: dto.checkInMethod,
      checkedInBy: userId,
      qrCodeUsed: dto.qrCode,
      metadata: dto.metadata,
    });

    // Increment attended count
    await this.eventRepository.incrementAttendedCount(dto.eventId);

    // Publish event
    await EventEventPublisher.publishMemberCheckedIn({
      eventId: dto.eventId,
      memberId,
      attendanceId: attendance.attendanceId,
      checkInMethod: dto.checkInMethod,
    });

    return attendance;
  }

  /**
   * Get attendance for an event
   */
  async getEventAttendance(eventId: string): Promise<Attendance[]> {
    return await this.attendanceRepository.findByEventId(eventId);
  }

  /**
   * Get member's attendance history
   */
  async getMemberAttendance(memberId: string): Promise<Attendance[]> {
    return await this.attendanceRepository.findByMemberId(memberId);
  }

  /**
   * Get attendance statistics for an event
   */
  async getAttendanceStats(eventId: string): Promise<{
    totalRegistrations: number;
    totalAttendance: number;
    attendanceRate: number;
  }> {
    const totalRegistrations = await this.registrationRepository.countByEvent(eventId);
    const totalAttendance = await this.attendanceRepository.countByEvent(eventId);
    const attendanceRate = await this.attendanceRepository.getAttendanceRate(
      eventId,
      totalRegistrations
    );

    return {
      totalRegistrations,
      totalAttendance,
      attendanceRate,
    };
  }
}
