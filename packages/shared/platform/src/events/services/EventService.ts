import { DataSource } from 'typeorm';
import { Event, EventStatus } from '../models/Event';
import { EventRepository } from '../repositories/EventRepository';
import { CreateEventDto } from '../dto/CreateEventDto';
import { EventEventPublisher } from '../events/EventEventPublisher';
import { v4 as uuidv4 } from 'uuid';

export class EventService {
  private eventRepository: EventRepository;

  constructor(dataSource: DataSource) {
    this.eventRepository = new EventRepository(dataSource);
  }

  /**
   * Create a new event
   */
  async createEvent(
    churchId: string,
    userId: string,
    dto: CreateEventDto
  ): Promise<Event> {
    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new Error('End date must be after start date');
    }

    if (dto.registrationDeadline) {
      const deadline = new Date(dto.registrationDeadline);
      if (deadline >= startDate) {
        throw new Error('Registration deadline must be before event start date');
      }
    }

    // Create event
    const event = await this.eventRepository.create({
      eventId: uuidv4(),
      churchId,
      name: dto.name,
      description: dto.description,
      eventType: dto.eventType,
      startDate,
      endDate,
      location: dto.location,
      capacity: dto.capacity,
      registrationRequired: dto.registrationRequired || false,
      registrationDeadline: dto.registrationDeadline ? new Date(dto.registrationDeadline) : undefined,
      isRecurring: dto.isRecurring || false,
      recurringPattern: dto.recurringPattern,
      status: EventStatus.DRAFT,
      createdBy: userId,
      metadata: dto.metadata,
      registeredCount: 0,
      attendedCount: 0,
    });

    // Publish event
    await EventEventPublisher.publishEventCreated({
      eventId: event.eventId,
      churchId: event.churchId,
      name: event.name,
      eventType: event.eventType,
      startDate: event.startDate,
    });

    return event;
  }

  /**
   * Get event by ID
   */
  async getEvent(eventId: string): Promise<Event | null> {
    return await this.eventRepository.findById(eventId);
  }

  /**
   * List events for a church
   */
  async listEvents(
    churchId: string,
    filters?: {
      status?: EventStatus;
      eventType?: any;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ events: Event[]; total: number }> {
    return await this.eventRepository.findByChurchId(churchId, filters);
  }

  /**
   * Publish an event (make it visible to members)
   */
  async publishEvent(eventId: string, userId: string): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    if (event.status !== EventStatus.DRAFT) {
      throw new Error('Only draft events can be published');
    }

    const updatedEvent = await this.eventRepository.update(eventId, {
      status: EventStatus.PUBLISHED,
    });

    if (!updatedEvent) {
      throw new Error('Failed to publish event');
    }

    await EventEventPublisher.publishEventPublished({
      eventId: updatedEvent.eventId,
      churchId: updatedEvent.churchId,
      name: updatedEvent.name,
    });

    return updatedEvent;
  }

  /**
   * Cancel an event
   */
  async cancelEvent(eventId: string, userId: string): Promise<Event> {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    const updatedEvent = await this.eventRepository.update(eventId, {
      status: EventStatus.CANCELLED,
    });

    if (!updatedEvent) {
      throw new Error('Failed to cancel event');
    }

    await EventEventPublisher.publishEventCancelled({
      eventId: updatedEvent.eventId,
      churchId: updatedEvent.churchId,
      name: updatedEvent.name,
    });

    return updatedEvent;
  }

  /**
   * Get upcoming events
   */
  async getUpcomingEvents(churchId: string, limit: number = 10): Promise<Event[]> {
    return await this.eventRepository.getUpcomingEvents(churchId, limit);
  }

  /**
   * Check if event is at capacity
   */
  async isEventAtCapacity(eventId: string): Promise<boolean> {
    const event = await this.eventRepository.findById(eventId);
    if (!event || !event.capacity) return false;
    return event.registeredCount >= event.capacity;
  }
}
