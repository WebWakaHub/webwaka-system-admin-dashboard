import type { AvailabilitySlot } from '../types';
export class AvailabilityService {
  constructor(private db: any) {}
  async getAvailableSlots(providerId: string, date: Date): Promise<AvailabilitySlot[]> {
    return [{ id: 'slot-1', providerId, startTime: new Date(), endTime: new Date(), isAvailable: true }];
  }
}
