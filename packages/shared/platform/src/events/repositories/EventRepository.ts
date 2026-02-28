import { DataSource, Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Event, EventStatus, EventType } from '../models/Event';

export class EventRepository {
  private repository: Repository<Event>;

  constructor(dataSource: DataSource) {
    this.repository = dataSource.getRepository(Event);
  }

  async create(data: Partial<Event>): Promise<Event> {
    const event = this.repository.create(data);
    return await this.repository.save(event);
  }

  async findById(eventId: string): Promise<Event | null> {
    return await this.repository.findOne({ where: { eventId } });
  }

  async findByChurchId(
    churchId: string,
    filters?: {
      status?: EventStatus;
      eventType?: EventType;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ events: Event[]; total: number }> {
    const where: any = { churchId };

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.eventType) {
      where.eventType = filters.eventType;
    }

    if (filters?.startDate && filters?.endDate) {
      where.startDate = Between(filters.startDate, filters.endDate);
    } else if (filters?.startDate) {
      where.startDate = MoreThanOrEqual(filters.startDate);
    } else if (filters?.endDate) {
      where.startDate = LessThanOrEqual(filters.endDate);
    }

    const [events, total] = await this.repository.findAndCount({
      where,
      order: { startDate: 'DESC' },
    });

    return { events, total };
  }

  async update(eventId: string, data: Partial<Event>): Promise<Event | null> {
    await this.repository.update({ eventId }, data);
    return await this.findById(eventId);
  }

  async delete(eventId: string): Promise<boolean> {
    const result = await this.repository.delete({ eventId });
    return (result.affected ?? 0) > 0;
  }

  async incrementRegisteredCount(eventId: string): Promise<void> {
    await this.repository.increment({ eventId }, 'registeredCount', 1);
  }

  async decrementRegisteredCount(eventId: string): Promise<void> {
    await this.repository.decrement({ eventId }, 'registeredCount', 1);
  }

  async incrementAttendedCount(eventId: string): Promise<void> {
    await this.repository.increment({ eventId }, 'attendedCount', 1);
  }

  async getUpcomingEvents(churchId: string, limit: number = 10): Promise<Event[]> {
    return await this.repository.find({
      where: {
        churchId,
        status: EventStatus.PUBLISHED,
        startDate: MoreThanOrEqual(new Date()),
      },
      order: { startDate: 'ASC' },
      take: limit,
    });
  }
}
