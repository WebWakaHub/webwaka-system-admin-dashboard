import { EventEmitter } from 'events';
import { Volunteer } from '../models/volunteer';

export class VolunteerService {
  constructor(private repository: any, private eventEmitter: EventEmitter) {}

  async createVolunteer(data: any, userId: string): Promise<Volunteer> {
    const volunteer = new Volunteer({
      ...data,
      id: `volunteer-${Date.now()}`,
      status: 'active',
    });

    await this.repository.create(volunteer);
    this.eventEmitter.emit('volunteer.registered', {
      volunteerId: volunteer.id,
      createdBy: userId,
    });

    return volunteer;
  }

  async recordHours(volunteerId: string, hours: number): Promise<Volunteer> {
    const volunteer = await this.repository.findById(volunteerId);
    volunteer.hoursContributed += hours;
    await this.repository.update(volunteer);

    this.eventEmitter.emit('volunteer.hours.recorded', {
      volunteerId,
      hours,
      totalHours: volunteer.hoursContributed,
    });

    return volunteer;
  }
}
