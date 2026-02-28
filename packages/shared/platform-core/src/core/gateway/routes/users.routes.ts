/**
 * User Management API Routes
 * Handles user CRUD operations
 */

import { Router, Request, Response } from 'express';
import { userService } from '../../identity/user.service';
import { logger } from '../../../shared/logger';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * GET /users/me
 * Get current user profile
 */
router.get('/me', async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user.userId;

    const user = await userService.getUserById(userId);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error('Failed to get current user', { error });
    res.status(500).json({
      error: 'Failed to get user profile',
    });
  }
});

/**
 * GET /users/:id
 * Get user by ID
 */
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await userService.getUserById(id);
    if (!user) {
      return res.status(404).json({
        error: 'User not found',
      });
    }

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error('Failed to get user', { error });
    res.status(500).json({
      error: 'Failed to get user',
    });
  }
});

/**
 * GET /users
 * List users with pagination
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const skip = parseInt(req.query.skip as string) || 0;
    const take = parseInt(req.query.take as string) || 10;
    const status = req.query.status as string;

    const where: any = {};
    if (status) {
      where.status = status;
    }

    const { users, total } = await userService.listUsers({ skip, take, where });

    // Remove password hashes
    const usersWithoutPasswords = users.map(({ passwordHash, ...user }) => user);

    res.json({
      users: usersWithoutPasswords,
      total,
      skip,
      take,
    });
  } catch (error) {
    logger.error('Failed to list users', { error });
    res.status(500).json({
      error: 'Failed to list users',
    });
  }
});

/**
 * PUT /users/:id
 * Update user
 */
router.put('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { firstName, lastName, phone, status } = req.body;

    const user = await userService.updateUser(id, {
      firstName,
      lastName,
      phone,
      status,
    });

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      message: 'User updated successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error('Failed to update user', { error });
    res.status(500).json({
      error: 'Failed to update user',
    });
  }
});

/**
 * DELETE /users/:id
 * Delete user (soft delete)
 */
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await userService.deleteUser(id);

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      message: 'User deleted successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error('Failed to delete user', { error });
    res.status(500).json({
      error: 'Failed to delete user',
    });
  }
});

/**
 * POST /users/:id/verify-email
 * Verify user email
 */
router.post('/:id/verify-email', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const user = await userService.verifyEmail(id);

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      message: 'Email verified successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error('Failed to verify email', { error });
    res.status(500).json({
      error: 'Failed to verify email',
    });
  }
});

/**
 * POST /users/:id/change-password
 * Change user password
 */
router.post('/:id/change-password', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    // Validate input
    if (!newPassword) {
      return res.status(400).json({
        error: 'New password is required',
      });
    }

    const user = await userService.updatePassword(id, newPassword);

    // Remove password hash
    const { passwordHash, ...userWithoutPassword } = user;

    res.json({
      message: 'Password changed successfully',
      user: userWithoutPassword,
    });
  } catch (error) {
    logger.error('Failed to change password', { error });
    res.status(500).json({
      error: 'Failed to change password',
    });
  }
});

export default router;
