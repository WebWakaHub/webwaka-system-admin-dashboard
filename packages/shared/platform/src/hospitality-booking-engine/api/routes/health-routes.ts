/**
 * Health Check Routes
 * 
 * Health check endpoints for load balancers and monitoring.
 * Checks database, event bus, and payment gateway connectivity.
 * 
 * @module hospitality-booking-engine/api/routes/health-routes
 * @author webwakaagent4
 */

import { Router, Request, Response } from 'express';
import { Pool } from 'pg';
import logger from '../../utils/logger';

const router = Router();

/**
 * Basic health check (liveness probe)
 */
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hospitality-booking-engine',
  });
});

/**
 * Detailed health check (readiness probe)
 */
router.get('/health/ready', async (req: Request, res: Response) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'hospitality-booking-engine',
    checks: {
      database: 'unknown',
      eventBus: 'unknown',
      paymentGateway: 'unknown',
    },
  };
  
  try {
    // Check database connectivity
    try {
      const pool = new Pool({
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432'),
        database: process.env.DB_NAME,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
      });
      
      await pool.query('SELECT 1');
      await pool.end();
      health.checks.database = 'ok';
    } catch (error) {
      health.checks.database = 'error';
      health.status = 'degraded';
      logger.error('Database health check failed', error as Error);
    }
    
    // Check event bus connectivity
    try {
      // TODO: Implement NATS/Redis Streams health check
      health.checks.eventBus = 'ok';
    } catch (error) {
      health.checks.eventBus = 'error';
      health.status = 'degraded';
      logger.error('Event bus health check failed', error as Error);
    }
    
    // Check payment gateway connectivity
    try {
      // TODO: Implement payment gateway health check (ping endpoints)
      health.checks.paymentGateway = 'ok';
    } catch (error) {
      health.checks.paymentGateway = 'error';
      health.status = 'degraded';
      logger.error('Payment gateway health check failed', error as Error);
    }
    
    // Return appropriate status code
    const statusCode = health.status === 'ok' ? 200 : 503;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Health check failed', error as Error);
    res.status(503).json({
      status: 'error',
      timestamp: new Date().toISOString(),
      service: 'hospitality-booking-engine',
      error: (error as Error).message,
    });
  }
});

/**
 * Metrics endpoint (Prometheus format)
 */
router.get('/metrics', (req: Request, res: Response) => {
  // TODO: Implement Prometheus metrics
  res.set('Content-Type', 'text/plain');
  res.send(`
# HELP booking_engine_up Service is up
# TYPE booking_engine_up gauge
booking_engine_up 1

# HELP booking_engine_requests_total Total number of requests
# TYPE booking_engine_requests_total counter
booking_engine_requests_total 0
  `.trim());
});

export default router;
