/**
 * AuthService - Handles user registration, authentication, and session management
 */

import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import {
  User,
  RegisterCredentials,
  LoginCredentials,
  AuthToken,
  TokenPayload,
  PasswordPolicy,
} from '../types';
import {
  UserAlreadyExistsError,
  InvalidCredentialsError,
  InvalidTokenError,
  PasswordPolicyError,
} from '../errors';

export class AuthService {
  private db: any;
  private eventBus: any;
  private jwtSecret: string;
  private jwtExpiresIn: string;
  private bcryptRounds: number;
  private passwordPolicy?: PasswordPolicy;

  constructor(config: {
    database: any;
    eventBus: any;
    jwtSecret: string;
    jwtExpiresIn: string;
    bcryptRounds: number;
    passwordPolicy?: PasswordPolicy;
  }) {
    this.db = config.database;
    this.eventBus = config.eventBus;
    this.jwtSecret = config.jwtSecret;
    this.jwtExpiresIn = config.jwtExpiresIn;
    this.bcryptRounds = config.bcryptRounds;
    this.passwordPolicy = config.passwordPolicy;
  }

  /**
   * Register a new user
   */
  async register(
    tenantId: string,
    credentials: RegisterCredentials
  ): Promise<User> {
    // Check if user already exists
    const existingUser = await this.db.query(
      'SELECT id FROM users WHERE tenant_id = $1 AND email = $2',
      [tenantId, credentials.email]
    );

    if (existingUser.rows.length > 0) {
      throw new UserAlreadyExistsError(credentials.email);
    }

    // Validate password policy
    this.validatePassword(credentials.password);

    // Hash password
    const passwordHash = await bcrypt.hash(credentials.password, this.bcryptRounds);

    // Generate email verification token
    const emailVerificationToken = uuidv4();
    const emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const result = await this.db.query(
      `INSERT INTO users (
        id, tenant_id, email, password_hash, first_name, last_name, phone,
        email_verified, email_verification_token, email_verification_expires,
        created_at, updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *`,
      [
        uuidv4(),
        tenantId,
        credentials.email,
        passwordHash,
        credentials.firstName || null,
        credentials.lastName || null,
        credentials.phone || null,
        false,
        emailVerificationToken,
        emailVerificationExpires,
      ]
    );

    const user = result.rows[0];

    // Emit event
    await this.eventBus.emit('user.created', {
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      emailVerificationToken,
    });

    return this.mapUser(user);
  }

  /**
   * Log in a user
   */
  async login(tenantId: string, credentials: LoginCredentials): Promise<AuthToken> {
    // Find user
    const result = await this.db.query(
      'SELECT * FROM users WHERE tenant_id = $1 AND email = $2',
      [tenantId, credentials.email]
    );

    if (result.rows.length === 0) {
      throw new InvalidCredentialsError();
    }

    const user = result.rows[0];

    // Verify password
    const isValid = await bcrypt.compare(credentials.password, user.password_hash);
    if (!isValid) {
      throw new InvalidCredentialsError();
    }

    // Get user roles
    const rolesResult = await this.db.query(
      `SELECT r.name FROM roles r
       JOIN user_roles ur ON r.id = ur.role_id
       WHERE ur.user_id = $1`,
      [user.id]
    );

    const roles = rolesResult.rows.map((row: any) => row.name);

    // Generate JWT
    const token = this.generateToken({
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
      roles,
    });

    // Update last login
    await this.db.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = $1',
      [user.id]
    );

    // Emit event
    await this.eventBus.emit('user.login', {
      userId: user.id,
      tenantId: user.tenant_id,
      email: user.email,
    });

    return token;
  }

  /**
   * Verify a JWT token
   */
  async verifyToken(token: string): Promise<TokenPayload> {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as TokenPayload;
      return payload;
    } catch (error) {
      throw new InvalidTokenError();
    }
  }

  /**
   * Generate a JWT token
   */
  private generateToken(payload: TokenPayload): AuthToken {
    const accessToken = jwt.sign(payload as any, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn,
    } as jwt.SignOptions);

    return {
      accessToken,
      expiresIn: this.parseExpiresIn(this.jwtExpiresIn),
      tokenType: 'Bearer',
    };
  }

  /**
   * Validate password against policy
   */
  private validatePassword(password: string): void {
    if (!this.passwordPolicy) return;

    const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } =
      this.passwordPolicy;

    if (password.length < minLength) {
      throw new PasswordPolicyError(`Password must be at least ${minLength} characters`);
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      throw new PasswordPolicyError('Password must contain at least one uppercase letter');
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      throw new PasswordPolicyError('Password must contain at least one lowercase letter');
    }

    if (requireNumbers && !/[0-9]/.test(password)) {
      throw new PasswordPolicyError('Password must contain at least one number');
    }

    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new PasswordPolicyError('Password must contain at least one special character');
    }
  }

  /**
   * Parse JWT expiresIn string to seconds
   */
  private parseExpiresIn(expiresIn: string): number {
    const match = expiresIn.match(/^(\d+)([smhd])$/);
    if (!match) return 3600;

    const value = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 's':
        return value;
      case 'm':
        return value * 60;
      case 'h':
        return value * 3600;
      case 'd':
        return value * 86400;
      default:
        return 3600;
    }
  }

  /**
   * Map database user to User type
   */
  private mapUser(dbUser: any): User {
    return {
      id: dbUser.id,
      tenantId: dbUser.tenant_id,
      email: dbUser.email,
      passwordHash: dbUser.password_hash,
      firstName: dbUser.first_name,
      lastName: dbUser.last_name,
      phone: dbUser.phone,
      emailVerified: dbUser.email_verified,
      emailVerificationToken: dbUser.email_verification_token,
      emailVerificationExpires: dbUser.email_verification_expires,
      passwordResetToken: dbUser.password_reset_token,
      passwordResetExpires: dbUser.password_reset_expires,
      lastLoginAt: dbUser.last_login_at,
      createdAt: dbUser.created_at,
      updatedAt: dbUser.updated_at,
    };
  }
}
