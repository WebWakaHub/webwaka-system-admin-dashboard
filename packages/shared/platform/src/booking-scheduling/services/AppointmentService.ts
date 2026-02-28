import type { Appointment } from '../types';
export class AppointmentService {
  constructor(private db: any, private eventBus: any) {}
  async createAppointment(data: Partial<Appointment>): Promise<Appointment> {
    const appt = { id: 'appt-1', status: 'confirmed', ...data } as Appointment;
    this.eventBus.emit('appointment.created', appt);
    return appt;
  }
  async getAppointments(userId: string): Promise<Appointment[]> {
    return [{ id: 'appt-1', providerId: userId, clientId: 'client-1', startTime: new Date(), endTime: new Date(), status: 'confirmed' }];
  }
}
