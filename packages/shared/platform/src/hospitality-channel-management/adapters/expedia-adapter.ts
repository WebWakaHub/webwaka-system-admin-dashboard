/**
 * Expedia Channel Adapter
 * 
 * Implements integration with Expedia API
 * 
 * @author webwakaagent4
 * @step 438
 */

import axios, { AxiosInstance } from 'axios';
import {
  IChannelAdapter,
  ChannelCredentials,
  RoomTypeInventory,
  RateDistribution,
  AvailabilityDistribution,
  ChannelBookingData,
} from '../types';

export class ExpediaAdapter implements IChannelAdapter {
  private client: AxiosInstance | null = null;
  private credentials: ChannelCredentials | null = null;

  async connect(credentials: ChannelCredentials): Promise<void> {
    this.credentials = credentials;
    
    this.client = axios.create({
      baseURL: 'https://api.expedia.com/v3',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  async disconnect(): Promise<void> {
    this.client = null;
    this.credentials = null;
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) return false;
    
    try {
      const response = await this.client.get('/ping');
      return response.status === 200;
    } catch {
      return false;
    }
  }

  async pushInventory(inventory: RoomTypeInventory[]): Promise<void> {
    if (!this.client) throw new Error('Not connected');

    const expediaInventory = inventory.map(room => ({
      roomTypeId: room.internalRoomTypeId,
      name: { en: room.name },
      description: { en: room.description },
      maxOccupancy: room.maxOccupancy,
      amenities: room.amenities,
      images: room.images,
    }));

    await this.client.post('/properties/rooms', { rooms: expediaInventory });
  }

  async pushRates(rates: RateDistribution[]): Promise<void> {
    if (!this.client) throw new Error('Not connected');

    const expediaRates = rates.map(rate => ({
      roomTypeId: rate.internalRoomTypeId,
      startDate: rate.startDate,
      endDate: rate.endDate,
      rate: rate.basePrice,
      currency: rate.currency,
    }));

    await this.client.post('/properties/rates', { rates: expediaRates });
  }

  async pushAvailability(availability: AvailabilityDistribution[]): Promise<void> {
    if (!this.client) throw new Error('Not connected');

    const expediaAvailability = availability.map(avail => ({
      roomTypeId: avail.internalRoomTypeId,
      date: avail.date,
      available: avail.availableCount,
    }));

    await this.client.post('/properties/availability', { availability: expediaAvailability });
  }

  async pullBookings(startDate: string, endDate: string): Promise<ChannelBookingData[]> {
    if (!this.client) throw new Error('Not connected');

    const response = await this.client.get('/bookings', {
      params: { startDate, endDate },
    });

    return response.data.bookings.map((booking: any) => ({
      channelBookingId: booking.id,
      propertyId: booking.propertyId,
      roomTypeId: booking.roomTypeId,
      checkInDate: booking.checkIn,
      checkOutDate: booking.checkOut,
      guestInfo: {
        firstName: booking.guest.firstName,
        lastName: booking.guest.lastName,
        email: booking.guest.email,
        phone: booking.guest.phone,
      },
      totalAmount: booking.totalPrice,
      currency: booking.currency,
      commissionAmount: booking.commission,
      status: 'confirmed',
    }));
  }

  async confirmBooking(channelBookingId: string): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    await this.client.post(`/bookings/${channelBookingId}/confirm`);
  }

  async cancelBooking(channelBookingId: string): Promise<void> {
    if (!this.client) throw new Error('Not connected');
    await this.client.post(`/bookings/${channelBookingId}/cancel`);
  }
}
