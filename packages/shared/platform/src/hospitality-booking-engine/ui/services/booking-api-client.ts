/**
 * Hospitality Booking Engine - Booking API Client
 * 
 * HTTP client for booking API with offline queue support.
 * 
 * @module hospitality-booking-engine/ui/services/booking-api-client
 * @author webwakaagent4
 */

import axios, { AxiosInstance } from 'axios';
import type {
  AvailabilitySearchRequest,
  AvailabilitySearchResponse,
  CreateBookingRequest,
  CreateBookingResponse,
  GetBookingResponse,
  ModifyBookingRequest,
  ModifyBookingResponse,
  CancelBookingRequest,
  CancelBookingResponse,
} from '../../types';

/**
 * Booking API Client Class
 * 
 * Handles all HTTP requests to the booking API.
 */
class BookingAPIClient {
  private client: AxiosInstance;

  constructor(baseURL: string = '/api/v1') {
    this.client = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for auth token
    this.client.interceptors.request.use((config) => {
      const token = this.getAuthToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          // Server responded with error
          throw new Error(error.response.data?.error?.message || 'API request failed');
        } else if (error.request) {
          // No response received
          throw new Error('Network error. Please check your connection.');
        } else {
          // Request setup error
          throw new Error(error.message || 'Request failed');
        }
      }
    );
  }

  /**
   * Search Availability
   * 
   * POST /api/v1/bookings/search
   */
  async searchAvailability(params: AvailabilitySearchRequest): Promise<AvailabilitySearchResponse> {
    const response = await this.client.post<AvailabilitySearchResponse>('/bookings/search', params);
    return response.data;
  }

  /**
   * Create Booking
   * 
   * POST /api/v1/bookings
   */
  async createBooking(request: CreateBookingRequest): Promise<CreateBookingResponse> {
    const response = await this.client.post<CreateBookingResponse>('/bookings', request);
    return response.data;
  }

  /**
   * Get Booking
   * 
   * GET /api/v1/bookings/:id
   */
  async getBooking(bookingId: string): Promise<GetBookingResponse> {
    const response = await this.client.get<GetBookingResponse>(`/bookings/${bookingId}`);
    return response.data;
  }

  /**
   * Get Booking by Reference
   * 
   * GET /api/v1/bookings/reference/:referenceNumber
   */
  async getBookingByReference(referenceNumber: string): Promise<GetBookingResponse> {
    const response = await this.client.get<GetBookingResponse>(
      `/bookings/reference/${referenceNumber}`
    );
    return response.data;
  }

  /**
   * Modify Booking
   * 
   * PATCH /api/v1/bookings/:id
   */
  async modifyBooking(
    bookingId: string,
    request: ModifyBookingRequest
  ): Promise<ModifyBookingResponse> {
    const response = await this.client.patch<ModifyBookingResponse>(
      `/bookings/${bookingId}`,
      request
    );
    return response.data;
  }

  /**
   * Cancel Booking
   * 
   * POST /api/v1/bookings/:id/cancel
   */
  async cancelBooking(
    bookingId: string,
    request: CancelBookingRequest
  ): Promise<CancelBookingResponse> {
    const response = await this.client.post<CancelBookingResponse>(
      `/bookings/${bookingId}/cancel`,
      request
    );
    return response.data;
  }

  /**
   * Get Auth Token
   * 
   * Retrieves JWT token from localStorage.
   */
  private getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }
}

/**
 * Singleton instance
 */
export const bookingApiClient = new BookingAPIClient();

export default bookingApiClient;
