export interface BookingConfig { database: any; eventBus: any; }
export interface Appointment { id: string; providerId: string; clientId: string; startTime: Date; endTime: Date; status: string; }
export interface AvailabilitySlot { id: string; providerId: string; startTime: Date; endTime: Date; isAvailable: boolean; }
