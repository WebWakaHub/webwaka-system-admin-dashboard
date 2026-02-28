/**
 * Hospitality Booking Engine - Booking Controller
 * 
 * Handles HTTP request/response for booking operations.
 * 
 * @module hospitality-booking-engine/api/controllers/booking-controller
 * @author webwakaagent4
 */

import { Request, Response } from 'express';
import { BookingService } from '../../services/booking-service';
import {
  CreateBookingRequest,
  ModifyBookingRequest,
  CancelBookingRequest,
  AvailabilitySearchRequest,
} from '../../types';

/**
 * Booking Controller
 * 
 * Handles all booking-related HTTP requests.
 */
export class BookingController {
  private bookingService: BookingService;

  constructor(bookingService: BookingService) {
    this.bookingService = bookingService;
  }

  /**
   * Search Availability
   * 
   * POST /api/v1/bookings/search
   */
  async searchAvailability(req: Request, res: Response): Promise<void> {
    try {
      const searchRequest: AvailabilitySearchRequest = {
        tenantId: req.body.tenantId || (req as any).user?.tenantId,
        propertyId: req.body.propertyId,
        checkInDate: req.body.checkInDate,
        checkOutDate: req.body.checkOutDate,
        adultsCount: req.body.adultsCount,
        childrenCount: req.body.childrenCount,
        roomTypeId: req.body.roomTypeId,
        minPrice: req.body.minPrice,
        maxPrice: req.body.maxPrice,
        amenities: req.body.amenities,
        sortBy: req.body.sortBy,
        page: req.body.page || 1,
        pageSize: req.body.pageSize || 20,
      };

      // TODO: Implement availability search logic
      // For now, return mock response
      res.status(200).json({
        properties: [],
        pagination: {
          page: searchRequest.page,
          pageSize: searchRequest.pageSize,
          totalItems: 0,
          totalPages: 0,
        },
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Create Booking
   * 
   * POST /api/v1/bookings
   */
  async createBooking(req: Request, res: Response): Promise<void> {
    try {
      const createRequest: CreateBookingRequest = {
        tenantId: req.body.tenantId || (req as any).user?.tenantId,
        propertyId: req.body.propertyId,
        checkInDate: req.body.checkInDate,
        checkOutDate: req.body.checkOutDate,
        adultsCount: req.body.adultsCount,
        childrenCount: req.body.childrenCount,
        rooms: req.body.rooms,
        guest: req.body.guest,
        specialRequests: req.body.specialRequests,
        paymentGateway: req.body.paymentGateway || 'paystack',
      };

      const response = await this.bookingService.createBooking(createRequest);

      res.status(201).json(response);
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Get Booking
   * 
   * GET /api/v1/bookings/:id
   */
  async getBooking(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      const bookingId = req.params.id;

      const response = await this.bookingService.getBooking(tenantId, bookingId);

      res.status(200).json(response);
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Get Booking by Reference
   * 
   * GET /api/v1/bookings/reference/:referenceNumber
   */
  async getBookingByReference(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      const referenceNumber = req.params.referenceNumber;

      // TODO: Implement getBookingByReference in service
      // For now, return mock response
      res.status(200).json({
        booking: {
          id: 'mock-id',
          referenceNumber,
          tenantId,
        },
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Modify Booking
   * 
   * PATCH /api/v1/bookings/:id
   */
  async modifyBooking(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      const bookingId = req.params.id;

      const modifyRequest: ModifyBookingRequest = {
        checkInDate: req.body.checkInDate,
        checkOutDate: req.body.checkOutDate,
        adultsCount: req.body.adultsCount,
        childrenCount: req.body.childrenCount,
        rooms: req.body.rooms,
        specialRequests: req.body.specialRequests,
        version: req.body.version,
      };

      const response = await this.bookingService.modifyBooking(tenantId, bookingId, modifyRequest);

      res.status(200).json(response);
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Cancel Booking
   * 
   * POST /api/v1/bookings/:id/cancel
   */
  async cancelBooking(req: Request, res: Response): Promise<void> {
    try {
      const tenantId = (req as any).user?.tenantId;
      const bookingId = req.params.id;

      const cancelRequest: CancelBookingRequest = {
        reason: req.body.reason,
      };

      const response = await this.bookingService.cancelBooking(tenantId, bookingId, cancelRequest);

      res.status(200).json(response);
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  /**
   * Handle Error
   * 
   * Handles errors and sends appropriate HTTP response.
   */
  private handleError(res: Response, error: any): void {
    console.error('Booking controller error:', error);

    const statusCode = this.getStatusCode(error);
    const errorCode = this.getErrorCode(error);

    res.status(statusCode).json({
      error: {
        code: errorCode,
        message: error.message || 'An error occurred',
        details: error.details || {},
      },
    });
  }

  /**
   * Get Status Code
   * 
   * Maps error type to HTTP status code.
   */
  private getStatusCode(error: any): number {
    if (error.message?.includes('not found')) return 404;
    if (error.message?.includes('not allowed')) return 403;
    if (error.message?.includes('required')) return 400;
    if (error.message?.includes('invalid')) return 400;
    if (error.message?.includes('Concurrent modification')) return 409;
    return 500;
  }

  /**
   * Get Error Code
   * 
   * Maps error type to error code.
   */
  private getErrorCode(error: any): string {
    if (error.message?.includes('not found')) return 'NOT_FOUND';
    if (error.message?.includes('not allowed')) return 'NOT_ALLOWED';
    if (error.message?.includes('required')) return 'VALIDATION_ERROR';
    if (error.message?.includes('invalid')) return 'VALIDATION_ERROR';
    if (error.message?.includes('Concurrent modification')) return 'CONCURRENT_MODIFICATION';
    if (error.message?.includes('not available')) return 'NOT_AVAILABLE';
    return 'INTERNAL_ERROR';
  }
}
