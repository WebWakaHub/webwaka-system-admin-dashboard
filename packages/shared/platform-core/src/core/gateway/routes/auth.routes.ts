/**
 * Authentication API Routes
 * Handles user authentication endpoints
 */

import { Router, Request, Response } from 'express';
import { authService } from '../../identity/auth.service';
import { userService } from '../../identity/user.service';
import { logger } from '../../../shared/logger';

const router = Router();

/**
 * POST /auth/register
 * Register a new user
 */
router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Check if user already exists
    const existingUser = await userService.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({
        error: 'User with this email already exists',
      });
    }

    // Create user
    const user = await userService.createUser({
      email,
      password,
      firstName,
      lastName,
      phone,
    });

    // Remove password hash from response
    const { passwordHash, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error('Registration failed', { error });
    res.status(500).json({
      error: 'Failed to register user',
    });
  }
});

/**
 * POST /auth/login
 * Login user
 */
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, tenantId } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required',
      });
    }

    // Login
    const result = await authService.login({ email, password, tenantId });

    res.json({
      message: 'Login successful',
      ...result,
    });
  } catch (error) {
    logger.error('Login failed', { error });
    res.status(401).json({
      error: error instanceof Error ? error.message : 'Invalid credentials',
    });
  }
});

/**
 * POST /auth/refresh
 * Refresh access token
 */
router.post('/refresh', async (req: Request, res: Response) => {
  try {
    const { refreshToken } = req.body;

    // Validate input
    if (!refreshToken) {
      return res.status(400).json({
        error: 'Refresh token is required',
      });
    }

    // Refresh token
    const tokens = await authService.refreshAccessToken(refreshToken);

    res.json({
      message: 'Token refreshed successfully',
      ...tokens,
    });
  } catch (error) {
    logger.error('Token refresh failed', { error });
    res.status(401).json({
      error: 'Invalid or expired refresh token',
    });
  }
});

/**
 * POST /auth/logout
 * Logout user
 */
router.post('/logout', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;

    if (userId) {
      await authService.logout(userId);
    }

    res.json({
      message: 'Logout successful',
    });
  } catch (error) {
    logger.error('Logout failed', { error });
    res.status(500).json({
      error: 'Failed to logout',
    });
  }
});

export default router;
