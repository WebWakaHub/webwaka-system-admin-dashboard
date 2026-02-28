/**
 * Authentication Middleware
 * Verifies JWT tokens and attaches user info to request
 */

import { Request, Response, NextFunction } from 'express';
import { authService } from '../../identity/auth.service';
import { logger } from '../../../shared/logger';

/**
 * Middleware to verify JWT token
 */
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({
        error: 'Authorization header is required',
      });
      return;
    }

    // Extract token from "Bearer <token>"
    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      res.status(401).json({
        error: 'Invalid authorization header format. Use: Bearer <token>',
      });
      return;
    }

    const token = parts[1];

    // Verify token
    const payload = authService.verifyAccessToken(token);

    // Attach user info to request
    (req as any).user = payload;

    next();
  } catch (error) {
    logger.error('Authentication failed', { error });
    res.status(401).json({
      error: 'Invalid or expired token',
    });
  }
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export function optionalAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      next();
      return;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      next();
      return;
    }

    const token = parts[1];
    const payload = authService.verifyAccessToken(token);
    (req as any).user = payload;

    next();
  } catch (error) {
    // Ignore authentication errors for optional auth
    next();
  }
}

/**
 * Middleware to require tenant context
 */
export function requireTenantMiddleware(req: Request, res: Response, next: NextFunction): void {
  try {
    const tenantId = (req as any).user?.tenantId;
    if (!tenantId) {
      res.status(403).json({
        error: 'Tenant context is required',
      });
      return;
    }

    next();
  } catch (error) {
    logger.error('Tenant validation failed', { error });
    res.status(403).json({
      error: 'Invalid tenant context',
    });
  }
}
