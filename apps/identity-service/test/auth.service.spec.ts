import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from '../src/auth/auth.service';
import { User } from '../src/database/entities/user.entity';
import { EventsService } from '../src/events/events.service';
import { OfflineQueueService } from '../src/offline/offline-queue.service';
import { ActorType } from '../src/common/enums/actor-type.enum';

describe('AuthService', () => {
  let service: AuthService;
  let userRepository: any;
  let jwtService: any;
  let eventsService: any;

  const mockUser: Partial<User> = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    passwordHash: '',
    firstName: 'Adebayo',
    lastName: 'Ogunlesi',
    actorType: ActorType.TENANT_ADMIN,
    tenantId: 'tenant-uuid-1',
    partnerId: null,
    isActive: true,
    roles: [],
    refreshToken: null,
  };

  beforeEach(async () => {
    // Hash a known password for testing
    mockUser.passwordHash = await bcrypt.hash('TestPassword123', 10);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('mock-jwt-token'),
            verify: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, any> = {
                'jwt.accessTokenExpiresIn': '15m',
                'jwt.refreshTokenExpiresIn': '7d',
                'bcrypt.saltRounds': 10,
              };
              return config[key];
            }),
          },
        },
        {
          provide: EventsService,
          useValue: {
            emit: jest.fn(),
          },
        },
        {
          provide: OfflineQueueService,
          useValue: {
            enqueue: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
    eventsService = module.get(EventsService);
  });

  describe('validateUser', () => {
    it('should return user without password when credentials are valid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'TestPassword123');
      expect(result).toBeDefined();
      expect(result!.email).toBe('test@example.com');
      expect((result as any).passwordHash).toBeUndefined();
    });

    it('should return null when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.validateUser('nonexistent@example.com', 'password');
      expect(result).toBeNull();
      expect(eventsService.emit).toHaveBeenCalledWith(
        'identity.auth.login.failed',
        expect.objectContaining({ reason: 'user_not_found' }),
      );
    });

    it('should return null when password is invalid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      const result = await service.validateUser('test@example.com', 'WrongPassword');
      expect(result).toBeNull();
      expect(eventsService.emit).toHaveBeenCalledWith(
        'identity.auth.login.failed',
        expect.objectContaining({ reason: 'invalid_password' }),
      );
    });

    it('should not return inactive users', async () => {
      userRepository.findOne.mockResolvedValue(null); // Active filter applied in query

      const result = await service.validateUser('inactive@example.com', 'password');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return auth response with tokens', async () => {
      const { passwordHash, ...userWithoutPassword } = mockUser as User;
      userRepository.update.mockResolvedValue({});

      const result = await service.login(userWithoutPassword as any);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.refreshToken).toBe('mock-jwt-token');
      expect(result.user.id).toBe('user-uuid-1');
      expect(result.user.actorType).toBe(ActorType.TENANT_ADMIN);
      expect(result.user.tenantId).toBe('tenant-uuid-1');
    });

    it('should emit login success event', async () => {
      const { passwordHash, ...userWithoutPassword } = mockUser as User;
      userRepository.update.mockResolvedValue({});

      await service.login(userWithoutPassword as any);

      expect(eventsService.emit).toHaveBeenCalledWith(
        'identity.auth.login.success',
        expect.objectContaining({
          userId: 'user-uuid-1',
          actorType: ActorType.TENANT_ADMIN,
        }),
      );
    });

    it('should include permissions in JWT payload', async () => {
      const userWithRoles = {
        ...mockUser,
        roles: [
          {
            permissions: [
              { resource: 'users', action: 'create' },
              { resource: 'users', action: 'read' },
            ],
          },
        ],
      };
      const { passwordHash, ...userWithoutPassword } = userWithRoles as any;
      userRepository.update.mockResolvedValue({});

      const result = await service.login(userWithoutPassword);

      expect(result.user.permissions).toContain('users:create');
      expect(result.user.permissions).toContain('users:read');
    });
  });

  describe('logout', () => {
    it('should revoke refresh token', async () => {
      userRepository.update.mockResolvedValue({});

      await service.logout('user-uuid-1');

      expect(userRepository.update).toHaveBeenCalledWith('user-uuid-1', {
        refreshToken: null,
      });
    });

    it('should emit logout event', async () => {
      userRepository.update.mockResolvedValue({});

      await service.logout('user-uuid-1');

      expect(eventsService.emit).toHaveBeenCalledWith(
        'identity.auth.logout',
        expect.objectContaining({ userId: 'user-uuid-1' }),
      );
    });
  });

  describe('changePassword', () => {
    it('should change password when current password is valid', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({});

      await service.changePassword('user-uuid-1', 'TestPassword123', 'NewPassword456');

      expect(userRepository.update).toHaveBeenCalledWith(
        'user-uuid-1',
        expect.objectContaining({ refreshToken: null }),
      );
    });

    it('should throw ForbiddenException when current password is wrong', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.changePassword('user-uuid-1', 'WrongPassword', 'NewPassword456'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.changePassword('nonexistent', 'password', 'newpassword'),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should emit password changed event', async () => {
      userRepository.findOne.mockResolvedValue(mockUser);
      userRepository.update.mockResolvedValue({});

      await service.changePassword('user-uuid-1', 'TestPassword123', 'NewPassword456');

      expect(eventsService.emit).toHaveBeenCalledWith(
        'identity.auth.password.changed',
        expect.objectContaining({ userId: 'user-uuid-1' }),
      );
    });
  });
});
