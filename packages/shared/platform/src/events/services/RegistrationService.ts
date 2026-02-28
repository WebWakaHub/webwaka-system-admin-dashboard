import { DataSource } from 'typeorm';
import { Registration, RegistrationStatus, PaymentStatus, TicketType } from '../models/Registration';
import { RegistrationRepository } from '../repositories/RegistrationRepository';
import { EventRepository } from '../repositories/EventRepository';
import { CreateRegistrationDto } from '../dto/CreateRegistrationDto';
import { QRCodeGenerator } from '../utils/QRCodeGenerator';
import { EventEventPublisher } from '../events/EventEventPublisher';
import { v4 as uuidv4 } from 'uuid';

export class RegistrationService {
  private registrationRepository: RegistrationRepository;
  private eventRepository: EventRepository;

  constructor(dataSource: DataSource) {
    this.registrationRepository = new RegistrationRepository(dataSource);
    this.eventRepository = new EventRepository(dataSource);
  }

  /**
   * Register a member for an event
   */
  async registerForEvent(
    churchId: string,
    dto: CreateRegistrationDto
  ): Promise<{ registration: Registration; qrCodeData: string }> {
    // Check if event exists
    const event = await this.eventRepository.findById(dto.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    // Check if registration is required
    if (!event.registrationRequired) {
      throw new Error('Registration is not required for this event');
    }

    // Check registration deadline
    if (event.registrationDeadline && new Date() > event.registrationDeadline) {
      throw new Error('Registration deadline has passed');
    }

    // Check if already registered
    const existing = await this.registrationRepository.findByEventAndMember(
      dto.eventId,
      dto.memberId
    );
    if (existing) {
      throw new Error('Already registered for this event');
    }

    // Check capacity
    if (event.capacity && event.registeredCount >= event.capacity) {
      // Add to waitlist
      const registration = await this.createRegistration(
        churchId,
        dto,
        RegistrationStatus.WAITLIST
      );
      return {
        registration,
        qrCodeData: registration.qrCode,
      };
    }

    // Create registration
    const registration = await this.createRegistration(
      churchId,
      dto,
      RegistrationStatus.CONFIRMED
    );

    // Increment registered count
    await this.eventRepository.incrementRegisteredCount(dto.eventId);

    // Publish event
    await EventEventPublisher.publishMemberRegistered({
      eventId: dto.eventId,
      memberId: dto.memberId,
      registrationId: registration.registrationId,
    });

    return {
      registration,
      qrCodeData: registration.qrCode,
    };
  }

  private async createRegistration(
    churchId: string,
    dto: CreateRegistrationDto,
    status: RegistrationStatus
  ): Promise<Registration> {
    const registrationId = uuidv4();
    const qrCode = QRCodeGenerator.generateQRCode(dto.eventId, dto.memberId, registrationId);

    const paymentStatus = dto.paymentAmount && dto.paymentAmount > 0
      ? PaymentStatus.PENDING
      : PaymentStatus.NOT_REQUIRED;

    return await this.registrationRepository.create({
      registrationId,
      churchId,
      eventId: dto.eventId,
      memberId: dto.memberId,
      registrationDate: new Date(),
      status,
      ticketType: dto.ticketType || TicketType.FREE,
      paymentStatus,
      paymentAmount: dto.paymentAmount,
      qrCode,
      metadata: dto.metadata,
    });
  }

  /**
   * Cancel a registration
   */
  async cancelRegistration(registrationId: string): Promise<Registration> {
    const registration = await this.registrationRepository.findById(registrationId);
    if (!registration) {
      throw new Error('Registration not found');
    }

    if (registration.status === RegistrationStatus.CANCELLED) {
      throw new Error('Registration already cancelled');
    }

    const updated = await this.registrationRepository.update(registrationId, {
      status: RegistrationStatus.CANCELLED,
    });

    if (!updated) {
      throw new Error('Failed to cancel registration');
    }

    // Decrement registered count if was confirmed
    if (registration.status === RegistrationStatus.CONFIRMED) {
      await this.eventRepository.decrementRegisteredCount(registration.eventId);
    }

    await EventEventPublisher.publishRegistrationCancelled({
      eventId: registration.eventId,
      memberId: registration.memberId,
      registrationId: registration.registrationId,
    });

    return updated;
  }

  /**
   * Get registration by QR code
   */
  async getRegistrationByQRCode(qrCode: string): Promise<Registration | null> {
    if (!QRCodeGenerator.validateQRCode(qrCode)) {
      throw new Error('Invalid QR code format');
    }
    return await this.registrationRepository.findByQrCode(qrCode);
  }

  /**
   * Get registrations for an event
   */
  async getEventRegistrations(eventId: string, status?: RegistrationStatus): Promise<Registration[]> {
    return await this.registrationRepository.findByEventId(eventId, status);
  }

  /**
   * Get member's registrations
   */
  async getMemberRegistrations(memberId: string): Promise<Registration[]> {
    return await this.registrationRepository.findByMemberId(memberId);
  }
}
