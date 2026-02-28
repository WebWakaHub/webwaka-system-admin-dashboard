/**
 * Authentication Service
 * Handles user authentication and JWT token management
 */

import { User } from '@prisma/client';
import * as jwt from 'jsonwebtoken';
import { userService } from './user.service';
import { tenantService } from './tenant.service';
import { logger } from '../../shared/logger';

export interface LoginInput {
  email: string;
  password: string;
  tenantId?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface TokenPayload {
  userId: string;
  email: string;
  tenantId?: string;
  roleId?: string;
  type: 'access' | 'refresh';
}

export class AuthService {
  private readonly JWT_SECRET = process.env.JWT_SECRET || 'webwaka-secret-key-change-in-production';
  private readonly JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'webwaka-refresh-secret-key';
  private readonly ACCESS_TOKEN_EXPIRY = '15m'; // 15 minutes
  private readonly REFRESH_TOKEN_EXPIRY = '7d'; // 7 days

  /**
   * Login user with email and password
   */
  async login(input: LoginInput): Promise<AuthTokens & { user: Omit<User, 'passwordHash'> }> {
    try {
      // Verify credentials
      const user = await userService.verifyPassword(input.email, input.password);
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Check if user is active
      if (user.status !== 'active') {
        throw new Error('User account is not active');
      }

      // If tenantId provided, verify user belongs to tenant
      let roleId: string | undefined;
      if (input.tenantId) {
        const isInTenant = await tenantService.isUserInTenant(input.tenantId, user.id);
        if (!isInTenant) {
          throw new Error('User does not belong to this tenant');
        }

        // Get user's role in tenant
        const tenantUsers = await tenantService.getTenantUsers(input.tenantId);
        const tenantUser = tenantUsers.find((tu) => tu.userId === user.id);
        roleId = tenantUser?.roleId;
      }

      // Generate tokens
      const tokens = this.generateTokens({
        userId: user.id,
        email: user.email,
        tenantId: input.tenantId,
        roleId,
      });

      // Remove password hash from response
      const { passwordHash, ...userWithoutPassword } = user;

      logger.info('User logged in', { userId: user.id, email: user.email, tenantId: input.tenantId });

      return {
        ...tokens,
        user: userWithoutPassword,
      };
    } catch (error) {
      logger.error('Login failed', { error, email: input.email });
      throw error;
    }
  }

  /**
   * Generate access and refresh tokens
   */
  generateTokens(payload: Omit<TokenPayload, 'type'>): AuthTokens {
    const accessToken = jwt.sign(
      { ...payload, type: 'access' },
      this.JWT_SECRET,
      { expiresIn: this.ACCESS_TOKEN_EXPIRY }
    );

    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      this.JWT_REFRESH_SECRET,
      { expiresIn: this.REFRESH_TOKEN_EXPIRY }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 minutes in seconds
    };
  }

  /**
   * Verify access token
   */
  verifyAccessToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.JWT_SECRET) as TokenPayload;
      
      if (payload.type !== 'access') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      logger.error('Failed to verify access token', { error });
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token
   */
  verifyRefreshToken(token: string): TokenPayload {
    try {
      const payload = jwt.verify(token, this.JWT_REFRESH_SECRET) as TokenPayload;
      
      if (payload.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      return payload;
    } catch (error) {
      logger.error('Failed to verify refresh token', { error });
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<AuthTokens> {
    try {
      // Verify refresh token
      const payload = this.verifyRefreshToken(refreshToken);

      // Verify user still exists and is active
      const user = await userService.getUserById(payload.userId);
      if (!user || user.status !== 'active') {
        throw new Error('User not found or inactive');
      }

      // Generate new tokens
      const tokens = this.generateTokens({
        userId: payload.userId,
        email: payload.email,
        tenantId: payload.tenantId,
        roleId: payload.roleId,
      });

      logger.info('Access token refreshed', { userId: payload.userId });

      return tokens;
    } catch (error) {
      logger.error('Failed to refresh access token', { error });
      throw error;
    }
  }

  /**
   * Logout user (client-side token invalidation)
   */
  async logout(userId: string): Promise<void> {
    try {
      logger.info('User logged out', { userId });
      // In a production system, you might want to:
      // 1. Add token to blacklist
      // 2. Clear refresh token from database
      // 3. Emit logout event
    } catch (error) {
      logger.error('Logout failed', { error, userId });
      throw error;
    }
  }

  /**
   * Validate user has access to tenant
   */
  async validateTenantAccess(userId: string, tenantId: string): Promise<boolean> {
    try {
      return await tenantService.isUserInTenant(tenantId, userId);
    } catch (error) {
      logger.error('Failed to validate tenant access', { error, userId, tenantId });
      return false;
    }
  }
}

// Export singleton instance
export const authService = new AuthService();
