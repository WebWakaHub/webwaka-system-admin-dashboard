/**
 * Hospitality Booking Engine - Booking Service
 * 
 * Core business logic for booking management including creation, modification,
 * cancellation, and retrieval. Implements domain-driven design with booking aggregate.
 * 
 * @module hospitality-booking-engine/services/booking-service
 * @author webwakaagent4
 */

import { v4 as uuidv4 } from 'uuid';
import { 
  BookingStatus, 
  PaymentStatus,
  CreateBookingRequest, 
  CreateBookingResponse,
  ModifyBookingRequest,
  ModifyBookingResponse,
  CancelBookingRequest,
  CancelBookingResponse,
  GetBookingResponse,
  BookingDetails,
  RefundStatus,
} from '../types';
import { EventPublisher } from '../events/event-publisher';
import { PaymentGatewayAdapter } from '../adapters/payment-gateway-adapter';

/**
 * Booking Service Class
 * 
 * Handles all booking-related business logic with proper state management,
 * validation, and event emission.
 */
export class BookingService {
  private eventPublisher: EventPublisher;
  private paymentGatewayAdapter: PaymentGatewayAdapter;

  constructor(
    eventPublisher: EventPublisher,
    paymentGatewayAdapter: PaymentGatewayAdapter
  ) {
    this.eventPublisher = eventPublisher;
    this.paymentGatewayAdapter = paymentGatewayAdapter;
  }

