import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { UsersService } from '../src/users/users.service';
import { User } from '../src/database/entities/user.entity';
import { EventsService } from '../src/events/events.service';
import { ActorType } from '../src/common/enums/actor-type.enum';
import { JwtPayload } from '../src/common/dto/auth.dto';

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: any;
  let eventsService: any;

  const superAdminPayload: JwtPayload = {
    sub: 'admin-uuid',
    email: 'admin@webwaka.com',
    actorType: ActorType.SUPER_ADMIN,
    tenantId: null,
    partnerId: null,
    permissions: ['users:create', 'users:read', 'users:update', 'users:delete'],
  };

  const tenantAdminPayload: JwtPayload = {
    sub: 'tenant-admin-uuid',
    email: 'admin@tenant.com',
    actorType: ActorType.TENANT_ADMIN,
    tenantId: 'tenant-uuid-1',
    partnerId: null,
    permissions: ['users:create', 'users:read'],
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            findAndCount: jest.fn(),
            create: jest.fn((data) => ({ ...data, id: 'new-user-uuid' })),
            save: jest.fn((data) => ({ ...data, id: data.id || 'new-user-uuid', createdAt: new Date(), updatedAt: new Date() })),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'bcrypt.saltRounds') return 10;
              return null;
            }),
          },
        },
        {
          provide: EventsService,
          useValue: {
            emit: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(getRepositoryToken(User));
    eventsService = module.get(EventsService);
  });

  describe('create', () => {
    it('should create a user with Nigeria-First defaults', async () => {
      userRepository.findOne.mockResolvedValue(null); // No duplicate

      const result = await service.create(
        {
          email: 'newuser@example.com',
          password: 'SecureP@ss123',
          firstName: 'Chidi',
          lastName: 'Okafor',
          actorType: ActorType.VENDOR,
          tenantId: 'tenant-uuid-1',
        },
        tenantAdminPayload,
      );

      expect(result.email).toBe('newuser@example.com');
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          locale: 'en-NG',
          timezone: 'Africa/Lagos',
          syncStatus: 'synced',
        }),
      );
    });

    it('should emit USER_CREATED event', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await service.create(
        {
          email: 'newuser@example.com',
          password: 'SecureP@ss123',
          firstName: 'Chidi',
          lastName: 'Okafor',
          actorType: ActorType.END_USER,
          tenantId: 'tenant-uuid-1',
        },
        tenantAdminPayload,
      );

      expect(eventsService.emit).toHaveBeenCalledWith(
        'identity.user.created',
        expect.objectContaining({ email: 'newuser@example.com' }),
      );
    });

    it('should throw ForbiddenException when actor hierarchy is violated', async () => {
      await expect(
        service.create(
          {
            email: 'admin@example.com',
            password: 'SecureP@ss123',
            firstName: 'Admin',
            lastName: 'User',
            actorType: ActorType.SUPER_ADMIN,
          },
          tenantAdminPayload,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ForbiddenException when non-Super Admin has no tenant', async () => {
      await expect(
        service.create(
          {
            email: 'user@example.com',
            password: 'SecureP@ss123',
            firstName: 'User',
            lastName: 'Test',
            actorType: ActorType.VENDOR,
            // No tenantId
          },
          superAdminPayload,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should throw ConflictException when email already exists in tenant', async () => {
      userRepository.findOne.mockResolvedValue({ id: 'existing-user' });

      await expect(
        service.create(
          {
            email: 'existing@example.com',
            password: 'SecureP@ss123',
            firstName: 'Existing',
            lastName: 'User',
            actorType: ActorType.END_USER,
            tenantId: 'tenant-uuid-1',
          },
          tenantAdminPayload,
        ),
      ).rejects.toThrow(ConflictException);
    });

    it('should allow Super Admin to create Partner users', async () => {
      userRepository.findOne.mockResolvedValue(null);

      const result = await service.create(
        {
          email: 'partner@example.com',
          password: 'SecureP@ss123',
          firstName: 'Partner',
          lastName: 'Admin',
          actorType: ActorType.PARTNER,
          tenantId: 'tenant-uuid-1',
        },
        superAdminPayload,
      );

      expect(result).toBeDefined();
    });
  });

  describe('findAll', () => {
    it('should apply tenant filter for non-Super Admin', async () => {
      userRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(tenantAdminPayload);

      expect(userRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { tenantId: 'tenant-uuid-1' },
        }),
      );
    });

    it('should not apply tenant filter for Super Admin', async () => {
      userRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(superAdminPayload);

      expect(userRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
        }),
      );
    });

    it('should paginate results', async () => {
      userRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll(tenantAdminPayload, 2, 10);

      expect(userRepository.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({
          skip: 10,
          take: 10,
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return user when found', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'user-uuid-1',
        email: 'test@example.com',
      });

      const result = await service.findOne('user-uuid-1', tenantAdminPayload);
      expect(result.email).toBe('test@example.com');
    });

    it('should throw NotFoundException when user not found', async () => {
      userRepository.findOne.mockResolvedValue(null);

      await expect(
        service.findOne('nonexistent', tenantAdminPayload),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('deactivate', () => {
    it('should deactivate user and revoke sessions', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'user-uuid-1',
        actorType: ActorType.END_USER,
        tenantId: 'tenant-uuid-1',
        isActive: true,
        refreshToken: 'some-token',
      });

      await service.deactivate('user-uuid-1', tenantAdminPayload);

      expect(userRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          isActive: false,
          refreshToken: null,
        }),
      );
    });

    it('should emit USER_DEACTIVATED event', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'user-uuid-1',
        actorType: ActorType.END_USER,
        tenantId: 'tenant-uuid-1',
      });

      await service.deactivate('user-uuid-1', tenantAdminPayload);

      expect(eventsService.emit).toHaveBeenCalledWith(
        'identity.user.deactivated',
        expect.objectContaining({ userId: 'user-uuid-1' }),
      );
    });

    it('should throw ForbiddenException when deactivating higher authority user', async () => {
      userRepository.findOne.mockResolvedValue({
        id: 'admin-uuid',
        actorType: ActorType.SUPER_ADMIN,
        tenantId: null,
      });

      await expect(
        service.deactivate('admin-uuid', tenantAdminPayload),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
