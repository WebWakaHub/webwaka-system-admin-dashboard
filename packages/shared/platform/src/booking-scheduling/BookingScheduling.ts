import type { BookingConfig } from './types';
import { AppointmentService } from './services/AppointmentService';
import { AvailabilityService } from './services/AvailabilityService';
export class BookingScheduling {
  public appointmentService: AppointmentService;
  public availabilityService: AvailabilityService;
  constructor(config: BookingConfig) {
    this.appointmentService = new AppointmentService(config.database, config.eventBus);
    this.availabilityService = new AvailabilityService(config.database);
  }
  async initialize(): Promise<void> {}
  async shutdown(): Promise<void> {}
}
