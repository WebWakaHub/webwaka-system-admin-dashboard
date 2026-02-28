/**
 * Request Logger Middleware
 * 
 * Logs all API requests and responses with correlation IDs,
 * duration, and user context for debugging and monitoring.
 * 
 * @module hospitality-booking-engine/api/middleware/request-logger
 * @author webwakaagent4
 */

import { Request, Response, NextFunction } from 'express';
import { generateCorrelationId, logRequest, logResponse } from '../../utils/logger';

/**
 * Request logger middleware
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Generate correlation ID
  const correlationId = generateCorrelationId();
  (req as any).correlationId = correlationId;
  
  // Add correlation ID to response headers
  res.setHeader('X-Correlation-ID', correlationId);
  
  // Get user context
  const userId = (req as any).user?.id;
  const tenantId = (req as any).user?.tenantId;
  
  // Log request
  logRequest(req.method, req.path, correlationId, userId, tenantId);
  
  // Capture start time
  const startTime = Date.now();
  
  // Override res.json to log response
  const originalJson = res.json.bind(res);
  res.json = function (body: any) {
    const duration = Date.now() - startTime;
    logResponse(req.method, req.path, res.statusCode, duration, correlationId);
    return originalJson(body);
  };
  
  // Override res.send to log response
  const originalSend = res.send.bind(res);
  res.send = function (body: any) {
    const duration = Date.now() - startTime;
    logResponse(req.method, req.path, res.statusCode, duration, correlationId);
    return originalSend(body);
  };
  
  next();
}

export default requestLogger;
