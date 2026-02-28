/**
 * Booking.com Channel Adapter
 * 
 * Implements integration with Booking.com API
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

export class BookingComAdapter implements IChannelAdapter {
  private client: AxiosInstance | null = null;
  private credentials: ChannelCredentials | null = null;

  async connect(credentials: ChannelCredentials): Promise<void> {
    this.credentials = credentials;
    
    // Initialize axios client with OAuth token
    this.client = axios.create({
      baseURL: 'https://api.booking.com/v1',
      headers: {
        'Authorization': `Bearer ${credentials.accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });

    // Set up token refresh interceptor
    this.client.interceptors.response.use(
      response => response,
      async error => {
        if (error.response?.status === 401 && credentials.refreshToken) {
          // Refresh token logic
          const newToken = await this.refreshAccessToken(credentials.refreshToken);
          credentials.accessToken = newToken;
          error.config.headers['Authorization'] = `Bearer ${newToken}`;
          return axios.request(error.config);
        }
        return Promise.reject(error);
      }
    );
  }

  async disconnect(): Promise<void> {
    this.client = null;
    this.credentials = null;
  }

  async testConnection(): Promise<boolean> {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    try {
      const response = await this.client.get('/health');
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  async pushInventory(inventory: RoomTypeInventory[]): Promise<void> {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    // Transform to Booking.com format
    const bookingComInventory = inventory.map(room => ({
      room_type_id: room.internalRoomTypeId,
      name: room.name,
      description: room.description,
      max_persons: room.maxOccupancy,
      facilities: this.mapAmenities(room.amenities),
      photos: room.images.map((url, index) => ({
        url,
        sort_order: index,
      })),
    }));

    await this.client.post('/inventory/rooms', {
      rooms: bookingComInventory,
    });
  }

  async pushRates(rates: RateDistribution[]): Promise<void> {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    // Transform to Booking.com format
    const bookingComRates = rates.map(rate => ({
      room_type_id: rate.internalRoomTypeId,
      date_from: rate.startDate,
      date_to: rate.endDate,
      price: rate.basePrice,
      currency: rate.currency,
      restrictions: {
        min_length_of_stay: rate.restrictions?.minLengthOfStay,
        max_length_of_stay: rate.restrictions?.maxLengthOfStay,
        closed_to_arrival: rate.restrictions?.closedToArrival,
        closed_to_departure: rate.restrictions?.closedToDeparture,
      },
    }));

    await this.client.post('/rates', {
      rates: bookingComRates,
    });
  }

  async pushAvailability(availability: AvailabilityDistribution[]): Promise<void> {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    // Transform to Booking.com format
    const bookingComAvailability = availability.map(avail => ({
      room_type_id: avail.internalRoomTypeId,
      date: avail.date,
      availability: avail.availableCount,
      status: avail.status === 'available' ? 'open' : 'closed',
    }));

    await this.client.post('/availability', {
      availability: bookingComAvailability,
    });
  }

  async pullBookings(startDate: string, endDate: string): Promise<ChannelBookingData[]> {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    const response = await this.client.get('/bookings', {
      params: {
        date_from: startDate,
        date_to: endDate,
      },
    });

    // Transform from Booking.com format
    return response.data.bookings.map((booking: any) => ({
      channelBookingId: booking.booking_id,
      propertyId: booking.hotel_id,
      roomTypeId: booking.room_type_id,
      checkInDate: booking.checkin_date,
      checkOutDate: booking.checkout_date,
      guestInfo: {
        firstName: booking.guest.first_name,
        lastName: booking.guest.last_name,
        email: booking.guest.email,
        phone: booking.guest.phone,
      },
      totalAmount: booking.total_price,
      currency: booking.currency,
      commissionAmount: booking.commission,
      status: this.mapBookingStatus(booking.status),
    }));
  }

  async confirmBooking(channelBookingId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    await this.client.post(`/bookings/${channelBookingId}/confirm`);
  }

  async cancelBooking(channelBookingId: string): Promise<void> {
    if (!this.client) {
      throw new Error('Not connected. Call connect() first.');
    }

    await this.client.post(`/bookings/${channelBookingId}/cancel`);
  }

  private async refreshAccessToken(refreshToken: string): Promise<string> {
    const response = await axios.post('https://api.booking.com/oauth/token', {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
    });

    return response.data.access_token;
  }

  private mapAmenities(amenities: string[]): string[] {
    // Map internal amenity codes to Booking.com facility codes
    const amenityMap: Record<string, string> = {
      'wifi': 'free_wifi',
      'parking': 'free_parking',
      'pool': 'swimming_pool',
      'gym': 'fitness_center',
      'restaurant': 'restaurant',
      'tv': 'flat_screen_tv',
      'minibar': 'minibar',
      'air-conditioning': 'air_conditioning',
    };

    return amenities.map(a => amenityMap[a] || a);
  }

  private mapBookingStatus(status: string): 'confirmed' | 'cancelled' | 'modified' {
    const statusMap: Record<string, 'confirmed' | 'cancelled' | 'modified'> = {
      'confirmed': 'confirmed',
      'cancelled': 'cancelled',
      'modified': 'modified',
    };

    return statusMap[status] || 'confirmed';
  }
}
