import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { DataSource } from 'typeorm';
import request from 'supertest';
import express from 'express';
import { CampaignController } from '../../controllers/CampaignController';
import { CampaignStatus } from '../../models/Campaign';

describe('Campaign API Integration Tests', () => {
  let app: express.Application;
  let dataSource: DataSource;
  let authToken: string;

  beforeAll(async () => {
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

    app = express();
    app.use(express.json());

    const controller = new CampaignController(dataSource);

    app.use((req, res, next) => {
      req.user = {
        userId: 'test-user-123',
        churchId: 'test-church-123',
      };
      next();
    });

    app.post('/api/v1/campaigns', controller.createCampaign.bind(controller));
    app.get('/api/v1/campaigns/:id', controller.getCampaign.bind(controller));
    app.get('/api/v1/campaigns', controller.listCampaigns.bind(controller));
    app.patch('/api/v1/campaigns/:id/status', controller.updateCampaignStatus.bind(controller));

    authToken = 'test-token';
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('POST /api/v1/campaigns', () => {
    it('should create campaign successfully', async () => {
      const response = await request(app)
        .post('/api/v1/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Building Fund 2026',
          description: 'New church building project',
          goalAmount: 5000000,
          startDate: '2026-03-01',
          endDate: '2026-12-31',
        });

      expect(response.status).toBe(201);
      expect(response.body.campaignId).toBeDefined();
    });

    it('should validate date range', async () => {
      const response = await request(app)
        .post('/api/v1/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Invalid Campaign',
          goalAmount: 100000,
          startDate: '2026-12-31',
          endDate: '2026-01-01', // End before start
        });

      expect(response.status).toBe(400);
    });
  });

  describe('GET /api/v1/campaigns/:id', () => {
    it('should retrieve campaign with progress', async () => {
      const createResponse = await request(app)
        .post('/api/v1/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Campaign',
          goalAmount: 1000000,
          startDate: '2026-02-13',
          endDate: '2026-06-30',
        });

      const campaignId = createResponse.body.campaignId;

      const response = await request(app)
        .get(`/api/v1/campaigns/${campaignId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.campaignId).toBe(campaignId);
      expect(response.body.progress).toBeDefined();
      expect(response.body.progress.percentageComplete).toBeGreaterThanOrEqual(0);
    });
  });

  describe('GET /api/v1/campaigns', () => {
    it('should list all campaigns', async () => {
      const response = await request(app)
        .get('/api/v1/campaigns')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.campaigns).toBeDefined();
      expect(Array.isArray(response.body.campaigns)).toBe(true);
    });

    it('should filter by status', async () => {
      const response = await request(app)
        .get('/api/v1/campaigns')
        .query({ status: CampaignStatus.ACTIVE })
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });
  });

  describe('PATCH /api/v1/campaigns/:id/status', () => {
    it('should update campaign status', async () => {
      const createResponse = await request(app)
        .post('/api/v1/campaigns')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Status Test Campaign',
          goalAmount: 500000,
          startDate: '2026-02-13',
          endDate: '2026-06-30',
        });

      const campaignId = createResponse.body.campaignId;

      const response = await request(app)
        .patch(`/api/v1/campaigns/${campaignId}/status`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ status: CampaignStatus.ACTIVE });

      expect(response.status).toBe(200);
      expect(response.body.status).toBe(CampaignStatus.ACTIVE);
    });
  });
});
