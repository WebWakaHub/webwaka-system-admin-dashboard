/**
 * Hospitality Booking Engine - API Integration Tests
 * 
 * Integration tests for Booking API endpoints with real Express server.
 * Tests HTTP request/response, authentication, validation, and error handling.
 * 
 * @module hospitality-booking-engine/__tests__/integration/api/booking-api.integration.test
 * @author webwakaagent5
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import request from 'supertest';
import express, { Express } from 'express';
import { bookingRoutes } from '../../../api/routes/booking-routes';
import { BookingService } from '../../../services/booking-service';
import { EventPublisher } from '../../../events/event-publisher';
import { PaymentGatewayAdapter } from '../../../adapters/payment-gateway-adapter';
import { BookingStatus, PaymentStatus } from '../../../types';

describe('Booking API Integration Tests', () => {
  let app: Express;
  let authToken: string;
  let testTenantId: string;

  beforeAll(async () => {
    // Setup Express app
    app = express();
    app.use(express.json());
    
    // Mock authentication middleware
    app.use((req, res, next) => {
      req.user = {
        id: 'user_123',
        tenantId: 'tenant_123',
        email: 'test@example.com',
      };
      next();
    });

    // Mount booking routes
    app.use('/api/v1/bookings', bookingRoutes);

    // Setup test data
    authToken = 'Bearer test_token_123';
    testTenantId = 'tenant_123';
  });

  afterAll(async () => {
    // Cleanup
  });

  describe('POST /api/v1/bookings/search', () => {
    it('should search available rooms successfully', async () => {
      const searchRequest = {
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        adultsCount: 2,
        childrenCount: 0,
        page: 1,
        pageSize: 20,
      };

      const response = await request(app)
        .post('/api/v1/bookings/search')
        .set('Authorization', authToken)
        .send(searchRequest)
        .expect(200);

      expect(response.body).toBeDefined();
      expect(response.body.properties).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.pageSize).toBe(20);
    });

    it('should return 400 for missing checkInDate', async () => {
      const invalidRequest = {
        checkOutDate: '2026-03-05',
        adultsCount: 2,
      };

      const response = await request(app)
        .post('/api/v1/bookings/search')
        .set('Authorization', authToken)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error).toBeDefined();
      expect(response.body.error.message).toContain('checkInDate');
    });

    it('should return 400 for invalid date range', async () => {
      const invalidRequest = {
        checkInDate: '2026-03-05',
        checkOutDate: '2026-03-01', // Before check-in
        adultsCount: 2,
      };

      const response = await request(app)
        .post('/api/v1/bookings/search')
        .set('Authorization', authToken)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error.message).toContain('Check-out date must be after check-in');
    });

    it('should return 401 without authentication', async () => {
      const searchRequest = {
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        adultsCount: 2,
      };

      await request(app)
        .post('/api/v1/bookings/search')
        .send(searchRequest)
        .expect(401);
    });
  });

  describe('POST /api/v1/bookings', () => {
    it('should create booking successfully', async () => {
      const createRequest = {
        propertyId: 'property_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        adultsCount: 2,
        childrenCount: 0,
        rooms: [
          {
            roomTypeId: 'room_type_123',
            ratePlanId: 'rate_plan_123',
            quantity: 1,
          },
        ],
        guest: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phone: '+2348012345678',
          ndprConsent: true,
        },
        paymentGateway: 'paystack',
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', authToken)
        .send(createRequest)
        .expect(201);

      expect(response.body.bookingId).toBeDefined();
      expect(response.body.referenceNumber).toBeDefined();
      expect(response.body.status).toBe(BookingStatus.PENDING);
      expect(response.body.totalAmount).toBeGreaterThan(0);
      expect(response.body.paymentUrl).toBeDefined();
      expect(response.body.expiresAt).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const invalidRequest = {
        propertyId: 'property_123',
        // Missing checkInDate, checkOutDate, etc.
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', authToken)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error).toBeDefined();
    });

    it('should return 400 for invalid phone format', async () => {
      const invalidRequest = {
        propertyId: 'property_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        adultsCount: 2,
        rooms: [{ roomTypeId: 'room_type_123', ratePlanId: 'rate_plan_123', quantity: 1 }],
        guest: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '08012345678', // Invalid format
          ndprConsent: true,
        },
        paymentGateway: 'paystack',
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', authToken)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error.message).toContain('+234');
    });

    it('should return 400 for missing NDPR consent', async () => {
      const invalidRequest = {
        propertyId: 'property_123',
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        adultsCount: 2,
        rooms: [{ roomTypeId: 'room_type_123', ratePlanId: 'rate_plan_123', quantity: 1 }],
        guest: {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '+2348012345678',
          ndprConsent: false, // No consent
        },
        paymentGateway: 'paystack',
      };

      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', authToken)
        .send(invalidRequest)
        .expect(400);

      expect(response.body.error.message).toContain('NDPR consent');
    });
  });

  describe('GET /api/v1/bookings/:id', () => {
    it('should retrieve booking by ID', async () => {
      const bookingId = 'booking_123';

      const response = await request(app)
        .get(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.booking).toBeDefined();
      expect(response.body.booking.id).toBe(bookingId);
      expect(response.body.booking.tenantId).toBe(testTenantId);
    });

    it('should return 404 for non-existent booking', async () => {
      const response = await request(app)
        .get('/api/v1/bookings/invalid_id')
        .set('Authorization', authToken)
        .expect(404);

      expect(response.body.error.message).toContain('not found');
    });

    it('should return 403 for booking from different tenant', async () => {
      // Mock booking from different tenant
      const response = await request(app)
        .get('/api/v1/bookings/other_tenant_booking')
        .set('Authorization', authToken)
        .expect(403);

      expect(response.body.error.message).toContain('access');
    });
  });

  describe('GET /api/v1/bookings/reference/:referenceNumber', () => {
    it('should retrieve booking by reference number', async () => {
      const referenceNumber = 'BK123456';

      const response = await request(app)
        .get(`/api/v1/bookings/reference/${referenceNumber}`)
        .set('Authorization', authToken)
        .expect(200);

      expect(response.body.booking).toBeDefined();
      expect(response.body.booking.referenceNumber).toBe(referenceNumber);
    });

    it('should return 404 for invalid reference number', async () => {
      await request(app)
        .get('/api/v1/bookings/reference/INVALID')
        .set('Authorization', authToken)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/bookings/:id', () => {
    it('should modify booking successfully', async () => {
      const bookingId = 'booking_123';
      const modifyRequest = {
        checkInDate: '2026-03-02',
        adultsCount: 3,
        version: 1,
      };

      const response = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', authToken)
        .send(modifyRequest)
        .expect(200);

      expect(response.body.booking).toBeDefined();
      expect(response.body.booking.id).toBe(bookingId);
      expect(response.body.modificationFee).toBeDefined();
    });

    it('should return 409 for concurrent modification', async () => {
      const bookingId = 'booking_123';
      const modifyRequest = {
        checkInDate: '2026-03-02',
        version: 999, // Wrong version
      };

      const response = await request(app)
        .patch(`/api/v1/bookings/${bookingId}`)
        .set('Authorization', authToken)
        .send(modifyRequest)
        .expect(409);

      expect(response.body.error.message).toContain('Concurrent modification');
    });

    it('should return 400 for cancelled booking', async () => {
      const cancelledBookingId = 'cancelled_booking_123';
      const modifyRequest = {
        adultsCount: 3,
        version: 1,
      };

      const response = await request(app)
        .patch(`/api/v1/bookings/${cancelledBookingId}`)
        .set('Authorization', authToken)
        .send(modifyRequest)
        .expect(400);

      expect(response.body.error.message).toContain('cancelled');
    });
  });

  describe('POST /api/v1/bookings/:id/cancel', () => {
    it('should cancel booking successfully', async () => {
      const bookingId = 'booking_123';
      const cancelRequest = {
        reason: 'Change of plans',
      };

      const response = await request(app)
        .post(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Authorization', authToken)
        .send(cancelRequest)
        .expect(200);

      expect(response.body.status).toBe(BookingStatus.CANCELLED);
      expect(response.body.cancellationDate).toBeDefined();
      expect(response.body.refundAmount).toBeDefined();
      expect(response.body.refundStatus).toBeDefined();
    });

    it('should return 400 for missing cancellation reason', async () => {
      const bookingId = 'booking_123';

      const response = await request(app)
        .post(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      expect(response.body.error.message).toContain('reason');
    });

    it('should return 400 for cancellation within 24 hours', async () => {
      const bookingId = 'imminent_booking_123';
      const cancelRequest = {
        reason: 'Emergency',
      };

      const response = await request(app)
        .post(`/api/v1/bookings/${bookingId}/cancel`)
        .set('Authorization', authToken)
        .send(cancelRequest)
        .expect(400);

      expect(response.body.error.message).toContain('24 hours');
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits', async () => {
      const searchRequest = {
        checkInDate: '2026-03-01',
        checkOutDate: '2026-03-05',
        adultsCount: 2,
      };

      // Make multiple requests rapidly
      const requests = Array(101).fill(null).map(() =>
        request(app)
          .post('/api/v1/bookings/search')
          .set('Authorization', authToken)
          .send(searchRequest)
      );

      const responses = await Promise.all(requests);
      const rateLimited = responses.filter(r => r.status === 429);

      expect(rateLimited.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should return 500 for internal server errors', async () => {
      // Trigger internal error by sending malformed data
      const response = await request(app)
        .post('/api/v1/bookings')
        .set('Authorization', authToken)
        .set('Content-Type', 'application/json')
        .send('invalid json')
        .expect(500);

      expect(response.body.error).toBeDefined();
    });

    it('should return proper error format', async () => {
      const response = await request(app)
        .post('/api/v1/bookings/search')
        .set('Authorization', authToken)
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('error');
      expect(response.body.error).toHaveProperty('code');
      expect(response.body.error).toHaveProperty('message');
      expect(response.body.error).toHaveProperty('timestamp');
    });
  });
});
