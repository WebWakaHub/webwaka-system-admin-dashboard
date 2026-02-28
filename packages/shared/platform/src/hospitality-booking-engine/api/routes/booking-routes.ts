/**
 * Hospitality Booking Engine - Booking API Routes
 * 
 * Defines REST API routes for booking management.
 * 
 * @module hospitality-booking-engine/api/routes/booking-routes
 * @author webwakaagent4
 */

import { Router } from 'express';
import { BookingController } from '../controllers/booking-controller';

/**
 * Create Booking Routes
 * 
 * Creates Express router with all booking-related routes.
 */
export function createBookingRoutes(bookingController: BookingController): Router {
  const router = Router();

  /**
   * POST /api/v1/bookings/search
   * 
   * Search for available rooms
   */
  router.post('/search', async (req, res, next) => {
    try {
      await bookingController.searchAvailability(req, res);
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/v1/bookings
   * 
   * Create new booking
   */
  router.post('/', async (req, res, next) => {
    try {
      await bookingController.createBooking(req, res);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/v1/bookings/:id
   * 
   * Get booking details by ID
   */
  router.get('/:id', async (req, res, next) => {
    try {
      await bookingController.getBooking(req, res);
    } catch (error) {
      next(error);
    }
  });

  /**
   * GET /api/v1/bookings/reference/:referenceNumber
   * 
   * Get booking details by reference number
   */
  router.get('/reference/:referenceNumber', async (req, res, next) => {
    try {
      await bookingController.getBookingByReference(req, res);
    } catch (error) {
      next(error);
    }
  });

  /**
   * PATCH /api/v1/bookings/:id
   * 
   * Modify existing booking
   */
  router.patch('/:id', async (req, res, next) => {
    try {
      await bookingController.modifyBooking(req, res);
    } catch (error) {
      next(error);
    }
  });

  /**
   * POST /api/v1/bookings/:id/cancel
   * 
   * Cancel booking
   */
  router.post('/:id/cancel', async (req, res, next) => {
    try {
      await bookingController.cancelBooking(req, res);
    } catch (error) {
      next(error);
    }
  });

  return router;
}
