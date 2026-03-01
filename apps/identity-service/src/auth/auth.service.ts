import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../database/entities/user.entity';
import { AuthResponse, JwtPayload } from '../common/dto/auth.dto';
import { EventsService } from '../events/events.service';
import { IdentityEvent } from '../common/enums/identity-event.enum';
import { OfflineQueueService } from '../offline/offline-queue.service';

/**
 * Authentication Service
 *
 * Handles all authentication operations:
 * - User validation (email/password)
 * - JWT token issuance with actor type, tenant ID, permissions
 * - Token refresh mechanism
 * - Password hashing with bcrypt
 * - Event emission on all auth state changes
 *
 * Offline-First: Failed auth events are queued for later sync.
 * Mobile-First: JWT tokens are compact for low-bandwidth environments.
 */
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly eventsService: EventsService,
    private readonly offlineQueueService: OfflineQueueService,
  ) {}

  /**
   * Validate user credentials.
   * Returns the user without password hash if valid, null otherwise.
   */
  async validateUser(email: string, password: string): Promise<Omit<User, 'passwordHash'> | null> {
    const user = await this.userRepository.findOne({
      where: { email, isActive: true },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user) {
      await this.eventsService.emit(IdentityEvent.AUTH_LOGIN_FAILED, {
        email,
        reason: 'user_not_found',
        timestamp: new Date().toISOString(),
      });
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      await this.eventsService.emit(IdentityEvent.AUTH_LOGIN_FAILED, {
        email,
        userId: user.id,
        reason: 'invalid_password',
        timestamp: new Date().toISOString(),
      });
      return null;
    }

    const { passwordHash, ...result } = user;
    return result as Omit<User, 'passwordHash'>;
  }

  /**
   * Generate JWT tokens and return auth response.
   * JWT payload includes actor type, tenant ID, and permissions
   * for stateless, offline-capable authentication.
   */
  async login(user: Omit<User, 'passwordHash'>): Promise<AuthResponse> {
    const permissions = this.extractPermissions(user);

    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      actorType: user.actorType,
      tenantId: user.tenantId,
      partnerId: user.partnerId,
      permissions,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.accessTokenExpiresIn'),
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id, type: 'refresh' },
      { expiresIn: this.configService.get<string>('jwt.refreshTokenExpiresIn') },
    );

    // Store refresh token hash in database
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);
    await this.userRepository.update(user.id, {
      refreshToken: refreshTokenHash,
      lastLoginAt: new Date(),
    });

    // Emit login success event
    await this.eventsService.emit(IdentityEvent.AUTH_LOGIN_SUCCESS, {
      userId: user.id,
      actorType: user.actorType,
      tenantId: user.tenantId,
      timestamp: new Date().toISOString(),
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: 900, // 15 minutes in seconds
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        actorType: user.actorType,
        tenantId: user.tenantId,
        permissions,
      },
    };
  }

  /**
   * Refresh an access token using a valid refresh token.
   */
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken);
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub, isActive: true },
      relations: ['roles', 'roles.permissions'],
    });

    if (!user || !user.refreshToken) {
      throw new UnauthorizedException('User not found or token revoked');
    }

    const isRefreshTokenValid = await bcrypt.compare(
      refreshToken,
      user.refreshToken,
    );
    if (!isRefreshTokenValid) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const { passwordHash, ...userWithoutPassword } = user;

    await this.eventsService.emit(IdentityEvent.AUTH_TOKEN_REFRESHED, {
      userId: user.id,
      timestamp: new Date().toISOString(),
    });

    return this.login(userWithoutPassword as Omit<User, 'passwordHash'>);
  }

  /**
   * Revoke a user's refresh token (logout).
   */
  async logout(userId: string): Promise<void> {
    await this.userRepository.update(userId, { refreshToken: null });

    await this.eventsService.emit(IdentityEvent.AUTH_LOGOUT, {
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Change a user's password.
   */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await bcrypt.compare(
      currentPassword,
      user.passwordHash,
    );
    if (!isCurrentPasswordValid) {
      throw new ForbiddenException('Current password is incorrect');
    }

    const saltRounds = this.configService.get<number>('bcrypt.saltRounds') || 12;
    const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

    await this.userRepository.update(userId, {
      passwordHash: newPasswordHash,
      refreshToken: null, // Invalidate all sessions
    });

    await this.eventsService.emit(IdentityEvent.AUTH_PASSWORD_CHANGED, {
      userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Extract permission strings from user's roles.
   */
  private extractPermissions(user: Omit<User, 'passwordHash'>): string[] {
    if (!user.roles) return [];
    const permissions = new Set<string>();
    for (const role of user.roles) {
      if (role.permissions) {
        for (const permission of role.permissions) {
          permissions.add(`${permission.resource}:${permission.action}`);
        }
      }
    }
    return Array.from(permissions);
  }
}
