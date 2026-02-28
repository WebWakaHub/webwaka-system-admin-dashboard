import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import request from 'supertest';
import express from 'express';
import { DonationController } from '../../controllers/DonationController';
import { PaymentMethod } from '../../models/Donation';

describe('Donation API Integration Tests', () => {
  let app: express.Application;
  let dataSource: DataSource;
  let authToken: string;

  beforeAll(async () => {
    // Initialize test database
    dataSource = new DataSource({
      type: 'postgres',
      host: process.env.TEST_DB_HOST || 'localhost',
      port: parseInt(process.env.TEST_DB_PORT || '5432'),
      username: process.env.TEST_DB_USER || 'test',
      password: process.env.TEST_DB_PASSWORD || 'test',
      database: process.env.TEST_DB_NAME || 'webwaka_test',
      synchronize: true,
      entities: ['src/donations/models/*.ts'],
    });

    await dataSource.initialize();

    // Setup Express app
    app = express();
    app.use(express.json());

    const controller = new DonationController(dataSource);

    // Mock authentication middleware
    app.use((req, res, next) => {
      req.user = {
        userId: 'test-user-123',
        churchId: 'test-church-123',
        email: 'test@example.com',
      };
      next();
    });

    // Routes
    app.post('/api/v1/donations', controller.createDonation.bind(controller));
    app.get('/api/v1/donations/:id', controller.getDonation.bind(controller));
    app.get('/api/v1/donations', controller.listDonations.bind(controller));
    app.post('/api/v1/donations/:id/refund', controller.refundDonation.bind(controller));
    app.get('/api/v1/donations/reports/summary', controller.getDonationSummary.bind(controller));

    authToken = 'test-token';
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('POST /api/v1/donations', () => {
    it('should create cash donation', async () => {
      const response = await request(app)
        .post('/api/v1/donations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          donorId: 'donor-123',
          amount: 10000,
          currency: 'NGN',
          paymentMethod: PaymentMethod.CASH,
        });

      expect(response.status).toBe(201);
      expect(response.body.donationId).toBeDefined();
      expect(response.body.status).toBe('COMPLETED');
    });

    it('should create card donation with payment URL', async () => {
      const response = await request(app)
        .post('/api/v1/donations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          donorId: 'donor-123',
          amount: 15000,
          currency: 'NGN',
          paymentMethod: PaymentMethod.CARD,
          donorEmail: 'donor@example.com',
        });

      expect(response.status).toBe(201);
      expect(response.body.donationId).toBeDefined();
      expect(response.body.paymentUrl).toBeDefined();
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/donations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          amount: 10000,
          // Missing donorId and paymentMethod
        });

      expect(response.status).toBe(400);
    });

    it('should link donation to campaign', async () => {
      const response = await request(app)
        .post('/api/v1/donations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          donorId: 'donor-123',
          amount: 20000,
          currency: 'NGN',
          paymentMethod: PaymentMethod.CASH,
          campaignId: 'campaign-123',
        });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/v1/donations/:id', () => {
    it('should retrieve donation by ID', async () => {
      // First create a donation
      const createResponse = await request(app)
        .post('/api/v1/donations')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          donorId: 'donor-123',
          amount: 5000,
          currency: 'NGN',
          paymentMethod: PaymentMethod.CASH,
        });

      const donationId = createResponse.body.donationId;

      // Then retrieve it
      const response = await request(app)
        .get(`/api/v1/donations/${donationId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.donationId).toBe(donationId);
    });

    it('should return 404 for non-existent donation', async () => {
      const response = await request(app)
        .get('/api/v1/donations/non-existent-id')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/v1/donations', () => {
    it('should list donations with pagination', async () => {
      const response = await request(app)
        .get('/api/v1/donations')
        .query({ page: 1, limit: 10 })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.donations).toBeDefined();
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter donations by donor', async () => {
      const response = await request(app)
        .get('/api/v1/donations')
        .query({ donorId: 'donor-123' })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it('should filter donations by date range', async () => {
      const response = await request(app)
        .get('/api/v1/donations')
        .query({
          startDate: '2026-01-01',
          endDate: '2026-12-31',
        })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/v1/donations/reports/summary', () => {
    it('should generate donation summary', async () => {
      const response = await request(app)
        .get('/api/v1/donations/reports/summary')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.totalAmount).toBeDefined();
      expect(response.body.donationCount).toBeDefined();
      expect(response.body.averageAmount).toBeDefined();
    });
  });
});