  /**
   * Create Booking
   * 
   * Creates a new booking with validation, inventory check, and payment initialization.
   * Emits booking.created event on success.
   * 
   * @param request - Create booking request data
   * @returns Create booking response with payment URL
   * @throws ValidationError if input is invalid
   * @throws AvailabilityError if rooms not available
   */
  async createBooking(request: CreateBookingRequest): Promise<CreateBookingResponse> {
    // Step 1: Validate request
    this.validateCreateBookingRequest(request);

    // Step 2: Validate dates
    this.validateDateRange(request.checkInDate, request.checkOutDate);

    // Step 3: Check room availability (would query property management module)
    await this.checkRoomAvailability(
      request.tenantId,
      request.propertyId,
      request.rooms,
      request.checkInDate,
      request.checkOutDate
    );

    // Step 4: Create or retrieve guest
    const guestId = await this.createOrRetrieveGuest(request.tenantId, request.guest);

    // Step 5: Calculate total amount
    const totalAmount = await this.calculateTotalAmount(
      request.propertyId,
      request.rooms,
      request.checkInDate,
      request.checkOutDate
    );

    // Step 6: Generate booking reference
    const referenceNumber = this.generateBookingReference();

    // Step 7: Create booking record
    const bookingId = uuidv4();
    const booking = {
      id: bookingId,
      tenantId: request.tenantId,
      referenceNumber,
      propertyId: request.propertyId,
      guestId,
      checkInDate: new Date(request.checkInDate),
      checkOutDate: new Date(request.checkOutDate),
      adultsCount: request.adultsCount,
      childrenCount: request.childrenCount || 0,
      totalAmount,
      currency: 'NGN',
      status: BookingStatus.PENDING,
      specialRequests: request.specialRequests,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Step 8: Save booking to database (would use Drizzle ORM)
    await this.saveBooking(booking);

    // Step 9: Save booking rooms
    await this.saveBookingRooms(bookingId, request.rooms, totalAmount);

    // Step 10: Initialize payment
    const paymentResponse = await this.paymentGatewayAdapter.initializePayment({
      bookingId,
      amount: totalAmount,
      currency: 'NGN',
      gateway: request.paymentGateway,
      email: request.guest.email,
      metadata: {
        referenceNumber,
        propertyId: request.propertyId,
        guestName: `${request.guest.firstName} ${request.guest.lastName}`,
      },
    });

    if (!paymentResponse.success) {
      throw new Error(`Payment initialization failed: ${paymentResponse.error}`);
    }

    // Step 11: Emit booking.created event
    await this.eventPublisher.publishBookingCreated({
      bookingId,
      referenceNumber,
      tenantId: request.tenantId,
      propertyId: request.propertyId,
      guestId,
      checkInDate: request.checkInDate,
      checkOutDate: request.checkOutDate,
      totalAmount,
      currency: 'NGN',
      rooms: request.rooms.map(room => ({
        roomTypeId: room.roomTypeId,
        quantity: room.quantity,
      })),
    });

    // Step 12: Return response
    return {
      bookingId,
      referenceNumber,
      status: BookingStatus.PENDING,
      totalAmount,
      currency: 'NGN',
      paymentUrl: paymentResponse.paymentUrl!,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes expiry
    };
  }

  /**
   * Get Booking
   * 
   * Retrieves booking details by ID with tenant isolation.
   * 
   * @param tenantId - Tenant ID for isolation
   * @param bookingId - Booking ID
   * @returns Booking details
   * @throws NotFoundError if booking not found
   */
  async getBooking(tenantId: string, bookingId: string): Promise<GetBookingResponse> {
    // Query booking with joins (would use Drizzle ORM)
    const booking = await this.fetchBookingById(tenantId, bookingId);

    if (!booking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    return {
      booking: this.mapToBookingDetails(booking),
    };
  }

  /**
   * Modify Booking
   * 
   * Modifies existing booking with optimistic locking and validation.
   * Emits booking.modified event on success.
   * 
   * @param tenantId - Tenant ID for isolation
   * @param bookingId - Booking ID
   * @param request - Modification request data
   * @returns Modified booking details
   * @throws ConcurrencyError if version mismatch
   * @throws ValidationError if modification not allowed
   */
  async modifyBooking(
    tenantId: string,
    bookingId: string,
    request: ModifyBookingRequest
  ): Promise<ModifyBookingResponse> {
    // Step 1: Fetch current booking
    const currentBooking = await this.fetchBookingById(tenantId, bookingId);

    if (!currentBooking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    // Step 2: Check optimistic lock
    if (currentBooking.version !== request.version) {
      throw new Error('Concurrent modification detected. Please refresh and try again.');
    }

    // Step 3: Validate modification allowed
    if (currentBooking.status === BookingStatus.CANCELLED) {
      throw new Error('Cannot modify cancelled booking');
    }

    // Step 4: Track changes
    const changes: Array<{ field: string; oldValue: any; newValue: any }> = [];

    // Step 5: Apply modifications
    const updatedBooking = { ...currentBooking };

    if (request.checkInDate && request.checkInDate !== currentBooking.checkInDate.toISOString()) {
      changes.push({
        field: 'checkInDate',
        oldValue: currentBooking.checkInDate.toISOString(),
        newValue: request.checkInDate,
      });
      updatedBooking.checkInDate = new Date(request.checkInDate);
    }

    if (request.checkOutDate && request.checkOutDate !== currentBooking.checkOutDate.toISOString()) {
      changes.push({
        field: 'checkOutDate',
        oldValue: currentBooking.checkOutDate.toISOString(),
        newValue: request.checkOutDate,
      });
      updatedBooking.checkOutDate = new Date(request.checkOutDate);
    }

    if (request.adultsCount && request.adultsCount !== currentBooking.adultsCount) {
      changes.push({
        field: 'adultsCount',
        oldValue: currentBooking.adultsCount,
        newValue: request.adultsCount,
      });
      updatedBooking.adultsCount = request.adultsCount;
    }

    if (request.specialRequests !== undefined) {
      changes.push({
        field: 'specialRequests',
        oldValue: currentBooking.specialRequests,
        newValue: request.specialRequests,
      });
      updatedBooking.specialRequests = request.specialRequests;
    }

    // Step 6: Recalculate price if dates or rooms changed
    let priceAdjustment = 0;
    if (request.checkInDate || request.checkOutDate || request.rooms) {
      const newTotalAmount = await this.calculateTotalAmount(
        currentBooking.propertyId,
        request.rooms || [],
        updatedBooking.checkInDate.toISOString(),
        updatedBooking.checkOutDate.toISOString()
      );
      priceAdjustment = newTotalAmount - currentBooking.totalAmount;
      updatedBooking.totalAmount = newTotalAmount;
    }

    // Step 7: Increment version
    updatedBooking.version = currentBooking.version + 1;
    updatedBooking.updatedAt = new Date();

    // Step 8: Save updated booking
    await this.updateBooking(updatedBooking);

    // Step 9: Emit booking.modified event
    await this.eventPublisher.publishBookingModified({
      bookingId,
      referenceNumber: currentBooking.referenceNumber,
      tenantId,
      changes,
    });

    // Step 10: Return response
    return {
      booking: this.mapToBookingDetails(updatedBooking),
      priceAdjustment: priceAdjustment !== 0 ? priceAdjustment : undefined,
      paymentRequired: priceAdjustment > 0,
      paymentUrl: priceAdjustment > 0 
        ? (await this.paymentGatewayAdapter.initializePayment({
            bookingId,
            amount: priceAdjustment,
            currency: 'NGN',
            gateway: 'paystack', // Default gateway
            email: '', // Would fetch from guest
            metadata: { type: 'modification_payment' },
          })).paymentUrl
        : undefined,
    };
  }

  /**
   * Cancel Booking
   * 
   * Cancels booking with refund calculation based on cancellation policy.
   * Emits booking.cancelled event on success.
   * 
   * @param tenantId - Tenant ID for isolation
   * @param bookingId - Booking ID
   * @param request - Cancellation request data
   * @returns Cancellation confirmation with refund details
   * @throws ValidationError if cancellation not allowed
   */
  async cancelBooking(
    tenantId: string,
    bookingId: string,
    request: CancelBookingRequest
  ): Promise<CancelBookingResponse> {
    // Step 1: Fetch current booking
    const currentBooking = await this.fetchBookingById(tenantId, bookingId);

    if (!currentBooking) {
      throw new Error(`Booking not found: ${bookingId}`);
    }

    // Step 2: Validate cancellation allowed
    if (currentBooking.status === BookingStatus.CANCELLED) {
      throw new Error('Booking already cancelled');
    }

    if (currentBooking.status === BookingStatus.CHECKED_OUT) {
      throw new Error('Cannot cancel completed booking');
    }

    // Step 3: Check cancellation policy
    const hoursUntilCheckIn = this.calculateHoursUntilCheckIn(currentBooking.checkInDate);
    
    if (hoursUntilCheckIn < 24) {
      throw new Error('Cancellation not allowed within 24 hours of check-in');
    }

    // Step 4: Calculate refund amount
    const refundAmount = this.calculateRefundAmount(
      currentBooking.totalAmount,
      hoursUntilCheckIn
    );

    // Step 5: Update booking status
    const updatedBooking = {
      ...currentBooking,
      status: BookingStatus.CANCELLED,
      cancellationReason: request.reason,
      cancellationDate: new Date(),
      refundAmount,
      refundStatus: refundAmount > 0 ? RefundStatus.PENDING : undefined,
      updatedAt: new Date(),
    };

    await this.updateBooking(updatedBooking);

    // Step 6: Process refund if applicable
    if (refundAmount > 0) {
      await this.processRefund(bookingId, refundAmount);
    }

    // Step 7: Emit booking.cancelled event
    await this.eventPublisher.publishBookingCancelled({
      bookingId,
      referenceNumber: currentBooking.referenceNumber,
      tenantId,
      cancellationReason: request.reason,
      refundAmount,
      refundStatus: refundAmount > 0 ? RefundStatus.PENDING : RefundStatus.COMPLETED,
    });

    // Step 8: Return response
    return {
      bookingId,
      status: BookingStatus.CANCELLED,
      refundAmount,
      refundStatus: refundAmount > 0 ? RefundStatus.PENDING : RefundStatus.COMPLETED,
      cancellationDate: updatedBooking.cancellationDate!.toISOString(),
    };
  }

  /**
   * Private Helper Methods
   */

  private validateCreateBookingRequest(request: CreateBookingRequest): void {
    if (!request.tenantId) throw new Error('Tenant ID is required');
    if (!request.propertyId) throw new Error('Property ID is required');
    if (!request.checkInDate) throw new Error('Check-in date is required');
    if (!request.checkOutDate) throw new Error('Check-out date is required');
    if (!request.adultsCount || request.adultsCount < 1) throw new Error('At least one adult required');
    if (!request.rooms || request.rooms.length === 0) throw new Error('At least one room required');
    if (!request.guest) throw new Error('Guest information is required');
    if (!request.guest.ndprConsent) throw new Error('NDPR consent is required');
    
    // Validate phone format
    if (!request.guest.phone.match(/^\+234\d{10}$/)) {
      throw new Error('Phone number must be in +234XXXXXXXXXX format');
    }
    
    // Validate email format
    if (!request.guest.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      throw new Error('Invalid email format');
    }
  }

  private validateDateRange(checkInDate: string, checkOutDate: string): void {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const now = new Date();

    if (checkIn < now) {
      throw new Error('Check-in date cannot be in the past');
    }

    if (checkOut <= checkIn) {
      throw new Error('Check-out date must be after check-in date');
    }

    const maxStay = 90; // Maximum 90 days stay
    const daysDiff = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysDiff > maxStay) {
      throw new Error(`Maximum stay is ${maxStay} days`);
    }
  }

  private async checkRoomAvailability(
    tenantId: string,
    propertyId: string,
    rooms: any[],
    checkInDate: string,
    checkOutDate: string
  ): Promise<void> {
    // TODO: Query property management module for availability
    // This would emit an event or make an API call to check inventory
    // For now, assume rooms are available
    return Promise.resolve();
  }

  private async createOrRetrieveGuest(tenantId: string, guestData: any): Promise<string> {
    // TODO: Query guests table or create new guest
    // For now, return a mock guest ID
    return Promise.resolve(uuidv4());
  }

  private async calculateTotalAmount(
    propertyId: string,
    rooms: any[],
    checkInDate: string,
    checkOutDate: string
  ): Promise<number> {
    // TODO: Calculate total based on room rates and number of nights
    // For now, return mock amount
    const nights = Math.ceil(
      (new Date(checkOutDate).getTime() - new Date(checkInDate).getTime()) / (1000 * 60 * 60 * 24)
    );
    return Promise.resolve(25000 * nights * rooms.length); // ₦25,000 per night per room
  }

  private generateBookingReference(): string {
    const prefix = 'BK';
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${prefix}${timestamp}${random}`;
  }

  private async saveBooking(booking: any): Promise<void> {
    // TODO: Use Drizzle ORM to insert booking
    return Promise.resolve();
  }

  private async saveBookingRooms(bookingId: string, rooms: any[], totalAmount: number): Promise<void> {
    // TODO: Use Drizzle ORM to insert booking rooms
    return Promise.resolve();
  }

  private async fetchBookingById(tenantId: string, bookingId: string): Promise<any> {
    // TODO: Use Drizzle ORM to fetch booking with joins
    // For now, return mock booking
    return Promise.resolve({
      id: bookingId,
      tenantId,
      referenceNumber: 'BK123456',
      propertyId: uuidv4(),
      guestId: uuidv4(),
      checkInDate: new Date('2026-03-01'),
      checkOutDate: new Date('2026-03-05'),
      adultsCount: 2,
      childrenCount: 0,
      totalAmount: 100000,
      currency: 'NGN',
      status: BookingStatus.CONFIRMED,
      version: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  private async updateBooking(booking: any): Promise<void> {
    // TODO: Use Drizzle ORM to update booking
    return Promise.resolve();
  }

  private mapToBookingDetails(booking: any): BookingDetails {
    // TODO: Map database entity to DTO
    return {
      id: booking.id,
      referenceNumber: booking.referenceNumber,
      tenantId: booking.tenantId,
      propertyId: booking.propertyId,
      propertyName: 'Mock Property',
      checkInDate: booking.checkInDate.toISOString(),
      checkOutDate: booking.checkOutDate.toISOString(),
      adultsCount: booking.adultsCount,
      childrenCount: booking.childrenCount,
      rooms: [],
      guest: {
        id: booking.guestId,
        firstName: 'Mock',
        lastName: 'Guest',
        email: 'guest@example.com',
        phone: '+2348012345678',
      },
      totalAmount: booking.totalAmount,
      currency: booking.currency,
      status: booking.status,
      createdAt: booking.createdAt.toISOString(),
      updatedAt: booking.updatedAt.toISOString(),
    };
  }

  private calculateHoursUntilCheckIn(checkInDate: Date): number {
    const now = new Date();
    return Math.ceil((checkInDate.getTime() - now.getTime()) / (1000 * 60 * 60));
  }

  private calculateRefundAmount(totalAmount: number, hoursUntilCheckIn: number): number {
    // Refund policy:
    // - More than 7 days (168 hours): 100% refund
    // - 3-7 days (72-168 hours): 50% refund
    // - 1-3 days (24-72 hours): 25% refund
    // - Less than 24 hours: No refund

    if (hoursUntilCheckIn >= 168) {
      return totalAmount; // 100% refund
    } else if (hoursUntilCheckIn >= 72) {
      return totalAmount * 0.5; // 50% refund
    } else if (hoursUntilCheckIn >= 24) {
      return totalAmount * 0.25; // 25% refund
    } else {
      return 0; // No refund
    }
  }

  private async processRefund(bookingId: string, refundAmount: number): Promise<void> {
    // TODO: Call payment gateway adapter to process refund
    return Promise.resolve();
  }
}
