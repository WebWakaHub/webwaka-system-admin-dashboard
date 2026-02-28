/**
 * User Service
 * Handles user management operations
 */

import { Prisma, User } from '@prisma/client';
import { db } from '../../shared/database';
import { logger } from '../../shared/logger';
import * as bcrypt from 'bcrypt';

export interface CreateUserInput {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateUserInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  status?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export class UserService {
  /**
   * Create a new user
   */
  async createUser(input: CreateUserInput): Promise<User> {
    try {
      // Hash password
      const passwordHash = await bcrypt.hash(input.password, 10);

      // Create user
      const user = await db.user.create({
        data: {
          email: input.email,
          passwordHash,
          firstName: input.firstName,
          lastName: input.lastName,
          phone: input.phone,
        },
      });

      logger.info('User created', { userId: user.id, email: user.email });
      return user;
    } catch (error) {
      logger.error('Failed to create user', { error, input: { email: input.email } });
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<User | null> {
    try {
      const user = await db.user.findUnique({
        where: { id: userId },
      });

      return user;
    } catch (error) {
      logger.error('Failed to get user by ID', { error, userId });
      throw error;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const user = await db.user.findUnique({
        where: { email },
      });

      return user;
    } catch (error) {
      logger.error('Failed to get user by email', { error, email });
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(userId: string, input: UpdateUserInput): Promise<User> {
    try {
      const user = await db.user.update({
        where: { id: userId },
        data: input,
      });

      logger.info('User updated', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to update user', { error, userId });
      throw error;
    }
  }

  /**
   * Delete user (soft delete)
   */
  async deleteUser(userId: string): Promise<User> {
    try {
      const user = await db.user.update({
        where: { id: userId },
        data: {
          deletedAt: new Date(),
          status: 'deleted',
        },
      });

      logger.info('User deleted', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to delete user', { error, userId });
      throw error;
    }
  }

  /**
   * List users with pagination
   */
  async listUsers(params: {
    skip?: number;
    take?: number;
    where?: Prisma.UserWhereInput;
  }): Promise<{ users: User[]; total: number }> {
    try {
      const { skip = 0, take = 10, where } = params;

      const [users, total] = await Promise.all([
        db.user.findMany({
          skip,
          take,
          where,
          orderBy: { createdAt: 'desc' },
        }),
        db.user.count({ where }),
      ]);

      return { users, total };
    } catch (error) {
      logger.error('Failed to list users', { error, params });
      throw error;
    }
  }

  /**
   * Verify user password
   */
  async verifyPassword(email: string, password: string): Promise<User | null> {
    try {
      const user = await this.getUserByEmail(email);
      if (!user) {
        return null;
      }

      const isValid = await bcrypt.compare(password, user.passwordHash);
      if (!isValid) {
        return null;
      }

      // Update last login
      await db.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      });

      return user;
    } catch (error) {
      logger.error('Failed to verify password', { error, email });
      throw error;
    }
  }

  /**
   * Verify user email
   */
  async verifyEmail(userId: string): Promise<User> {
    try {
      const user = await db.user.update({
        where: { id: userId },
        data: { emailVerified: true },
      });

      logger.info('User email verified', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to verify email', { error, userId });
      throw error;
    }
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, newPassword: string): Promise<User> {
    try {
      const passwordHash = await bcrypt.hash(newPassword, 10);

      const user = await db.user.update({
        where: { id: userId },
        data: { passwordHash },
      });

      logger.info('User password updated', { userId: user.id });
      return user;
    } catch (error) {
      logger.error('Failed to update password', { error, userId });
      throw error;
    }
  }
}

// Export singleton instance
export const userService = new UserService();
