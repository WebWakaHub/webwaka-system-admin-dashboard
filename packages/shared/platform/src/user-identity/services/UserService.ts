/**
 * UserService - Manages user profiles and password operations
 */

import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { User, UserProfile } from '../types';
import { UserNotFoundError, InvalidTokenError, PasswordPolicyError } from '../errors';

export class UserService {
  private db: any;
  private eventBus: any;
  private bcryptRounds: number;

  constructor(config: { database: any; eventBus: any; bcryptRounds: number }) {
    this.db = config.database;
    this.eventBus = config.eventBus;
    this.bcryptRounds = config.bcryptRounds;
  }

  /**
   * Get user by ID
   */
  async getUserById(tenantId: string, userId: string): Promise<UserProfile> {
    const result = await this.db.query(
      'SELECT * FROM users WHERE tenant_id = $1 AND id = $2',
      [tenantId, userId]
    );

    if (result.rows.length === 0) {
      throw new UserNotFoundError(userId);
    }

    return this.mapUserProfile(result.rows[0]);
  }

  /**
   * Update user profile
   */
  async updateProfile(
    tenantId: string,
    userId: string,
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    const fields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (updates.firstName !== undefined) {
      fields.push(`first_name = $${paramIndex++}`);
      values.push(updates.firstName);
    }

    if (updates.lastName !== undefined) {
      fields.push(`last_name = $${paramIndex++}`);
      values.push(updates.lastName);
    }

    if (updates.phone !== undefined) {
      fields.push(`phone = $${paramIndex++}`);
      values.push(updates.phone);
    }

    if (fields.length === 0) {
      return this.getUserById(tenantId, userId);
    }

    fields.push(`updated_at = NOW()`);
    values.push(tenantId, userId);

    const result = await this.db.query(
      `UPDATE users SET ${fields.join(', ')} 
       WHERE tenant_id = $${paramIndex++} AND id = $${paramIndex++}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      throw new UserNotFoundError(userId);
    }

    const user = result.rows[0];

    // Emit event
    await this.eventBus.emit('user.updated', {
      userId: user.id,
      tenantId: user.tenant_id,
      updates,
    });

    return this.mapUserProfile(user);
  }

  /**
   * Change user password
   */
  async changePassword(
    tenantId: string,
    userId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<void> {
    // Get user
    const result = await this.db.query(
      'SELECT * FROM users WHERE tenant_id = $1 AND id = $2',
      [tenantId, userId]
    );

    if (result.rows.length === 0) {
      throw new UserNotFoundError(userId);
    }

    const user = result.rows[0];

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, user.password_hash);
    if (!isValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.bcryptRounds);

    // Update password
    await this.db.query(
      'UPDATE users SET password_hash = $1, updated_at = NOW() WHERE id = $2',
      [passwordHash, userId]
    );

    // Emit event
    await this.eventBus.emit('user.password.changed', {
      userId,
      tenantId,
    });
  }

  /**
   * Initiate password reset
   */
  async initiatePasswordReset(tenantId: string, email: string): Promise<void> {
    // Find user
    const result = await this.db.query(
      'SELECT * FROM users WHERE tenant_id = $1 AND email = $2',
      [tenantId, email]
    );

    if (result.rows.length === 0) {
      // Don't reveal if user exists
      return;
    }

    const user = result.rows[0];

    // Generate reset token
    const resetToken = uuidv4();
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Save reset token
    await this.db.query(
      'UPDATE users SET password_reset_token = $1, password_reset_expires = $2 WHERE id = $3',
      [resetToken, resetExpires, user.id]
    );

    // Emit event
    await this.eventBus.emit('user.password.reset.requested', {
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      resetToken,
    });
  }

  /**
   * Complete password reset
   */
  async completePasswordReset(
    tenantId: string,
    token: string,
    newPassword: string
  ): Promise<void> {
    // Find user by reset token
    const result = await this.db.query(
      `SELECT * FROM users 
       WHERE tenant_id = $1 AND password_reset_token = $2 
       AND password_reset_expires > NOW()`,
      [tenantId, token]
    );

    if (result.rows.length === 0) {
      throw new InvalidTokenError();
    }

    const user = result.rows[0];

    // Hash new password
    const passwordHash = await bcrypt.hash(newPassword, this.bcryptRounds);

    // Update password and clear reset token
    await this.db.query(
      `UPDATE users 
       SET password_hash = $1, password_reset_token = NULL, 
           password_reset_expires = NULL, updated_at = NOW()
       WHERE id = $2`,
      [passwordHash, user.id]
    );

    // Emit event
    await this.eventBus.emit('user.password.reset.completed', {
      userId: user.id,
      tenantId: user.tenant_id,
    });
  }

  /**
   * Map database user to UserProfile
   */
  private mapUserProfile(dbUser: any): UserProfile {
    return {
      id: dbUser.id,
      email: dbUser.email,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      phone: dbUser.phone,
      emailVerified: dbUser.email_verified,
      lastLoginAt: dbUser.last_login_at,
      createdAt: dbUser.created_at,
    };
  }
}
